import React, { memo, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { createSocket } from './Socket';
import GlobalNotificationBanner from './GlobalNotificationBanner';
import { useDispatch, useStore } from 'react-redux';
import { setNewMatches } from '../slices/loginServices/authSlice';
import { markProcessed } from '../slices/inAppNotificationSlice';

const KEEP_ALIVE_MS = 3000;

// Module-level singleton: dedupe survives tab switching/reconnects and blocks repeated popups.
const seenNotificationKeys = new Set<string>();

interface NotificationData {
    matchId: string;
    senderId: string;
    senderName: string;
    messagePreview: string;
    profilePicture?: string;
    timestamp: string;
    gender?: string
}

const GlobalNotificationManager: React.FC = () => {
    const dispatch = useDispatch();
    const store = useStore();

    const [notification, setNotification] = useState<NotificationData | null>(null);

    // Refs that stay up to date WITHOUT subscribing the component to redux re-renders
    const userIdRef = useRef<string | null>(null);
    const newMatchesRef = useRef<any[]>([]);
    const activeChatMatchIdRef = useRef<string | null>(null);
    const processedRef = useRef<Record<string, true>>({});
    const notificationRef = useRef<NotificationData | null>(null);
    const socketRef = useRef<any>(null);

    useEffect(() => {
        notificationRef.current = notification;
    }, [notification]);

    const getNotificationKey = (response: any) => {
        const type = response?.type || 'unknown';

        // Prefer MESSAGE identity for new_message (notificationId can change on re-emit)
        if (type === 'new_message') {
            const messageId =
                response?.messageId ||
                response?.message_id ||
                response?.message?._id ||
                response?.message?.id ||
                response?._id ||
                response?.id;
            if (messageId) return `new_message:${String(messageId)}`;

            // Use createdAt/timestamp if available (user requirement) to keep key stable across re-emits
            const matchId = response?.matchId || '';
            const senderId = response?.senderId || '';
            const createdAt = response?.createdAt || response?.timestamp || response?.created_at || '';
            if (createdAt) return `new_message:${matchId}:${senderId}:${String(createdAt)}`;

            // Last resort: keep stable-ish (no timestamp)
            const messageType = response?.messageType || '';
            const preview = String(response?.messagePreview || '').trim();
            return `new_message:${matchId}:${senderId}:${messageType}:${preview}`;
        }

        if (type === 'crushNote') {
            const messageId =
                response?.messageId ||
                response?.message_id ||
                response?._id ||
                response?.id;
            if (messageId) return `crushNote:${String(messageId)}`;
            const fromUserId = response?.fromUserId || '';
            const preview = String(response?.messagePreview || '').trim();
            return `crushNote:${fromUserId}:${preview}`;
        }

        // Generic: use explicit ids if present, otherwise stable composite
        const genericId =
            response?.notificationId ||
            response?.notification_id ||
            response?._id ||
            response?.id;
        if (genericId) return `${type}:${String(genericId)}`;

        const matchId = response?.matchId || response?.fromUserId || '';
        const sender = response?.senderId || response?.fromUserId || response?.userId || '';
        const preview = String(response?.messagePreview || '').trim();
        return `${type}:${matchId}:${sender}:${preview}`;
    };

    useEffect(() => {
        // One-time subscription to store changes (does NOT cause component re-render)
        const syncFromStore = () => {
            const state: any = store.getState();
            userIdRef.current = state?.auth?.userData?._id || null;
            newMatchesRef.current = state?.auth?.newMatches || [];
            activeChatMatchIdRef.current = state?.inAppNotification?.activeChatMatchId || null;
            processedRef.current = state?.inAppNotification?.processed || {};

            // Seed singleton dedupe from redux state
            const processedMap = processedRef.current || {};
            Object.keys(processedMap).forEach((k) => seenNotificationKeys.add(k));

            // CRITICAL: If user opened the chat related to the currently visible notification, dismiss instantly.
            // This must be instant and use smooth animation (handled by GlobalNotificationBanner)
            const currentNotif = notificationRef.current;
            if (currentNotif?.matchId && activeChatMatchIdRef.current === currentNotif.matchId) {
                console.log('[GlobalNotificationManager] Removing in-app notification - user opened matching chat:', currentNotif.matchId);
                setNotification(null);
            }
        };

        // Initial sync + subscribe
        syncFromStore();
        const unsubscribe = store.subscribe(syncFromStore);

        return () => {
            unsubscribe();
        };
    }, [store]);

    // Shared notification handler to avoid code duplication
    const createNotificationHandler = () => {
        return (response: any) => {
            console.log('[GlobalNotificationManager] Received notification:', response?.type, {
                matchId: response?.matchId,
                senderId: response?.senderId,
            });

            const key = getNotificationKey(response);
            if (seenNotificationKeys.has(key) || processedRef.current?.[key]) {
                console.log('[GlobalNotificationManager] Notification already processed, skipping:', key);
                return;
            }
            seenNotificationKeys.add(key);
            dispatch(markProcessed(key));

            // Get current state from store at the time of notification (not from refs which might be stale)
            const state: any = store.getState();
            const activeChatMatchId = state?.inAppNotification?.activeChatMatchId || null;
            const currentUserIdInner = userIdRef.current;
            const currentMatches = newMatchesRef.current;

            if (response?.type === 'new_message') {
                const { matchId, senderId, messagePreview, timestamp } = response;

                // Update chat list (always update, even if user is in same TakingScreen)
                const updatedMatches = currentMatches.map((chat: any) => {
                    if (chat.matchId === matchId) {
                        const updatedChat = {
                            ...chat,
                            lastMessage: {
                                text: messagePreview,
                                content: messagePreview,
                                createdAt: timestamp,
                                senderId: senderId,
                            }
                        };
                        // Only increment unread count if user is NOT in the same TakingScreen
                        if (!activeChatMatchId || activeChatMatchId !== matchId) {
                            updatedChat.unreadCount = (chat.unreadCount || 0) + 1;
                        }
                        return updatedChat;
                    }
                    return chat;
                });

                const chatIndex = updatedMatches.findIndex((chat: any) => chat.matchId === matchId);
                if (chatIndex > 0) {
                    const updatedChat = updatedMatches[chatIndex];
                    updatedMatches.splice(chatIndex, 1);
                    updatedMatches.unshift(updatedChat);
                }

                dispatch(setNewMatches(updatedMatches));

                // Only show notification if message is from other user AND not the currently open chat
                if (senderId !== currentUserIdInner) {
                    if (activeChatMatchId && activeChatMatchId === matchId) {
                        console.log('[GlobalNotificationManager] Skipping notification banner - user is in same TakingScreen:', matchId);
                        return;
                    }
                    const chat = currentMatches.find((c: any) => c.matchId === matchId);
                    console.log('[GlobalNotificationManager] Showing notification banner for matchId:', matchId);
                    setNotification({
                        matchId,
                        senderId,
                        // The matches list may not contain this chat yet; fall back to what the server sent
                        senderName: chat?.username || chat?.name || response?.senderName,
                        messagePreview,
                        profilePicture: chat?.profilePicture?.url,
                        timestamp,
                        gender: chat?.gender
                    });
                }
            } else if (response?.type === 'crushNote') {
                const { fromUserId, fromUserName, messagePreview, createdAt } = response;

                // A crush note lands in the chat with that person, so it counts as an unread chat message
                const chat = currentMatches.find((c: any) => String(c.userId) === String(fromUserId));
                const isChatOpen = Boolean(chat && activeChatMatchId && activeChatMatchId === chat.matchId);
                if (chat && fromUserId !== currentUserIdInner) {
                    const updatedMatches = currentMatches.map((c: any) =>
                        c.matchId === chat.matchId
                            ? {
                                ...c,
                                lastMessage: { text: messagePreview, content: messagePreview, createdAt, senderId: fromUserId, type: 'crushNote' },
                                unreadCount: isChatOpen ? c.unreadCount : (c.unreadCount || 0) + 1,
                            }
                            : c
                    );
                    // Newest conversation first, like for regular messages
                    const index = updatedMatches.findIndex((c: any) => c.matchId === chat.matchId);
                    if (index > 0) updatedMatches.unshift(updatedMatches.splice(index, 1)[0]);
                    dispatch(setNewMatches(updatedMatches));
                }

                // No banner while that chat is on screen
                if (isChatOpen) {
                    console.log('[GlobalNotificationManager] Skipping crushNote notification - user is in same TakingScreen:', fromUserId);
                    return;
                }

                if (fromUserId !== currentUserIdInner) {
                    console.log('[GlobalNotificationManager] Showing crushNote notification banner for fromUserId:', fromUserId);
                    setNotification({
                        matchId: chat?.matchId ?? fromUserId,
                        senderId: fromUserId,
                        senderName: fromUserName || chat?.username || chat?.name,
                        messagePreview,
                        profilePicture: chat?.profilePicture?.url,
                        timestamp: createdAt,
                        gender: chat?.gender,
                    });
                }
            }
        };
    };

    // Always points at the latest handler so the socket listener never goes stale
    const handlerRef = useRef<(response: any) => void>(() => { });
    handlerRef.current = createNotificationHandler();

    useEffect(() => {
        // One stable function attached to the socket; it forwards to the latest handler
        const onInAppNotification = (response: any) => handlerRef.current(response);
        let attachedTo: any = null;

        const detach = () => {
            // Remove only OUR listener: the socket is shared with other screens
            try {
                attachedTo?.off?.('in_app_notification', onInAppNotification);
                attachedTo?.disconnect?.();
            } catch (e) {
                // ignore
            }
            attachedTo = null;
            socketRef.current = null;
        };

        const ensureSocket = () => {
            const currentUserId = userIdRef.current;
            if (!currentUserId) return;
            // Healthy already
            if (attachedTo && !attachedTo.isClosed) return;

            attachedTo = null;
            const { config } = require('../config/config');
            const url = `${config.BASE_URL}?userId=${currentUserId}`;
            const socket = createSocket(url);
            socketRef.current = socket;
            attachedTo = socket;
            socket.on('in_app_notification', onInAppNotification);
            socket.on('connect_error', (error: any) => {
                console.error('[GlobalNotificationManager] Socket connection error:', error);
            });
        };

        // Keep-alive: another screen, logout or going to the background may have closed our socket,
        // and the user may only become known after start-up. Re-check regularly.
        ensureSocket();
        const keepAlive = setInterval(ensureSocket, KEEP_ALIVE_MS);

        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (nextAppState === 'background' || nextAppState === 'inactive') {
                // Don't hold a connection while backgrounded; the keep-alive reconnects on return
                detach();
            } else if (nextAppState === 'active') {
                ensureSocket();
            }
        });

        return () => {
            clearInterval(keepAlive);
            subscription.remove();
            detach();
        };
    }, []);

    const handleDismiss = () => {
        setNotification(null);
    };

    return (
        <GlobalNotificationBanner
            notification={notification}
            onDismiss={handleDismiss}
        />
    );
};

export default memo(GlobalNotificationManager);

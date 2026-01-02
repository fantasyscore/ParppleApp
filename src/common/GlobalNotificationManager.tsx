import React, { memo, useEffect, useRef, useState } from 'react';
import { createSocket } from './Socket';
import GlobalNotificationBanner from './GlobalNotificationBanner';
import { useDispatch, useStore } from 'react-redux';
import { setNewMatches } from '../slices/loginServices/authSlice';
import { markProcessed } from '../slices/inAppNotificationSlice';

// Module-level singleton: dedupe survives tab switching/reconnects and blocks repeated popups.
const seenNotificationKeys = new Set<string>();

interface NotificationData {
    matchId: string;
    senderId: string;
    senderName: string;
    messagePreview: string;
    profilePicture?: string;
    timestamp: string;
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

            // If user opened the chat related to the currently visible notification, dismiss instantly.
            const currentNotif = notificationRef.current;
            if (currentNotif?.matchId && activeChatMatchIdRef.current === currentNotif.matchId) {
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

    useEffect(() => {
        // Socket lifecycle is managed internally; not tied to Home/Chat/Taking renders.
        let lastSocketUserId: string | null = null;

        const ensureSocket = () => {
            const currentUserId = userIdRef.current;
            if (!currentUserId) return;

            if (lastSocketUserId === currentUserId && socketRef.current) return;

            // User changed (or first init) -> reconnect
            try {
                if (socketRef.current) {
                    socketRef.current.disconnect?.();
                }
            } catch (e) {
                // ignore
            }

            lastSocketUserId = currentUserId;
            const url = `http://13.201.74.29/?userId=${currentUserId}`;
            const socket = createSocket(url);
            socketRef.current = socket;

            const handleInAppNotification = (response: any) => {
                const key = getNotificationKey(response);
                if (seenNotificationKeys.has(key) || processedRef.current?.[key]) return;
                seenNotificationKeys.add(key);
                dispatch(markProcessed(key));

                const currentUserIdInner = userIdRef.current;
                const currentMatches = newMatchesRef.current;

                if (response?.type === 'new_message') {
                    const { matchId, senderId, senderName, messagePreview, timestamp } = response;

                    // Update chat list (silent or not)
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
                            updatedChat.unreadCount = (chat.unreadCount || 0) + 1;
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
                        if (activeChatMatchIdRef.current && activeChatMatchIdRef.current === matchId) return;
                        const chat = currentMatches.find((c: any) => c.matchId === matchId);
                        setNotification({
                            matchId,
                            senderId,
                            senderName,
                            messagePreview,
                            profilePicture: chat?.profilePicture?.url,
                            timestamp,
                        });
                    }
                } else if (response?.type === 'crushNote') {
                    const { fromUserId, fromUserName, messagePreview, createdAt } = response;
                    if (fromUserId !== currentUserIdInner) {
                        setNotification({
                            matchId: fromUserId,
                            senderId: fromUserId,
                            senderName: fromUserName,
                            messagePreview,
                            profilePicture: undefined,
                            timestamp: createdAt,
                        });
                    }
                }
            };

            socket.on('in_app_notification', handleInAppNotification);
        };

        // Poll once quickly until userId is available, then socket stays alive.
        const initTimer = setInterval(() => {
            ensureSocket();
            if (socketRef.current && userIdRef.current) {
                clearInterval(initTimer);
            }
        }, 200);

        return () => {
            clearInterval(initTimer);
        };
    }, [dispatch]);

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


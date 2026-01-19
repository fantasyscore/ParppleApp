import React, { memo, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { createSocket, disconnectAllSockets } from './Socket';
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
                const { matchId, senderId, senderName, messagePreview, timestamp } = response;

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
                        senderName,
                        messagePreview,
                        profilePicture: chat?.profilePicture?.url,
                        timestamp,
                    });
                }
            } else if (response?.type === 'crushNote') {
                const { fromUserId, fromUserName, messagePreview, createdAt } = response;
                
                // Don't show notification if user is already in the same TakingScreen
                if (activeChatMatchId && activeChatMatchId === fromUserId) {
                    console.log('[GlobalNotificationManager] Skipping crushNote notification - user is in same TakingScreen:', fromUserId);
                    return;
                }
                
                if (fromUserId !== currentUserIdInner) {
                    console.log('[GlobalNotificationManager] Showing crushNote notification banner for fromUserId:', fromUserId);
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
    };

    useEffect(() => {
        // Socket lifecycle is managed internally; not tied to Home/Chat/Taking renders.
        let lastSocketUserId: string | null = null;

        const ensureSocket = () => {
            const currentUserId = userIdRef.current;
            if (!currentUserId) return;

            if (lastSocketUserId === currentUserId && socketRef.current?.connected) return;

            // User changed (or first init) -> reconnect
            try {
                if (socketRef.current) {
                    socketRef.current.removeAllListeners?.();
                    socketRef.current.disconnect?.();
                }
            } catch (e) {
                // ignore
            }

            lastSocketUserId = currentUserId;
            // Use the same socket URL as TakingScreen for consistency
            const { config } = require('../config/config');
            const url = `${config.BASE_URL}?userId=${currentUserId}`;
            console.log('[GlobalNotificationManager] Creating socket connection:', url);
            const socket = createSocket(url);
            socketRef.current = socket;

            // Add connection event listeners for debugging
            socket.on('connect', () => {
                console.log('[GlobalNotificationManager] Socket connected successfully');
            });

            socket.on('disconnect', (reason: string) => {
                console.log('[GlobalNotificationManager] Socket disconnected:', reason);
            });

            socket.on('connect_error', (error: any) => {
                console.error('[GlobalNotificationManager] Socket connection error:', error);
            });

            // CRITICAL: Remove all existing listeners first to prevent duplicates
            socket.removeAllListeners?.();
            
            // Attach notification handler
            socket.on('in_app_notification', createNotificationHandler());
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
            // Cleanup socket on unmount
            if (socketRef.current) {
                try {
                    socketRef.current.removeAllListeners?.();
                    socketRef.current.disconnect?.();
                } catch (e) {
                    // ignore
                }
                socketRef.current = null;
            }
        };
    }, [dispatch, store]);

    // Handle app lifecycle: disconnect socket on background, reconnect on foreground
    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            console.log('[GlobalNotificationManager] App state changed:', nextAppState);
            
            if (nextAppState === 'background' || nextAppState === 'inactive') {
                // CRITICAL: App is going to background/recent apps - disconnect ALL sockets
                // This prevents background socket events and memory leaks
                console.log('[GlobalNotificationManager] Disconnecting ALL sockets - app going to background');
                try {
                    disconnectAllSockets();
                    if (socketRef.current) {
                        try {
                            socketRef.current.removeAllListeners?.();
                            socketRef.current.disconnect?.();
                        } catch (e) {
                            console.error('[GlobalNotificationManager] Error disconnecting socket:', e);
                        }
                        socketRef.current = null;
                    }
                } catch (e) {
                    console.error('[GlobalNotificationManager] Error during background disconnect:', e);
                    // Don't crash - ensure socket ref is cleared
                    socketRef.current = null;
                }
            } else if (nextAppState === 'active') {
                // App is coming to foreground - reconnect socket
                // This tells backend user is online again
                // CRITICAL: Add delay to ensure app is fully initialized after resume
                // This prevents crashes when app is restored from killed state
                setTimeout(() => {
                    try {
                        // Verify store is available and has valid state
                        const state: any = store.getState();
                        if (!state) {
                            console.warn('[GlobalNotificationManager] Store not available on resume, skipping socket reconnect');
                            return;
                        }

                        const currentUserId = userIdRef.current;
                        if (!currentUserId) {
                            console.log('[GlobalNotificationManager] No userId available on resume, skipping socket reconnect');
                            return;
                        }

                        // Only reconnect if socket is not already connected
                        if (socketRef.current?.connected) {
                            console.log('[GlobalNotificationManager] Socket already connected, skipping reconnect');
                            return;
                        }

                        console.log('[GlobalNotificationManager] Reconnecting socket - app coming to foreground');
                        // Use the same socket URL as TakingScreen for consistency
                        const { config } = require('../config/config');
                        if (!config?.BASE_URL) {
                            console.error('[GlobalNotificationManager] Config BASE_URL not available');
                            return;
                        }

                        const url = `${config.BASE_URL}?userId=${currentUserId}`;
                        
                        // Clean up old socket if exists
                        if (socketRef.current) {
                            try {
                                socketRef.current.removeAllListeners?.();
                                socketRef.current.disconnect?.();
                            } catch (e) {
                                console.warn('[GlobalNotificationManager] Error cleaning up old socket:', e);
                            }
                        }

                        const socket = createSocket(url);
                        socketRef.current = socket;

                        // Add connection event listeners
                        socket.on('connect', () => {
                            console.log('[GlobalNotificationManager] Socket reconnected successfully');
                        });

                        socket.on('disconnect', (reason: string) => {
                            console.log('[GlobalNotificationManager] Socket disconnected:', reason);
                        });

                        socket.on('connect_error', (error: any) => {
                            console.error('[GlobalNotificationManager] Socket reconnection error:', error);
                            // Don't crash on connection error - socket will retry automatically
                        });

                        // CRITICAL: Remove all existing listeners first to prevent duplicates
                        socket.removeAllListeners?.();
                        
                        // Re-attach notification handler
                        socket.on('in_app_notification', createNotificationHandler());
                    } catch (e) {
                        console.error('[GlobalNotificationManager] Error reconnecting socket on resume:', e);
                        // Don't crash - clear socket ref and let it retry later
                        socketRef.current = null;
                    }
                }, 500); // Delay to ensure app is fully initialized
            }
        };

        // Subscribe to app state changes
        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription.remove();
        };
    }, [dispatch, store]);

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

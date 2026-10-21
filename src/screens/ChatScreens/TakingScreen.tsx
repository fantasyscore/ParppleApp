import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { AppState, AppStateStatus, ImageBackground, InteractionManager, Platform, ScrollView } from 'react-native';
import { Chat, Bubble, Time } from '@kesha-antonov/react-native-chat';
import { addPhotoIcon, gallaryICon, blockModalImage, chatBackground, dummyfemaleProfile, dummyMaleProfile, emptyTextImage, helloHand, timeShowNewBackground, unmatchModalImage } from '../../helper/ImageAssets';
import { AppSafeAreaView } from '../../common/AppSafeAreaView';
import ChatHeader from '../../common/ChatHeader';
import { StyleSheet, View, Dimensions, Modal, Animated } from 'react-native';
import { colors, newColor } from '../../theme/colors';
import metrics from '../../assets/Metrics';
import { AppText, BLACK, fontSize, FORTEEN, INTER_MEDIUM, INTER_SEMI_BOLD, OPECITY, SCHEHERAZADE_BOLD, TEN, THIRTEEN, TWELVE, TWENTY_FOUR, WHITE } from '../../common/AppText';
import { TouchableOpacityView } from '../../common/TouchableOpacityView';
import FastImage from 'react-native-fast-image';
import PortraitAvatar from '../../common/PortraitAvatar';
import { interSemiBold } from '../../theme/typography';
import { Screen } from '../../theme/dimens';
import RBSheet from 'react-native-raw-bottom-sheet';
import { threeDotData } from '../../common/UiltData';
import NavigationService from '../../navigation/NavigationService';
import { NAVIGATION_REPORT_SCREEN } from '../../navigation/routes';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { blockByIdAPIUser, getOtherProfile, removeMessageFromChatHistoryCache, setChatHistoryCache, userUnmatchAPI } from '../../actions/authActions';
import { createSocket } from '../../common/Socket';
import { appOperation } from '../../appOperation';
import { ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { clearActiveChat, setActiveChatMatchId } from '../../slices/inAppNotificationSlice';
import { chatHistoryDetails, setLastMessageOverride, setNewMatches } from '../../slices/loginServices/authSlice';
import { clearNotificationsByMatchId } from '../../notifications/pushNotifications';
import { toastAlert } from '../../actions/UploadImageActions';
import SeeOtherUserProfile from './SeeOtherUserProfile';
import FullScreenImage from '../HomeScreens/FullScreenImage'
import KeyboardInsetView from './KeyboardInsetView';
import ChatInputBar from './components/ChatInputBar';
import ViewOncePhotoBubble from './viewOnce/ViewOncePhotoBubble';
import ViewOncePhotoViewer from './viewOnce/ViewOncePhotoViewer';
import { dismissedPhotoIds, useViewOncePhotos } from './viewOnce/useViewOncePhotos';
const USER_ID = 1;
const OTHER_USER_ID = 2;
const TYPING_INDICATOR_ID = 'typing-indicator';

// The library keeps an empty spacer the size of its avatar under every message of a group except the
// last one. It must equal our custom avatar's size (see renderAvatar), or earlier bubbles sit off-line.
const AVATAR_SIZE = metrics.hp4;
const EmptyDataText = [
    { id: 1, text: "Hello!🤗" },
    { id: 2, text: "What's Up!" },
    { id: 3, text: "How are you?" },
];
const TIME_TEXT_STYLE = { left: { color: colors.white }, right: { color: colors.white } };
const TIME_CONTAINER_STYLE = { left: { marginTop: 2 }, right: { marginTop: 2 } };
const CHAT_THEME = {
    colors: { background: colors.transparent },
    avatar: { size: AVATAR_SIZE },
};

type ChatMessage = {
    _id: number | string;
    text: string;
    createdAt: Date;
    isMine: Boolean;
    user: {
        _id: number | string;
        name: string;
        avatar: any;
    };
    isRead?: boolean; // Read receipt status
    // View-once photos (see viewOnce/)
    messageType?: string;
    viewOnce?: boolean;
    mediaStatus?: 'unopened' | 'opened' | 'expired' | null;
}

/** Newest message first (the order the chat list expects). */
const sortNewestFirst = (a: ChatMessage, b: ChatMessage) => b.createdAt.getTime() - a.createdAt.getTime();

/** Message payloads arrive in several shapes (REST history vs. socket events); normalise to a string. */
const extractMessageText = (item: any): string => {
    const candidates = [item?.message, item?.text, item?.content];
    for (const value of candidates) {
        if (typeof value === 'string') return value;
    }
    for (const value of candidates) {
        if (value && typeof value === 'object') {
            return value.text || value.content || JSON.stringify(value);
        }
    }
    return '';
};

const parseCreatedAt = (item: any): Date => {
    const raw = item?.createdAt || item?.timestamp;
    return raw ? new Date(raw) : new Date();
};

const buildOutgoingMessage = (text: string): ChatMessage => ({
    _id: Math.random(),
    text,
    createdAt: new Date(),
    isMine: true,
    user: {
        _id: USER_ID,
        name: 'Current User',
        avatar: dummyMaleProfile,
    },
});

// Defined at module level so React keeps one component identity (and one running animation)
// instead of remounting it on every TakingScreen render.
const TypingIndicatorBubble = () => {
    const dots = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;

    useEffect(() => {
        const animations = dots.map((dot, index) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(index * 200),
                    Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
                    Animated.timing(dot, { toValue: 0, duration: 400, useNativeDriver: true }),
                ])
            )
        );
        animations.forEach((anim) => anim.start());
        return () => animations.forEach((anim) => anim.stop());
    }, [dots]);

    const dotSize = metrics.hp0_8;
    return (
        <View style={styles.typingBubbleWrapper}>
            <View style={styles.typingBubble}>
                <View style={styles.typingDotsContainer}>
                    {dots.map((dot, index) => (
                        <Animated.View
                            key={index}
                            style={[
                                styles.typingDot,
                                {
                                    width: dotSize,
                                    height: dotSize,
                                    opacity: dot.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
                                },
                            ]}
                        />
                    ))}
                </View>
            </View>
        </View>
    );
};

const TakingScreen = ({ route }: any) => {
    const dispatch = useDispatch();
    const insets = useSafeAreaInsets();
    const store = useStore();
    const matchChatUserDetails = useSelector((state: any) => state.auth.matchChatUserDetails);
    const otherUserProfile = useSelector((state: any) => state.auth.otherUserProfile);
    const userData = useSelector((state: any) => state.auth.userData);
    const chatHistory = useSelector((state: any) => state.auth.chatHistory);
    const refFilter: any = useRef(null);
    const hasLoadedInitialMessages = useRef(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const seenMessageKeysRef = useRef<Set<string>>(new Set());
    const [messagesOwnerMatchId, setMessagesOwnerMatchId] = useState<string | undefined>(matchChatUserDetails?.matchId);
    const [modalVisible, setModalVisible] = useState(false);
    const [otherUserProfie, setOtherUserProfile] = useState(false);

    const [saveReportTitle, setSaveReportTitle] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [isInitialLoading, setIsInitialLoading] = useState(false);
    const [currentProfileData, setCurrentProfileData] = useState({})
    const activeMatchIdRef = useRef<string | undefined>(matchChatUserDetails?.matchId);
    const activeOtherUserIdRef = useRef<string | undefined>(matchChatUserDetails?.userId);
    const matchChatUserDetailsRef = useRef<any>(matchChatUserDetails);
    const otherUserProfileRef = useRef<any>(otherUserProfile);
    const userDataRef = useRef<any>(userData);
    // Long-press delete of my own messages: the message the confirmation dialog is about (null = closed)
    const [deleteTarget, setDeleteTarget] = useState<ChatMessage | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    // Ids of the text messages sent from this screen that the server has not confirmed yet (messageSent gives their real id)
    const pendingTextIdsRef = useRef<(number | string)[]>([]);
    // Takes a deleted message out of the chat, the cached history and the store, so it does not reappear when the chat reopens
    const forgetMessageRef = useRef<(messageId: string) => void>(() => undefined);
    const [fullImage, setFullImage] = useState<any>(false);
    const [gallaryData, setGallaryData] = useState<any>([]);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    // Opening this screen slides it in. Creating the socket, loading profile + history and rebuilding the
    // message list during that slide makes it stutter, so that work waits until the animation is done.
    const [transitionDone, setTransitionDone] = useState(false);
    useEffect(() => {
        const handle = InteractionManager.runAfterInteractions(() => setTransitionDone(true));
        return () => handle.cancel();
    }, []);

    useEffect(() => {
        activeMatchIdRef.current = matchChatUserDetails?.matchId;
        activeOtherUserIdRef.current = matchChatUserDetails?.userId;
        matchChatUserDetailsRef.current = matchChatUserDetails;
    }, [matchChatUserDetails?.matchId, matchChatUserDetails?.userId, matchChatUserDetails]);

    useEffect(() => {
        otherUserProfileRef.current = otherUserProfile;
    }, [otherUserProfile]);

    useEffect(() => {
        userDataRef.current = userData;
    }, [userData]);

    useEffect(() => {
        if (!matchChatUserDetails?.matchId) return;
        setMessages([]);
        seenMessageKeysRef.current = new Set();
        setMessagesOwnerMatchId(matchChatUserDetails?.matchId);
        setCurrentPage(1);
        setHasMoreMessages(true);
        setIsLoadingMore(false);
        setIsInitialLoading(false);
        hasLoadedInitialMessages.current = false;
    }, [matchChatUserDetails?.matchId]);

    useFocusEffect(
        useCallback(() => {
            const matchId = matchChatUserDetails?.matchId;
            if (matchId) {
                dispatch(setActiveChatMatchId(matchId));
                clearNotificationsByMatchId(matchId).catch((error) => {
                    console.error('[TakingScreen] Error clearing notifications:', error);
                });
                const state: any = store?.getState?.();
                const newMatches = state?.auth?.newMatches || [];
                const updatedMatches = newMatches.map((chat: any) => {
                    if (chat.matchId === matchId) {
                        return {
                            ...chat,
                            unreadCount: 0, // Reset unread count when chat is opened
                        };
                    }
                    return chat;
                });
                dispatch(setNewMatches(updatedMatches));
            }
            return () => {
                dispatch(clearActiveChat());
                // Leaving the chat: remember exactly what is on screen (including messages sent or received since it was
                // opened) as the cached history. Reopening shows it at once; without this the chat showed the older cached
                // messages first and the newest ones popped in only when the server's history arrived.
                const shown = messagesRef.current.filter(
                    (message) =>
                        message._id !== TYPING_INDICATOR_ID &&
                        typeof message._id === 'string' &&
                        !message._id.startsWith('pending-')
                );
                const cachedMatchId = matchChatUserDetails?.matchId;
                if (cachedMatchId && shown.length > 0) {
                    setChatHistoryCache(
                        cachedMatchId,
                        shown.slice(0, 50).map((message) => ({
                            _id: message._id,
                            matchId: cachedMatchId,
                            message: message.text,
                            createdAt: message.createdAt.toISOString(),
                            isMine: message.isMine,
                            isRead: message.isRead,
                            messageType: message.messageType,
                            viewOnce: message.viewOnce,
                            mediaStatus: message.mediaStatus,
                        }))
                    );
                }
                // The chats list shows this conversation's newest message straight away (messages sent
                // from this screen are not in the list's data yet), so it never flashes an old preview while it refreshes.
                const newest = messagesRef.current.find(
                    (message) =>
                        message._id !== TYPING_INDICATOR_ID &&
                        !String(message._id).startsWith('pending-') &&
                        !(message.viewOnce && (message.mediaStatus === 'opened' || message.mediaStatus === 'expired' || dismissedPhotoIds.has(String(message._id))))
                );
                const leftMatchId = matchChatUserDetails?.matchId;
                if (!newest || !leftMatchId) return;
                const chats: any[] = (store.getState() as any)?.auth?.newMatches || [];
                const current = chats.find((chat: any) => chat.matchId === leftMatchId);
                const currentTime = new Date(current?.lastMessage?.createdAt).getTime();
                // Only a newer message replaces the preview; never overwrite something fresher the server told us
                if (!current || (Number.isFinite(currentTime) && currentTime >= newest.createdAt.getTime())) return;
                dispatch(setNewMatches(chats.map((chat: any) => chat.matchId !== leftMatchId ? chat : {
                    ...chat,
                    lastMessage: {
                        ...(chat.lastMessage || {}),
                        text: newest.text,
                        message: newest.text,
                        createdAt: newest.createdAt.toISOString(),
                        senderId: newest.isMine ? userDataRef.current?._id : matchChatUserDetailsRef.current?.userId,
                    },
                })));
            };
        }, [dispatch, matchChatUserDetails?.matchId, store])
    );


    const transformChatHistoryToMessages = useCallback((history: any[]): ChatMessage[] => {
        if (!history || !Array.isArray(history) || history.length === 0) {
            return [];
        }

        const userData = userDataRef.current;
        const otherUserProfile = otherUserProfileRef.current;
        const matchChatUserDetails = matchChatUserDetailsRef.current;
        const transformedRaw = history.map((item: any) => {
            const messageText = extractMessageText(item);

            const messageId = item._id || item.messageId || item.id;
            const isMine = item.isMine === true || item.isMine === 'true';
            const avatar = isMine
                ? (userData?.profilePicture?.[0]?.url || userData?.gallery?.[0]?.url || userData?.gender == "male" ? dummyMaleProfile : dummyfemaleProfile)
                : (otherUserProfile?.profilePicture?.[0]?.url || matchChatUserDetails?.profilePicture?.[0]?.url || matchChatUserDetails?.gender == "male" ? dummyMaleProfile : dummyfemaleProfile);

            const createdAt = parseCreatedAt(item);
            const isRead = item.isRead === true || item.isRead === 'true';
            const userId = isMine ? USER_ID : OTHER_USER_ID;
            const createdAtKey =
                item.createdAt || item.timestamp || item.created_at || item.time || createdAt.toISOString();
            const senderIdKey =
                item.senderId || item.sender?._id || item.userId || (isMine ? userData?._id : matchChatUserDetails?.userId) || '';
            const dedupeKey = messageId
                ? `id:${String(messageId)}`
                : `cst:${String(senderIdKey)}:${String(createdAtKey)}:${String(messageText || '')}`;
            return {
                _id: messageId || Date.now() + Math.random(),
                text: String(messageText || ''),
                createdAt: createdAt,
                user: {
                    _id: userId,
                    name: '',
                    avatar: avatar,
                },
                isRead: isRead,
                isMine: isMine,
                messageType: item.messageType,
                viewOnce: item.viewOnce === true || item.messageType === 'image',
                mediaStatus: item.mediaStatus ?? null,
                _dedupeKey: dedupeKey,
            } as any;
        });

        const seenLocal = new Set<string>();
        const transformed = transformedRaw.filter((m: any) => {
            // A view-once photo (sent or received) that was already opened or has expired is not shown again
            if (m.viewOnce && (m.mediaStatus === 'opened' || m.mediaStatus === 'expired' || dismissedPhotoIds.has(String(m._id)))) return false;
            const key = m?._dedupeKey || `id:${String(m?._id)}`;
            if (seenLocal.has(key)) return false;
            seenLocal.add(key);
            return true;
        });

        // Oldest -> newest first so same-timestamp messages keep server order, then flip for the list.
        transformed.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

        return transformed.reverse();
    // Reads user/profile data through refs on purpose: the other user's profile finishes loading right after
    // the screen opens, and depending on it here rebuilt the whole message list (a visible blink).
    }, []);

    const transformedMessages = useMemo(() => {
        const activeMatchId = matchChatUserDetails?.matchId;
        const scopedHistory = Array.isArray(chatHistory)
            ? chatHistory.filter((m: any) => {
                if (!activeMatchId) return true;
                if (m?.matchId) return String(m.matchId) === String(activeMatchId);
                if (m?.conversationId) return String(m.conversationId) === String(activeMatchId);
                return true;
            })
            : chatHistory;
        return transformChatHistoryToMessages(scopedHistory as any);
    }, [chatHistory, transformChatHistoryToMessages, matchChatUserDetails?.matchId]);

    const displayedMessages = useMemo(() => {
        const activeMatchId = matchChatUserDetails?.matchId;
        if (!activeMatchId) return [];
        if (messagesOwnerMatchId !== activeMatchId) return [];
        // First frame: show the (cached) history directly instead of waiting for the effect below
        return messages.length > 0 ? messages : (transformedMessages as ChatMessage[]);
    }, [messages, messagesOwnerMatchId, matchChatUserDetails?.matchId, transformedMessages]);

    const isChatTransitioning = useMemo(() => {
        const activeMatchId = matchChatUserDetails?.matchId;
        if (!activeMatchId) return false;
        return messagesOwnerMatchId !== activeMatchId;
    }, [messagesOwnerMatchId, matchChatUserDetails?.matchId]);

    const socketUrl = useMemo(() => {
        const currentUserId = userData?._id;
        if (!currentUserId) return null;
        const { config } = require('../../config/config');
        return `${config.BASE_URL}?userId=${currentUserId}`;
    }, [userData?._id]);

    const socketRef = useRef<any>(null);
    const [socketReconnectKey, setSocketReconnectKey] = useState(0);

    const socket = useMemo(() => {
        if (!socketUrl || !transitionDone) return null;
        // Disconnect old socket if exists
        if (socketRef.current) {
            try {
                socketRef.current.disconnect?.();
            } catch (e) {
                // ignore
            }
        }
        const newSocket = createSocket(socketUrl);
        socketRef.current = newSocket;
        return newSocket;
    }, [socketUrl, socketReconnectKey, transitionDone]);

    useEffect(() => {
        if (!socket) return;
        const handleConnected = (data: any) => {
            console.log('Socket connected:', data);
        };
        // Only my own unread messages change: every other bubble keeps its object, so it is not re-rendered
        const handleMessagesRead = () => {
            setMessages((prevMessages) =>
                prevMessages.some((msg) => msg.isMine && !msg.isRead)
                    ? prevMessages.map((msg) => (msg.isMine && !msg.isRead ? { ...msg, isRead: true } : msg))
                    : prevMessages
            );
        };
        const handleUserTyping = (response: any) => {
            if (!response) return;
            const myUserId = userDataRef.current?._id;
            const activeOtherUserId = activeOtherUserIdRef.current;

            const typingUserId =
                response?.userId ||
                response?.senderId ||
                response?.sender?._id ||
                response?.fromUserId;
            const typingTargetUserId =
                response?.otherUserId ||
                response?.receiverId ||
                response?.toUserId;

            const activeMatchId = activeMatchIdRef.current;
            const incomingMatchId = response?.matchId || response?.conversationId;
            if (activeMatchId && incomingMatchId && String(incomingMatchId) !== String(activeMatchId)) return;

            if (activeOtherUserId && typingUserId && String(typingUserId) !== String(activeOtherUserId)) return;
            if (myUserId && typingTargetUserId && String(typingTargetUserId) !== String(myUserId)) return;
            if (myUserId && typingUserId && String(typingUserId) === String(myUserId)) return;
            const isTyping =
                response.isTyping === true ||
                response.isTyping === 'true' ||
                response.typing === true ||
                response.typing === 'true' ||
                response.is_typing === true ||
                response.is_typing === 'true';
            const senderName = response.senderName || matchChatUserDetailsRef.current?.name || 'Someone';
            if (isTyping) {
                setMessages((prevMessages) => {
                    const hasTypingIndicator = prevMessages.some((msg) => msg._id === TYPING_INDICATOR_ID);
                    if (hasTypingIndicator) {
                        return prevMessages;
                    }
                    const typingMessage: ChatMessage = {
                        _id: TYPING_INDICATOR_ID,
                        text: '',
                        createdAt: new Date(),
                        isMine: false,
                        user: {
                            _id: 'typing-indicator-user',
                            name: senderName,
                            avatar: matchChatUserDetailsRef.current?.profilePicture?.[0]?.url || matchChatUserDetails?.gender == "male" ? dummyMaleProfile : dummyfemaleProfile,
                        },
                    };
                    return Chat.append(prevMessages, [typingMessage]);
                });
            } else {
                setMessages((prevMessages) =>
                    prevMessages.filter((msg) => msg._id !== TYPING_INDICATOR_ID)
                );
            }
        };


        const handleIncomingMessage = (response: any) => {
            if (!response) return;
            try {
                const activeMatchId = activeMatchIdRef.current;
                const activeOtherUserId = activeOtherUserIdRef.current;
                const incomingMatchId = response?.matchId || response?.conversationId;
                if (activeMatchId && incomingMatchId && String(incomingMatchId) !== String(activeMatchId)) {
                    return;
                }

                const messageText = extractMessageText(response);

                const isMine = response.isMine === true || response.isMine === 'true';
                const avatar = isMine
                    ? (userDataRef.current?.profilePicture?.[0]?.url || userDataRef.current?.gallery?.[0]?.url || userDataRef.current?.gender == "male" ? dummyMaleProfile : dummyfemaleProfile)
                    : (otherUserProfileRef.current?.profilePicture?.[0]?.url || matchChatUserDetailsRef.current?.profilePicture?.[0]?.url || matchChatUserDetailsRef.current?.gender == "male" ? dummyMaleProfile : dummyfemaleProfile);
                const createdAt = parseCreatedAt(response);
                const messageId = response._id || response.messageId || response.id || Date.now() + Math.random();
                const createdAtKey =
                    response.createdAt || response.timestamp || response.created_at || createdAt.toISOString();
                const senderIdKey =
                    response.sender?._id || response.senderId || response.userId || response.fromUserId || '';
                const dedupeKey = (response._id || response.messageId || response.id)
                    ? `id:${String(response._id || response.messageId || response.id)}`
                    : `cst:${String(senderIdKey)}:${String(createdAtKey)}:${String(messageText || '')}`;

                if (seenMessageKeysRef.current.has(dedupeKey)) {
                    return;
                }
                seenMessageKeysRef.current.add(dedupeKey);

                if (!isMine) {
                    const incomingSenderId = response.sender?._id || response.senderId;
                    if (activeOtherUserId && incomingSenderId && String(incomingSenderId) !== String(activeOtherUserId)) {
                        return;
                    }
                    const userId = incomingSenderId || matchChatUserDetailsRef.current?.userId || 'other';
                    const newMessage: ChatMessage = {
                        _id: messageId,
                        text: String(messageText || ''),
                        createdAt: createdAt,
                        isMine: false,
                        messageType: response.messageType,
                        viewOnce: response.viewOnce === true || response.messageType === 'image',
                        mediaStatus: response.mediaStatus ?? null,
                        user: {
                            _id: userId,
                            name: '',
                            avatar: avatar,
                        },
                    };
                    setMessages((prevMessages) => {
                        const withoutTyping = prevMessages.filter((msg) => msg._id !== TYPING_INDICATOR_ID);
                        return Chat.append(withoutTyping, [newMessage]).sort(sortNewestFirst);
                    });
                    if (socket && matchChatUserDetailsRef.current?.userId) {
                        const payload = {
                            senderId: matchChatUserDetailsRef.current.userId,
                        };
                        socket.emit('mark_read', payload);
                    }
                }
            } catch (error) {
                console.error('Error parsing incoming message:', error, response);
            }
        };
        // Log socket connection status
        console.log('[TakingScreen] Setting up socket listeners, connected:', socket.connected);

        socket.on('connect', () => {
            console.log('[TakingScreen] Socket connected successfully');
        });

        socket.on('disconnect', (reason: string) => {
            console.log('[TakingScreen] Socket disconnected:', reason);
        });

        socket.on('connect_error', (error: any) => {
            console.error('[TakingScreen] Socket connection error:', error);
        });

        // The server confirms a text I sent: swap the temporary local id for the real one (needed to delete it)
        const handleTextMessageSent = (payload: any) => {
            const saved = payload?.message;
            if (!saved?._id || saved?.messageType === 'image') return;
            const localId = pendingTextIdsRef.current.shift();
            seenMessageKeysRef.current.add(`id:${String(saved._id)}`);
            if (localId === undefined) return;
            setMessages((previous) => previous.map((message) => (message._id === localId ? { ...message, _id: saved._id } : message)));
        };
        // A message was deleted by its sender: take it out of this chat at once. The server's event name is not
        // documented, so any event whose name says "delete" / "remove" is accepted (and logged, to find the real name).
        const handleAnyEvent = (event: string, payload: any) => {
            if (!/delet|remov/i.test(event)) return;
            console.log('[TakingScreen] Delete-like socket event:', event, payload);
            const ids = [payload?.messageId, payload?._id, payload?.id, payload?.message?._id, ...(Array.isArray(payload?.messageIds) ? payload.messageIds : [])]
                .filter((value) => value !== undefined && value !== null)
                .map(String);
            ids.forEach((id) => forgetMessageRef.current(id));
        };
        socket.on('messageSent', handleTextMessageSent);
        socket.onAny?.(handleAnyEvent);

        socket.on('connected', handleConnected);
        socket.on('messagesRead', handleMessagesRead);
        socket.on('newMessage', handleIncomingMessage);
        socket.on('user_typing', handleUserTyping);

        return () => {
            // CRITICAL: Clean up all listeners to prevent memory leaks and duplicate events
            try {
                socket.off('connect');
                socket.off('disconnect');
                socket.off('connect_error');
                socket.off('messageSent', handleTextMessageSent);
                socket.offAny?.(handleAnyEvent);
                socket.off('connected', handleConnected);
                socket.off('messagesRead', handleMessagesRead);
                socket.off('newMessage', handleIncomingMessage);
                socket.off('user_typing', handleUserTyping);
            } catch (e) {
                console.error('[TakingScreen] Error removing socket listeners:', e);
            }
        };
    }, [socket]);

    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
                if (socketUrl) {
                    setSocketReconnectKey((prev) => prev + 1);
                }
            }
        };

        // Subscribe to app state changes
        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription.remove();
        };
    }, [socketUrl]);

    useEffect(() => {
        if (!socket || !matchChatUserDetails?.userId) return;
        const payload = {
            senderId: matchChatUserDetails.userId,
        };
        socket.emit('mark_read', payload);
    }, [socket, matchChatUserDetails?.userId]);

    useEffect(() => {
        return () => {
            if (socket && socket.connected) {
                socket.disconnect();
            }
        };
    }, [socket]);
    const sendMessageViaSocket = useCallback((message: string, messageType: string = 'text') => {
        if (!socket || !matchChatUserDetails?.userId) {
            console.warn('Cannot send message: socket or receiverId not available');
            return;
        }

        const payload = {
            receiverId: matchChatUserDetails.userId,
            message: message,
            messageType: messageType,
        };

        socket.emit('send_message', payload);
    }, [socket, matchChatUserDetails?.userId]);

    // A viewed photo is gone from the chat, so the chat list must not keep showing the photo label as the last message:
    // it shows the newest message that is still visible instead (from me or from the other user), or none.
    const messagesRef = useRef<ChatMessage[]>([]);
    messagesRef.current = messages;
    const rememberLastMessage = useCallback(
        (photoCreatedAt: number, visibleMessage: ChatMessage | undefined) => {
            const matchId = matchChatUserDetailsRef.current?.matchId;
            if (!matchId || !Number.isFinite(photoCreatedAt)) return;
            const lastMessage = visibleMessage
                ? {
                      text: visibleMessage.text,
                      message: visibleMessage.text,
                      createdAt: visibleMessage.createdAt.toISOString(),
                      senderId: visibleMessage.isMine ? userDataRef.current?._id : matchChatUserDetailsRef.current?.userId,
                      type: visibleMessage.messageType || 'text',
                      messageType: visibleMessage.messageType || 'text',
                  }
                : null;
            dispatch(setLastMessageOverride({ matchId, photoCreatedAt, lastMessage }));
        },
        [dispatch]
    );
    const onPhotoGone = useCallback(
        (photoId: string) => {
            const current = messagesRef.current;
            const photo = current.find((message) => String(message._id) === photoId);
            if (!photo) return;
            const newestVisible = current.find(
                (message) =>
                    String(message._id) !== photoId &&
                    message._id !== TYPING_INDICATOR_ID &&
                    !String(message._id).startsWith('pending-') &&
                    !(message.viewOnce && (message.mediaStatus === 'opened' || message.mediaStatus === 'expired' || dismissedPhotoIds.has(String(message._id))))
            );
            rememberLastMessage(photo.createdAt.getTime(), newestVisible);
        },
        [rememberLastMessage]
    );

    const viewOncePhotos = useViewOncePhotos({
        socket,
        socketUrl,
        receiverId: matchChatUserDetails?.userId,
        matchKey: matchChatUserDetails?.matchId,
        myUserKey: USER_ID,
        setMessages: setMessages as any,
        seenMessageKeysRef,
        onPhotoGone,
    });
    // renderBubble below is memoized once, so it reaches the latest open handler through a ref
    // Photos that are still "Sending..." come from outside the screen, so they are there again after leaving and returning
    const chatMessages = useMemo(
        () => (viewOncePhotos.pendingMessages.length > 0 ? [...viewOncePhotos.pendingMessages, ...displayedMessages] : displayedMessages),
        [viewOncePhotos.pendingMessages, displayedMessages]
    );
    const openPhotoRef = useRef(viewOncePhotos.openPhoto);
    openPhotoRef.current = viewOncePhotos.openPhoto;

    // Gallery / Camera sheet. The picker opens only after the sheet has finished closing, so the two
    // never animate over each other (that is what made the flow stutter).
    const photoSheetRef: any = useRef(null);
    const pendingPhotoSourceRef = useRef<'gallery' | 'camera' | null>(null);
    const sendPhotoRef = useRef(viewOncePhotos.sendPhoto);
    sendPhotoRef.current = viewOncePhotos.sendPhoto;
    const onPhotoSheetClosed = useCallback(() => {
        const source = pendingPhotoSourceRef.current;
        pendingPhotoSourceRef.current = null;
        if (!source) return;
        // The sheet is a native modal that is still being dismissed when its close callback fires. Presenting the
        // camera over it too early makes iOS drop the camera again and leaves the app waiting for it, so wait
        // until the sheet is really gone.
        setTimeout(() => sendPhotoRef.current(source), 500);
    }, []);
    const choosePhotoSource = (source: 'gallery' | 'camera') => {
        pendingPhotoSourceRef.current = source;
        photoSheetRef.current?.close();
    };

    const emitTypingStatus = useCallback((isTyping: boolean) => {
        if (!socket || !matchChatUserDetails?.userId) {
            return;
        }
        const payload = {
            otherUserId: matchChatUserDetails.userId,
            isTyping: isTyping,
        };

        socket.emit('typing', payload);
    }, [socket, matchChatUserDetails?.userId]);

    const loadOlderMessages = useCallback(async () => {
        if (isLoadingMore || !hasMoreMessages || !matchChatUserDetails?.userId) {
            return;
        }
        setIsLoadingMore(true);
        try {
            const nextPage = currentPage + 1;
            const params = {
                page: nextPage,
                limit: 50,
            };
            const data = {
                otherUserId: matchChatUserDetails.userId,
                matchId: matchChatUserDetails.matchId,
            }

            const response: any = await appOperation.customer.loadChatMessagesAPI(params, data);

            if (response?.statusCode === 200 && response?.data) {
                const olderMessages = response.data;

                if (olderMessages && Array.isArray(olderMessages) && olderMessages.length > 0) {
                    const transformedOlderMessages = transformChatHistoryToMessages(olderMessages);
                    setMessages((prevMessages) => {
                        return [...transformedOlderMessages, ...prevMessages].sort(sortNewestFirst);
                    });

                    setCurrentPage(nextPage);
                    const hasMore = olderMessages.length >= 50;
                    setHasMoreMessages(hasMore);
                } else {
                    setHasMoreMessages(false);
                }
            } else {
                setHasMoreMessages(false);
            }
        } catch (error) {
            console.error('Error loading older messages:', error);
            setHasMoreMessages(false);
        } finally {
            setIsLoadingMore(false);
        }
    }, [currentPage, isLoadingMore, hasMoreMessages, matchChatUserDetails?.userId, matchChatUserDetails?.matchId, transformChatHistoryToMessages]);

    useEffect(() => {
        if (transformedMessages.length > 0) {
            const seeded = new Set<string>();
            const uniq = (transformedMessages as any[]).filter((m: any) => {
                const key = m?._dedupeKey || `id:${String(m?._id)}`;
                if (key === 'id:typing-indicator') return false;
                if (seeded.has(key)) return false;
                seeded.add(key);
                return true;
            });
            seenMessageKeysRef.current = seeded;
            // Messages that are only on this device (just sent, or older pages loaded by scrolling up) are not in the stored
            // history. Replacing the list with the history would make them vanish until the chat is reopened, so they stay.
            setMessages((previous) => {
                const localOnly = previous.filter((message) => message._id !== TYPING_INDICATOR_ID && !seeded.has(`id:${String(message._id)}`));
                return (localOnly.length === 0 ? uniq : [...uniq, ...localOnly].sort(sortNewestFirst)) as any;
            });
            setMessagesOwnerMatchId(matchChatUserDetails?.matchId);
            setCurrentPage(1);
            setHasMoreMessages(transformedMessages.length >= 50);
        } else if (Array.isArray(chatHistory) && chatHistory.length === 0) {
            setHasMoreMessages(true);
        }
        if (isInitialLoading) setIsInitialLoading(false);
    }, [transformedMessages, chatHistory]);

    // The newest message of the loaded history is a photo that was already viewed: the chat list shows the last visible message
    useEffect(() => {
        if (!Array.isArray(chatHistory) || chatHistory.length === 0) return;
        let newest: any = null;
        let newestTime = -Infinity;
        for (const item of chatHistory as any[]) {
            const time = new Date(item?.createdAt || item?.timestamp).getTime();
            if (time > newestTime) {
                newestTime = time;
                newest = item;
            }
        }
        const isPhoto = newest && (newest.viewOnce === true || newest.messageType === 'image');
        const isGone = isPhoto && (newest.mediaStatus === 'opened' || newest.mediaStatus === 'expired' || dismissedPhotoIds.has(String(newest._id)));
        if (isGone) rememberLastMessage(newestTime, (transformedMessages as ChatMessage[])[0]);
    }, [chatHistory, transformedMessages, rememberLastMessage]);

    const onSend = useCallback((newMessages: ChatMessage[] = []) => {
        setMessagesOwnerMatchId(matchChatUserDetails?.matchId);
        setMessages(prev => {
            return Chat.append(prev, newMessages).sort(sortNewestFirst);
        });
        if (newMessages.length > 0 && newMessages[0].text) {
            pendingTextIdsRef.current.push(newMessages[0]._id);
            sendMessageViaSocket(newMessages[0].text, 'text');
        }
    }, [sendMessageViaSocket, matchChatUserDetails?.matchId]);

    forgetMessageRef.current = (messageId: string) => {
        setMessages((previous) => previous.filter((message) => String(message._id) !== messageId));
        const matchId = matchChatUserDetailsRef.current?.matchId;
        if (matchId) removeMessageFromChatHistoryCache(matchId, messageId);
        const history: any[] = (store.getState() as any)?.auth?.chatHistory;
        if (Array.isArray(history)) {
            dispatch(chatHistoryDetails(history.filter((message: any) => String(message?._id ?? message?.messageId ?? message?.id) !== messageId)));
        }
    };

    // ---- Delete one of my own messages (long press) ----
    const requestDelete = useCallback((message: ChatMessage | undefined) => {
        if (!message || !message.isMine || message._id === TYPING_INDICATOR_ID) return;
        // Messages (and photos) the server has not confirmed yet have no deletable id
        if (String(message._id).startsWith('pending-')) return;
        if (typeof message._id === 'number') {
            toastAlert.showToastError('This message is still being sent. Try again in a moment.');
            return;
        }
        setDeleteTarget(message);
    }, []);
    const requestDeleteRef = useRef(requestDelete);
    requestDeleteRef.current = requestDelete;

    const confirmDelete = useCallback(async () => {
        const target = deleteTarget;
        if (!target || isDeleting) return;
        setIsDeleting(true);
        try {
            const response: any = await appOperation.customer.deleteChatMessageAPI(String(target._id));
            if (response?.statusCode !== 200 && response?.success !== true) {
                throw new Error(response?.message || 'Delete failed');
            }
            const remaining = messagesRef.current.filter((message) => message._id !== target._id);
            if (target.viewOnce) dismissedPhotoIds.add(String(target._id));
            forgetMessageRef.current(String(target._id));
            setDeleteTarget(null);
            // The chat list's last message follows: it becomes the newest message that is left
            const matchId = matchChatUserDetailsRef.current?.matchId;
            const newest = remaining.find((message) => message._id !== TYPING_INDICATOR_ID && !String(message._id).startsWith('pending-'));
            const wasNewest = messagesRef.current.find((message) => message._id !== TYPING_INDICATOR_ID && !String(message._id).startsWith('pending-'))?._id === target._id;
            if (matchId && wasNewest) {
                const chats: any[] = (store.getState() as any)?.auth?.newMatches || [];
                dispatch(setNewMatches(chats.map((chat: any) => chat.matchId !== matchId ? chat : {
                    ...chat,
                    lastMessage: newest ? {
                        ...(chat.lastMessage || {}),
                        text: newest.text,
                        message: newest.text,
                        createdAt: newest.createdAt.toISOString(),
                        senderId: newest.isMine ? userDataRef.current?._id : matchChatUserDetailsRef.current?.userId,
                    } : null,
                })));
            }
            toastAlert.showToastError('Message deleted.');
        } catch (error: any) {
            console.warn('[TakingScreen] Delete failed:', error?.message ?? error);
            toastAlert.showToastError("Couldn't delete the message. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    }, [deleteTarget, isDeleting, dispatch, store]);

    const renderDay = useCallback((props: any) => {
        if (props.currentMessage?._id === 'typing-indicator') return null;
        const date = props.currentMessage?.createdAt ? new Date(props.currentMessage.createdAt) : null;
        if (!date) return null;

        const today = new Date();
        const isToday = date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
        const displayText = isToday ? 'Today' : `${date.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()]} ${date.getFullYear()}`;

        return (
            <ImageBackground source={timeShowNewBackground} resizeMode='stretch' style={{ height: metrics.hp4, width: metrics.hp14, alignSelf: 'center', marginVertical: 10, alignItems: "center", justifyContent: "center" }} >
                <AppText color={WHITE} weight={INTER_SEMI_BOLD} type={TEN}>{displayText}</AppText>
            </ImageBackground>

        );
    }, []);

    const renderBubble = useCallback((props: any) => {
        const isTypingIndicator =
            props.currentMessage?._id === 'typing-indicator';

        if (isTypingIndicator) {
            return <TypingIndicatorBubble />;
        }

        if (props.currentMessage?.viewOnce) {
            return (
                <ViewOncePhotoBubble
                    message={props.currentMessage}
                    onOpen={(id) => openPhotoRef.current(id)}
                    // Long press on one of my own photos offers to delete it, like a text message
                    onLongPress={() => requestDeleteRef.current(props.currentMessage)}
                />
            );
        }


        return (
            <Bubble
                {...props}
                // Long press on one of my own messages offers to delete it
                onLongPressMessage={(_context: any, message: any) => requestDeleteRef.current(message)}
                wrapperStyle={{
                    right: {
                        backgroundColor: "#555359",
                        borderBottomRightRadius: 0,
                        borderRadius: metrics.hp1,
                        marginRight: metrics.hp0_3,
                    },

                    left: {
                        backgroundColor: "#7A4E40",
                        borderBottomLeftRadius: 0,
                        borderRadius: metrics.hp1,
                        marginLeft: 0,
                    },
                }}
                textStyle={{
                    left: {
                        color: 'white',
                        fontSize: fontSize(14),
                        fontFamily: interSemiBold,
                    },
                    right: {
                        color: 'white',
                        fontSize: fontSize(14),
                        fontFamily: interSemiBold,
                    },
                }}
                timeTextStyle={{
                    left: {
                        color: colors.nanoOpecity,
                        fontSize: 10,
                    },
                    right: {
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: 10,
                    },
                }}
            />
        );
    }, []);
    const seeOtherProfile = useCallback(() => {
        const data = { userId: matchChatUserDetails?.userId };
        dispatch(getOtherProfile(data, setCurrentProfileData, setOtherUserProfile));
    }, [dispatch, matchChatUserDetails?.userId]);
    const renderAvatar = useCallback((props: any) => {
        if (props.currentMessage.user._id === USER_ID) return null;
        if (props.currentMessage._id === 'typing-indicator' || props.currentMessage.user._id === 'typing-indicator-user') {
            return null;
        }
        return (
            <TouchableOpacityView onPress={() => seeOtherProfile()}>
                <PortraitAvatar
                    source={matchChatUserDetails?.profilePicture?.url ? { uri: matchChatUserDetails?.profilePicture?.url } : matchChatUserDetails?.gender == "male" ? dummyMaleProfile : dummyfemaleProfile}
                    style={{ width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2, marginBottom: metrics.hp1_5, backgroundColor: '#2A2A2D' }}
                />
            </TouchableOpacityView>
        );
    }, [matchChatUserDetails?.profilePicture, matchChatUserDetails?.gender, seeOtherProfile]);
    const unMatchButton = () => {
        const data = {
            matchId: matchChatUserDetails?.matchId
        }
        dispatch(userUnmatchAPI(data))
        setModalVisible(false);
        NavigationService.goBack();
    }
    const unBlockButton = () => {
        const data = {
            blockedId: matchChatUserDetails?.userId,
        };
        dispatch(blockByIdAPIUser(data))
        setModalVisible(false);
        NavigationService.goBack();
    }
    const renderTime = useCallback((props: any) => {
        if (props.currentMessage?._id === 'typing-indicator') return null;
        return (
            <View>
                <Time {...props} timeTextStyle={TIME_TEXT_STYLE} containerStyle={TIME_CONTAINER_STYLE} />
            </View>
        );
    }, []);

    // The message box keeps its own text (see ChatInputBar), so typing never re-renders this screen
    const sendText = useCallback((text: string) => onSend([buildOutgoingMessage(text)]), [onSend]);
    const openPhotoSheet = useCallback(() => photoSheetRef.current?.open(), []);
    const renderCustomInput = useCallback(
        () => (
            <ChatInputBar
                key={matchChatUserDetails?.matchId}
                onSendText={sendText}
                onTypingChange={emitTypingStatus}
                onPhotoPress={openPhotoSheet}
            />
        ),
        [matchChatUserDetails?.matchId, sendText, emitTypingStatus, openPhotoSheet]
    );
    // The actions sheet is a native modal. iOS cannot present another modal (the unmatch / block dialogs) while it is still
    // being dismissed and silently drops it, so the chosen action runs only once the sheet has really closed.
    const pendingActionRef = useRef<(() => void) | null>(null);
    const onActionsSheetClosed = useCallback(() => {
        const action = pendingActionRef.current;
        pendingActionRef.current = null;
        if (!action) return;
        setTimeout(action, Platform.OS === "ios" ? 400 : 0);
    }, []);
    const onthreedot = (index: any) => {
        if (index == "0") pendingActionRef.current = () => { setSaveReportTitle("unMatch"); setModalVisible(true); };
        else if (index == "1") pendingActionRef.current = () => NavigationService.navigate(NAVIGATION_REPORT_SCREEN, { reportedUserId: matchChatUserDetails?.userId });
        else if (index == "2") pendingActionRef.current = () => { setSaveReportTitle("Block"); setModalVisible(true); };
        else return;
        refFilter?.current?.close();
    };
    const openActionsSheet = useCallback(() => refFilter?.current?.open(), []);
    const showFullProfile = useCallback((item: any, index: number = 0) => {
        setGallaryData(item);
        setSelectedImageIndex(index);
        setFullImage(true);
    }, []);
    const sendEmptyMessage = useCallback((text: string) => {
        if (!text?.trim()) return;
        onSend([buildOutgoingMessage(text.trim())]);
    }, [onSend]);
    const forEmptyChat = !!route?.params?.forEmptyChat;
    const chatEmptyRender = useCallback(() => {
        if (!forEmptyChat) return null
        return (
            // The chat list is upside down, so this is turned back. Android flips the list with a 180deg rotation, but iOS
            // mirrors it vertically (scaleY -1): rotating here as well left the iOS text mirrored left-to-right.
            <View style={{ transform: Platform.OS === "ios" ? [{ scaleY: -1 }] : [{ rotate: "180deg" }], }}>
                <TouchableOpacityView activeOpacity={0.7} onPress={() => sendEmptyMessage("Hi")} style={{ alignItems: "center", justifyContent: "center" }}>
                    <FastImage source={helloHand} resizeMode='contain' style={{ height: metrics.hp18, width: metrics.hp18, }} />
                    <TouchableOpacityView activeOpacity={0.7} onPress={() => sendEmptyMessage("Hi")}>
                        <ImageBackground source={emptyTextImage} resizeMode='stretch' style={{ paddingHorizontal: metrics.hp2, paddingVertical: metrics.hp1, alignItems: "center", justifyContent: "center" }}>
                            <AppText color={WHITE} type={THIRTEEN} weight={INTER_SEMI_BOLD}>
                                Say Hi!
                            </AppText>
                        </ImageBackground>
                    </TouchableOpacityView>
                </TouchableOpacityView>
                <ScrollView showsHorizontalScrollIndicator={false} horizontal={true} contentContainerStyle={{ marginTop: metrics.hp25 }}>
                    {EmptyDataText?.map((item) => {
                        return (
                            <TouchableOpacityView key={item.id} activeOpacity={0.7} onPress={() => sendEmptyMessage(item.text)} style={{ marginLeft: metrics.hp1 }}>
                                <ImageBackground key={item.id} source={emptyTextImage} resizeMode='stretch' style={{ paddingHorizontal: metrics.hp2, paddingVertical: metrics.hp1, alignItems: "center", justifyContent: "center", }}>
                                    <AppText color={WHITE} type={THIRTEEN} weight={INTER_SEMI_BOLD}>
                                        {item.text}
                                    </AppText>
                                </ImageBackground>
                            </TouchableOpacityView>
                        )
                    })}
                </ScrollView>
            </View>
        )
    }, [forEmptyChat, sendEmptyMessage]);

    // Props handed to the chat list are kept stable, so an unrelated state change never makes the whole list re-render
    const chatUser = useMemo(
        () => ({ _id: USER_ID, name: 'Gurrent User', avatar: userData?.gender == "male" ? dummyMaleProfile : dummyfemaleProfile }),
        [userData?.gender]
    );
    const loadEarlierMessagesProps = useMemo(
        () => ({
            isAvailable: hasMoreMessages,
            onPress: loadOlderMessages,
            isLoading: isLoadingMore,
            isInfiniteScrollEnabled: true,
            activityIndicatorColor: colors.purple,
            activityIndicatorSize: 'small' as const,
        }),
        [hasMoreMessages, loadOlderMessages, isLoadingMore]
    );
    const renderLoadEarlier = useCallback(() => {
        if (!hasMoreMessages || !isLoadingMore) return null;
        return (
            <View style={{ paddingVertical: 10, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={colors.purple} />
            </View>
        );
    }, [hasMoreMessages, isLoadingMore]);

    return (
        <AppSafeAreaView color={newColor.blackNew}>
            <ChatHeader onPress={openActionsSheet} seeProfileOther={seeOtherProfile} />
            <ImageBackground
                source={chatBackground}
                resizeMode="cover"
                style={styles.containerChat}>
                <KeyboardInsetView>
                <Chat
                    messages={chatMessages}
                    onSend={onSend}
                    user={chatUser}
                    renderAvatar={renderAvatar}
                    renderBubble={renderBubble}
                    renderDay={renderDay}
                    renderTime={renderTime}
                    renderInputToolbar={renderCustomInput}
                    renderChatEmpty={chatEmptyRender}
                    isUserAvatarVisible={false}
                    // Keyboard lift is handled by KeyboardInsetView (real IME inset)
                    keyboardAvoidingViewProps={{ enabled: false }}
                    loadEarlierMessagesProps={loadEarlierMessagesProps}
                    theme={CHAT_THEME}
                    darkTheme={CHAT_THEME}
                    renderLoadEarlier={renderLoadEarlier}
                />
                </KeyboardInsetView>
                {isChatTransitioning && (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color={colors.purple} />
                    </View>
                )}
            </ImageBackground>
            
            <Modal animationType="fade" transparent statusBarTranslucent visible={!!deleteTarget} onRequestClose={() => !isDeleting && setDeleteTarget(null)}>
                <View style={styles.centeredView}>
                    <View style={[styles.confirmContainer, { height: undefined, paddingVertical: metrics.hp3 }]}>
                        <AppText style={{ textAlign: "center" }} type={TWENTY_FOUR} weight={SCHEHERAZADE_BOLD} color={WHITE}>
                            Delete message?
                        </AppText>
                        <AppText style={{ textAlign: "center", marginTop: metrics.hp1, marginHorizontal: metrics.hp2 }} type={TWELVE} weight={INTER_MEDIUM} color={OPECITY} numberOfLines={3}>
                            {deleteTarget?.text}
                        </AppText>
                        <AppText style={{ textAlign: "center", marginTop: metrics.hp1 }} type={TEN} weight={INTER_MEDIUM} color={OPECITY}>
                            This can't be undone.
                        </AppText>
                        <TouchableOpacityView onPress={confirmDelete} disabled={isDeleting} style={[styles.ediButton, { backgroundColor: "#E6B7A8", marginTop: metrics.hp3, width: "55%", opacity: isDeleting ? 0.6 : 1 }]}>
                            {isDeleting ? <ActivityIndicator size="small" color={BLACK} /> : (
                                <AppText color={BLACK} weight={INTER_SEMI_BOLD} type={TWELVE}>
                                    Yes, Delete
                                </AppText>
                            )}
                        </TouchableOpacityView>
                        <AppText onPress={() => !isDeleting && setDeleteTarget(null)} weight={INTER_SEMI_BOLD} type={TWELVE} style={{ textAlign: "center", marginTop: metrics.hp2 }} color={WHITE}>
                            No, cancel
                        </AppText>
                    </View>
                </View>
            </Modal>
            <ViewOncePhotoViewer visible={viewOncePhotos.viewerVisible} imageUri={viewOncePhotos.viewerImage} onClose={viewOncePhotos.closeViewer} />
            {/* Sized to its two rows (no empty space below them) and drawn under the navigation bar, so the chat
                behind it no longer shows through a strip at the bottom of the screen */}
            <RBSheet ref={photoSheetRef} openDuration={150} closeDuration={150} onClose={onPhotoSheetClosed}
                height={metrics.hp21 + insets.bottom}
                customModalProps={{ statusBarTranslucent: true, navigationBarTranslucent: true }}
                customStyles={{
                    wrapper: { backgroundColor: "#00000020" },
                    container: { backgroundColor: "#151517", borderTopLeftRadius: metrics.hp2, borderTopRightRadius: metrics.hp2, paddingBottom: insets.bottom }
                }}>
                <View style={styles.containerRb}>
                    <TouchableOpacityView onPress={() => choosePhotoSource('gallery')} style={styles.containerViewRb}>
                        <FastImage source={gallaryICon} resizeMode='contain' style={styles.rbIcon} />
                        <View style={styles.textContainerRb}>
                            <AppText type={FORTEEN} weight={INTER_SEMI_BOLD} color={WHITE}>Gallery</AppText>
                            <AppText type={TEN} weight={INTER_MEDIUM} color={WHITE}>Send a photo from your library. It can be opened only once.</AppText>
                        </View>
                    </TouchableOpacityView>
                    <TouchableOpacityView onPress={() => choosePhotoSource('camera')} style={styles.containerViewRb}>
                        <FastImage source={addPhotoIcon} resizeMode='contain' style={styles.rbIcon} />
                        <View style={styles.textContainerRb}>
                            <AppText type={FORTEEN} weight={INTER_SEMI_BOLD} color={WHITE}>Camera</AppText>
                            <AppText type={TEN} weight={INTER_MEDIUM} color={WHITE}>Take a new photo and send it. It can be opened only once.</AppText>
                        </View>
                    </TouchableOpacityView>
                </View>
            </RBSheet>
            <RBSheet ref={refFilter} openDuration={100} onClose={onActionsSheetClosed}
                height={Dimensions.get('window').height / 3.10}
                customStyles={{
                    wrapper: {
                        backgroundColor: "#00000020",
                    },
                    container: {
                        backgroundColor: "#151517",
                        borderTopLeftRadius: metrics.hp2,
                        borderTopRightRadius: metrics.hp2
                    }
                }}>
                <View style={styles.containerRb}>
                    {threeDotData?.map((item, index) => {
                        return (
                            <TouchableOpacityView onPress={() => onthreedot(index)} key={index} style={styles.containerViewRb}>
                                <FastImage source={item.icon} resizeMode='contain' style={styles.rbIcon} />
                                <View style={styles.textContainerRb}>
                                    <AppText type={FORTEEN} weight={INTER_SEMI_BOLD} color={WHITE}>
                                        {item.headLine}{" "}{matchChatUserDetails?.username ? matchChatUserDetails?.username : matchChatUserDetails?.name}
                                    </AppText>
                                    <AppText type={TEN} weight={INTER_MEDIUM} color={WHITE}>
                                        {item.disLine}
                                    </AppText>
                                </View>
                            </TouchableOpacityView>
                        )
                    })}
                </View>
            </RBSheet>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}>
                {saveReportTitle == "unMatch" &&
                    <View style={styles.centeredView}>
                        <View style={styles.confirmContainer}>
                            <FastImage source={unmatchModalImage} resizeMode="stretch" style={styles.bdyBack} />
                            <AppText style={{ textAlign: "center" }} type={TWENTY_FOUR} weight={SCHEHERAZADE_BOLD} color={WHITE}>
                                Would you like to
                            </AppText>
                            <AppText style={{ marginTop: -metrics.hp3, textAlign: "center" }} type={TWENTY_FOUR} weight={SCHEHERAZADE_BOLD} color={WHITE}>
                                Unmatch this user?
                            </AppText>
                            <TouchableOpacityView onPress={() => unMatchButton()} style={[styles.ediButton, { backgroundColor: "#E6B7A8", marginTop: metrics.hp0 }]}>
                                <AppText color={BLACK} weight={INTER_SEMI_BOLD} type={TWELVE}>
                                    Yes, Unmatch
                                </AppText>
                            </TouchableOpacityView>
                            <AppText onPress={() => setModalVisible(false)} weight={INTER_SEMI_BOLD} type={TWELVE} style={{ textAlign: "center", marginTop: metrics.hp2 }} color={WHITE}>
                                No, cancel
                            </AppText>
                        </View>
                    </View>}
                {saveReportTitle == "Block" &&
                    <View style={styles.centeredView}>
                        <View style={[styles.confirmContainer, { height: metrics.hp42, }]}>
                            <FastImage source={blockModalImage} resizeMode="stretch" style={[styles.bdyBack, { height: metrics.hp18 }]} />
                            <AppText style={{ textAlign: "center" }} type={TWENTY_FOUR} weight={SCHEHERAZADE_BOLD} color={WHITE}>
                                Block {matchChatUserDetails?.name}?
                            </AppText>
                            <AppText style={{ marginTop: -metrics.hp2, textAlign: "center" }} type={TWELVE} weight={INTER_MEDIUM} color={OPECITY}>
                                You won’t be able to undo this. You sure{'\n'} to continue?
                            </AppText>
                            <TouchableOpacityView onPress={() => unBlockButton()} style={[styles.ediButton, { backgroundColor: "#E6B7A8", marginTop: metrics.hp2 }]}>
                                <AppText color={BLACK} weight={INTER_SEMI_BOLD} type={TWELVE}>
                                    Yes, Block
                                </AppText>
                            </TouchableOpacityView>
                            <AppText onPress={() => setModalVisible(false)} weight={INTER_SEMI_BOLD} type={TWELVE} style={{ textAlign: "center", marginTop: metrics.hp2 }} color={WHITE}>
                                No, cancel
                            </AppText>
                        </View>
                    </View>}
            </Modal>

            <Modal
                animationType="fade"
                visible={otherUserProfie}
                statusBarTranslucent
                onRequestClose={() => setOtherUserProfile(false)}>
                <SeeOtherUserProfile currentProfileData={currentProfileData} setModalVisible={setOtherUserProfile}
                    showFullProfile={showFullProfile} />
                {/* Inside the profile modal: iOS cannot show a second, separate modal over one that is already open */}
                <Modal
                    animationType="fade"
                    transparent
                    statusBarTranslucent
                    visible={fullImage}
                    onRequestClose={() => setFullImage(false)}>
                    <FullScreenImage gallaryData={gallaryData} setFullImage={setFullImage} initialIndex={selectedImageIndex} />
                </Modal>
            </Modal>
        </AppSafeAreaView>
    );
};

export default TakingScreen;

const styles = StyleSheet.create({containerChat: { flex: 1, backgroundColor: newColor.blackNew, overflow: 'hidden' },
    containerRb: { paddingHorizontal: metrics.hp2, paddingVertical: metrics.hp2 },
    containerViewRb: { paddingHorizontal: metrics.hp1, paddingVertical: metrics.hp2, flexDirection: "row", backgroundColor: "#212123", marginBottom: metrics.hp0_5, borderRadius: metrics.hp1_5 },
    rbIcon: { height: metrics.hp2_5, width: metrics.hp2_5, marginTop: metrics.hp0_5, marginLeft: metrics.hp1 },
    textContainerRb: { paddingLeft: metrics.hp2, paddingRight: metrics.hp5 },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.transparentBlack,
        paddingHorizontal: metrics.hp2
    },
    confirmContainer: {
        height: metrics.hp40,
        backgroundColor: "#212123",
        width: Screen.Width / 1.20,
        borderRadius: metrics.hp2,
    },
    bdyBack: {
        height: metrics.hp17,
        borderTopRightRadius: metrics.hp2,
        borderTopLeftRadius: metrics.hp2,

    },
    ediButton: {
        height: metrics.hp5,
        borderWidth: 1,
        borderColor: "#E6B7A810",
        borderRadius: metrics.hp4,
        alignItems: "center",
        justifyContent: "center",
        width: "40%",
        alignSelf: "center",
    },    loaderContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: newColor.blackNew,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },typingBubbleWrapper: {
        marginBottom: metrics.hp1_2,
        marginLeft: metrics.hp2,
        alignSelf: 'flex-start',
    },
    typingBubble: {
        backgroundColor: '#FFFFFF',
        borderRadius: metrics.hp1_5,
        paddingHorizontal: metrics.hp1,
        paddingVertical: metrics.hp0_5,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: metrics.hp1_7,
    },
    typingDotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: metrics.hp0_5,
    },
    typingDot: {
        backgroundColor: colors.darkOpecity,
        borderRadius: metrics.hp0_5,
    },});

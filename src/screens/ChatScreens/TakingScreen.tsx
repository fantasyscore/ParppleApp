import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Bubble, GiftedChat, Time } from 'react-native-gifted-chat';
import { blackIcon, blockModalImage, check, checks, emojiIcon, noccce, profileImage, rightBlack, sendButton, unmatchModalImage } from '../../helper/ImageAssets';
import { AppSafeAreaView } from '../../common/AppSafeAreaView';
import ChatHeader from '../../common/ChatHeader';
import { StyleSheet, View, TextInput, KeyboardAvoidingView, Keyboard, Dimensions, Modal, Animated } from 'react-native';
import { colors } from '../../theme/colors';
import metrics from '../../assets/Metrics';
import { AppText, fontSize, FORTEEN, INTER_BOLD, INTER_MEDIUM, INTER_SEMI_BOLD, LIGHT_BLACK, OPECITY_DARK, PURPLE, SCHEHERAZADE_BOLD, SIXTEEN, TEN, TWELVE, TWENTY_FOUR, WHITE } from '../../common/AppText';
import { TouchableOpacityView } from '../../common/TouchableOpacityView';
import FastImage from 'react-native-fast-image';
import { interMedium, interSemiBold } from '../../theme/typography';
import EmojiSelector, { Categories } from 'react-native-emoji-selector';
import { Screen } from '../../theme/dimens';
import ChatProfileScreen from './ChatProfileScreen';
import RBSheet from 'react-native-raw-bottom-sheet';
import { threeDotData } from '../../common/UiltData';
import NavigationService from '../../navigation/NavigationService';
import { NAVIGATION_REPORT_SCREEN } from '../../navigation/routes';
import { useDispatch, useSelector } from 'react-redux';
import { getOtherProfile, userBlockAPI, userUnmatchAPI } from '../../actions/authActions';
import { createSocket } from '../../common/Socket';
import { appOperation } from '../../appOperation';
import { ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { clearActiveChat, setActiveChatMatchId } from '../../slices/inAppNotificationSlice';
import { chatHistoryDetails } from '../../slices/loginServices/authSlice';

const USER_ID = 1;

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
}



const TakingScreen = () => {
    const dispatch = useDispatch();
    const matchChatUserDetails = useSelector((state: any) => state.auth.matchChatUserDetails);
    const otherUserProfile = useSelector((state: any) => state.auth.otherUserProfile);
    const userData = useSelector((state: any) => state.auth.userData);
    const chatHistory = useSelector((state: any) => state.auth.chatHistory);
    const refFilter: any = useRef(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const hasLoadedInitialMessages = useRef(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    // Prevent duplicate message rendering when chat is open:
    // Deduplicate by stable id if available, otherwise by (senderId + createdAt + text).
    const seenMessageKeysRef = useRef<Set<string>>(new Set());
    // Prevent "flash" of previous chat: only render messages that belong to the currently active matchId.
    const [messagesOwnerMatchId, setMessagesOwnerMatchId] = useState<string | undefined>(matchChatUserDetails?.matchId);
    const [tabSelect, setTabSelect] = useState('Chat');
    const [inputText, setInputText] = useState('');
    const [emojiVisible, setEmojiVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [saveReportTitle, setSaveReportTitle] = useState("");
    const [profileData, setProfileData] = useState();
    const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
    const [typingUserName, setTypingUserName] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    // WhatsApp-like: show chat instantly (no blocking loader overlay)
    const [isInitialLoading, setIsInitialLoading] = useState(false);

    // Keep latest chat identifiers in refs so socket listeners never use stale chat context.
    const activeMatchIdRef = useRef<string | undefined>(matchChatUserDetails?.matchId);
    const activeOtherUserIdRef = useRef<string | undefined>(matchChatUserDetails?.userId);
    const matchChatUserDetailsRef = useRef<any>(matchChatUserDetails);
    const otherUserProfileRef = useRef<any>(otherUserProfile);
    const userDataRef = useRef<any>(userData);

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

    // Mandatory: strict message isolation when switching between chats
    useEffect(() => {
        if (!matchChatUserDetails?.matchId) return;
        // Clear global chatHistory immediately to avoid stale redux data being applied to the new chat
        dispatch(chatHistoryDetails([]));
        setMessages([]);
        seenMessageKeysRef.current = new Set();
        setMessagesOwnerMatchId(matchChatUserDetails?.matchId);
        setIsOtherUserTyping(false);
        setTypingUserName('');
        setEmojiVisible(false);
        setInputText('');
        setCurrentPage(1);
        setHasMoreMessages(true);
        setIsLoadingMore(false);
        setIsInitialLoading(false);
        hasLoadedInitialMessages.current = false;
    }, [matchChatUserDetails?.matchId]);

    // Global: mark which chat is currently open so in-app notifications can be suppressed for that chat user.
    useFocusEffect(
        useCallback(() => {
            const matchId = matchChatUserDetails?.matchId;
            if (matchId) {
                dispatch(setActiveChatMatchId(matchId));
            }
            return () => {
                dispatch(clearActiveChat());
            };
        }, [dispatch, matchChatUserDetails?.matchId])
    );

    const transformChatHistoryToMessages = useCallback((history: any[]): ChatMessage[] => {
        if (!history || !Array.isArray(history) || history.length === 0) {
            return [];
        }

        const transformedRaw = history.map((item: any) => {
            // Extract message text - handle both string and object cases
            let messageText = '';
            if (typeof item.message === 'string') {
                messageText = item.message;
            } else if (typeof item.text === 'string') {
                messageText = item.text;
            } else if (item.message && typeof item.message === 'object') {
                // If message is an object, try to extract text from it
                messageText = item.message.text || item.message.content || JSON.stringify(item.message);
            } else if (item.text && typeof item.text === 'object') {
                messageText = item.text.text || item.text.content || JSON.stringify(item.text);
            }

            const messageId = item._id || item.messageId || item.id;
            const isMine = item.isMine === true || item.isMine === 'true';
            const avatar = isMine
                ? (userData?.profilePicture?.[0]?.url || userData?.gallery?.[0]?.url || profileImage)
                : (otherUserProfile?.profilePicture?.[0]?.url || matchChatUserDetails?.profilePicture?.[0]?.url || profileImage);

            let createdAt: Date;
            if (item.createdAt) {
                createdAt = typeof item.createdAt === 'string'
                    ? new Date(item.createdAt)
                    : new Date(item.createdAt);
            } else {
                createdAt = new Date();
            }
            const isRead = item.isRead === true || item.isRead === 'true';
            const userId = isMine ? 1 : 2;
            const createdAtKey =
                item.createdAt || item.timestamp || item.created_at || item.time || createdAt.toISOString();
            const senderIdKey =
                item.senderId || item.sender?._id || item.userId || (isMine ? userData?._id : matchChatUserDetails?.userId) || '';
            const dedupeKey = messageId
                ? `id:${String(messageId)}`
                : `cst:${String(senderIdKey)}:${String(createdAtKey)}:${String(messageText || '')}`;
            return {
                _id: messageId || Date.now() + Math.random(),
                text: String(messageText || ''), // Ensure text is always a string
                createdAt: createdAt,
                user: {
                    _id: userId,
                    name: '',
                    avatar: avatar,
                },
                isRead: isRead,
                isMine: isMine,
                _dedupeKey: dedupeKey,
            } as any;
        });

        // Dedupe within history payload (prevents duplicates if API returns duplicates)
        const seenLocal = new Set<string>();
        const transformed = transformedRaw.filter((m: any) => {
            const key = m?._dedupeKey || `id:${String(m?._id)}`;
            if (seenLocal.has(key)) return false;
            seenLocal.add(key);
            return true;
        });

        // Sort by createdAt to ensure proper order (oldest first, then reverse for GiftedChat)
        transformed.sort((a, b) => {
            const timeA = a.createdAt.getTime();
            const timeB = b.createdAt.getTime();
            return timeA - timeB;
        });

        // Reverse for GiftedChat (newest first)
        return transformed.reverse();
    }, [userData, otherUserProfile, matchChatUserDetails]);

    const transformedMessages = useMemo(() => {
        const activeMatchId = matchChatUserDetails?.matchId;
        const scopedHistory = Array.isArray(chatHistory)
            ? chatHistory.filter((m: any) => {
                // If API provides matchId per message, enforce it; otherwise keep item.
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
        return messagesOwnerMatchId === activeMatchId ? messages : [];
    }, [messages, messagesOwnerMatchId, matchChatUserDetails?.matchId]);

    const isChatTransitioning = useMemo(() => {
        const activeMatchId = matchChatUserDetails?.matchId;
        if (!activeMatchId) return false;
        return messagesOwnerMatchId !== activeMatchId;
    }, [messagesOwnerMatchId, matchChatUserDetails?.matchId]);

    const socketUrl = useMemo(() => {
        const currentUserId = userData?._id;
        if (!currentUserId) return null;
        return `https://api.parpple.com/?userId=${currentUserId}`;
    }, [userData?._id]);

    const socket = useMemo(() => {
        if (!socketUrl) return null;
        return createSocket(socketUrl);
    }, [socketUrl]);

    useEffect(() => {
        if (!socket) return;
        const handleConnected = (data: any) => {
            console.log('Socket connected:', data);
        };
        const handleNewMatch = (response: any) => {
            console.log('New match received:', response);
        };
        const handleSuperLike = (response: any) => {
            console.log('Super like received:', response);
        };
        const handleMessageSent = (response: any) => {
            console.log('Message sent confirmation:', response);
        };
        const handleMessagesRead = (response: any) => {
            console.log('Messages read confirmation:', response);
            setMessages((prevMessages) =>
                prevMessages.map((msg) => ({ ...msg, isRead: true }))
            );
        };
        const handleMessageMarkedRead = (response: any) => {
            console.log('Message marked read event received:', response);
        };
        const handleUserTyping = (response: any) => {
            console.log('User typing event received:', response);
            if (!response) return;
            // Strict isolation (supports your payload):
            // response.userId      -> the user who is typing (sender)
            // response.otherUserId -> the user who should see this typing state (receiver / me)
            const myUserId = userDataRef.current?._id;
            const activeOtherUserId = activeOtherUserIdRef.current; // current chat partner id

            const typingUserId =
                response?.userId ||
                response?.senderId ||
                response?.sender?._id ||
                response?.fromUserId;
            const typingTargetUserId =
                response?.otherUserId ||
                response?.receiverId ||
                response?.toUserId;

            // If backend includes matchId/conversationId, enforce it.
            const activeMatchId = activeMatchIdRef.current;
            const incomingMatchId = response?.matchId || response?.conversationId;
            if (activeMatchId && incomingMatchId && String(incomingMatchId) !== String(activeMatchId)) return;

            // Only show typing for the currently open conversation partner
            if (activeOtherUserId && typingUserId && String(typingUserId) !== String(activeOtherUserId)) return;
            // Only if this typing event is intended for me
            if (myUserId && typingTargetUserId && String(typingTargetUserId) !== String(myUserId)) return;
            // Never show typing animation for yourself
            if (myUserId && typingUserId && String(typingUserId) === String(myUserId)) return;

            // Use exact field, but stay tolerant
            const isTyping =
                response.isTyping === true ||
                response.isTyping === 'true' ||
                response.typing === true ||
                response.typing === 'true' ||
                response.is_typing === true ||
                response.is_typing === 'true';
            const senderName = response.senderName || matchChatUserDetailsRef.current?.name || 'Someone';
            setIsOtherUserTyping(isTyping);
            setTypingUserName(senderName);
            if (isTyping) {
                setMessages((prevMessages) => {
                    const hasTypingIndicator = prevMessages.some((msg) => msg._id === 'typing-indicator');
                    if (hasTypingIndicator) {
                        return prevMessages;
                    }
                    const typingMessage: ChatMessage = {
                        _id: 'typing-indicator',
                        text: '',
                        createdAt: new Date(),
                        isMine: false,
                        user: {
                            _id: 'typing-indicator-user',
                            name: senderName,
                            avatar: matchChatUserDetailsRef.current?.profilePicture?.[0]?.url || profileImage,
                        },
                    };
                    return GiftedChat.append(prevMessages, [typingMessage]);
                });
            } else {
                setMessages((prevMessages) =>
                    prevMessages.filter((msg) => msg._id !== 'typing-indicator')
                );
            }
        };
        const handleIncomingMessage = (response: any) => {
            console.log('Incoming message received:', response);
            if (!response) return;
            try {
                // Strict isolation: ignore messages not meant for the active chat
                const activeMatchId = activeMatchIdRef.current;
                const activeOtherUserId = activeOtherUserIdRef.current;
                const incomingMatchId = response?.matchId || response?.conversationId;
                if (activeMatchId && incomingMatchId && String(incomingMatchId) !== String(activeMatchId)) {
                    return;
                }

                // Extract message text - handle both string and object cases
                let messageText = '';
                if (typeof response.message === 'string') {
                    messageText = response.message;
                } else if (typeof response.text === 'string') {
                    messageText = response.text;
                } else if (typeof response.content === 'string') {
                    messageText = response.content;
                } else if (response.message && typeof response.message === 'object') {
                    // If message is an object, try to extract text from it
                    messageText = response.message.text || response.message.content || JSON.stringify(response.message);
                } else if (response.text && typeof response.text === 'object') {
                    messageText = response.text.text || response.text.content || JSON.stringify(response.text);
                }

                const isMine = response.isMine === true || response.isMine === 'true';
                const avatar = isMine
                    ? (userDataRef.current?.profilePicture?.[0]?.url || userDataRef.current?.gallery?.[0]?.url || profileImage)
                    : (otherUserProfileRef.current?.profilePicture?.[0]?.url || matchChatUserDetailsRef.current?.profilePicture?.[0]?.url || profileImage);
                let createdAt: Date;
                if (response.createdAt) {
                    createdAt = typeof response.createdAt === 'string'
                        ? new Date(response.createdAt)
                        : new Date(response.createdAt);
                } else if (response.timestamp) {
                    createdAt = typeof response.timestamp === 'string'
                        ? new Date(response.timestamp)
                        : new Date(response.timestamp);
                } else {
                    createdAt = new Date();
                }
                const messageId = response._id || response.messageId || response.id || Date.now() + Math.random();
                // Deduplicate (important: chat screen only)
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
                        text: String(messageText || ''), // Ensure text is always a string
                        createdAt: createdAt,
                        isMine: false,
                        user: {
                            _id: userId,
                            name: '',
                            avatar: avatar,
                        },
                    };
                    setMessages((prevMessages) => {
                        // If a real message arrives, typing should disappear immediately (WhatsApp-like)
                        const withoutTyping = prevMessages.filter((msg) => msg._id !== 'typing-indicator');
                        const updated = GiftedChat.append(withoutTyping, [newMessage]);
                        // Ensure messages are sorted by createdAt (newest first for GiftedChat)
                        return updated.sort((a, b) => {
                            const timeA = a.createdAt.getTime();
                            const timeB = b.createdAt.getTime();
                            return timeB - timeA; // Descending (newest first)
                        });
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
        socket.on('connected', handleConnected);
        socket.on('newMatch', handleNewMatch);
        socket.on('superLike', handleSuperLike);
        socket.on('messageSent', handleMessageSent);
        socket.on('messagesRead', handleMessagesRead);
        socket.on('newMessage', handleIncomingMessage);
        socket.on('message_marked_read', handleMessageMarkedRead);
        socket.on('user_typing', handleUserTyping);
        return () => {
            socket.off('connected', handleConnected);
            socket.off('newMatch', handleNewMatch);
            socket.off('superLike', handleSuperLike);
            socket.off('messageSent', handleMessageSent);
            socket.off('messagesRead', handleMessagesRead);
            socket.off('newMessage', handleIncomingMessage);
            socket.off('message_marked_read', handleMessageMarkedRead);
            socket.off('user_typing', handleUserTyping);
        };
    }, [socket]);

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
            // Cleanup typing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = null;
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

        console.log('Sending message via socket:', payload);
        socket.emit('send_message', payload);
    }, [socket, matchChatUserDetails?.userId]);

    const emitTypingStatus = useCallback((isTyping: boolean) => {
        if (!socket || !matchChatUserDetails?.userId) {
            return;
        }
        const payload = {
            otherUserId: matchChatUserDetails.userId,
            isTyping: isTyping,
        };
        console.log(payload, "asdasdsaad");

        socket.emit('typing', payload);
    }, [socket, matchChatUserDetails?.userId]);

    const handleTypingStart = useCallback(() => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }

        emitTypingStatus(true);
    }, [emitTypingStatus]);

    const handleTypingStop = useCallback(() => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            emitTypingStatus(false);
            typingTimeoutRef.current = null;
        }, 2000);
    }, [emitTypingStatus]);

    const loadOlderMessages = useCallback(async () => {
        console.log('loadOlderMessages called', { isLoadingMore, hasMoreMessages, currentPage, userId: matchChatUserDetails?.userId });
        if (isLoadingMore || !hasMoreMessages || !matchChatUserDetails?.userId) {
            console.log('loadOlderMessages early return', { isLoadingMore, hasMoreMessages, userId: matchChatUserDetails?.userId });
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

            console.log('Loading older messages with params:', params);
            const response: any = await appOperation.customer.loadChatMessagesAPI(params, data);
            console.log('API Response:', response);

            if (response?.statusCode === 200 && response?.data) {
                const olderMessages = response.data;
                console.log('Older messages received:', olderMessages?.length, 'messages');

                if (olderMessages && Array.isArray(olderMessages) && olderMessages.length > 0) {
                    const transformedOlderMessages = transformChatHistoryToMessages(olderMessages);
                    console.log('Transformed older messages:', transformedOlderMessages.length);
                    setMessages((prevMessages) => {
                        const combined = [...transformedOlderMessages, ...prevMessages];
                        combined.sort((a, b) => {
                            const timeA = a.createdAt.getTime();
                            const timeB = b.createdAt.getTime();
                            return timeB - timeA; // Descending (newest first for GiftedChat)
                        });
                        console.log('Total messages after prepend:', combined.length);
                        return combined;
                    });

                    setCurrentPage(nextPage);
                    // If we got less than 50 messages, there are no more
                    const hasMore = olderMessages.length >= 50;
                    setHasMoreMessages(hasMore);
                    console.log('Has more messages:', hasMore);
                } else {
                    console.log('No older messages found, setting hasMoreMessages to false');
                    setHasMoreMessages(false);
                }
            } else {
                console.log('API response not successful or no data:', response);
                setHasMoreMessages(false);
            }
        } catch (error) {
            console.error('Error loading older messages:', error);
            setHasMoreMessages(false);
        } finally {
            setIsLoadingMore(false);
        }
    }, [currentPage, isLoadingMore, hasMoreMessages, matchChatUserDetails?.userId, transformChatHistoryToMessages]);

    useEffect(() => {
        // Always render instantly; just set messages when available.
        if (transformedMessages.length > 0) {
            // Seed dedupe cache from redux messages and ensure no duplicates are rendered.
            const seeded = new Set<string>();
            const uniq = (transformedMessages as any[]).filter((m: any) => {
                const key = m?._dedupeKey || `id:${String(m?._id)}`;
                if (key === 'id:typing-indicator') return false;
                if (seeded.has(key)) return false;
                seeded.add(key);
                return true;
            });
            seenMessageKeysRef.current = seeded;
            setMessages(uniq as any);
            setMessagesOwnerMatchId(matchChatUserDetails?.matchId);
            setCurrentPage(1);
            setHasMoreMessages(transformedMessages.length >= 50);
        } else if (Array.isArray(chatHistory) && chatHistory.length === 0) {
            setHasMoreMessages(true);
        }
        // Ensure loader overlay never blocks UI
        if (isInitialLoading) setIsInitialLoading(false);
    }, [transformedMessages, chatHistory]);

    useEffect(() => {
        let data = {
            "userId": matchChatUserDetails?.userId
        };
        dispatch(getOtherProfile(data, true, setProfileData, true));
    }, [matchChatUserDetails?.userId]);
    useEffect(() => {
        const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
            setEmojiVisible(false);
        });
        return () => showSubscription.remove();
    }, []);

    const onSend = useCallback((newMessages: ChatMessage[] = []) => {
        setMessagesOwnerMatchId(matchChatUserDetails?.matchId);
        setMessages(prev => {
            const updated = GiftedChat.append(prev, newMessages);
            // Ensure messages are sorted by createdAt (newest first for GiftedChat)
            return updated.sort((a, b) => {
                const timeA = a.createdAt.getTime();
                const timeB = b.createdAt.getTime();
                return timeB - timeA; // Descending (newest first)
            });
        });
        setInputText('');
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
        emitTypingStatus(false);
        if (newMessages.length > 0 && newMessages[0].text) {
            sendMessageViaSocket(newMessages[0].text, 'text');
        }
    }, [sendMessageViaSocket, emitTypingStatus]);

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
            <View style={{ alignSelf: 'center', marginVertical: 10 }}>
                <AppText color={OPECITY_DARK} weight={INTER_SEMI_BOLD} type={TEN}>{displayText}</AppText>

            </View>
        );
    }, []);

    const renderBubble = useCallback((props: any) => {
        const isCurrentUser = props.currentMessage?.user?._id === userData?._id || props.currentMessage?.user?._id === USER_ID;
        const isRead = props.currentMessage?.isRead === true;
        const isTypingIndicator = props.currentMessage?._id === 'typing-indicator';

        if (isTypingIndicator) {
            return <TypingIndicatorBubble />;
        }

        return (
            <View style={isCurrentUser ? styles.bubbleWrapperRight : null}>
                <Bubble
                    {...props}
                    wrapperStyle={{
                        left: { backgroundColor: '#FFFFFF', borderRadius: metrics.hp0_5, padding: metrics.hp0_2, marginBottom: metrics.hp1_2 },
                        right: { backgroundColor: '#EDE0FF', borderRadius: metrics.hp0_5, padding: metrics.hp0_2, paddingRight: metrics.hp3, marginBottom: metrics.hp1_2, marginRight: metrics.hp1, position: 'relative' },
                    }}
                    textStyle={{
                        left: { color: 'black', fontSize: fontSize(14), fontFamily: interSemiBold },
                        right: { color: 'black', fontSize: fontSize(14), fontFamily: interSemiBold },
                    }}
                />
                {isCurrentUser && (
                    <View style={styles.readReceiptContainer}>
                        <FastImage
                            source={isRead ? checks : check}
                            resizeMode="contain"
                            style={[
                                isRead ? styles.readReceiptIcon : styles.readReceiptIconUnread,
                            ]}
                        />
                    </View>
                )}

            </View>
        );
    }, [userData?._id]);

    const renderAvatar = useCallback((props: any) => {
        if (props.currentMessage.user._id === USER_ID) return null;
        if (props.currentMessage._id === 'typing-indicator' || props.currentMessage.user._id === 'typing-indicator-user') {
            return null;
        }
        return (
            <FastImage
                source={matchChatUserDetails?.profilePicture?.url ? { uri: matchChatUserDetails?.profilePicture?.url } : profileImage}
                resizeMode='cover'
                style={{ width: metrics.hp4, height: metrics.hp4, borderRadius: metrics.hp2, marginBottom: metrics.hp1_5 }}
            />
        );
    }, [matchChatUserDetails?.profilePicture]);
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
            matchId: matchChatUserDetails?.matchId
        };
        dispatch(userBlockAPI(data))
        setModalVisible(false);
        NavigationService.goBack();
    }
    const renderTime = (props: any) => {
        if (props.currentMessage?._id === 'typing-indicator') return null;
        return (
            <View>
                <Time {...props} timeTextStyle={{ left: { color: colors.darkOpecity }, right: { color: colors.darkOpecity } }} containerStyle={{ left: { marginTop: 2 }, right: { marginTop: 2 } }} />
                {props?.currentMessage?.isMine ?
                    <FastImage source={noccce} resizeMode='contain' style={{
                        height: metrics.hp2, width: metrics.hp2_3, position: 'absolute',
                        bottom: -metrics.hp0_29,
                        right: -metrics.hp3_7,
                    }} tintColor={"#EDE0FF"} /> :
                    <FastImage
                        source={noccce} resizeMode='contain' style={{
                            height: metrics.hp2, width: metrics.hp2_3, position: 'absolute',
                            bottom: -metrics.hp0_29,
                            left: -metrics.hp1,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }} />
                }
            </View>
        );
    };

    const TypingIndicatorBubble = () => {
        const dot1 = useRef(new Animated.Value(0)).current;
        const dot2 = useRef(new Animated.Value(0)).current;
        const dot3 = useRef(new Animated.Value(0)).current;

        useEffect(() => {
            const animateDot = (dot: Animated.Value, delay: number) => {
                return Animated.loop(
                    Animated.sequence([
                        Animated.delay(delay),
                        Animated.timing(dot, {
                            toValue: 1,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                        Animated.timing(dot, {
                            toValue: 0,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                    ])
                );
            };

            const animations = [
                animateDot(dot1, 0),
                animateDot(dot2, 200),
                animateDot(dot3, 400),
            ];

            animations.forEach((anim) => anim.start());

            return () => {
                animations.forEach((anim) => anim.stop());
            };
        }, [dot1, dot2, dot3]);

        const dotSize = metrics.hp0_8;
        const dotOpacity1 = dot1.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1],
        });
        const dotOpacity2 = dot2.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1],
        });
        const dotOpacity3 = dot3.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1],
        });

        return (
            <View style={styles.typingBubbleWrapper}>
                <View style={styles.typingBubble}>
                    <View style={styles.typingDotsContainer}>
                        <Animated.View
                            style={[
                                styles.typingDot,
                                {
                                    width: dotSize,
                                    height: dotSize,
                                    opacity: dotOpacity1,
                                },
                            ]}
                        />
                        <Animated.View
                            style={[
                                styles.typingDot,
                                {
                                    width: dotSize,
                                    height: dotSize,
                                    opacity: dotOpacity2,
                                },
                            ]}
                        />
                        <Animated.View
                            style={[
                                styles.typingDot,
                                {
                                    width: dotSize,
                                    height: dotSize,
                                    opacity: dotOpacity3,
                                },
                            ]}
                        />
                    </View>
                </View>
            </View>
        );
    };

    const renderCustomInput = () => (
        <KeyboardAvoidingView keyboardVerticalOffset={80} style={styles.inputContainer}>
            <View style={styles.inputContainerType}>
                <TextInput
                    style={styles.textInput}
                    value={inputText}
                    onChangeText={(text) => {
                        setInputText(text);
                        if (text.length > 0) {
                            handleTypingStart();
                            handleTypingStop();
                        } else {
                            if (typingTimeoutRef.current) {
                                clearTimeout(typingTimeoutRef.current);
                                typingTimeoutRef.current = null;
                            }
                            emitTypingStatus(false);
                        }
                    }}
                    onFocus={() => {
                        if (inputText.length > 0) {
                            handleTypingStart();
                        }
                    }}
                    onBlur={() => {
                        if (typingTimeoutRef.current) {
                            clearTimeout(typingTimeoutRef.current);
                            typingTimeoutRef.current = null;
                        }
                        emitTypingStatus(false);
                    }}
                    placeholder="Type a message..."
                    multiline
                />
            </View>
            <TouchableOpacityView
                style={styles.sendButton}
                onPress={() => {
                    if (inputText.trim().length > 0) {
                        console.log("Hello")
                        onSend([{
                            _id: Math.random(),
                            text: inputText,
                            createdAt: new Date(),
                            isMine: true,
                            user: { _id: USER_ID, name: 'Gurrent User', avatar: profileImage }
                        }]);
                    }
                }}>
                <FastImage source={sendButton} resizeMode='contain' style={{ height: metrics.hp3, width: metrics.hp3 }} />
            </TouchableOpacityView>
        </KeyboardAvoidingView>
    );
    const onthreedot = (index: any) => {
        if (index == "0") refFilter?.current?.close(), setModalVisible(true), setSaveReportTitle("unMatch");
        if (index == "1") refFilter?.current?.close(), NavigationService.navigate(NAVIGATION_REPORT_SCREEN)
        if (index == '2') refFilter?.current?.close(), setModalVisible(true), setSaveReportTitle("Block");

    }
    return (
        <AppSafeAreaView>
            <ChatHeader setTabSelect={setTabSelect} onPress={() => refFilter?.current?.open()} />

            <View style={styles.tabContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacityView onPress={() => setTabSelect('Chat')} style={styles.inTabContainer}>
                        <AppText type={TWELVE} weight={INTER_BOLD} color={tabSelect === 'Chat' ? PURPLE : OPECITY_DARK}>Chat</AppText>
                        <View style={[styles.selectLine, { backgroundColor: tabSelect === 'Chat' ? colors.purple : colors.transparent }]} />
                    </TouchableOpacityView>
                    <AppText type={SIXTEEN} style={{ color: "#C3B7D0" }}>
                        /
                    </AppText>
                    <TouchableOpacityView onPress={() => setTabSelect('Profile')} style={styles.inTabContainer}>
                        <AppText type={TWELVE} weight={INTER_BOLD} color={tabSelect === 'Profile' ? PURPLE : OPECITY_DARK}>Profile</AppText>
                        <View style={[styles.selectLine, { backgroundColor: tabSelect === 'Profile' ? colors.purple : colors.transparent }]} />
                    </TouchableOpacityView>
                </View>
            </View>

            {tabSelect == "Chat" ?
                <View style={{ flex: 1 }}>
                    <View style={styles.containerChat}>
                        <GiftedChat
                            messages={displayedMessages}
                            onSend={onSend}
                            user={{ _id: USER_ID, name: 'Gurrent User', avatar: profileImage }}
                            renderAvatar={renderAvatar}
                            renderBubble={renderBubble}
                            renderDay={renderDay}
                            renderTime={renderTime}
                            renderInputToolbar={renderCustomInput}
                            showUserAvatar={false}
                            onLoadEarlier={loadOlderMessages}
                            loadEarlier={hasMoreMessages && !isLoadingMore}
                            isLoadingEarlier={isLoadingMore}
                            infiniteScroll={true}
                            renderLoadEarlier={() => {
                                if (!hasMoreMessages) return null;
                                if (isLoadingMore) {
                                    return (
                                        <View style={{ paddingVertical: 10, alignItems: 'center' }}>
                                            <ActivityIndicator size="small" color={colors.purple} />
                                        </View>
                                    );
                                }
                                return null;
                            }}
                        />
                        {isChatTransitioning && (
                            <View style={styles.loaderContainer}>
                                <ActivityIndicator size="large" color={colors.purple} />
                            </View>
                        )}
                    </View>
                    {/* WhatsApp-like: no blocking loader overlay */}
                </View> :
                <View style={{ flex: 1 }}>
                    <ChatProfileScreen always={true} />
                </View>
            }
            <RBSheet ref={refFilter} openDuration={100}
                height={Dimensions.get('window').height / 3.10}
                customStyles={{
                    wrapper: {
                        backgroundColor: '#00000080',
                    },
                    container: {
                        backgroundColor: colors.white,
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
                                    <AppText type={FORTEEN} weight={INTER_SEMI_BOLD}>
                                        {item.headLine}{" "}{matchChatUserDetails?.name}
                                    </AppText>
                                    <AppText type={TEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
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
                            <AppText style={{ textAlign: "center" }} type={TWENTY_FOUR} weight={SCHEHERAZADE_BOLD} color={LIGHT_BLACK}>
                                Would you like to
                            </AppText>
                            <AppText style={{ marginTop: -metrics.hp3, textAlign: "center" }} type={TWENTY_FOUR} weight={SCHEHERAZADE_BOLD} color={LIGHT_BLACK}>
                                Unmatch this user?
                            </AppText>
                            <TouchableOpacityView onPress={() => unMatchButton()} style={[styles.ediButton, { backgroundColor: colors.purple, marginTop: metrics.hp0 }]}>
                                <AppText color={WHITE} weight={INTER_SEMI_BOLD} type={TWELVE}>
                                    Yes, Unmatch
                                </AppText>
                            </TouchableOpacityView>
                            <AppText onPress={() => setModalVisible(false)} weight={INTER_SEMI_BOLD} type={TWELVE} style={{ textAlign: "center", marginTop: metrics.hp2 }} color={LIGHT_BLACK}>
                                No, cancel
                            </AppText>
                        </View>
                    </View>}
                {saveReportTitle == "Block" &&
                    <View style={styles.centeredView}>
                        <View style={[styles.confirmContainer, { height: metrics.hp42, }]}>
                            <FastImage source={blockModalImage} resizeMode="stretch" style={[styles.bdyBack, { height: metrics.hp18 }]} />
                            <AppText style={{ textAlign: "center" }} type={TWENTY_FOUR} weight={SCHEHERAZADE_BOLD} color={LIGHT_BLACK}>
                                Block {matchChatUserDetails?.name}?
                            </AppText>
                            <AppText style={{ marginTop: -metrics.hp2, textAlign: "center" }} type={TWELVE} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                You won’t be able to undo this. You sure{'\n'} to continue?
                            </AppText>
                            <TouchableOpacityView onPress={() => unBlockButton()} style={[styles.ediButton, { backgroundColor: colors.purple, marginTop: metrics.hp2 }]}>
                                <AppText color={WHITE} weight={INTER_SEMI_BOLD} type={TWELVE}>
                                    Yes, Block
                                </AppText>
                            </TouchableOpacityView>
                            <AppText onPress={() => setModalVisible(false)} weight={INTER_SEMI_BOLD} type={TWELVE} style={{ textAlign: "center", marginTop: metrics.hp2 }} color={LIGHT_BLACK}>
                                No, cancel
                            </AppText>
                        </View>
                    </View>}
            </Modal>
        </AppSafeAreaView>
    );
};

export default TakingScreen;

const styles = StyleSheet.create({
    tabContainer: { backgroundColor: colors.white, height: metrics.hp5, justifyContent: 'flex-end' },
    selectLine: { height: metrics.hp0_3, width: metrics.hp11, borderTopRightRadius: metrics.hp1, borderTopLeftRadius: metrics.hp1 },
    inTabContainer: { alignItems: 'center', justifyContent: 'center', flex: 1 },
    containerChat: { flex: 1, backgroundColor: '#F5F7FA' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: metrics.hp2, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e0e0e0', paddingVertical: metrics.hp2 },
    textInput: { minHeight: metrics.hp4, maxHeight: metrics.hp8, fontSize: fontSize(13), width: "83%", fontFamily: interMedium, marginLeft: metrics.hp1 },
    sendButton: { backgroundColor: '#6F13F2', borderRadius: metrics.hp50, marginLeft: 6, justifyContent: 'center', alignItems: 'center', height: metrics.hp5_5, width: metrics.hp5_5 },
    inputContainerType: { borderWidth: metrics.hp0_1, borderColor: colors.nanoOpecity, borderRadius: metrics.hp5, paddingHorizontal: metrics.hp1, alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingVertical: metrics.hp0_5 },
    emojiIcon: { height: metrics.hp3, width: metrics.hp3 },
    containerRb: { paddingHorizontal: metrics.hp2, paddingVertical: metrics.hp2 },
    containerViewRb: { paddingHorizontal: metrics.hp1, paddingVertical: metrics.hp2, flexDirection: "row", backgroundColor: colors.lightBack, marginBottom: metrics.hp0_5, borderRadius: metrics.hp1_5 },
    rbIcon: { height: metrics.hp2_5, width: metrics.hp2_5, marginTop: metrics.hp0_5 },
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
        backgroundColor: colors.white,
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
        borderColor: colors.purple,
        borderRadius: metrics.hp4,
        alignItems: "center",
        justifyContent: "center",
        width: "40%",
        alignSelf: "center",
    },
    bubbleWrapperRight: {
        position: 'relative',
        alignSelf: 'flex-end',
    },
    loaderContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#F5F7FA',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    readReceiptContainer: {
        position: 'absolute',
        bottom: metrics.hp1_2,
        right: metrics.hp2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    readReceiptIcon: {
        height: metrics.hp2_5,
        width: metrics.hp2_5,
    },
    readReceiptIconUnread: {
        height: metrics.hp2,
        width: metrics.hp2,
        marginBottom: metrics.hp0_5,
        marginLeft: metrics.hp0_5,
    },
    typingBubbleWrapper: {
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
    },
});

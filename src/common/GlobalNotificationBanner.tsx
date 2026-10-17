import React, { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View, Platform } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    withSpring,
    runOnJS,
    Easing,
} from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import { AppText, FORTEEN, INTER_MEDIUM, INTER_REGULAR, SIXTEEN, WHITE } from './AppText';
import metrics from '../assets/Metrics';
import NavigationService from '../navigation/NavigationService';
import { NAVIGATION_TAKING_SCREEN } from '../navigation/routes';
import { useDispatch, useSelector } from 'react-redux';
import { chatHistoryAPI } from '../actions/authActions';
import { chatHistoryDetails, matchChatDetails } from '../slices/loginServices/authSlice';
import { dummyfemaleProfile, dummyMaleProfile } from '../helper/ImageAssets';

interface NotificationData {
    matchId: string;
    senderId: string;
    senderName: string;
    messagePreview: string;
    profilePicture?: string;
    timestamp: string;
    gender?: string;
}

interface GlobalNotificationBannerProps {
    notification: NotificationData | null;
    onDismiss: () => void;
}

const GlobalNotificationBanner: React.FC<GlobalNotificationBannerProps> = ({
    notification,
    onDismiss,
}) => {
    const dispatch = useDispatch();
    const userData = useSelector((state: any) => state.auth.userData);
    const newMatches = useSelector((state: any) => state.auth.newMatches);

    const translateY = useSharedValue(-100);
    const opacity = useSharedValue(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isShowingRef = useRef(false);
    const previousNotificationRef = useRef<NotificationData | null>(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, []);

    const handleDismissComplete = useCallback(() => {
        if (!isMountedRef.current) return;
        isShowingRef.current = false;
        onDismiss();
    }, [onDismiss]);

    const handleDismiss = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        translateY.value = withTiming(-100, {
            duration: 200,
            easing: Easing.out(Easing.ease),
        });
        opacity.value = withTiming(0, {
            duration: 200,
            easing: Easing.out(Easing.ease),
        }, (finished) => {
            if (finished) {
                runOnJS(handleDismissComplete)();
            }
        });
    }, [handleDismissComplete, translateY, opacity]);

    const handleDismissInstant = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        // Instantly hide (WhatsApp-like on tap)
        translateY.value = -100;
        opacity.value = 0;
        handleDismissComplete();
    }, [handleDismissComplete, translateY, opacity]);

    const handlePress = useCallback(() => {
        if (!notification) return;
        // Hide banner immediately on tap
        handleDismissInstant();

        const chat = newMatches.find((c: any) => c.matchId === notification.matchId);
        if (chat) {
            const data = {
                otherUserId: chat.userId,
                matchId: chat.matchId,
            };
            const params = {
                page: 1,
                limit: 50,
            };
            // Prevent previous chat messages from flashing
            dispatch(chatHistoryDetails([]));
            // Navigate instantly; fetch chat history in background
            dispatch(chatHistoryAPI(data, params, false));
            dispatch(matchChatDetails(chat));
            NavigationService.navigate(NAVIGATION_TAKING_SCREEN);
        }
    }, [notification, newMatches, dispatch, handleDismissInstant]);

    const showNotification = useCallback(() => {
        if (!notification) return;

        isShowingRef.current = true;
        previousNotificationRef.current = notification;

        // Reset and animate in
        translateY.value = -100;
        opacity.value = 0;

        // Immediate smooth animation
        translateY.value = withSpring(0, {
            damping: 25,
            stiffness: 400,
            mass: 0.7,
        });
        opacity.value = withTiming(1, {
            duration: 200,
            easing: Easing.out(Easing.ease),
        });

        // Auto dismiss after 3 seconds
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            handleDismiss();
        }, 3000);
    }, [notification, handleDismiss, translateY, opacity]);

    useEffect(() => {
        if (!notification) {
            if (isShowingRef.current) {
                handleDismiss();
            }
            return;
        }

        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        const isSameNotification = previousNotificationRef.current?.matchId === notification.matchId;
        const wasShowing = isShowingRef.current;

        // If different notification and one is currently showing, dismiss quickly then show new
        if (wasShowing && !isSameNotification) {
            // Quickly dismiss current
            translateY.value = withTiming(-100, {
                duration: 150,
                easing: Easing.in(Easing.ease),
            });
            opacity.value = withTiming(0, {
                duration: 150,
                easing: Easing.in(Easing.ease),
            }, (finished) => {
                if (finished) {
                    runOnJS(showNotification)();
                }
            });
        } else {
            showNotification();
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [notification, handleDismiss, showNotification, translateY, opacity]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
            opacity: opacity.value,
        };
    }, []);

    if (!notification) {
        return null;
    }

    const senderName = notification.senderName?.trim() || 'New message';

    return (
        <Animated.View style={[styles.container, animatedStyle]} pointerEvents="box-none">
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={handlePress}
                style={styles.banner}
            >
                <View style={styles.content}>
                        <FastImage
                            source={notification.profilePicture ? { uri: notification.profilePicture } : notification?.gender == "female" ? dummyfemaleProfile : dummyMaleProfile}
                            style={styles.avatar}
                            resizeMode="cover"
                        />
                    <View style={styles.textContainer}>
                        <AppText type={SIXTEEN} weight={INTER_MEDIUM} color={WHITE} numberOfLines={1}>
                            {senderName}
                        </AppText>
                        <AppText
                            type={FORTEEN}
                            weight={INTER_REGULAR}
                            color={WHITE}
                            style={styles.messageText}
                            numberOfLines={1}
                        >
                            {notification.messagePreview}
                        </AppText>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : metrics.hp6,
        left: 0,
        right: 0,
        zIndex: 10000,
        // Android draws native screens by elevation; without this the banner can sit underneath them
        elevation: 24,
        paddingHorizontal: metrics.hp2,
        pointerEvents: 'box-none',
    },
    banner: {
        backgroundColor: "#555359",
        borderRadius: metrics.hp1,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        overflow: 'hidden',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: metrics.hp1_5,
    },
    avatar: {
        width: metrics.hp5,
        height: metrics.hp5,
        borderRadius: metrics.hp2_5,
        marginRight: metrics.hp1_5,
    },    textContainer: {
        flex: 1,
        marginLeft: metrics.hp0_5,
    },
    messageText: {
        marginTop: metrics.hp0_3,
        opacity: 0.7,
    },
});

export default GlobalNotificationBanner;


import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    GestureResponderEvent,
    LayoutChangeEvent,
    Modal,
    PermissionsAndroid,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { AppText, ELEVEN, FORTEEN, INTER_BOLD, INTER_MEDIUM, INTER_SEMI_BOLD, LIGHT_BLACK, OPECITY_DARK, SCHEHERAZADE_BOLD, TEN, TWELVE, TWENTY_FOUR, TWENTY_TWO, WHITE } from '../../common/AppText';
import { blueTikeIcon, bussinessIcon, CloseBlueIcon, completeProfileBanner, flashIcon, goldCard, heartGreen, heartRed, locationCIon, nopeIcon, shareRedIcon, silverCard, superlike, superlikeiconwhite, upArrowIcon, yesIcon } from '../../helper/ImageAssets';
import metrics from '../../assets/Metrics';
import FastImage from 'react-native-fast-image';
import { colors } from '../../theme/colors';
import { Screen } from '../../theme/dimens';
import { TouchableOpacityView } from '../../common/TouchableOpacityView';
import LinearGradient from 'react-native-linear-gradient';
import Animated2, { Extrapolate, interpolate, useAnimatedStyle, useDerivedValue, useSharedValue } from "react-native-reanimated";
import { useDispatch, useSelector } from 'react-redux';
import PeopleHeader from '../../common/PeopleHeader';
import { SwiperCardRefType } from 'rn-swiper-list';
import Swiper from '../../swiperComponents/Swiper';
import PreviewDetails from './PreviewDetails';
import { AppSafeAreaView } from '../../common/AppSafeAreaView';
import { activateBoostAPI, discoverProfile, getNewMatches, getProfile, listProfiles, swipeLikeDisLike } from '../../actions/authActions';
import { AnyComponent } from 'react-native-reanimated/lib/typescript/createAnimatedComponent/commonTypes';
import { useIsFocused } from '@react-navigation/native';
import { setGetProfile, setListProfiles } from '../../slices/loginServices/authSlice';
import { createSocket } from '../../common/Socket';
import MatchScreen from './MatchScreen';
import Toast, { IToast } from '../../common/Toast';
import SuperLikeScreen from './SuperLikeScreen';
import NavigationService from '../../navigation/NavigationService';
import { NAVIGATION_CRUSH_NOTE_SENDER_SCREEN, NAVIGATION_CRUSH_PURCHESE_SCREEN, NAVIGATION_EDIT_PROFILE_SCREEN, NAVIGATION_PROFILE_BOOST_PURCHASE_SCREEN, NAVIGATION_SUBSCRIPTION_SCREEN, NAVIGATION_SUPERLIKE_PURCHESE_SCREEN } from '../../navigation/routes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SWIPES_PER_DAY_KEY, SWIPES_REMAINING_KEY, SUPER_LIKES_REMAINING_KEY } from '../../helper/Constants';
import { BoostModal } from '../../common/boost/BoostModal';
import { useBoostTimer } from '../../hooks/useBoostTimer';
import { BoostLiquidButton } from '../../common/boost/BoostLiquidButton';
import CrushNotesSender from './CrushNotesSender';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from "react-native-svg";
import { appOperation } from '../../appOperation';
import messaging, {
    FirebaseMessagingTypes,
} from "@react-native-firebase/messaging";
import Loader from '../../common/Lodaer';
const { width, height } = Dimensions.get("window");
const FULL_IMAGE_HEIGHT = height * 0.75;
// keep in sync with `src/swiperComponents/SwipeableCard.tsx`
const SWIPE_THRESHOLD_X = width * 0.18;
const SWIPE_THRESHOLD_Y = height * 0.1;
const SUPERLIKE_ESCAPE_X = SWIPE_THRESHOLD_X * 1.35;
const SUPERLIKE_INTENT_RATIO = 1.15;
// _ZG8y64lJ_5M8tk62RbCW3oeIRcm4JIyUkux7x
// Session-only flag (resets when app is fully killed/reopened)
let hasShownProfileCompletionReminderThisSession = false;

const PulsingCircle = React.memo(({ size }: { size: number }) => {
    const anim = useRef(new Animated.Value(0)).current;
    const animTwp = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        let isMounted = true;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        const pulse = () => {
            anim.setValue(0);
            Animated.timing(anim, {
                toValue: 1,
                duration: 3000,
                useNativeDriver: true,
            }).start(() => {
                if (!isMounted) return;
                pulse();
            });
        };

        const pulseTwo = () => {
            animTwp.setValue(0);
            Animated.timing(animTwp, {
                toValue: 1,
                duration: 3000,
                useNativeDriver: true,
            }).start(() => {
                if (!isMounted) return;
                pulseTwo();
            });
        };

        pulse();
        timeoutId = setTimeout(() => {
            if (!isMounted) return;
            pulseTwo();
        }, 1500);

        return () => {
            isMounted = false;
            if (timeoutId) clearTimeout(timeoutId);
            anim.stopAnimation();
            animTwp.stopAnimation();
        };
    }, [anim, animTwp]);

    const animatedStyle = {
        transform: [
            {
                scale: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 3],
                }),
            },
        ],
        opacity: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0],
        }),
    };

    const animatedStyleTwo = {
        transform: [
            {
                scale: animTwp.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 3],
                }),
            },
        ],
        opacity: animTwp.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0],
        }),
    };

    return (
        <>
            <Animated.View
                style={[
                    styles.pulse,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        borderWidth: metrics.hp0_1,
                        borderColor: "#6F13F225",
                    },
                    animatedStyle,
                ]}
            />
            <Animated.View
                style={[
                    styles.pulse,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        borderWidth: metrics.hp0_1,
                        borderColor: "#6F13F225",
                    },
                    animatedStyleTwo,
                ]}
            />
        </>
    );
});

const PeopleScreen = () => {
    const dispatch = useDispatch();
    const ref = useRef<SwiperCardRefType>(null);
    const IsFocused = useIsFocused();
    const listProfilesData = useSelector((state: any) => state.auth.listProfiles);
    // const listProfilesData:any = [];
    const userData = useSelector((state: any) => state.auth.userData);
    const position: any = useRef(new Animated.ValueXY()).current;
    const [getCurrentIndex, setGetCurrentIndex] = useState(0);
    const [windowStartIndex, setWindowStartIndex] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [crushNotesSednder, setCrushNotesSender] = useState(false);
    const [swipeRight, setSwipeRight] = useState(false);
    const [swipeLeft, setSwipeLeft] = useState(false);
    const [swipeUp, setSwipeUp] = useState(false);
    const [matchVisible, setMatchVisible] = useState(false);
    const [superLikeVisible, setSuperLikeVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
    const [matchData, setMatchData] = useState([]);
    const cardWidthRef = useRef(0);
    const WINDOW_SIZE = 4;
    const LOAD_THRESHOLD = 2;
    const PROFILE_LIMIT = 10; // Target number of profiles to maintain
    const TOP_UP_TRIGGER_COUNT = 3; // Trigger top-up when 3 profiles remain
    const hasFetchedFeedOnceRef = useRef(false);
    const skipNextSwipeRightCallbackRef = useRef(false);
    const totalFetchedCountRef = useRef(0); // Track total profiles fetched so far
    const isTopUpInProgressRef = useRef(false); // Prevent concurrent top-up requests
    const lastTopUpTriggeredAtRef = useRef<number | null>(null); // Track last remaining count when top-up was triggered
    // "Home loaded" = this landing's initial profile/feed fetches have settled (success or failure).
    // Used to ensure the profile completion reminder shows only after the screen is actually ready.
    const homeLoadCycleRef = useRef(0);
    const homeIsReadyRef = useRef(false);
    const [homeLoadedSignal, setHomeLoadedSignal] = useState(0);
    const [remainingSwipes, setRemainingSwipes] = useState(0);
    const [remainingSuperLikes, setRemainingSuperLikes] = useState(0);
    const [swipesPerDay, setSwipesPerDay] = useState(0);
    const [boostModalVisible, setBoostModalVisible] = useState(false);
    const [isBoostActivating, setIsBoostActivating] = useState(false);
    const [showProfileCompletionReminder, setShowProfileCompletionReminder] = useState(false);

    // Tinder-style: a single source of truth for swipe gesture state (shared from swiper)
    const sharedTranslateX = useSharedValue(0);
    const sharedTranslateY = useSharedValue(0);
    // Tap flash (NOT stored in React state; instant set/reset via press events)
    const tapLike = useSharedValue(0);
    const tapNope = useSharedValue(0);
    const tapSuperLike = useSharedValue(0);

    const isSuperLikeIntent = useDerivedValue(() => {
        if (sharedTranslateY.value >= 0) return false;
        return Math.abs(sharedTranslateY.value) > Math.abs(sharedTranslateX.value) * SUPERLIKE_INTENT_RATIO;
    });
    const isSuperLikeLocked = useDerivedValue(() => {
        return sharedTranslateY.value < -SWIPE_THRESHOLD_Y && Math.abs(sharedTranslateX.value) < SUPERLIKE_ESCAPE_X;
    });
    const isSuperLikeMode = useDerivedValue(() => isSuperLikeIntent.value || isSuperLikeLocked.value);

    const superLikeProgress = useDerivedValue(() => {
        // 0..1 while swiping up
        if (!isSuperLikeMode.value) return 0;
        if (Math.abs(sharedTranslateX.value) >= SUPERLIKE_ESCAPE_X) return 0; // escaped
        return interpolate(
            sharedTranslateY.value,
            [0, -SWIPE_THRESHOLD_Y],
            [0, 1],
            Extrapolate.CLAMP
        );
    });

    const likeProgress = useDerivedValue(() => {
        // While SUPER LIKE is active (intent/locked and not escaped), LIKE must be disabled.
        if (isSuperLikeMode.value && Math.abs(sharedTranslateX.value) < SUPERLIKE_ESCAPE_X) return 0;
        return interpolate(
            sharedTranslateX.value,
            [0, SWIPE_THRESHOLD_X],
            [0, 1],
            Extrapolate.CLAMP
        );
    });
    const nopeProgress = useDerivedValue(() => {
        if (isSuperLikeMode.value && Math.abs(sharedTranslateX.value) < SUPERLIKE_ESCAPE_X) return 0;
        return interpolate(
            sharedTranslateX.value,
            [-SWIPE_THRESHOLD_X, 0],
            [1, 0],
            Extrapolate.CLAMP
        );
    });

    // Effective progress = swipe progress OR tap flash (tap flash is instant and does not wait for card lifecycle)
    const likeProgressEff = useDerivedValue(() => Math.max(likeProgress.value, tapLike.value));
    const nopeProgressEff = useDerivedValue(() => Math.max(nopeProgress.value, tapNope.value));
    const superLikeProgressEff = useDerivedValue(() => Math.max(superLikeProgress.value, tapSuperLike.value));

    const likeBgStyle = useAnimatedStyle(() => ({ opacity: likeProgressEff.value, borderRadius: metrics.hp50 }));
    const nopeBgStyle = useAnimatedStyle(() => ({ opacity: nopeProgressEff.value, borderRadius: metrics.hp50 }));
    const likeBorderStyle = useAnimatedStyle(() => ({ opacity: likeProgressEff.value, borderRadius: metrics.hp50 }));
    const nopeBorderStyle = useAnimatedStyle(() => ({ opacity: nopeProgressEff.value, borderRadius: metrics.hp50 }));
    const likeWhiteIconStyle = useAnimatedStyle(() => ({ opacity: likeProgressEff.value }));
    const likeBaseIconStyle = useAnimatedStyle(() => ({ opacity: 1 - likeProgressEff.value }));
    const nopeWhiteIconStyle = useAnimatedStyle(() => ({ opacity: nopeProgressEff.value }));
    const nopeBaseIconStyle = useAnimatedStyle(() => ({ opacity: 1 - nopeProgressEff.value }));
    const superLikeBgStyle = useAnimatedStyle(() => ({ opacity: superLikeProgressEff.value, borderRadius: metrics.hp50 }));
    const superLikeBorderStyle = useAnimatedStyle(() => ({ opacity: superLikeProgressEff.value, borderRadius: metrics.hp50 }));
    const superLikeWhiteIconStyle = useAnimatedStyle(() => ({ opacity: superLikeProgressEff.value }));
    const superLikeBaseIconStyle = useAnimatedStyle(() => ({ opacity: 1 - superLikeProgressEff.value }));

    const triggerNope = useCallback(() => {
        // Programmatic swipe only. Visual tap feedback is handled by press-in/out (tapNope).
        ref.current?.swipeLeft();
    }, []);

    const triggerLike = useCallback(() => {
        ref.current?.swipeRight();
    }, []);

    const BOOST_DURATION_MS = 30 * 60 * 1000;

    // Backend truth:
    // - remaining boosts: userData.boostRemaining
    // - status: userData.boost { isActive, expiresAt }
    const boostRemaining = useMemo(() => {
        const n = 4 /* Number(userData?.boostRemaining) */;
        return Number.isFinite(n) ? n : 0;
    }, [userData?.boostRemaining]);

    const boostEndAtMs = useMemo(() => {
        const isActiveFlag = userData?.boost?.isActive === true;
        const expiresAt = userData?.boost?.expiresAt;
        if (!isActiveFlag || !expiresAt) return null;
        const ms = new Date(String(expiresAt)).getTime();
        return Number.isFinite(ms) && ms > 0 ? ms : null;
    }, [userData?.boost?.expiresAt, userData?.boost?.isActive]);

    // Active means "not expired"
    const boostTimer = useBoostTimer({ boostEndAtMs, durationMs: BOOST_DURATION_MS });

    const handleBoostPress = useCallback(() => {
        // Disabled when:
        // - no boosts remaining
        // - boost is already active (prevents re-activation)
        if (boostTimer.isRunning) return;
        if (boostRemaining <= 0) {
            NavigationService.navigate(NAVIGATION_PROFILE_BOOST_PURCHASE_SCREEN);
            return;
        }
        setBoostModalVisible(true);
    }, [boostRemaining, boostTimer.isRunning]);

    const handleActivateBoost = useCallback(async () => {
        if (isBoostActivating) return;
        if (boostTimer.isRunning) return; // Prevent activating while one is active
        if (boostRemaining <= 0) return;

        setIsBoostActivating(true);
        try {
            // Trigger activation (do not read/depend on API response payload)
            await dispatch(activateBoostAPI());

            // Optimistic UI update for instant feedback (then getProfile() will reconcile)
            if (userData) {
                dispatch(
                    setGetProfile({
                        ...userData,
                        boostRemaining: Math.max(0, boostRemaining - 1),
                        boost: {
                            isActive: true,
                            expiresAt: new Date(Date.now() + BOOST_DURATION_MS).toISOString(),
                        },
                    })
                );
            }
        } catch (e) {
            // errors are handled/toasted in action
        } finally {
            setIsBoostActivating(false);
        }
    }, [BOOST_DURATION_MS, activateBoostAPI, boostRemaining, boostTimer.isRunning, dispatch, isBoostActivating, userData]);

    const loadStoredValues = useCallback(async () => {
        try {
            const storedSwipesRemaining = await AsyncStorage.getItem(SWIPES_REMAINING_KEY);
            const storedSuperLikesRemaining = await AsyncStorage.getItem(SUPER_LIKES_REMAINING_KEY);
            const storedSwipesPerDay = await AsyncStorage.getItem(SWIPES_PER_DAY_KEY);

            if (storedSwipesRemaining !== null) {
                setRemainingSwipes(parseInt(storedSwipesRemaining, 10));
            }
            if (storedSuperLikesRemaining !== null) {
                setRemainingSuperLikes(parseInt(storedSuperLikesRemaining, 10));
            }
            if (storedSwipesPerDay !== null) {
                setSwipesPerDay(parseInt(storedSwipesPerDay, 10));
            }
        } catch (error) {
            console.warn('Error loading stored values:', error);
        }
    }, []);

    const saveStoredValues = useCallback(async (swipes?: number, superLikes?: number, perDay?: number) => {
        try {
            if (swipes !== undefined) {
                await AsyncStorage.setItem(SWIPES_REMAINING_KEY, swipes.toString());
            }
            if (superLikes !== undefined) {
                await AsyncStorage.setItem(SUPER_LIKES_REMAINING_KEY, superLikes.toString());
            }
            if (perDay !== undefined) {
                await AsyncStorage.setItem(SWIPES_PER_DAY_KEY, perDay.toString());
            }
        } catch (error) {
            console.warn('Error saving stored values:', error);
        }
    }, []);

    const subscriptionItem = useMemo(() => ({ id: '1', icon: silverCard, title: 'Silver' }), []);

    const visibleCards = useMemo(() => {
        if (!listProfilesData || listProfilesData.length === 0) return [];
        const endIndex = Math.min(windowStartIndex + WINDOW_SIZE, listProfilesData.length);
        const cards = listProfilesData.slice(windowStartIndex, endIndex);
        return cards;
    }, [listProfilesData, windowStartIndex]);
    // console.log(visibleCards, "visibleCards");

    const socketUrl = useMemo(() => {
        const currentUserId = userData?._id;
        if (!currentUserId) return null;
        const { config } = require('../../config/config');
        return `${config.BASE_URL}?userId=${currentUserId}`;
    }, [userData?._id]);

    const socket = useMemo(() => {
        if (!socketUrl) return null;
        return createSocket(socketUrl);
    }, [socketUrl]);

    useEffect(() => {
        if (!socket) return;

        const handleNewMatch = (response: any) => {
            if (!response) return;
            setMatchVisible(true);
            setMatchData(response?.matchData);
        };

        socket.on('newMatch', handleNewMatch);

        return () => {
            socket.off?.('newMatch', handleNewMatch);
            socket.disconnect?.();
        };
    }, [socket]);

    // NOTE: Old `position.x` based button colors removed.
    // The swipe gesture state comes from the card swiper via `sharedTranslateX`.
    const returningFromSubscriptionRef = useRef(false);
    const isInitialMountRef = useRef(true);

    useEffect(() => {
        loadStoredValues();
    }, [loadStoredValues]);

    useEffect(() => {
        if (userData && (userData.swipesRemaining !== undefined || userData.superLikesRemaining !== undefined || userData.swipesPerDay !== undefined)) {
            const swipesRemaining = userData?.swipesRemaining ?? 0;
            const superLikesRemaining = userData?.superLikesRemaining ?? 0;
            const swipesPerDayValue = userData?.swipesPerDay ?? 0;
            setRemainingSwipes(swipesRemaining);
            setRemainingSuperLikes(superLikesRemaining);
            setSwipesPerDay(swipesPerDayValue);
            saveStoredValues(swipesRemaining, superLikesRemaining, swipesPerDayValue);
        }
    }, [userData, saveStoredValues]);

    useEffect(() => {
        if (!IsFocused) return;

        // Run these calls ONCE per landing/focus.
        // Important: do NOT depend on `listProfilesData` here, otherwise Redux updates re-trigger the effect.
        homeLoadCycleRef.current += 1;
        const cycle = homeLoadCycleRef.current;
        homeIsReadyRef.current = false;

        const run = async () => {
            const promises: any[] = [];

            if (!userData?._id) {
                promises.push(dispatch(getProfile(true)));
            }
            if (!hasFetchedFeedOnceRef.current && (!listProfilesData || listProfilesData.length === 0)) {
                hasFetchedFeedOnceRef.current = true;
                // Initial fetch with skip=0, limit=10
                promises.push(dispatch(listProfiles(true, 0, PROFILE_LIMIT, false)).then((result: any) => {
                    // Update totalFetchedCountRef after initial fetch completes
                    // This will be set based on actual response in the effect below
                }));
            }

            if (promises.length > 0) {
                try {
                    await Promise.allSettled(promises);
                } catch {
                    // ignore - we only care that initial load "settled"
                }
            }

            // Only mark ready if this is still the latest landing cycle
            if (homeLoadCycleRef.current !== cycle) return;
            homeIsReadyRef.current = true;
            setHomeLoadedSignal((s) => s + 1);
        };

        run();

        if (isInitialMountRef.current) {
            setWindowStartIndex(0);
            setGetCurrentIndex(0);
            isInitialMountRef.current = false;
        } else if (returningFromSubscriptionRef.current) {
            returningFromSubscriptionRef.current = false;
        }
        // NOTE: Do NOT reset indices on tab switching; preserve the current card.
        return () => {
            // invalidate this landing cycle
            if (homeLoadCycleRef.current === cycle) {
                homeLoadCycleRef.current += 1;
                homeIsReadyRef.current = false;
            }
        };
    }, [IsFocused, dispatch, userData?._id])

    useEffect(() => {
        if (!IsFocused) return;
        if (hasShownProfileCompletionReminderThisSession) return;

        // Only show after Home has fully loaded for this landing.
        if (!homeIsReadyRef.current) return;

        const timer = setTimeout(() => {
            if (!IsFocused) return;
            if (hasShownProfileCompletionReminderThisSession) return;
            if (!homeIsReadyRef.current) return;

            const completion = Math.trunc(userData?.profileCompletion);
            if (completion <= 70) {
                hasShownProfileCompletionReminderThisSession = true;
                setShowProfileCompletionReminder(true);
            }
        }, 3000); // slight delay after load for smoother UX

        return () => clearTimeout(timer);
    }, [IsFocused, userData?.profileCompletion, homeLoadedSignal]);

    useEffect(() => {
        if (remainingSwipes !== undefined) {
            saveStoredValues(remainingSwipes, undefined, undefined);
        }
    }, [remainingSwipes, saveStoredValues]);

    useEffect(() => {
        if (remainingSuperLikes !== undefined) {
            saveStoredValues(undefined, remainingSuperLikes, undefined);
        }
    }, [remainingSuperLikes, saveStoredValues]);

    useEffect(() => {
        if (swipesPerDay !== undefined) {
            saveStoredValues(undefined, undefined, swipesPerDay);
        }
    }, [swipesPerDay, saveStoredValues]);

    useEffect(() => {
        if (getCurrentIndex >= LOAD_THRESHOLD && listProfilesData && listProfilesData.length > 0) {
            const newWindowStart = windowStartIndex + LOAD_THRESHOLD;
            const remainingCards = listProfilesData.length - newWindowStart;

            if (remainingCards > 0) {
                setWindowStartIndex(newWindowStart);
                setGetCurrentIndex(0);
            }
        }
    }, [getCurrentIndex, windowStartIndex, listProfilesData]);

    // Track total fetched count: use actual list length as source of truth
    // This handles cases where API returns fewer profiles than requested
    useEffect(() => {
        if (!listProfilesData || listProfilesData.length === 0) {
            // Reset when profiles are cleared
            totalFetchedCountRef.current = 0;
            lastTopUpTriggeredAtRef.current = null; // Reset trigger tracking
            return;
        }

        const previousCount = totalFetchedCountRef.current;
        const currentCount = listProfilesData.length;

        // Update count to match actual list length
        // This ensures we always request from the correct skip position
        // If list length decreased, it's a fresh fetch (filter reset) - update count
        // If list length increased, it's a top-up merge - update count
        totalFetchedCountRef.current = currentCount;

        // Reset trigger ref when new profiles are added (top-up completed)
        // This allows top-up to trigger again if count drops to 3 later
        if (currentCount > previousCount && previousCount > 0) {
            lastTopUpTriggeredAtRef.current = null;
        }
    }, [listProfilesData]);

    // Auto top-up logic: fetch more profiles when exactly 3 profiles remain
    const fetchTopUpProfiles = useCallback(async () => {
        if (isTopUpInProgressRef.current) return; // Prevent concurrent requests
        if (!IsFocused) return; // Only top-up when screen is focused

        const currentTotal = listProfilesData?.length || 0;
        const consumedCount = windowStartIndex + getCurrentIndex;
        const remainingCount = currentTotal - consumedCount;

        // Only top-up when exactly 3 profiles remain (or <= 3 to handle edge cases)
        // This ensures we fetch 7 more to reach 10 total
        if (remainingCount <= TOP_UP_TRIGGER_COUNT && remainingCount >= 0) {
            // Prevent duplicate triggers for the same remaining count
            if (lastTopUpTriggeredAtRef.current === remainingCount) {
                return;
            }

            const neededCount = PROFILE_LIMIT - remainingCount; // Will be 7 when remainingCount is 3
            const skip = totalFetchedCountRef.current;
            const limit = neededCount;

            // Only fetch if we need more and haven't already fetched everything
            if (limit > 0 && limit <= PROFILE_LIMIT) {
                isTopUpInProgressRef.current = true;
                lastTopUpTriggeredAtRef.current = remainingCount; // Mark that we triggered for this count
                try {
                    console.log(`[HomeScreen] Top-up: fetching ${limit} more profiles (skip=${skip}, remaining=${remainingCount})`);
                    await dispatch(listProfiles(true, skip, limit, true)); // merge=true to append
                    // totalFetchedCountRef will be updated automatically by the useEffect above
                } catch (error) {
                    console.warn('[HomeScreen] Top-up fetch failed:', error);
                    // Reset trigger ref on error so it can retry
                    lastTopUpTriggeredAtRef.current = null;
                } finally {
                    isTopUpInProgressRef.current = false;
                }
            }
        }
    }, [IsFocused, listProfilesData, windowStartIndex, getCurrentIndex, dispatch]);

    // Monitor profile consumption and trigger top-up when exactly 3 profiles remain
    useEffect(() => {
        if (!IsFocused) return;
        if (!listProfilesData || listProfilesData.length === 0) return;
        if (isTopUpInProgressRef.current) return; // Don't trigger if already fetching

        const consumedCount = windowStartIndex + getCurrentIndex;
        const remainingCount = listProfilesData.length - consumedCount;

        // Trigger top-up only when exactly 3 profiles remain (or <= 3 to handle edge cases)
        // This ensures API is called only once when threshold is reached
        if (remainingCount <= TOP_UP_TRIGGER_COUNT && remainingCount >= 0) {
            // Check if we already triggered for this remaining count
            if (lastTopUpTriggeredAtRef.current !== remainingCount) {
                // Small delay to avoid rapid successive calls
                const timer = setTimeout(() => {
                    fetchTopUpProfiles();
                }, 300);

                return () => clearTimeout(timer);
            }
        } else if (remainingCount > TOP_UP_TRIGGER_COUNT) {
            // Reset trigger ref when remaining count goes above threshold
            // This allows top-up to trigger again if count drops back to 3
            lastTopUpTriggeredAtRef.current = null;
        }
    }, [IsFocused, listProfilesData, windowStartIndex, getCurrentIndex, fetchTopUpProfiles]);

    const canSwipeRight = useCallback(() => {
        // Check subscription perks for unlimited likes
        const unlimitedLikes = userData?.subscription?.perks?.unlimitedLikes;
        if (unlimitedLikes === true) {
            return true; // Allow unlimited swipes
        }

        const swipes = remainingSwipes ?? userData?.swipesRemaining ?? 0;
        if (swipes <= 0) {
            returningFromSubscriptionRef.current = true;
            NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN, { comming: subscriptionItem });
            return false;
        }
        return true;
    }, [remainingSwipes, userData?.swipesRemaining, userData?.subscription?.perks?.unlimitedLikes, subscriptionItem]);

    const canSuperLike = useCallback(() => {
        // Check subscription perks for super like limit
        // const superLikePerks = userData?.subscription?.perks?.superLike;
        // if (superLikePerks === 0) {
        //     returningFromSubscriptionRef.current = true;
        //     NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN, { comming: subscriptionItem });
        //     return false;
        // }

        // Use state value (which is synced with AsyncStorage)
        const superLikes = remainingSuperLikes ?? userData?.superLikesRemaining ?? 0;
        if (superLikes <= 0) {
            returningFromSubscriptionRef.current = true;
            NavigationService.navigate(NAVIGATION_SUPERLIKE_PURCHESE_SCREEN);
            return false;
        }
        return true;
    }, [remainingSuperLikes, userData?.superLikesRemaining, userData?.subscription?.perks?.superLike, subscriptionItem]);
    const OverlayLabelRight = useCallback(() => {
        return (
            <View style={styles.leftIconOverlay}>
                <FastImage source={yesIcon} resizeMode="contain" style={styles.yesIcon} />
            </View>
        );
    }, []);
    const OverlayLabelLeft = useCallback(() => {
        return (
            <View style={styles.rightIconOverlay}>
                <FastImage source={nopeIcon} resizeMode="contain" style={styles.yesIcon} />
            </View>

        );
    }, []);
    const OverlayLabelTop = useCallback(() => {
        return (
            <View style={{ top: metrics.hp25, alignItems: 'center', justifyContent: 'center', }}>
                <FastImage source={superlike} resizeMode='contain' style={{ height: metrics.hp20, width: metrics.hp25 }} />
            </View>
        );
    }, []);
    const handleTap = (evt: any, profile: any) => {
        const totalImages = profile?.gallery?.length || 0;
        if (!evt?.nativeEvent?.locationX || !cardWidthRef.current) return;
        const x = evt.nativeEvent.locationX;

        const updatedProfiles = listProfilesData.map((p: any) => {
            if (p._id === profile._id) {
                let newIndex = p.index || 0;
                if (x > cardWidthRef.current / 2) {
                    newIndex = newIndex < totalImages - 1 ? newIndex + 1 : newIndex;
                } else {
                    newIndex = newIndex > 0 ? newIndex - 1 : newIndex;
                }

                if (newIndex !== p.index && p.gallery && p.gallery[newIndex]?.url) {
                    const targetImageUrl = p.gallery[newIndex].url;
                    FastImage.preload([{ uri: targetImageUrl, priority: FastImage.priority.high }]);

                    if (newIndex > 0 && p.gallery[newIndex - 1]?.url) {
                        FastImage.preload([{ uri: p.gallery[newIndex - 1].url, priority: FastImage.priority.normal }]);
                    }
                    if (newIndex < totalImages - 1 && p.gallery[newIndex + 1]?.url) {
                        FastImage.preload([{ uri: p.gallery[newIndex + 1].url, priority: FastImage.priority.normal }]);
                    }
                }

                return { ...p, index: newIndex };
            }
            return p;
        });

        dispatch(setListProfiles(updatedProfiles));
    };

    useEffect(() => {
        if (listProfilesData && listProfilesData.length > 0) {
            listProfilesData.forEach((profile: any) => {
                if (profile?.gallery && profile?.gallery.length > 0) {
                    const currentIndex = profile.index || 0;
                    const gallery = profile.gallery;

                    const imagesToPreload = [
                        gallery[currentIndex]?.url,
                        currentIndex > 0 ? gallery[currentIndex - 1]?.url : null,
                        currentIndex < gallery.length - 1 ? gallery[currentIndex + 1]?.url : null,
                    ].filter(Boolean);

                    imagesToPreload.forEach((url: string) => {
                        if (url) {
                            FastImage.preload([{ uri: url, priority: FastImage.priority.normal }]);
                        }
                    });
                }
            });
        }
    }, [listProfilesData]);

    async function requestAndroidNotificationPermission() {
        await messaging().registerDeviceForRemoteMessages();
        try {
            if (Platform.OS === 'android' && Platform.Version >= 33) {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                );

                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('Notification permission granted');
                } else {
                    console.log('Notification permission denied');
                }
            }
        } catch (e) {
            // Never crash HomeScreen due to permission API edge cases
            console.warn('Notification permission request failed:', e);
        }
        await messaging().requestPermission();
    }
    useEffect(() => {
        const timer = setTimeout(() => {
            requestAndroidNotificationPermission()
        }, 3000);
        return () => clearTimeout(timer);
    }, [])
    const renderCard = ((profile: any, index: any) => {
        const currentImageIndex = profile?.index || 0;
        const gallery = profile?.gallery || [];
        const currentImage = gallery[currentImageIndex];
        const prevImage = currentImageIndex > 0 ? gallery[currentImageIndex - 1] : null;
        const nextImage = currentImageIndex < gallery.length - 1 ? gallery[currentImageIndex + 1] : null;

        return (
            <View style={styles.card}>
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={(evt: GestureResponderEvent) => handleTap(evt, profile)}
                    onLayout={(e: LayoutChangeEvent) => {
                        const layout = e?.nativeEvent?.layout;
                        if (layout?.width) cardWidthRef.current = layout.width;
                    }}>
                    <View style={styles.imageContainer}>
                        {prevImage?.url && (
                            <FastImage
                                source={{ uri: prevImage.url }}
                                style={styles.hiddenImage}
                                resizeMode={FastImage.resizeMode.cover}
                            />
                        )}
                        {nextImage?.url && (
                            <FastImage
                                source={{ uri: nextImage.url }}
                                style={styles.hiddenImage}
                                resizeMode={FastImage.resizeMode.cover}
                            />
                        )}
                        {/* Main visible image */}
                        {currentImage?.url ? (
                            <FastImage
                                source={{
                                    uri: currentImage.url,
                                    priority: FastImage.priority.high,
                                }}
                                style={[styles.image, { height: FULL_IMAGE_HEIGHT }]}
                                resizeMode={FastImage.resizeMode.cover}
                            />
                        ) : null}
                    </View>
                    <View style={styles.paginationContainer}>
                        {profile?.gallery?.map((_: any, i: number) => (
                            <View
                                key={i}
                                style={[
                                    styles.paginationBar,
                                    {
                                        opacity: i === profile?.index ? 1 : 0.3,
                                        backgroundColor:
                                            i === profile?.index ? colors.white : "gray",
                                    },
                                ]}
                            />
                        ))}
                    </View>
                    <LinearGradient start={{ x: 1, y: 1 }}
                        end={{ x: 1, y: 0 }} colors={Platform.OS === "ios" ? ["#00000090", "#00000040", "#00000000"] : ["#000000", "#00000099", "#00000000"]} style={styles.bottomDetails}>
                        <View style={{ marginTop: metrics.hp8, paddingHorizontal: Platform.OS === "ios" ? metrics.hp2 : metrics.hp0 }}>
                            {profile?.online && userData?.subscription?.plan !== "FREE" &&
                                <View style={styles.activeContainer}>
                                    <View style={styles.activeBackground}>
                                        <View style={styles.activeDot} />
                                    </View>
                                    <AppText type={TEN} color={WHITE} weight={INTER_SEMI_BOLD}>
                                        {" "}Active
                                    </AppText>
                                </View>
                            }
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <AppText type={TWENTY_TWO} color={WHITE} weight={INTER_BOLD}>
                                    {profile.name}, {profile.age}{" "}
                                </AppText>
                                <FastImage source={blueTikeIcon} resizeMode="contain" style={styles.blueTikIcon} />
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <FastImage source={locationCIon} resizeMode="contain" style={styles.loctionIcon} />
                                <AppText style={{ marginTop: metrics.hp0_5 }} type={ELEVEN} color={WHITE} weight={INTER_MEDIUM}>
                                    {"  "}
                                    {`${profile.distanceInKm == 0 ? "Near by" : `${profile.distanceInKm} Km away`}`}
                                </AppText>
                            </View>
                            {profile.work !== "" &&
                                <View style={{ flexDirection: "row", alignItems: "center", marginTop: metrics.hp0_1 }}>
                                    <FastImage source={bussinessIcon} resizeMode="contain" style={styles.loctionIcon} />
                                    <AppText style={{ marginTop: metrics.hp0_5 }} type={ELEVEN} color={WHITE} weight={INTER_MEDIUM}>
                                        {"  "}
                                        {profile.work}
                                    </AppText>
                                </View>}

                        </View>
                        <TouchableOpacityView style={styles.upArrowContainer} onPress={() => { setModalVisible(true), setSwipeUp(false) }}>
                            <FastImage
                                source={upArrowIcon}
                                resizeMode="contain"
                                style={styles.uparrowIcon}
                            />
                        </TouchableOpacityView>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

        );
    });

    const swipeFunction = async (index: any, swipe: any) => {
        const actualProfileIndex = windowStartIndex + index;
        const profile = listProfilesData[actualProfileIndex];
        if (!profile) return;
        if (swipe === "like") {
            setGetCurrentIndex(index + 1);
            // Only decrement remaining swipes if unlimited likes is not active
            const unlimitedLikes = userData?.subscription?.perks?.unlimitedLikes;
            if (unlimitedLikes !== true) {
                setRemainingSwipes((prev: number) => Math.max((prev ?? 0) - 1, 0));
            }
            let data = {
                "swipedId": profile._id,
                "type": "like"
            };
            dispatch(swipeLikeDisLike(data));
        } else if (swipe === "superLike") {
            setGetCurrentIndex((prev) => prev + 1);
            setRemainingSuperLikes((prev: number) => Math.max((prev ?? 0) - 1, 0));
            let datanew = {
                "swipedId": profile._id,
                "type": "superLike"
            };
            dispatch(swipeLikeDisLike(datanew));
            setSuperLikeVisible(false);
        } else if (swipe === "dislike") {
            setGetCurrentIndex(index + 1);
            let data = {
                "swipedId": profile._id,
                "type": "dislike"
            };
            dispatch(swipeLikeDisLike(data));
        }
    };

    // Programmatic swipe handlers (used by modals like Crush Notes): ensure API is hit reliably.
    useEffect(() => {
        if (!modalVisible && swipeRight) {
            // 1) hit the same "like" API path for the current card
            swipeFunction(getCurrentIndex, "like");
            // 2) animate swipe, but skip Swiper's onSwipeRight callback once to avoid double-like
            skipNextSwipeRightCallbackRef.current = true;
            ref.current?.swipeRight();
            setSwipeRight(false);
        } else if (!modalVisible && swipeLeft) {
            ref.current?.swipeLeft();
            setSwipeLeft(false);
        } else if (!modalVisible && swipeUp) {
            const timer = setTimeout(() => {
                ref.current?.swipeTop();
                setSwipeUp(false);
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [swipeRight, modalVisible, swipeLeft, swipeUp, getCurrentIndex]);

    // const toastRef = useRef<IToast>(null);
    // function show() {
    //     toastRef.current?.hide(() => {
    //         toastRef.current?.show('Posting...', 'info', 400);
    //     })
    // }

    // function hide() {
    //     toastRef.current?.hide();
    // }

    // function showSuccess() {
    //     toastRef.current?.hide(() => {
    //         toastRef.current?.show('Posted', 'success', 400);
    //     })
    // }

    // function showError() {
    //     toastRef.current?.hide(() => {
    //         toastRef.current?.show('Ops, something is wrong!', 'error', 400);
    //     })
    // }

    // function handleHide() {
    //     console.log('toast is hidden');
    // }
    // useEffect(()=>{
    //     // toastRef.current?.hide(() => {
    //         toastRef.current?.show('Posted', 'success', 400);
    //     // })
    // },[])

    const toCount = (v: any, fallback: number) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : fallback;
    };

    const crushNotesRemaining = toCount(userData?.crushNotesRemaining, 0);

    return (
        <AppSafeAreaView>
            {/* <Toast ref={toastRef} onHide={showSuccess} /> */}
            <View>
                <View style={{ zIndex: 2, backgroundColor: colors.white }}>
                    <PeopleHeader
                        profile={false}
                        useName={true}
                        showBooster={visibleCards.length === 0 || (windowStartIndex + getCurrentIndex >= listProfilesData?.length)}
                        boostIcon={(boostRemaining > 0 || boostTimer.isRunning) ? flashIcon : null}
                        boostTimerText={boostTimer.isRunning ? boostTimer.remainingLabel : null}
                        onBoostPress={handleBoostPress}
                        setModalVisible={setModalVisible}
                    />
                </View>
                <View style={[styles.swiperContainer, { paddingHorizontal: (visibleCards.length === 0 || (windowStartIndex + getCurrentIndex >= listProfilesData?.length)) ? 0 : metrics.hp1 }]}>
                    {(visibleCards.length === 0 || (windowStartIndex + getCurrentIndex >= listProfilesData?.length)) &&
                        <>
                            <View style={{ alignItems: "center", justifyContent: "center", flex: 1, marginTop: -metrics.hp5 }}>
                                <PulsingCircle size={metrics.hp15} />
                                <View style={{ height: metrics.hp15, width: metrics.hp15, borderRadius: metrics.hp50, borderWidth: metrics.hp0_3, borderColor: "#6F13F220", alignItems: "center", justifyContent: "center" }}>
                                    <FastImage resizeMode='cover' style={styles.emptyImage} source={{ uri: userData?.gallery[0]?.url }} />
                                </View>
                            </View>
                            <AppText style={{ position: "absolute", top: "63%" }} type={TWELVE} color={OPECITY_DARK} weight={INTER_MEDIUM}>
                                Searching people near you...
                            </AppText>
                            {userData?.globalSearch === false &&
                                <LinearGradient colors={["#6F13F200", "#6F13F220"]} style={{ alignItems: "center", justifyContent: "center", width: "100%", position: "absolute", height: metrics.hp25, paddingHorizontal: metrics.hp2, bottom: -metrics.hp5 }}>
                                    <AppText type={FORTEEN} weight={INTER_BOLD}>
                                        Your Story Isn’t Over Yet
                                    </AppText>
                                    <AppText style={{ textAlign: "center" }}>
                                        You’re caught up for today. New people are searching for you — reset your filters or switch to Global Search to discover more.
                                    </AppText>
                                    <TouchableOpacityView onPress={async () => {
                                        const data = {
                                            "preferredGender": userData?.preferredGender,
                                            "relationshipPreference": userData?.relationshipPreference || userData?.relationsShipStatus,
                                            "preferredAgeRange": {
                                                "min": userData?.preferredAgeRange ? userData.preferredAgeRange.min : 18,
                                                "max": userData?.preferredAgeRange ? userData.preferredAgeRange.max : 45
                                            },
                                            "preferredDistanceKm": userData?.preferredDistanceKm,
                                            "globalSearch": true,
                                            "languagePrefrence": userData?.languagePrefrence || [],
                                        };
                                        try {
                                            const response: any = await appOperation.customer.editFilterAPI(data);
                                            if (response?.statusCode === 200) {
                                                dispatch(listProfiles(true))
                                                dispatch(getProfile(true));
                                            }
                                        } catch (error) {
                                            console.log("Error updating filter:", error);
                                        }
                                    }} style={{ height: metrics.hp5, borderRadius: metrics.hp50, borderWidth: metrics.hp0_1, borderColor: colors.black, alignItems: "center", justifyContent: "center", width: "100%", marginTop: metrics.hp2 }}>
                                        <AppText type={FORTEEN} weight={INTER_BOLD}>
                                            Global Search
                                        </AppText>
                                    </TouchableOpacityView>
                                </LinearGradient>
                            }
                        </>}
                    {visibleCards.length > 0 && (windowStartIndex + getCurrentIndex < listProfilesData?.length) &&
                        <Swiper
                            key={`swiper-${windowStartIndex}`}
                            ref={ref}
                            data={visibleCards}
                            cardStyle={styles.cardStyle}
                            overlayLabelContainerStyle={styles.overlayLabelContainerStyle}
                            renderCard={renderCard}
                            disableBottomSwipe
                            disableRightSwipe={userData?.subscription?.perks?.unlimitedLikes !== true && (remainingSwipes ?? userData?.swipesRemaining ?? 0) <= 0}
                            disableTopSwipe={/* userData?.subscription?.perks?.superLike !== 0 &&  */(remainingSuperLikes ?? userData?.superLikesRemaining ?? 0) <= 0}
                            OverlayLabelRight={OverlayLabelRight}
                            OverlayLabelLeft={OverlayLabelLeft}
                            OverlayLabelTop={OverlayLabelTop}
                            onSwipeRightDenied={() => {
                                // Check if unlimited likes perk is active
                                const unlimitedLikes = userData?.subscription?.perks?.unlimitedLikes;
                                if (unlimitedLikes === true) {
                                    return; // Should not happen, but just in case
                                }
                                returningFromSubscriptionRef.current = true;
                                NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN, { comming: subscriptionItem });
                            }}
                            onSwipeTopDenied={() => {
                                // Check if super like perk is available
                                // const superLikePerks = userData?.subscription?.perks?.superLike;
                                // if (superLikePerks === 0) {
                                //     returningFromSubscriptionRef.current = true;
                                //     NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN, { comming: subscriptionItem });
                                // } else {
                                returningFromSubscriptionRef.current = true;
                                NavigationService.navigate(NAVIGATION_SUPERLIKE_PURCHESE_SCREEN);
                                // }
                            }}
                            onSwipeRight={(index) => {
                                // When we trigger a programmatic swipeRight (e.g. from a modal),
                                // we already called `swipeFunction()` manually. Skip once to avoid double-like.
                                if (skipNextSwipeRightCallbackRef.current) {
                                    skipNextSwipeRightCallbackRef.current = false;
                                    return;
                                }
                                const swipes = remainingSwipes ?? userData?.swipesRemaining ?? 0;
                                if (swipes <= 0) {
                                    returningFromSubscriptionRef.current = true;
                                    NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN, { comming: subscriptionItem });
                                    requestAnimationFrame(() => {
                                        ref.current?.swipeBack && ref.current?.swipeBack();
                                    });
                                    return;
                                }
                                swipeFunction(index, "like");
                            }}
                            onSwipeLeft={(index) => swipeFunction(index, "dislike")}
                            onSwipeTop={(index) => {
                                swipeFunction(index, "superLike");
                            }}
                            // Tinder-style shared swipe state for gesture-linked button indicators
                            sharedTranslateX={sharedTranslateX}
                            sharedTranslateY={sharedTranslateY}
                            initialIndex={getCurrentIndex}
                            prerenderItems={4}
                        />}
                </View>
                {visibleCards.length > 0 && (windowStartIndex + getCurrentIndex < listProfilesData?.length) &&
                    <View style={styles.likeUnLikeCOntainer}>
                        <TouchableOpacityView activeOpacity={0.8} onPress={handleBoostPress} style={styles.flasContaier}>
                            <BoostLiquidButton
                                size={metrics.hp6_5}
                                isRunning={boostTimer.isRunning}
                                remainingFraction={boostTimer.remainingFraction}
                                timerText={boostTimer.remainingLabel}
                                iconSource={flashIcon}
                            />
                        </TouchableOpacityView>
                        <View style={styles.unlickContainer} >
                            <Animated2.View style={[StyleSheet.absoluteFill, nopeBgStyle, { overflow: "hidden" }]}>
                                <LinearGradient
                                    colors={["#6F13F2", "#400B8C"]}
                                    start={{ x: 0.5, y: 0 }}
                                    end={{ x: 0.5, y: 1 }}
                                    style={StyleSheet.absoluteFill}
                                />
                            </Animated2.View>
                            <Animated2.View style={[StyleSheet.absoluteFill, nopeBorderStyle, { overflow: "hidden" }]}>
                                <Svg width="100%" height="100%" viewBox="0 0 100 100">
                                    <Defs>
                                        <SvgLinearGradient id="nopeBorder" x1="0" y1="0.5" x2="1" y2="0.5">
                                            <Stop offset="0" stopColor="#6F13F2" />
                                            <Stop offset="1" stopColor="#400B8C" />
                                        </SvgLinearGradient>
                                    </Defs>
                                    <Circle cx="50" cy="50" r="48" fill="none" stroke="url(#nopeBorder)" strokeWidth="3" />
                                </Svg>
                            </Animated2.View>
                            <TouchableOpacityView
                                onPressIn={() => { tapNope.value = 1; }}
                                onPressOut={() => { tapNope.value = 0; }}
                                onPress={() => {
                                    tapNope.value = 0; // hard reset (no delay)
                                    triggerNope();
                                }}>
                                <View style={styles.iconStack}>
                                    <Animated2.Image source={CloseBlueIcon} resizeMode="contain" style={[styles.flasIconClose, nopeBaseIconStyle]} />
                                    <Animated2.Image source={CloseBlueIcon} resizeMode="contain" style={[styles.flasIconClose, styles.iconAbs, nopeWhiteIconStyle]} tintColor={colors.white} />
                                </View>
                            </TouchableOpacityView>
                        </View>
                        <View style={[styles.flasContaier, { overflow: Platform.OS === "ios" ? "visible" : "hidden" }]}>
                            <Animated2.View style={[StyleSheet.absoluteFill, superLikeBgStyle, { overflow: "hidden" }]}>
                                <LinearGradient
                                    colors={["#FF1A00", "#991000"]}
                                    start={{ x: 0.5, y: 0 }}
                                    end={{ x: 0.5, y: 1 }}
                                    style={StyleSheet.absoluteFill}
                                />
                            </Animated2.View>
                            <Animated2.View style={[StyleSheet.absoluteFill, superLikeBorderStyle, { overflow: "hidden" }]}>
                                <Svg width="100%" height="100%" viewBox="0 0 100 100">
                                    <Circle cx="50" cy="50" r="48" fill="none" stroke="#FF0000" strokeWidth="3" />
                                </Svg>
                            </Animated2.View>
                            <TouchableOpacityView
                                onPressIn={() => { tapSuperLike.value = 1; }}
                                onPressOut={() => { tapSuperLike.value = 0; }}
                                onPress={() => {
                                    tapSuperLike.value = 0; // hard reset (no delay)

                                    // Check subscription perks for super like limit
                                    // const superLikePerks = userData?.subscription?.perks?.superLike;
                                    // if (superLikePerks === 0) {
                                    //     NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN, { comming: subscriptionItem });
                                    //     return;
                                    // }

                                    const superLikes = remainingSuperLikes ?? userData?.superLikesRemaining ?? 0;
                                    if (superLikes <= 0) {
                                        NavigationService.navigate(NAVIGATION_SUPERLIKE_PURCHESE_SCREEN);
                                        return;
                                    }
                                    setSuperLikeVisible(true);
                                }}>
                                <View style={styles.iconStack}>
                                    <Animated2.Image source={heartRed} resizeMode="contain" style={[styles.flasIcon, superLikeBaseIconStyle]} />
                                    <Animated2.Image source={superlikeiconwhite} resizeMode="contain" style={[styles.flasIcon, styles.iconAbs, superLikeWhiteIconStyle, { top: metrics.hp0_3, left: metrics.hp0_2 }]} />
                                </View>
                            </TouchableOpacityView>
                        </View>
                        <View style={styles.unlickContainer} >
                            <Animated2.View style={[StyleSheet.absoluteFill, likeBgStyle, { overflow: "hidden" }]}>
                                <LinearGradient
                                    colors={["#CCF63D", "#779024"]}
                                    start={{ x: 0.5, y: 0 }}
                                    end={{ x: 0.5, y: 1 }}
                                    style={StyleSheet.absoluteFill}
                                />
                            </Animated2.View>
                            <Animated2.View style={[StyleSheet.absoluteFill, likeBorderStyle, { overflow: "hidden" }]}>
                                <Svg width="100%" height="100%" viewBox="0 0 100 100">
                                    <Defs>
                                        <SvgLinearGradient id="likeBorder" x1="0" y1="0.5" x2="1" y2="0.5">
                                            <Stop offset="0" stopColor="#C7FF09" />
                                            <Stop offset="1" stopColor="#8FB800" />
                                        </SvgLinearGradient>
                                    </Defs>
                                    <Circle cx="50" cy="50" r="48" fill="none" stroke="url(#likeBorder)" strokeWidth="3" />
                                </Svg>
                            </Animated2.View>
                            <TouchableOpacityView
                                onPressIn={() => { tapLike.value = 1; }}
                                onPressOut={() => { tapLike.value = 0; }}
                                onPress={() => {
                                    // Check subscription perks for unlimited likes
                                    const unlimitedLikes = userData?.subscription?.perks?.unlimitedLikes;
                                    if (unlimitedLikes !== true) {
                                        const swipes = remainingSwipes ?? userData?.swipesRemaining ?? 0;
                                        if (swipes <= 0) {
                                            returningFromSubscriptionRef.current = true;
                                            NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN, { comming: subscriptionItem });
                                            return;
                                        }
                                    }
                                    tapLike.value = 0; // hard reset (no delay)
                                    triggerLike();
                                }}>
                                <View style={styles.iconStack}>
                                    <Animated2.Image source={heartGreen} resizeMode="contain" style={[styles.flasIconClose, likeBaseIconStyle, { marginTop: Platform.OS === "ios" ? metrics.hp0_2 : 0 }]} />
                                    <Animated2.Image source={heartGreen} resizeMode="contain" style={[styles.flasIconClose, styles.iconAbs, likeWhiteIconStyle, { marginTop: Platform.OS === "ios" ? metrics.hp0_2 : 0 }]} tintColor={colors.white} />
                                </View>
                            </TouchableOpacityView>
                        </View>
                        <TouchableOpacityView
                            onPress={() => {
                                if (crushNotesRemaining <= 0) {
                                    NavigationService.navigate(NAVIGATION_CRUSH_PURCHESE_SCREEN);
                                    return;
                                }
                                setCrushNotesSender(true);
                            }}
                            style={styles.flasContaier}
                        >
                            <FastImage source={shareRedIcon} resizeMode="contain" style={styles.flasIcon} />
                        </TouchableOpacityView>
                    </View>
                }
                <Modal
                    animationType="fade"
                    visible={modalVisible}
                    statusBarTranslucent
                    onRequestClose={() => setModalVisible(false)}>
                    <PreviewDetails data={visibleCards[getCurrentIndex] || listProfilesData[windowStartIndex + getCurrentIndex]} setModalVisible={setModalVisible}
                        setSwipeRight={setSwipeRight}
                        setSwipeLeft={setSwipeLeft}
                        setSwipeUp={setSwipeUp} modalVisible={modalVisible} ref={ref}
                        ImageIndex={currentImageIndex}
                        CurrentImageIndex={setCurrentImageIndex}
                        canSuperLike={canSuperLike}
                        setSuperLikeVisible={setSuperLikeVisible} />
                </Modal>
                <Modal
                    animationType="slide"
                    visible={crushNotesSednder}
                    statusBarTranslucent
                    onRequestClose={() => setCrushNotesSender(false)}>
                    <CrushNotesSender data={visibleCards[getCurrentIndex] || listProfilesData[windowStartIndex + getCurrentIndex]} setModalVisible={setCrushNotesSender}
                        setSwipeRight={setSwipeRight}
                        setSwipeLeft={setSwipeLeft}
                        setSwipeUp={setSwipeUp} modalVisible={crushNotesSednder} ref={ref}
                        ImageIndex={currentImageIndex}
                        CurrentImageIndex={setCurrentImageIndex}
                        setSuperLikeVisible={setSuperLikeVisible} />
                </Modal>
                <Modal
                    animationType="fade"
                    transparent={true}
                    statusBarTranslucent
                    visible={matchVisible}
                    onRequestClose={() => setMatchVisible(false)}>
                    <MatchScreen setMatchVisible={setMatchVisible} matchData={matchData} />
                </Modal>
                <Modal
                    animationType="fade"
                    transparent={true}
                    statusBarTranslucent
                    visible={superLikeVisible}
                    onRequestClose={() => setSuperLikeVisible(false)}>
                    <SuperLikeScreen data={visibleCards[getCurrentIndex] || listProfilesData[windowStartIndex + getCurrentIndex]} setSuperLikeVisible={setSuperLikeVisible} setGetCurrentIndex={setGetCurrentIndex}
                        setSwipeUp={setSwipeUp} ref={ref} getCurrentIndex={getCurrentIndex} />
                </Modal>
                <BoostModal
                    visible={boostModalVisible}
                    onClose={() => setBoostModalVisible(false)}
                    boostsAvailable={boostRemaining}
                    durationMinutes={30}
                    isRunning={boostTimer.isRunning}
                    remainingFraction={boostTimer.remainingFraction}
                    remainingLabel={boostTimer.remainingLabel}
                    onStart={handleActivateBoost}
                    isActivating={isBoostActivating}
                />


                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={showProfileCompletionReminder}
                    statusBarTranslucent
                    onRequestClose={() => setShowProfileCompletionReminder(false)}>
                    <View style={styles.centeredView}>
                        <View style={styles.confirmContainer}>
                            <FastImage source={completeProfileBanner} resizeMode="stretch" style={styles.bdyBack} />
                            <AppText style={{ textAlign: "center" }} type={TWENTY_FOUR} weight={SCHEHERAZADE_BOLD} color={LIGHT_BLACK}>
                                Complete your profile
                            </AppText>
                            <AppText style={{ marginTop: -metrics.hp3, textAlign: "center" }} type={TWENTY_FOUR} weight={SCHEHERAZADE_BOLD} color={LIGHT_BLACK}>
                                to get more matches!
                            </AppText>
                            <TouchableOpacityView onPress={() => {
                                setShowProfileCompletionReminder(false);
                                NavigationService.navigate(NAVIGATION_EDIT_PROFILE_SCREEN);
                            }} style={[styles.ediButton, { backgroundColor: colors.purple, marginTop: metrics.hp0 }]}>
                                <AppText color={WHITE} weight={INTER_SEMI_BOLD} type={TWELVE}>
                                    Complete Profile
                                </AppText>
                            </TouchableOpacityView>
                            <AppText onPress={() => setShowProfileCompletionReminder(false)} weight={INTER_SEMI_BOLD} type={TWELVE} style={{ textAlign: "center", marginTop: metrics.hp2 }} color={LIGHT_BLACK}>
                                No, skip now
                            </AppText>
                        </View>
                    </View>
                </Modal>
            </View>
        </AppSafeAreaView>
    );
};

export default PeopleScreen;

const styles = StyleSheet.create({
    swiperContainer: {
        height: FULL_IMAGE_HEIGHT, marginBottom: metrics.hp2, alignItems: "center", zIndex: 1, marginTop: metrics.hp2, paddingHorizontal: metrics.hp1,
    },
    paginationContainer: {
        position: 'absolute',
        top: metrics.hp1,
        left: 0,
        right: 0,
        height: 4,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: metrics.hp1,
        gap: metrics.hp0_5,
    },
    paginationBar: {
        height: metrics.hp0_3,
        width: metrics.hp5,
        flex: 1,
        borderRadius: metrics.hp10
    },
    yesIcon: {
        height: metrics.hp10,
        width: metrics.hp16,
    },
    imageContainer: {
        position: 'relative',
        width: "100%",
        height: FULL_IMAGE_HEIGHT,
        borderRadius: metrics.hp2,
        overflow: 'hidden',
        backgroundColor: '#000',
    },
    image: {
        borderRadius: metrics.hp2,
        width: "100%",
        height: "100%",
        backgroundColor: '#000',
    },
    hiddenImage: {
        position: 'absolute',
        width: 1,
        height: 1,
        opacity: 0,
        zIndex: -1,
    },
    leftIconOverlay: {
        position: "absolute",
        top: "40%",
        left: metrics.hp2,
        alignItems: "center",
        justifyContent: "center",
    },
    rightIconOverlay: {
        position: "absolute",
        top: "40%",
        right: metrics.hp2,
        alignItems: "center",
        justifyContent: "center",
    },
    card: {
        width: "100%",
        height: height * 0.75,
        position: "absolute",
        borderRadius: metrics.hp2,
        backgroundColor: "#000",
        overflow: Platform.OS === "android" ? "hidden" : undefined,
    },
    cardStyle: {
        width: '100%',
        borderRadius: 15,
        alignItems: 'center',
        flex: 1,
    },
    overlayLabelContainer: {
        borderRadius: 15,
        height: '90%',
        width: '90%',
    },
    overlayLabelContainerStyle: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: metrics.hp30,
    },
    likeUnLikeCOntainer: {
        bottom: -metrics.hp2,
        position: "absolute",
        width: Screen.Width / 1.05,
        zIndex: 1,
        alignSelf: "center",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-evenly",
    },
    flasContaier: {
        height: metrics.hp6_5,
        width: metrics.hp6_5,
        backgroundColor: colors.white,
        borderRadius: metrics.hp50,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: metrics.hp1,
        elevation: metrics.hp0_5,
    },
    unlickContainer: {
        height: metrics.hp7_2,
        width: metrics.hp7_2,
        backgroundColor: colors.white,
        borderRadius: metrics.hp50,
        alignItems: "center",
        justifyContent: "center",
        overflow: Platform.OS === "ios" ? "visible" : "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: metrics.hp1,
        elevation: metrics.hp0_5,
    },
    iconStack: {
        height: metrics.hp4,
        width: metrics.hp4,
        alignItems: "center",
        justifyContent: "center",
    },
    iconAbs: {
        position: "absolute",
        top: 0,
        left: 0,
    },
    flasIcon: {
        height: metrics.hp3_5,
        width: metrics.hp3_5,
    },
    flasIconClose: {
        height: metrics.hp4,
        width: metrics.hp4,

    },
    blueTikIcon: {
        height: metrics.hp2_5,
        width: metrics.hp2_5,
        marginTop: metrics.hp0_5,
    },
    loctionIcon: {
        height: metrics.hp2,
        width: metrics.hp2,
        marginTop: metrics.hp0_5,
    },
    bottomDetails: {
        position: "absolute",
        bottom: Platform.OS === "ios" ? metrics.hp0 : -metrics.hp2,
        width: "100%",
        height: Platform.OS === "ios" ? metrics.hp22 : metrics.hp25,
        paddingHorizontal: Platform.OS === "ios" ? metrics.hp0 : metrics.hp2,
        borderBottomLeftRadius: Platform.OS === "ios" ? metrics.hp2 : metrics.hp0,
        borderBottomRightRadius: Platform.OS === "ios" ? metrics.hp2 : metrics.hp0,
    },
    uparrowIcon: {
        height: metrics.hp2_5,
        width: metrics.hp2_3,
    },
    upArrowContainer: {
        height: metrics.hp6,
        width: metrics.hp6,
        borderRadius: metrics.hp50,
        borderWidth: metrics.hp0_1,
        borderColor: "#FFFFFF4D",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#00000033",
        marginRight: metrics.hp2,
        position: "absolute",
        right: metrics.hp0,
        bottom: metrics.hp12
    },
    pulse: {
        position: 'absolute',
        backgroundColor: "#6F13F220",
    },
    emptyImage: {
        height: metrics.hp14, width: metrics.hp14, borderRadius: metrics.hp50, borderWidth: metrics.hp0_1, borderColor: colors.white
    },
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
    activeContainer: { height: metrics.hp2, paddingHorizontal: metrics.hp1, flexDirection: "row", alignItems: "center", borderRadius: metrics.hp5, backgroundColor: "#FFFFFF33", marginTop: metrics.hp0_5, width: metrics.hp8 },
    activeBackground: { height: metrics.hp1_2, width: metrics.hp1_2, borderWidth: metrics.hp0_1, borderColor: "#28EC594D", backgroundColor: "#28EC591A", borderRadius: metrics.hp20, alignItems: "center", justifyContent: "center", marginRight: metrics.hp0_3 },
    activeDot: { height: metrics.hp0_8, width: metrics.hp0_8, backgroundColor: "#28EC59", borderRadius: metrics.hp50 },
});


import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, AppState, AppStateStatus, Dimensions, GestureResponderEvent, Image, ImageBackground, Modal, NativeModules, PermissionsAndroid, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import Animated, {
    Extrapolation,
    SharedValue,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';

import { AppSafeAreaView } from '../../common/AppSafeAreaView';
import { TouchableOpacityView } from '../../common/TouchableOpacityView';
import {
    AppText,
    ELEVEN,
    fontSize,
    FORTEEN,
    INTER_BOLD,
    INTER_MEDIUM,
    INTER_SEMI_BOLD,
    LIGHT_BLACK,
    OPECITY_DARK,
    SCHEHERAZADE_BOLD,
    TEN,
    THIRTEEN,
    TWELVE,
    TWENTY_FOUR,
    TWENTY_TWO,
    WHITE,
} from '../../common/AppText';
import { activateBoostAPI, getProfile, listProfiles, swipeLikeDisLike } from '../../actions/authActions';
import metrics from '../../assets/Metrics';
import { colors } from '../../theme/colors';
import { accountcircleIcon, blueTikeIcon, bussinessIcon, disLikeNewIcon, flashIcon, goldCard, likeNewICon, locationCIon, mapIcon, swipeUpIcon } from '../../helper/ImageAssets';
import PeopleHeader from '../../common/PeopleHeader';
import { useBoostTimer } from '../../hooks/useBoostTimer';
import NavigationService from '../../navigation/NavigationService';
import { NAVIGATION_PROFILE_BOOST_PURCHASE_SCREEN, NAVIGATION_SUBSCRIPTION_SCREEN } from '../../navigation/routes';
import { NAVIGATION_FACE_LIVENESS_TEST_SCREEN } from '../../navigation/routes';
import { setGetProfile, setListProfiles } from '../../slices/loginServices/authSlice';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';
import { appOperation } from '../../appOperation';
import PulsingCircle from '../../common/PulsingCircle';
import PreviewDetails from './PreviewDetails';
import SafeGifImage from '../../common/SafeGifImage';
import { viewProfileICon } from '../../helper/ImageAssets';
import { NAVIGATION_SUPERLIKE_PURCHESE_SCREEN } from '../../navigation/routes';
import MatchScreen from './MatchScreen';
import { BoostModal } from '../../common/boost/BoostModal';
import { completeProfileBanner } from '../../helper/ImageAssets';
import { NAVIGATION_EDIT_PROFILE_SCREEN } from '../../navigation/routes';
import { createSocket } from '../../common/Socket';
import { useIsFocused } from '@react-navigation/native';
import messaging, {
    FirebaseMessagingTypes,
} from "@react-native-firebase/messaging";
import { check, openSettings, PERMISSIONS, request, RESULTS } from "react-native-permissions";
import Geolocation from "react-native-geolocation-service";
const { width, height } = Dimensions.get('window');

const CARD_WIDTH = width * 0.90;
const CARD_HEIGHT = height * 0.75;
const SIDE_PEEK = width * 0.01;
const STEP = CARD_WIDTH - SIDE_PEEK;
const TRANSITION_MS = 320;

type SwipeType = 'dislike' | 'like' | 'superLike';

// Session-only flag (resets when app is fully killed/reopened)
let hasShownProfileCompletionReminderThisSession = false;
let hasShownLocationPermissionPromptThisSession = false;
let hasShownFaceVerificationPromptThisSession = false;


type FaceLivenessResult =
    | { status?: string; message?: string }
    | string
    | null
    | undefined;

interface ProfileCardProps {
    profile: any;
    index: number;
    activeIndex: SharedValue<number>;
    onImageTap: (evt: GestureResponderEvent, profile: any) => void;
    onOpenPreview: (profile: any) => void;
    onLikePress: () => void;
    onDislikePress: () => void;
}

const ProfileCard = memo(({
    profile,
    index,
    activeIndex,
    onImageTap,
    onOpenPreview,
    onLikePress,
    onDislikePress,
}: ProfileCardProps) => {
    const touchStartYRef = useRef(0);
    const didSwipeUpRef = useRef(false);
    const SWIPE_UP_THRESHOLD = 55;
    const [imageError, setImageError] = useState(false);

    const currentImageIndex = profile?.index || 0;
    const gallery = profile?.gallery || [];
    const currentImage = gallery[currentImageIndex];

    useEffect(() => {
        setImageError(false);
    }, [currentImage?.url]);

    const animatedStyle = useAnimatedStyle(() => {
        const relative = index - activeIndex.value;
        const translateX = relative * STEP;

        const scale = interpolate(
            relative,
            [-2, -1, 0, 1, 2],
            [0.85, 0.9, 1, 0.9, 0.85],
            Extrapolation.CLAMP
        );
        const opacity = interpolate(
            Math.abs(relative),
            [0, 1, 2],
            [1, 0.8, 0.5],
            Extrapolation.CLAMP
        );

        return {
            transform: [{ translateX }, { scale }],
            opacity,
            zIndex: 100 - Math.round(Math.abs(relative)),
        };
    }, [index]);

    return (
        <Animated.View style={[styles.card, animatedStyle]}>
            <TouchableOpacity
                activeOpacity={1}
                onPress={(evt) => {
                    if (didSwipeUpRef.current) {
                        didSwipeUpRef.current = false;
                        return;
                    }
                    onImageTap(evt, profile);
                }}
                onPressIn={(evt: any) => {
                    touchStartYRef.current = evt.nativeEvent.pageY;
                }}
                onPressOut={(evt: any) => {
                    const deltaY = touchStartYRef.current - evt.nativeEvent.pageY;
                    if (deltaY > SWIPE_UP_THRESHOLD) {
                        didSwipeUpRef.current = true;
                        onOpenPreview(profile);
                        return;
                    }
                }}
                style={styles.imageTapArea}
            >
                <View style={styles.imageContainer}>
                    {currentImage?.url && !imageError ? (
                        <FastImage
                            source={{ uri: currentImage.url, priority: FastImage.priority.high }}
                            style={styles.image}
                            resizeMode={FastImage.resizeMode.cover}
                            onError={() => {
                                console.log(`[NewHomeScreen] Failed to load/decode image: ${currentImage.url}, falling back to placeholder.`);
                                setImageError(true);
                            }}
                        />
                    ) : (
                        <View style={[styles.image, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#222' }]}>
                            <FastImage source={accountcircleIcon} resizeMode="contain" tintColor="#555" style={{ width: 100, height: 100 }} />
                        </View>
                    )}
                </View>
            </TouchableOpacity>

            <View
                pointerEvents="none"
                style={{
                    height: metrics.hp4,
                    borderWidth: 0.1,
                    borderColor: colors.white,
                    flexDirection: "row",
                    alignItems: "center",
                    borderRadius: metrics.hp6,
                    justifyContent: "space-between",
                    position: "absolute",
                    top: metrics.hp1,
                    overflow: "hidden",
                    alignSelf: "center",
                    paddingHorizontal: metrics.hp0_4,
                }}
            >
                <BlurView
                    style={StyleSheet.absoluteFillObject}
                    blurType="light"
                    blurAmount={1}
                />
                <View
                    style={{
                        ...StyleSheet.absoluteFillObject,
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.25)',
                    }}
                />
                {profile?.gallery?.map((item: any, thumbIdx: number) => {
                    const isLast = thumbIdx === profile?.gallery.length - 1;
                    return (
                        <React.Fragment key={item?.url ?? thumbIdx}>
                            <FastImage
                                source={{ uri: item.url }}
                                resizeMode="cover"
                                style={{
                                    height: metrics.hp3,
                                    width: metrics.hp3,
                                    borderRadius: metrics.hp50,
                                    borderWidth: thumbIdx === (profile?.index ?? 0) ? metrics.hp0_1 : 0,
                                    borderColor: colors.white,
                                }}
                            />
                            {!isLast ? <AppText> </AppText> : null}
                        </React.Fragment>
                    );
                })}
            </View>

            <TouchableOpacityView
                onPressOut={(evt: any) => {
                    const deltaY = touchStartYRef.current - evt.nativeEvent.pageY;
                    if (deltaY > SWIPE_UP_THRESHOLD) {
                        didSwipeUpRef.current = true;
                        onOpenPreview(profile);
                        return;
                    }
                }}
            >
                <LinearGradient
                    start={{ x: 1, y: 1 }}
                    end={{ x: 1, y: 0 }}
                    colors={Platform.OS === "ios" ? ["#00000090", "#00000040", "#00000000"] : ["#000000", "#00000099", "#00000000"]}
                    style={{
                        height: metrics.hp20,
                        width: "100%",
                        position: "absolute",
                        bottom: 0,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {profile?.online ? (
                        <View style={styles.activeContainer}>
                            <View style={styles.activeBackground}>
                                <View style={styles.activeDot} />
                            </View>
                            <AppText type={TEN} color={WHITE} weight={INTER_SEMI_BOLD}>
                                {' '}Active
                            </AppText>
                        </View>
                    ) : null}

                    <View style={styles.nameRow}>
                        <AppText style={{ fontWeight: "700", fontSize: fontSize(28) }} color={WHITE} weight={INTER_BOLD}>
                            {profile?.firstName ?? 'Unknown'}, {profile?.age ?? '--'}
                        </AppText>
                        {profile?.faceVerified == true ? <FastImage source={blueTikeIcon} resizeMode="contain" style={styles.blueTickIcon} /> : <></>}
                    </View>

                    <View style={[styles.metaRow, { marginTop: metrics.hp0_5 }]}>
                        <FastImage source={locationCIon} style={styles.metaIcon} resizeMode="contain" />
                        <AppText type={THIRTEEN} color={WHITE} weight={INTER_BOLD}>
                            {'  '}
                            {profile?.distanceInKm ? `${profile.distanceInKm} Km away` : 'Nearby'}
                        </AppText>
                    </View>

                    {!!profile?.work ? (
                        <View style={[styles.metaRow, { marginTop: metrics.hp1 }]}>
                            <FastImage source={bussinessIcon} style={styles.metaIcon} resizeMode="contain" />
                            <AppText type={THIRTEEN} color={WHITE} weight={INTER_BOLD}>
                                {'  '}
                                {profile?.work}
                            </AppText>
                        </View>
                    ) : null}

                    <TouchableOpacityView
                        onPress={() => onOpenPreview(profile)}
                        style={styles.viewProfileBtn}
                        onPressIn={(evt: any) => {
                            touchStartYRef.current = evt.nativeEvent.pageY;
                        }}
                        onPressOut={(evt: any) => {
                            const deltaY = touchStartYRef.current - evt.nativeEvent.pageY;
                            if (deltaY > SWIPE_UP_THRESHOLD) {
                                didSwipeUpRef.current = true;
                                onOpenPreview(profile);
                                return;
                            }
                        }}
                    >
                        <SafeGifImage source={swipeUpIcon} resizeMode='contain' style={{ height: metrics.hp17, width: metrics.hp17, marginLeft: -metrics.hp0_5 }} />
                    </TouchableOpacityView>

                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "95%", position: "absolute", bottom: metrics.hp1 }}>
                        <TouchableOpacityView
                            onPress={onDislikePress}
                            style={{
                                height: metrics.hp7,
                                width: metrics.hp7,
                                borderRadius: metrics.hp50,
                                overflow: 'hidden',
                            }}
                        >
                            <BlurView
                                style={StyleSheet.absoluteFillObject}
                                blurType="light"
                                blurAmount={1}
                            />
                            <View
                                style={{
                                    ...StyleSheet.absoluteFillObject,
                                    borderWidth: 1,
                                    borderColor: 'rgba(255,255,255,0.25)',
                                }}
                            />
                            <View
                                style={{
                                    flex: 1,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <FastImage
                                    source={disLikeNewIcon}
                                    resizeMode="contain"
                                    style={{ height: metrics.hp3, width: metrics.hp3 }}
                                />
                            </View>
                        </TouchableOpacityView>

                        <TouchableOpacityView
                            onPress={onLikePress}
                            style={{
                                height: metrics.hp7,
                                width: metrics.hp7,
                                borderRadius: metrics.hp50,
                                overflow: 'hidden',
                            }}
                        >
                            <BlurView
                                style={StyleSheet.absoluteFillObject}
                                blurType="light"
                                blurAmount={1}
                            />
                            <View
                                style={{
                                    ...StyleSheet.absoluteFillObject,
                                    borderWidth: 1,
                                    borderColor: 'rgba(255,255,255,0.25)',
                                }}
                            />
                            <View
                                style={{
                                    flex: 1,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <FastImage
                                    source={likeNewICon}
                                    resizeMode="contain"
                                    style={{ height: metrics.hp3, width: metrics.hp3 }}
                                />
                            </View>
                        </TouchableOpacityView>
                    </View>
                </LinearGradient>
            </TouchableOpacityView>
        </Animated.View>
    );
});

const NewHomeScreen = () => {
    const dispatch = useDispatch();
    const listProfilesData = useSelector((state: any) => state.auth.listProfiles ?? []);
    const userData = useSelector((state: any) => state.auth.userData);
    const [boostModalVisible, setBoostModalVisible] = useState(false);
    const [isBoostActivating, setIsBoostActivating] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [matchVisible, setMatchVisible] = useState(false);
    const [matchData, setMatchData] = useState([]);
    const [showProfileCompletionReminder, setShowProfileCompletionReminder] = useState(false);
    const [faceVerificationPromptVisible, setFaceVerificationPromptVisible] = useState(false);
    const [locationPromptVisible, setLocationPromptVisible] = useState(false);
    const [isRequestingLocationPermission, setIsRequestingLocationPermission] = useState(false);
    const [hasLocationPermission, setHasLocationPermission] = useState(true);
    const [currentLocation, setCurrentLocation] = useState<{ lat: string; long: string }>({ lat: '', long: '' });
    const [remainingSwipes, setRemainingSwipes] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const activeIndex = useSharedValue(0);
    const isFocused = useIsFocused();
    const isDislikeFxRunningRef = useRef(false);
    const dislikeFxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isLikeFxRunningRef = useRef(false);
    const likeFxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isRequestingLocationPermissionRef = useRef(false);
    const hasAutoRequestedLocationOnFocusRef = useRef(false);
    const dislikeOverlayOpacity = useSharedValue(0);
    const dislikeIconScale = useSharedValue(0.7);
    const likeOverlayOpacity = useSharedValue(0);
    const likeIconScale = useSharedValue(0.7);
    const itemtwo = useMemo(() => ({ id: "2", icon: goldCard, title: "Gold" }), []);
    const locationPromptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        // Preload first profile's image in the background during the loading overlay to prevent loading flash.
        if (listProfilesData.length > 0) {
            const firstProfile = listProfilesData[0];
            if (firstProfile?.gallery && firstProfile.gallery[0]?.url) {
                FastImage.preload([{ uri: firstProfile.gallery[0].url, priority: FastImage.priority.high }]);
            }
        }

        const timer = setTimeout(() => {
            setIsInitialLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    const handleCloseFaceVerificationPrompt = useCallback(() => {
        setFaceVerificationPromptVisible(false);
    }, []);

    useEffect(() => {
        const swipes = Number(userData?.swipesRemaining ?? 0);
        setRemainingSwipes(Number.isFinite(swipes) ? swipes : 0);
    }, [userData?.swipesRemaining]);

    useEffect(() => {
        const maxIndex = Math.max(listProfilesData.length - 1, 0);
        if (currentIndex > maxIndex) {
            setCurrentIndex(maxIndex);
            activeIndex.value = maxIndex;
        }
    }, [activeIndex, currentIndex, listProfilesData.length]);

    // Background prefetching and queue buffering strategy refs
    const isPrefetchingRef = useRef(false);
    const noMoreProfilesRef = useRef(false);
    const prevLengthRef = useRef(0);
    const listProfilesLengthRef = useRef(listProfilesData.length);

    useEffect(() => {
        listProfilesLengthRef.current = listProfilesData.length;
    }, [listProfilesData.length]);

    const handleLastProfileSwiped = useCallback(() => {
        dispatch(setListProfiles([]));
        dispatch(listProfiles(true));
        dispatch(getProfile(true));
    }, [dispatch]);

    const handleNext = useCallback(
        (type: SwipeType) => {
            const current = listProfilesData[currentIndex];
            if (!current) return;
            const isLastProfile = currentIndex >= listProfilesData.length - 1;

            dispatch(
                swipeLikeDisLike({
                    swipedId: current._id,
                    type,
                })
            );

            const nextIndex = Math.min(currentIndex + 1, listProfilesData.length - 1);

            activeIndex.value = withTiming(nextIndex, { duration: TRANSITION_MS }, (finished) => {
                if (finished) {
                    runOnJS(setCurrentIndex)(nextIndex);
                    if (isLastProfile && (type === 'like' || type === 'dislike')) {
                        runOnJS(handleLastProfileSwiped)();
                    }
                }
            });
        },
        [activeIndex, currentIndex, dispatch, listProfilesData, handleLastProfileSwiped]
    );

    const handleLikeWithoutSlide = useCallback(() => {
        const current = listProfilesData[currentIndex];
        if (!current) return;
        const isLastProfile = currentIndex >= listProfilesData.length - 1;
        const unlimitedLikes = userData?.subscription?.perks?.unlimitedLikes === true;

        dispatch(
            swipeLikeDisLike({
                swipedId: current._id,
                type: 'like',
            })
        );
        if (!unlimitedLikes) {
            setRemainingSwipes((prev) => Math.max(prev - 1, 0));
        }

        const nextIndex = Math.min(currentIndex + 1, listProfilesData.length - 1);
        activeIndex.value = nextIndex;
        setCurrentIndex(nextIndex);

        if (isLastProfile) {
            handleLastProfileSwiped();
        }
    }, [activeIndex, currentIndex, dispatch, listProfilesData, userData?.subscription?.perks?.unlimitedLikes, handleLastProfileSwiped]);

    const handleTap = useCallback(
        (evt: GestureResponderEvent, profile: any) => {
            const totalImages = profile?.gallery?.length || 0;
            if (!evt?.nativeEvent?.locationX || totalImages === 0) return;
            const x = evt.nativeEvent.locationX;

            const updatedProfiles = listProfilesData.map((p: any) => {
                if (p._id !== profile._id) return p;

                let newIndex = p.index || 0;
                if (x > CARD_WIDTH / 2) {
                    newIndex = newIndex < totalImages - 1 ? newIndex + 1 : newIndex;
                } else {
                    newIndex = newIndex > 0 ? newIndex - 1 : newIndex;
                }

                if (newIndex !== p.index && p.gallery && p.gallery[newIndex]?.url) {
                    const targetImageUrl = p.gallery[newIndex].url;
                    const preloadList: any[] = [{ uri: targetImageUrl, priority: FastImage.priority.high }];

                    if (newIndex > 0 && p.gallery[newIndex - 1]?.url) {
                        preloadList.push({ uri: p.gallery[newIndex - 1].url, priority: FastImage.priority.normal });
                    }
                    if (newIndex < totalImages - 1 && p.gallery[newIndex + 1]?.url) {
                        preloadList.push({ uri: p.gallery[newIndex + 1].url, priority: FastImage.priority.normal });
                    }
                    FastImage.preload(preloadList);
                }

                return { ...p, index: newIndex };
            });

            dispatch(setListProfiles(updatedProfiles));
        },
        [dispatch, listProfilesData]
    );

    // Consolidated single batch image preloading effect
    useEffect(() => {
        if (!listProfilesData?.length) return;

        const activeProfiles = [
            listProfilesData[currentIndex],
            currentIndex < listProfilesData.length - 1 ? listProfilesData[currentIndex + 1] : null,
        ].filter(Boolean);

        const urlsToPreload: string[] = [];

        activeProfiles.forEach((profile: any, index: number) => {
            if (!profile?.gallery?.length) return;
            const currentIdx = profile.index || 0;
            const gallery = profile.gallery;

            if (index === 0) {
                const urls = [
                    gallery[currentIdx]?.url,
                    currentIdx > 0 ? gallery[currentIdx - 1]?.url : null,
                    currentIdx < gallery.length - 1 ? gallery[currentIdx + 1]?.url : null,
                ].filter(Boolean) as string[];
                urlsToPreload.push(...urls);
            } else {
                if (gallery[currentIdx]?.url) {
                    urlsToPreload.push(gallery[currentIdx].url);
                }
            }
        });

        const uniqueUrls = Array.from(new Set(urlsToPreload)).filter(Boolean) as string[];
        if (uniqueUrls.length > 0) {
            const preloadSources = uniqueUrls.map(url => ({
                uri: url,
                priority: FastImage.priority.normal,
            }));
            FastImage.preload(preloadSources);
        }
    }, [listProfilesData, currentIndex]);

    // Background prefetching buffer checking effect
    useEffect(() => {
        const currentLength = listProfilesData.length;
        const remaining = currentLength - currentIndex;

        if (currentLength !== prevLengthRef.current) {
            if (isPrefetchingRef.current && currentLength === prevLengthRef.current) {
                noMoreProfilesRef.current = true;
            }
            isPrefetchingRef.current = false;
            prevLengthRef.current = currentLength;
        }

        if (remaining > 0 && remaining <= 3 && !isPrefetchingRef.current && !noMoreProfilesRef.current) {
            isPrefetchingRef.current = true;
            dispatch(listProfiles(true, undefined, undefined, true));
        }
    }, [listProfilesData.length, currentIndex, dispatch]);

    useEffect(() => {
        if (currentIndex === 0) {
            noMoreProfilesRef.current = false;
            isPrefetchingRef.current = false;
        }
    }, [currentIndex]);

    const socketUrl = useMemo(() => {
        const currentUserId = userData?._id;
        if (!currentUserId) return null;
        const { config } = require('../../config/config');
        const lat = hasLocationPermission ? currentLocation.lat : '';
        const long = hasLocationPermission ? currentLocation.long : '';
        // Backend asked for latitude/longitude. Send empty when permission missing.
        return `${config.BASE_URL}?userId=${encodeURIComponent(String(currentUserId))}&lat=${encodeURIComponent(
            String(lat ?? '')
        )}&long=${encodeURIComponent(String(long ?? ''))}`;
    }, [currentLocation.lat, currentLocation.long, hasLocationPermission, userData?._id]);

    const socket = useMemo(() => {
        if (!socketUrl) return null;
        return createSocket(socketUrl);
    }, [socketUrl]);

    useEffect(() => {
        if (!socket) return;
        const handleNewMatch = (response: any) => {
            if (!response) return;
            setMatchVisible(true);
            setMatchData(response?.matchData ?? []);
        };
        const handleConnect = () => {
            console.log('✅ Socket connected:', socket.id);
        };
        socket.on('connect', handleConnect);
        socket.on('newMatch', handleNewMatch);

        return () => {
            socket.off?.('connect', handleConnect);
            socket.off?.('newMatch', handleNewMatch);
            socket.disconnect?.();
        };
    }, [socket]);

    useEffect(() => {
        if (!userData?.faceVerified) return;
        if (!isFocused) return;
        if (hasShownProfileCompletionReminderThisSession) return;

        const timer = setTimeout(() => {
            if (!isFocused) return;
            if (hasShownProfileCompletionReminderThisSession) return;

            const completion = Math.trunc(userData?.profileCompletion ?? 0);
            if (completion <= 70) {
                hasShownProfileCompletionReminderThisSession = true;
                setShowProfileCompletionReminder(true);
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [isFocused, userData?.profileCompletion]);

    useEffect(() => {
        if (!isFocused) return;
        if (hasShownFaceVerificationPromptThisSession) return;

        const timer = setTimeout(() => {
            if (!isFocused) return;
            if (hasShownFaceVerificationPromptThisSession) return;

            const isFaceVerified = userData?.faceVerified === true;
            console.log(userData?.faceVerified, "userData?.faceVerified");

            if (!isFaceVerified) {
                hasShownFaceVerificationPromptThisSession = true;
                setFaceVerificationPromptVisible(Platform.OS === "ios" ? true : false);
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [isFocused, userData?.faceVerified]);

    const hasProfiles = listProfilesData.length > 0;
    const BOOST_DURATION_MS = 30 * 60 * 1000;
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

    const dislikeOverlayStyle = useAnimatedStyle(() => ({
        opacity: dislikeOverlayOpacity.value,
    }));

    const dislikeIconAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: dislikeIconScale.value }],
    }));

    const likeOverlayStyle = useAnimatedStyle(() => ({
        opacity: likeOverlayOpacity.value,
    }));

    const likeIconAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: likeIconScale.value }],
    }));

    const runDislikeAnimation = useCallback(() => {
        if (isDislikeFxRunningRef.current) return;
        isDislikeFxRunningRef.current = true;
        dislikeOverlayOpacity.value = 0;
        dislikeIconScale.value = 0.7;

        dislikeOverlayOpacity.value = withTiming(1, { duration: 70 });
        dislikeIconScale.value = withSequence(
            withTiming(1.28, { duration: 120 }),
            withTiming(0.9, { duration: 90 }),
            withTiming(1, { duration: 70 })
        );

        if (dislikeFxTimerRef.current) {
            clearTimeout(dislikeFxTimerRef.current);
        }
        dislikeFxTimerRef.current = setTimeout(() => {
            handleNext('dislike');
            dislikeOverlayOpacity.value = withTiming(0, { duration: 90 });
            isDislikeFxRunningRef.current = false;
            dislikeFxTimerRef.current = null;
        }, 240);
    }, [dislikeIconScale, dislikeOverlayOpacity, handleNext]);

    const runLikeAnimation = useCallback(() => {
        const unlimitedLikes = userData?.subscription?.perks?.unlimitedLikes;
        if (unlimitedLikes !== true) {
            if (remainingSwipes <= 0) {
                NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN, { comming: itemtwo });
                return;
            }
        }
        if (isLikeFxRunningRef.current) return;
        isLikeFxRunningRef.current = true;
        likeOverlayOpacity.value = 0;
        likeIconScale.value = 0.7;

        likeOverlayOpacity.value = withTiming(1, { duration: 70 });
        likeIconScale.value = withSequence(
            withTiming(1.28, { duration: 120 }),
            withTiming(0.9, { duration: 90 }),
            withTiming(1, { duration: 70 })
        );

        if (likeFxTimerRef.current) {
            clearTimeout(likeFxTimerRef.current);
        }
        likeFxTimerRef.current = setTimeout(() => {
            handleLikeWithoutSlide();
            likeOverlayOpacity.value = withTiming(0, { duration: 90 });
            isLikeFxRunningRef.current = false;
            likeFxTimerRef.current = null;
        }, 240);
    }, [handleLikeWithoutSlide, itemtwo, likeIconScale, likeOverlayOpacity, remainingSwipes, userData?.subscription?.perks?.unlimitedLikes]);

    useEffect(() => {
        return () => {
            if (dislikeFxTimerRef.current) {
                clearTimeout(dislikeFxTimerRef.current);
            }
            if (likeFxTimerRef.current) {
                clearTimeout(likeFxTimerRef.current);
            }
        };
    }, [likeFxTimerRef]);

    // PreviewDetails triggers actions using these "swipe" setter props.
    // Since NewHomeScreen moves via button presses, proxy those setters to handleNext().
    const setSwipeRightProxy = useCallback(
        (val: boolean) => {
            if (!val) return;
            setModalVisible(false);
            runLikeAnimation();
        },
        [runLikeAnimation]
    );

    const setSwipeLeftProxy = useCallback(
        (val: boolean) => {
            if (!val) return;
            setModalVisible(false);
            runDislikeAnimation();
        },
        [runDislikeAnimation]
    );

    const setSwipeUpProxy = useCallback(
        (val: boolean) => {
            if (!val) return;
            setModalVisible(false);
            handleNext('superLike');
        },
        [handleNext]
    );

    const setSuperLikeVisibleProxy = useCallback(
        (val: boolean) => {
            if (!val) return;
            setModalVisible(false);
            handleNext('superLike');
        },
        [handleNext]
    );

    const canSuperLike = useCallback(() => {
        const remaining = Number(userData?.superLikesRemaining ?? 0);
        return Number.isFinite(remaining) && remaining > 0;
    }, [userData?.superLikesRemaining]);

    const getLocationPermissionType = useCallback(() => {
        if (Platform.OS === "ios") return PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
        return PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION;
    }, []);

    const isLocationPermissionGranted = useCallback(async () => {
        try {
            const status = await check(getLocationPermissionType());
            return status === RESULTS.GRANTED;
        } catch (error) {
            console.warn("Location permission check failed:", error);
            return false;
        }
    }, [getLocationPermissionType]);

    const fetchCurrentLocationForSocket = useCallback(() => {
        Geolocation.getCurrentPosition(
            (position) => {
                const lat = String(position?.coords?.latitude ?? '');
                const long = String(position?.coords?.longitude ?? '');
                setCurrentLocation({ lat, long });
            },
            (error) => {
                console.warn("Location fetch failed:", error);
                setCurrentLocation({ lat: '', long: '' });
            },
            {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 10000,
                forceRequestLocation: true,
            }
        );
    }, []);

    const refreshLocationPermission = useCallback(async () => {
        let granted = await isLocationPermissionGranted();
        
        if (!granted) {
            const status = await check(getLocationPermissionType());
            if (status === RESULTS.DENIED) {
                if (!isRequestingLocationPermissionRef.current) {
                    isRequestingLocationPermissionRef.current = true;
                    setIsRequestingLocationPermission(true);
                    try {
                        const reqStatus = await request(getLocationPermissionType());
                        granted = (reqStatus === RESULTS.GRANTED);
                    } catch (error) {
                        console.warn("Location permission request failed:", error);
                    } finally {
                        isRequestingLocationPermissionRef.current = false;
                        setIsRequestingLocationPermission(false);
                    }
                }
            }
        }

        setHasLocationPermission(granted);
        if (granted) {
            fetchCurrentLocationForSocket();
            // Avoid reloading the feed on resume/app-active if profiles are already loaded.
            if (listProfilesLengthRef.current === 0) {
                dispatch(listProfiles(true));
                dispatch(getProfile(true));
            } else {
                dispatch(getProfile(true));
            }
        } else {
            setCurrentLocation({ lat: '', long: '' });
        }
    }, [dispatch, fetchCurrentLocationForSocket, isLocationPermissionGranted, getLocationPermissionType]);

    useEffect(() => {
        if (!isFocused) return;
        hasAutoRequestedLocationOnFocusRef.current = false;
        let mounted = true;

        const syncLocationPermission = async () => {
            const granted = await isLocationPermissionGranted();
            if (!mounted) return;
            setHasLocationPermission(granted);
            if (granted) {
                // Avoid resetting and reloading the feed on focus if profiles are already loaded.
                if (listProfilesLengthRef.current === 0) {
                    dispatch(listProfiles(true));
                    dispatch(getProfile(true));
                } else {
                    fetchCurrentLocationForSocket();
                    dispatch(getProfile(true));
                }
                hasAutoRequestedLocationOnFocusRef.current = true;
                return;
            }

            // iOS "Allow Once" expires on next app open; re-trigger native prompt automatically.
            if (
                Platform.OS === "ios" &&
                !hasAutoRequestedLocationOnFocusRef.current &&
                !isRequestingLocationPermissionRef.current
            ) {
                hasAutoRequestedLocationOnFocusRef.current = true;
                isRequestingLocationPermissionRef.current = true;
                setIsRequestingLocationPermission(true);
                try {
                    const status = await request(getLocationPermissionType());
                    if (!mounted) return;

                    if (status === RESULTS.GRANTED) {
                        setHasLocationPermission(true);
                        fetchCurrentLocationForSocket();
                        dispatch(listProfiles(true));
                        dispatch(getProfile(true));
                    } else {
                        setHasLocationPermission(false);
                        setCurrentLocation({ lat: '', long: '' });
                    }
                } catch (error) {
                    console.warn("Location permission request failed:", error);
                } finally {
                    isRequestingLocationPermissionRef.current = false;
                    setIsRequestingLocationPermission(false);
                }
            }
        };

        syncLocationPermission();
        return () => {
            mounted = false;
        };
    }, [dispatch, fetchCurrentLocationForSocket, getLocationPermissionType, isFocused, isLocationPermissionGranted]);

    useEffect(() => {
        // When user goes to Settings and returns, re-check permission.
        // `isFocused` may remain true, so AppState is the reliable trigger.
        if (!isFocused) return;

        const onChange = (nextState: AppStateStatus) => {
            if (nextState === "active") {
                refreshLocationPermission();
            }
        };

        const sub = AppState.addEventListener("change", onChange);
        return () => sub.remove();
    }, [isFocused, refreshLocationPermission]);

    const requestLocationPermissionAgain = useCallback(async () => {
        if (isRequestingLocationPermissionRef.current) return;
        isRequestingLocationPermissionRef.current = true;
        setIsRequestingLocationPermission(true);
        try {
            const status = await request(getLocationPermissionType());
            if (status === RESULTS.GRANTED) {
                setLocationPromptVisible(false);
                setHasLocationPermission(true);
                fetchCurrentLocationForSocket();
                dispatch(listProfiles(true));
                dispatch(getProfile(true));
                return;
            }

            setHasLocationPermission(false);
            setCurrentLocation({ lat: '', long: '' });
            if (status === RESULTS.BLOCKED) {
                Alert.alert(
                    "Location permission is disabled",
                    "Location permission is disabled. You can enable it from Settings.",
                    [
                        { text: "Open Settings", onPress: () => openSettings().catch(() => null) },
                        { text: "Cancel", style: "cancel" },
                    ]
                );
            }
        } catch (error) {
            console.warn("Location permission request failed:", error);
        } finally {
            isRequestingLocationPermissionRef.current = false;
            setIsRequestingLocationPermission(false);
        }
    }, [dispatch, fetchCurrentLocationForSocket, getLocationPermissionType]);

    useEffect(() => {
        if (!isFocused) return;
        if (hasShownLocationPermissionPromptThisSession) return;

        let isMounted = true;

        const scheduleLocationPromptIfNeeded = async () => {
            const granted = await isLocationPermissionGranted();
            if (!isMounted || granted) return;

            if (locationPromptTimerRef.current) {
                clearTimeout(locationPromptTimerRef.current);
            }

            locationPromptTimerRef.current = setTimeout(() => {
                if (!isMounted) return;
                if (hasShownLocationPermissionPromptThisSession) return;
                hasShownLocationPermissionPromptThisSession = true;
                setLocationPromptVisible(true);
            }, 10000);
        };

        scheduleLocationPromptIfNeeded();

        return () => {
            isMounted = false;
            if (locationPromptTimerRef.current) {
                clearTimeout(locationPromptTimerRef.current);
                locationPromptTimerRef.current = null;
            }
        };
    }, [isFocused, isLocationPermissionGranted]);


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





    // ProfileCard is now extracted outside NewHomeScreen for optimal rendering and layout performance.

    const FaceLiveness = (NativeModules as any)?.FaceLiveness as
        | { startLiveness?: (sessionId: string) => Promise<FaceLivenessResult> }
        | undefined;

    const moduleAvailable = useMemo(() => {
        return Boolean(FaceLiveness && typeof FaceLiveness.startLiveness === 'function');
    }, [FaceLiveness]);

    const [loading, setLoading] = useState(false);
    const [resultText, setResultText] = useState<string>('');
    const [faceVerificationPromptFailedVisible, setFaceVerificationPromptFailedVisible] = useState(false);
    const [faceVerificationPromptSuccessVisible, setFaceVerificationPromptSuccessVisible] = useState(false);
    const handleCloseFaceVerificationSuccessPrompt = useCallback(() => {
        setFaceVerificationPromptSuccessVisible(false);
    }, []);
    const handleCloseFaceVerificationFailedPrompt = useCallback(() => {
        setFaceVerificationPromptFailedVisible(false);
    }, []);

    const ensureCameraPermission = useCallback(async (): Promise<boolean> => {
        try {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: 'Camera Permission Required',
                        message: 'Face verification requires camera access.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );

                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    return true;
                } else {
                    Alert.alert(
                        "Camera permission denied",
                        "Face verification requires camera access. You can enable it from Settings.",
                        [
                            { text: "Open Settings", onPress: () => openSettings().catch(() => null) },
                            { text: "Cancel", style: "cancel" },
                        ]
                    );
                    return false;
                }
            } else {
                const permissionType = PERMISSIONS.IOS.CAMERA;
                const currentStatus = await check(permissionType);

                if (currentStatus === RESULTS.GRANTED) return true;

                if (currentStatus === RESULTS.BLOCKED) {
                    Alert.alert(
                        "Camera permission required",
                        "Camera permission is disabled. Please enable it from Settings to continue face verification.",
                        [
                            { text: "Open Settings", onPress: () => openSettings().catch(() => null) },
                            { text: "Cancel", style: "cancel" },
                        ]
                    );
                    return false;
                }

                const requestedStatus = await request(permissionType);
                if (requestedStatus === RESULTS.GRANTED) return true;

                Alert.alert(
                    "Camera permission denied",
                    "Face verification requires camera access. You can enable it from Settings.",
                    [
                        { text: "Open Settings", onPress: () => openSettings().catch(() => null) },
                        { text: "Cancel", style: "cancel" },
                    ]
                );
                return false;
            }
        } catch (error) {
            console.warn("Camera permission check failed:", error);
            Alert.alert("Permission error", "Unable to check camera permission. Please try again.");
            return false;
        }
    }, []);
    const [faceMessage, setFaneMessage] = useState("")
    const start = async () => {
        if (!moduleAvailable) {
            const msg =
                'FaceLiveness native module not found. Make sure you rebuilt the app (not just Metro reload).';
            console.warn('[FaceLivenessTest] ' + msg);
            setResultText(msg);
            return;
        }

        setLoading(true);
        setResultText('');

        try {
            const isCameraAllowed = await ensureCameraPermission();
            console.log(isCameraAllowed, "isCameraAllowed");

            if (!isCameraAllowed) {
                return;
            }

            console.log('[FaceLivenessTest] Requesting session from /faceId/liveliness');
            const sessionResp = await (appOperation.customer as any).createFaceLivenessSessionAPI();
            const sessionId = sessionResp?.data
            console.log(sessionResp, "sessionResp");

            if (!sessionId) {
                throw new Error('Session API did not return a valid sessionId');
            }

            console.log('[FaceLivenessTest] Starting native liveness with sessionId:', sessionId);
            if (!FaceLiveness || typeof FaceLiveness.startLiveness !== 'function') {
                throw new Error('FaceLiveness native module is not available on this device.');
            }
            const res = await FaceLiveness.startLiveness(sessionId);
            console.log('[FaceLivenessTest] Native result:', res);

            // Normalize a few common shapes.
            if (res && typeof res === 'object') {
                const status = (res as any).status;
                if (status === 'success') {
                    setFaceVerificationPromptVisible(false);
                    console.log('[FaceLivenessTest] Verifying session via faceId/verifySessionResult');
                    const verifyResp = await (appOperation.customer as any).verifyFaceLivenessSessionAPI({
                        sessionId,
                    });

                    if (verifyResp?.data?.success) {
                        dispatch(getProfile(true))
                        setFaceVerificationPromptSuccessVisible(true)
                        setFaceVerificationPromptFailedVisible(false);
                    } else if (!verifyResp?.data?.success) {
                        setFaneMessage(verifyResp?.data?.message)
                        setFaceVerificationPromptVisible(false);
                        setFaceVerificationPromptFailedVisible(true);
                    }
                } else if (status === 'cancelled') {
                    Alert.alert((res as any).message ? `Cancelled: ${(res as any).message}` : 'Cancelled')
                } else {
                    Alert.alert(`Result: ${JSON.stringify(res)}`)
                }
            } else {
                Alert.alert(res ? `Result: ${String(res)}` : 'Liveness Success')
            }
        } catch (e: any) {
            const msg = e?.message ?? String(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppSafeAreaView>
            <View style={styles.screen}>
                <View style={{ zIndex: 2, backgroundColor: colors.white }}>
                    <PeopleHeader
                        profile={false}
                        useName={true}
                        showBooster={true}
                        boostIcon={(boostRemaining > 0 || boostTimer.isRunning) ? flashIcon : null}
                        boostTimerText={boostTimer.isRunning ? boostTimer.remainingLabel : null}
                        onBoostPress={handleBoostPress}
                        setModalVisible={setModalVisible}
                    />
                </View>

                <View style={styles.carouselViewport}>
                    {!hasLocationPermission ? (
                        <View style={styles.locationGateContainer}>
                            <FastImage source={mapIcon} resizeMode="contain" style={styles.locationGateIcon} />
                            <AppText type={TWENTY_TWO} weight={SCHEHERAZADE_BOLD} color={LIGHT_BLACK} style={{ textAlign: "center", marginTop: metrics.hp0 }}>
                                Unable to connect
                            </AppText>
                            <AppText type={TWELVE} weight={INTER_SEMI_BOLD} color={OPECITY_DARK} style={{ textAlign: "center", marginTop: metrics.hp0 }}>
                                To use Purpple, you need to enable you location sharing so we can show you who's around
                            </AppText>
                            <AppText type={TWELVE} weight={INTER_SEMI_BOLD} color={OPECITY_DARK} style={{ textAlign: "center", marginTop: metrics.hp2 }}>
                                {`Go to Settings > Purpple > Location > Enable Location \n While Using the App`}
                            </AppText>
                            <TouchableOpacityView
                                onPress={() => openSettings().catch(() => null)}
                                style={[styles.locationPromptButton, { backgroundColor: colors.purple, borderColor: colors.purple, marginTop: metrics.hp2, width: metrics.hp15 }]}
                            >
                                <AppText color={WHITE} weight={INTER_BOLD} type={TWELVE}>
                                    Open Settings
                                </AppText>
                            </TouchableOpacityView>
                        </View>
                    ) : hasProfiles && !isInitialLoading ? (
                        <View style={styles.carouselLayer}>
                            {listProfilesData
                                .map((profile: any, idx: number) => ({ profile, idx }))
                                .slice(currentIndex, currentIndex + 3)
                                .map(({ profile, idx }: any) => (
                                    <ProfileCard
                                        key={profile?._id ?? `profile-${idx}`}
                                        profile={profile}
                                        index={idx}
                                        activeIndex={activeIndex}
                                        onImageTap={handleTap}
                                        onOpenPreview={(p) => {
                                            setModalVisible(true);
                                        }}
                                        onLikePress={runLikeAnimation}
                                        onDislikePress={runDislikeAnimation}
                                    />
                                ))}
                        </View>
                    ) : (
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
                            {/* {userData?.globalSearch === false &&
                                <LinearGradient colors={["#6F13F200", "#6F13F220", "#6F13F200", "#6F13F200"]} style={{ alignItems: "center", justifyContent: "center", width: "100%", position: "absolute", height: metrics.hp25, bottom: -metrics.hp5 }}>
                                    <AppText type={FORTEEN} weight={INTER_BOLD}>
                                        Your Story Isn’t Over Yet
                                    </AppText>
                                    <AppText style={{ textAlign: "center", marginHorizontal: metrics.hp2 }}>
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
                                    }} style={{ height: metrics.hp5, borderRadius: metrics.hp50, borderWidth: metrics.hp0_1, borderColor: colors.black, alignItems: "center", justifyContent: "center", width: "90%", marginTop: metrics.hp2, marginHorizontal: metrics.hp2 }}>
                                        <AppText type={FORTEEN} weight={INTER_BOLD}>
                                            Global Search
                                        </AppText>
                                    </TouchableOpacityView>
                                </LinearGradient>
                            } */}
                        </>
                    )}
                </View>
            </View>

            <Modal
                animationType="slide"
                visible={modalVisible}
                statusBarTranslucent
                onRequestClose={() => setModalVisible(false)}
            >
                <PreviewDetails
                    data={listProfilesData[currentIndex] || {}}
                    setModalVisible={setModalVisible}
                    setSwipeRight={setSwipeRightProxy}
                    setSwipeLeft={setSwipeLeftProxy}
                    setSwipeUp={setSwipeUpProxy}
                    modalVisible={modalVisible}
                    setProfileData={() => { }}
                    setSuperLikeVisible={setSuperLikeVisibleProxy}
                    canSuperLike={canSuperLike}
                />
            </Modal>

            <Animated.View pointerEvents="none" style={[styles.dislikeFxOverlay, dislikeOverlayStyle]}>
                <Animated.View style={dislikeIconAnimatedStyle}>
                    <FastImage source={disLikeNewIcon} tintColor={colors.black} resizeMode="contain" style={styles.dislikeFxIcon} />
                </Animated.View>
            </Animated.View>

            <Animated.View pointerEvents="none" style={[styles.likeFxOverlay, likeOverlayStyle]}>
                <Animated.View style={likeIconAnimatedStyle}>
                    <FastImage source={likeNewICon} tintColor={colors.black} resizeMode="contain" style={styles.likeFxIcon} />
                </Animated.View>
            </Animated.View>

            <Modal
                animationType="fade"
                transparent={true}
                statusBarTranslucent
                visible={matchVisible}
                onRequestClose={() => setMatchVisible(false)}>
                <MatchScreen setMatchVisible={setMatchVisible} matchData={matchData} />
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

            {/* <Modal
                animationType="fade"
                transparent
                visible={locationPromptVisible}
                onRequestClose={() => setLocationPromptVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.locationPromptContainer}>
                        <FastImage source={mapIcon} resizeMode='contain' style={{ height: metrics.hp8, width: metrics.hp8, alignSelf: "center" }} />
                        <AppText type={TWENTY_TWO} weight={SCHEHERAZADE_BOLD} color={LIGHT_BLACK} style={{ textAlign: "center" }}>
                            Enable location
                        </AppText>
                        <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK} style={{ textAlign: "center", marginTop: -metrics.hp0_5 }}>
                            Set your location so that other people around You
                            could match with your profile.
                        </AppText>
                        <TouchableOpacityView
                            onPress={requestLocationPermissionAgain}
                            style={[styles.locationPromptButton, { backgroundColor: colors.purple, borderColor: colors.purple, marginTop: metrics.hp3 }]}
                        >
                            <AppText color={WHITE} weight={INTER_SEMI_BOLD} type={TWELVE}>
                                {isRequestingLocationPermission ? "Please wait..." : "Allow Location"}
                            </AppText>
                        </TouchableOpacityView>

                    </View>
                    <TouchableOpacityView
                        onPress={() => setLocationPromptVisible(false)}
                        style={[styles.locationPromptButton, { backgroundColor: colors.transparent, borderColor: colors.transparent }]}
                    >
                        <AppText color={WHITE} weight={INTER_BOLD} type={FORTEEN}>
                            No, skip now
                        </AppText>
                    </TouchableOpacityView>
                </View>
            </Modal> */}

            <Modal
                animationType="fade"
                transparent
                visible={faceVerificationPromptVisible}
                onRequestClose={handleCloseFaceVerificationPrompt}
            >
                <View style={styles.centeredView}>
                    <View style={styles.locationPromptContainer}>
                        <AppText type={TWENTY_TWO} weight={SCHEHERAZADE_BOLD} color={LIGHT_BLACK} style={{ textAlign: "center" }}>
                            Verify Your Identity
                        </AppText>
                        <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK} style={{ textAlign: "center", marginTop: metrics.hp0 }}>
                            Complete a quick face verification to secure your account. This process takes only a few seconds.
                        </AppText>
                        <TouchableOpacityView
                            onPress={start}
                            style={[styles.locationPromptButton, { backgroundColor: colors.purple, borderColor: colors.purple, marginTop: metrics.hp3 }]}
                        >
                            <AppText color={WHITE} weight={INTER_SEMI_BOLD} type={TWELVE}>
                                Start Verification
                            </AppText>
                        </TouchableOpacityView>
                        <TouchableOpacityView
                            onPress={handleCloseFaceVerificationPrompt}
                            style={[styles.locationPromptButton, { backgroundColor: colors.transparent, borderColor: colors.transparent, marginTop: metrics.hp1 }]}
                        >
                            <AppText color={LIGHT_BLACK} weight={INTER_BOLD} type={FORTEEN}>
                                Skip for Now
                            </AppText>
                        </TouchableOpacityView>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="fade"
                transparent
                visible={faceVerificationPromptSuccessVisible}
                onRequestClose={handleCloseFaceVerificationSuccessPrompt}
            >
                <View style={styles.centeredView}>
                    <View style={styles.locationPromptContainer}>
                        <AppText type={TWENTY_TWO} weight={SCHEHERAZADE_BOLD} color={LIGHT_BLACK} style={{ textAlign: "center" }}>
                            Verification Successful
                        </AppText>
                        <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK} style={{ textAlign: "center", marginTop: metrics.hp0_5 }}>
                            Your face verification has been completed successfully. Your account is now fully verified.
                        </AppText>
                        <TouchableOpacityView
                            onPress={handleCloseFaceVerificationSuccessPrompt}
                            style={[styles.locationPromptButton, { backgroundColor: colors.purple, borderColor: colors.purple, marginTop: metrics.hp3 }]}
                        >
                            <AppText color={WHITE} weight={INTER_SEMI_BOLD} type={TWELVE}>
                                Continue
                            </AppText>
                        </TouchableOpacityView>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="fade"
                transparent
                visible={faceVerificationPromptFailedVisible}
                onRequestClose={handleCloseFaceVerificationFailedPrompt}
            >
                <View style={styles.centeredView}>
                    <View style={styles.locationPromptContainer}>
                        <AppText type={TWENTY_TWO} weight={SCHEHERAZADE_BOLD} color={LIGHT_BLACK} style={{ textAlign: "center" }}>
                            Verification Failed
                        </AppText>
                        <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK} style={{ textAlign: "center", marginTop: metrics.hp0_5 }}>
                            We were unable to verify your identity. {faceMessage ? faceMessage : `Please try again in a well-lit environment and ensure your face is clearly visible.`}
                        </AppText>
                        <TouchableOpacityView
                            onPress={start}
                            style={[styles.locationPromptButton, { backgroundColor: colors.purple, borderColor: colors.purple, marginTop: metrics.hp3 }]}
                        >
                            <AppText color={WHITE} weight={INTER_SEMI_BOLD} type={TWELVE}>
                                Try Again
                            </AppText>
                        </TouchableOpacityView>
                        <TouchableOpacityView
                            onPress={handleCloseFaceVerificationFailedPrompt}
                            style={[styles.locationPromptButton, { backgroundColor: colors.transparent, borderColor: colors.transparent, marginTop: metrics.hp1_5 }]}
                        >
                            <AppText color={LIGHT_BLACK} weight={INTER_BOLD} type={FORTEEN}>
                                Cancel
                            </AppText>
                        </TouchableOpacityView>
                    </View>
                </View>
            </Modal>

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


        </AppSafeAreaView>
    );
};

export default NewHomeScreen;

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.white,
    },
    header: {
        paddingHorizontal: metrics.hp2,
        paddingTop: metrics.hp1,
    },
    carouselViewport: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    carouselLayer: {
        width,
        height: CARD_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        position: 'absolute',
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: metrics.hp2,
        overflow: 'hidden',
        backgroundColor: '#151519',
        shadowColor: '#000',
        shadowOpacity: Platform.OS === 'ios' ? 0.22 : 0.28,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 12,
        elevation: 8,
    },
    imageTapArea: {
        flex: 1,
        width: '100%',
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        flex: 1,
        minHeight: CARD_HEIGHT * 0.5,
        backgroundColor: '#000',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    hiddenImage: {
        position: 'absolute',
        width: 1,
        height: 1,
        opacity: 0,
        zIndex: -1,
    },
    imageFallback: {
        backgroundColor: '#2B2B31',
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
        borderRadius: metrics.hp10,
    },
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: metrics.hp1_5,
        paddingBottom: metrics.hp2,
        paddingTop: metrics.hp8,
        backgroundColor: '#00000066',
    },
    activeContainer: {
        height: metrics.hp2,
        paddingHorizontal: metrics.hp1,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: metrics.hp5,
        backgroundColor: '#FFFFFF33',
        width: metrics.hp8,
        marginTop:-metrics.hp2
    },
    activeBackground: {
        height: metrics.hp1_2,
        width: metrics.hp1_2,
        borderWidth: metrics.hp0_1,
        borderColor: '#28EC594D',
        backgroundColor: '#28EC591A',
        borderRadius: metrics.hp20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: metrics.hp0_3,
    },
    activeDot: {
        height: metrics.hp0_8,
        width: metrics.hp0_8,
        backgroundColor: '#28EC59',
        borderRadius: metrics.hp50,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: -metrics.hp12,
    },
    blueTickIcon: {
        height: metrics.hp3,
        width: metrics.hp3,
        marginLeft: metrics.hp0_4,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: metrics.hp0_2,
    },
    metaIcon: {
        height: metrics.hp2,
        width: metrics.hp2,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: metrics.hp1,
        paddingHorizontal: metrics.hp2,
        paddingBottom: metrics.hp2,
    },
    actionButton: {
        flex: 1,
        height: metrics.hp5_6,
        borderRadius: metrics.hp10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    skipButton: {
        backgroundColor: '#2D6CDF',
    },
    likeButton: {
        backgroundColor: '#17B26A',
    },
    superLikeButton: {
        backgroundColor: '#D92D6E',
    },
    viewProfileBtn: {
        // alignSelf: 'center',
        // flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: metrics.hp12,
        height: metrics.hp12,
        // borderRadius: metrics.hp50,
        // borderWidth: metrics.hp0_1,
        // borderColor: '#FFFFFF4D',
        // backgroundColor: '#00000033',
        // marginTop: metrics.hp1,
        paddingHorizontal: metrics.hp1,
        position: "absolute",
        bottom: -metrics.hp2_3
    },
    viewProfileIcon: {
        height: metrics.hp2_5,
        width: metrics.hp2_3,
        marginLeft: metrics.hp0_5,
    },
    emptyCard: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: metrics.hp2,
        backgroundColor: '#1F1F24',
        alignItems: 'center',
        justifyContent: 'center',

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
        width: width / 1.20,
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
    dislikeFxOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.white,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
    },
    dislikeFxIcon: {
        height: metrics.hp11,
        width: metrics.hp11,
    },
    likeFxOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.white,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
    },
    likeFxIcon: {
        height: metrics.hp11,
        width: metrics.hp11,
    },
    locationPromptContainer: {
        backgroundColor: colors.white,
        width: width / 1.15,
        borderRadius: metrics.hp2,
        paddingHorizontal: metrics.hp2,
        paddingVertical: metrics.hp3,
    },
    locationPromptButton: {
        height: metrics.hp5,
        borderWidth: 1,
        borderColor: colors.darkBorder,
        borderRadius: metrics.hp4,
        alignItems: "center",
        justifyContent: "center",
        marginTop: metrics.hp1_5,
    },
    locationGateContainer: {
        flex: 1,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: metrics.hp3,
    },
    locationGateIcon: {
        height: metrics.hp15,
        width: metrics.hp15,
    },
});


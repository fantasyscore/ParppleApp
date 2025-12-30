import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    GestureResponderEvent,
    LayoutChangeEvent,
    Modal,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { AppText, ELEVEN, INTER_BOLD, INTER_MEDIUM, TWENTY_TWO, WHITE } from '../../common/AppText';
import { blueTikeIcon, bussinessIcon, CloseBlueIcon, flashIcon, goldCard, heartGreen, heartRed, locationCIon, nopeIcon, shareRedIcon, silverCard, superlike, superlikeiconwhite, upArrowIcon, yesIcon } from '../../helper/ImageAssets';
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
import { getProfile, listProfiles, swipeLikeDisLike } from '../../actions/authActions';
import { AnyComponent } from 'react-native-reanimated/lib/typescript/createAnimatedComponent/commonTypes';
import { useIsFocused } from '@react-navigation/native';
import { setListProfiles } from '../../slices/loginServices/authSlice';
import { createSocket } from '../../common/Socket';
import MatchScreen from './MatchScreen';
import Toast, { IToast } from '../../common/Toast';
import SuperLikeScreen from './SuperLikeScreen';
import NavigationService from '../../navigation/NavigationService';
import { NAVIGATION_CRUSH_NOTE_SENDER_SCREEN, NAVIGATION_CRUSH_PURCHESE_SCREEN, NAVIGATION_PROFILE_BOOST_PURCHASE_SCREEN, NAVIGATION_SUBSCRIPTION_SCREEN, NAVIGATION_SUPERLIKE_PURCHESE_SCREEN } from '../../navigation/routes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SWIPES_PER_DAY_KEY, SWIPES_REMAINING_KEY, SUPER_LIKES_REMAINING_KEY } from '../../helper/Constants';
import { BoostModal } from '../../common/boost/BoostModal';
import { useBoostTimer } from '../../hooks/useBoostTimer';
import { BoostLiquidButton } from '../../common/boost/BoostLiquidButton';
import CrushNotesSender from './CrushNotesSender';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from "react-native-svg";

const { width, height } = Dimensions.get("window");
const FULL_IMAGE_HEIGHT = height * 0.75;
// keep in sync with `src/swiperComponents/SwipeableCard.tsx`
const SWIPE_THRESHOLD_X = width * 0.18;
const SWIPE_THRESHOLD_Y = height * 0.1;
const SUPERLIKE_ESCAPE_X = SWIPE_THRESHOLD_X * 1.35;
const SUPERLIKE_INTENT_RATIO = 1.15;
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
    const [remainingSwipes, setRemainingSwipes] = useState(0);
    const [remainingSuperLikes, setRemainingSuperLikes] = useState(0);
    const [swipesPerDay, setSwipesPerDay] = useState(0);
    const [boostModalVisible, setBoostModalVisible] = useState(false);
    const [boostEndAtMs, setBoostEndAtMs] = useState<number | null>(null);
    const [boostsAvailable, setBoostsAvailable] = useState<number>(() => 3);

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

    const likeBgStyle = useAnimatedStyle(() => ({ opacity: likeProgressEff.value }));
    const nopeBgStyle = useAnimatedStyle(() => ({ opacity: nopeProgressEff.value }));
    const likeBorderStyle = useAnimatedStyle(() => ({ opacity: likeProgressEff.value }));
    const nopeBorderStyle = useAnimatedStyle(() => ({ opacity: nopeProgressEff.value }));
    const likeWhiteIconStyle = useAnimatedStyle(() => ({ opacity: likeProgressEff.value }));
    const likeBaseIconStyle = useAnimatedStyle(() => ({ opacity: 1 - likeProgressEff.value }));
    const nopeWhiteIconStyle = useAnimatedStyle(() => ({ opacity: nopeProgressEff.value }));
    const nopeBaseIconStyle = useAnimatedStyle(() => ({ opacity: 1 - nopeProgressEff.value }));
    const superLikeBgStyle = useAnimatedStyle(() => ({ opacity: superLikeProgressEff.value }));
    const superLikeBorderStyle = useAnimatedStyle(() => ({ opacity: superLikeProgressEff.value }));
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
    /**
     * Future-ready: once backend starts sending boost end time in `userData`,
     * update ONLY this key (and keep the rest of the UI working).
     * Example backend value can be epoch ms or an ISO string.
     */
    const BOOST_END_AT_USER_KEY = "boostEndAt";
    const boostTimer = useBoostTimer({ boostEndAtMs, durationMs: BOOST_DURATION_MS });

    const getBoostsFromUserData = useCallback((u: any): number | null => {
        if (!u) return null;
        const candidates = [
            u.boostsRemaining,
            u.boostersRemaining,
            u.boosts,
            u.boosters,
            u.boostCount,
            u.boosterCount,
        ];
        const raw = candidates.find((v) => v !== undefined && v !== null);
        if (raw === undefined || raw === null) return null;
        const n = typeof raw === "number" ? raw : parseInt(String(raw), 10);
        return Number.isFinite(n) ? n : null;
    }, []);

    const getBoostEndAtFromUserData = useCallback((u: any): number | null => {
        if (!u) return null;
        const raw = u?.[BOOST_END_AT_USER_KEY];
        if (raw === undefined || raw === null) return null;
        if (typeof raw === "number") return raw;
        const asNumber = parseInt(String(raw), 10);
        if (Number.isFinite(asNumber) && asNumber > 0) return asNumber;
        const asDate = new Date(String(raw)).getTime();
        return Number.isFinite(asDate) ? asDate : null;
    }, [BOOST_END_AT_USER_KEY]);

    useEffect(() => {
        // Future-ready: when backend starts providing count consistently, this will pick it up.
        const fromUser = getBoostsFromUserData(userData);
        if (fromUser !== null && !boostEndAtMs) {
            setBoostsAvailable(fromUser);
        }
    }, [boostEndAtMs, getBoostsFromUserData, userData]);

    useEffect(() => {
        const endAtFromUser = getBoostEndAtFromUserData(userData);
        if (endAtFromUser !== null && endAtFromUser !== boostEndAtMs) {
            setBoostEndAtMs(endAtFromUser);
        }
    }, [boostEndAtMs, getBoostEndAtFromUserData, userData]);

    useEffect(() => {
        if (boostEndAtMs && !boostTimer.isRunning) {
            // Clean up finished boost (keeps UI logic simple).
            setBoostEndAtMs(null);
        }
    }, [boostEndAtMs, boostTimer.isRunning]);

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
    const url = `http://13.201.74.29/?userId=${userData?._id}`

    const socket = useMemo(() => createSocket(url), [url]);

    useEffect(() => {
        setRemainingSwipes(userData?.swipesRemaining ?? 0);
        socket.on('connect', () => {
        });
        socket.on('newMatch', (response) => {
            if (response) {
                setMatchVisible(true)
                setMatchData(response?.matchData)
            }
        });
    }, [])

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

        dispatch(getProfile(true))
        dispatch(listProfiles(true));

        if (isInitialMountRef.current) {
            setWindowStartIndex(0);
            setGetCurrentIndex(0);
            isInitialMountRef.current = false;
        } else if (returningFromSubscriptionRef.current) {
            returningFromSubscriptionRef.current = false;
        } else {
            setWindowStartIndex(0);
            setGetCurrentIndex(0);
        }
    }, [IsFocused])

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
        const superLikePerks = userData?.subscription?.perks?.superLike;
        if (superLikePerks === 0) {
            returningFromSubscriptionRef.current = true;
            NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN, { comming: subscriptionItem });
            return false;
        }

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
                        end={{ x: 1, y: 0 }} colors={["#000000", "#00000099", "#00000000"]} style={styles.bottomDetails}>
                        <View style={{ marginTop: metrics.hp8 }}>
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

    useEffect(() => {
        if (!modalVisible && swipeRight) {
            ref.current?.swipeRight();
            setSwipeRight(false)
        } else if (!modalVisible && swipeLeft) {
            ref.current?.swipeLeft();
            setSwipeLeft(false)
        } else if (!modalVisible && swipeUp) {
            const timer = setTimeout(() => {
                ref.current?.swipeTop();
                setSwipeUp(false);
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [swipeRight, modalVisible, swipeLeft, swipeUp])
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

    const PulsingCircle = ({ size }: any) => {
        const anim = useRef(new Animated.Value(0)).current;
        const animTwp = useRef(new Animated.Value(0)).current;
        useEffect(() => {
            const pulse = () => {
                anim.setValue(0);
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 3000,
                    useNativeDriver: true,
                }).start(() => {
                    pulse()
                });
            };
            const pulseTwp = () => {
                animTwp.setValue(0);
                Animated.timing(animTwp, {
                    toValue: 1,
                    duration: 3000,
                    useNativeDriver: true,
                }).start(() => {
                    pulseTwp()
                });
            };
            pulse()
            setTimeout(() => {
                pulseTwp()
            }, 1500);
        }, [anim]);
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
    };

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


    return (
        <AppSafeAreaView>
            {/* <Toast ref={toastRef} onHide={showSuccess} /> */}
            <View>
                <View style={{ zIndex: 2, backgroundColor: colors.white }}>
                    <PeopleHeader 
                        profile={false} 
                        useName={true}
                        showBooster={visibleCards.length === 0 || (windowStartIndex + getCurrentIndex >= listProfilesData?.length)}
                        boostIcon={flashIcon}
                        boostTimerText={boostTimer.isRunning ? boostTimer.remainingLabel : null}
                        onBoostPress={() => {
                            // Check subscription perks for boost limit
                            const boostPerMonth = userData?.subscription?.perks?.boostPerMonth;
                            if (boostPerMonth === 0) {
                                NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN, { comming: subscriptionItem });
                                return;
                            }

                            if (boostsAvailable <= 0 && !boostTimer.isRunning) {
                                NavigationService.navigate(NAVIGATION_PROFILE_BOOST_PURCHASE_SCREEN);
                            } else {
                                setBoostModalVisible(true);
                            }
                        }}
                    />
                </View>
                <View style={styles.swiperContainer}>
                    {(visibleCards.length === 0 || (windowStartIndex + getCurrentIndex >= listProfilesData?.length)) &&
                        <View style={{ alignItems: "center", justifyContent: "center", flex: 1, marginTop: -metrics.hp5 }}>
                            <PulsingCircle size={metrics.hp12} />
                            <FastImage resizeMode='cover' style={styles.emptyImage} source={{ uri: userData?.gallery[0]?.url }} />
                        </View>}
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
                            disableTopSwipe={userData?.subscription?.perks?.superLike !== 0 && (remainingSuperLikes ?? userData?.superLikesRemaining ?? 0) <= 0}
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
                                const superLikePerks = userData?.subscription?.perks?.superLike;
                                if (superLikePerks === 0) {
                                    returningFromSubscriptionRef.current = true;
                                    NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN, { comming: subscriptionItem });
                                } else {
                                    returningFromSubscriptionRef.current = true;
                                    NavigationService.navigate(NAVIGATION_SUPERLIKE_PURCHESE_SCREEN);
                                }
                            }}
                            onSwipeRight={(index) => {
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
                        <TouchableOpacityView activeOpacity={0.8} onPress={() => {
                            // Check subscription perks for boost limit
                            const boostPerMonth = userData?.subscription?.perks?.boostPerMonth;
                            if (boostPerMonth === 0) {
                                NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN, { comming: subscriptionItem });
                                return;
                            }

                            if (boostsAvailable <= 0 && !boostTimer.isRunning) {
                                NavigationService.navigate(NAVIGATION_PROFILE_BOOST_PURCHASE_SCREEN);
                            } else {
                                setBoostModalVisible(true);
                            }
                        }} style={styles.flasContaier}>
                            <BoostLiquidButton
                                size={metrics.hp6_5}
                                isRunning={boostTimer.isRunning}
                                remainingFraction={boostTimer.remainingFraction}
                                timerText={boostTimer.remainingLabel}
                                iconSource={flashIcon}
                            />
                        </TouchableOpacityView>
                        <View style={styles.unlickContainer} >
                            <Animated2.View style={[StyleSheet.absoluteFill, nopeBgStyle]}>
                                <LinearGradient
                                    colors={["#6F13F2", "#400B8C"]}
                                    start={{ x: 0.5, y: 0 }}
                                    end={{ x: 0.5, y: 1 }}
                                    style={StyleSheet.absoluteFill}
                                />
                            </Animated2.View>
                            <Animated2.View style={[StyleSheet.absoluteFill, nopeBorderStyle]}>
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
                        <View style={[styles.flasContaier, { overflow: "hidden" }]}>
                            <Animated2.View style={[StyleSheet.absoluteFill, superLikeBgStyle]}>
                                <LinearGradient
                                    colors={["#FF1A00", "#991000"]}
                                    start={{ x: 0.5, y: 0 }}
                                    end={{ x: 0.5, y: 1 }}
                                    style={StyleSheet.absoluteFill}
                                />
                            </Animated2.View>
                            <Animated2.View style={[StyleSheet.absoluteFill, superLikeBorderStyle]}>
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
                                    const superLikePerks = userData?.subscription?.perks?.superLike;
                                    if (superLikePerks === 0) {
                                        NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN, { comming: subscriptionItem });
                                        return;
                                    }

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
                            <Animated2.View style={[StyleSheet.absoluteFill, likeBgStyle]}>
                                <LinearGradient
                                    colors={["#CCF63D", "#779024"]}
                                    start={{ x: 0.5, y: 0 }}
                                    end={{ x: 0.5, y: 1 }}
                                    style={StyleSheet.absoluteFill}
                                />
                            </Animated2.View>
                            <Animated2.View style={[StyleSheet.absoluteFill, likeBorderStyle]}>
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
                                    <Animated2.Image source={heartGreen} resizeMode="contain" style={[styles.flasIconClose, likeBaseIconStyle]} />
                                    <Animated2.Image source={heartGreen} resizeMode="contain" style={[styles.flasIconClose, styles.iconAbs, likeWhiteIconStyle]} tintColor={colors.white} />
                                </View>
                            </TouchableOpacityView>
                        </View>
                        <TouchableOpacityView onPress={() => setCrushNotesSender(true) /* NavigationService.navigate(NAVIGATION_CRUSH_PURCHESE_SCREEN) */} style={styles.flasContaier}>
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
                    boostsAvailable={boostsAvailable}
                    durationMinutes={30}
                    isRunning={boostTimer.isRunning}
                    remainingFraction={boostTimer.remainingFraction}
                    remainingLabel={boostTimer.remainingLabel}
                    onStart={() => {
                        if (boostTimer.isRunning) return;
                        if (boostsAvailable <= 0) return;
                        setBoostsAvailable((p) => Math.max(0, p - 1));
                        setBoostEndAtMs(Date.now() + BOOST_DURATION_MS);
                    }}
                />
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
        overflow: "hidden",
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
        bottom: -metrics.hp2,
        width: "100%",
        height: metrics.hp25,
        paddingHorizontal: metrics.hp2
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
        height: metrics.hp12, width: metrics.hp12, borderRadius: metrics.hp50, borderWidth: metrics.hp0_3, borderColor: "#6F13F285"
    }
});


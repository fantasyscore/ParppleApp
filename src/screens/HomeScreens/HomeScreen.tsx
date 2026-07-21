import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import RBSheet from 'react-native-raw-bottom-sheet';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import {
    Animated,
    FlatList,
    Image,
    ImageBackground,
    InteractionManager,
    Modal,
    PermissionsAndroid,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { AppText, INTER_MEDIUM, FOURTEEN, INTER_REGULAR, INTER_SEMI_BOLD, SCHEHERAZADE_BOLD, SIXTEEN, TWELVE, WHITE, EIGHTEEN, fontSize, BLACK } from '../../common/AppText';
import { toggalOnButtonNew, toggalOffButtonNew, serachButtonNew, resetButtonNew, directChatIcon, locIcon, lockIconWhite, newCloseIcon, newIcon, newLikeIcon, newProfileBackground, silverCard, straightenIcon } from '../../helper/ImageAssets';
import metrics from '../../assets/Metrics';
import FastImage from 'react-native-fast-image';
import { colors, newColor } from '../../theme/colors';
import { TouchableOpacityView } from '../../common/TouchableOpacityView';
import { useDispatch, useSelector } from 'react-redux';
import { AppSafeAreaView } from '../../common/AppSafeAreaView';
import { getProfile, listProfiles, swipeLikeDisLike } from '../../actions/authActions';
import { useIsFocused } from '@react-navigation/native';
import { setListProfiles } from '../../slices/loginServices/authSlice';
import { createSocket } from '../../common/Socket';
import MatchScreen from './MatchScreen';
import NavigationService from '../../navigation/NavigationService';
import { NAVIGATION_CRUSH_PURCHESE_SCREEN, NAVIGATION_SUBSCRIPTION_SCREEN } from '../../navigation/routes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SWIPES_PER_DAY_KEY, SWIPES_REMAINING_KEY, SUPER_LIKES_REMAINING_KEY } from '../../helper/Constants';
import messaging from "@react-native-firebase/messaging";
import { checkMultiple, PERMISSIONS, RESULTS } from "react-native-permissions";
import Geolocation from "react-native-geolocation-service";
import NewHeaderAndroid from '../../common/NewHeaderAndroid';
import { useLikeDislikeAnimation } from '../../hooks/useLikeDislikeAnimation';
import { LikeDislikeOverlays } from '../../common/LikeDislikeOverlays';
import ViewProfileAndroid from './ViewProfileAndroid';

const PROFILE_BATCH_LIMIT = 10;
const TOP_UP_TRIGGER_COUNT = 3; // fetch more when this few profiles remain
const CARD_HEIGHT = metrics.hp44;
const CARD_MARGIN_BOTTOM = metrics.hp6;
const ITEM_HEIGHT = CARD_HEIGHT + CARD_MARGIN_BOTTOM;
const LIST_TOP_PADDING = metrics.hp3;
const AVATAR_PRELOAD_CACHE_LIMIT = 120;

const runAfterInitialInteractions = (callback: () => void, delay = 0) => {
    let interactionHandle: { cancel?: () => void } | null = null;
    const timer = setTimeout(() => {
        interactionHandle = InteractionManager.runAfterInteractions(callback);
    }, delay);

    return () => {
        clearTimeout(timer);
        interactionHandle?.cancel?.();
    };
};

const PulsingCircle = memo(({ size }: { size: number }) => {
    const anim = useRef(new Animated.Value(0)).current;
    const animTwo = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        let isMounted = true;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        const loop = (value: Animated.Value) => {
            value.setValue(0);
            Animated.timing(value, {
                toValue: 1,
                duration: 3000,
                useNativeDriver: true,
            }).start(() => {
                if (isMounted) loop(value);
            });
        };

        loop(anim);
        timeoutId = setTimeout(() => {
            if (isMounted) loop(animTwo);
        }, 1500);

        return () => {
            isMounted = false;
            if (timeoutId) clearTimeout(timeoutId);
            anim.stopAnimation();
            animTwo.stopAnimation();
        };
    }, [anim, animTwo]);

    const pulseStyle = (value: Animated.Value) => ({
        transform: [{ scale: value.interpolate({ inputRange: [0, 1], outputRange: [1, 3] }) }],
        opacity: value.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
    });

    const sizeStyle = {
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: metrics.hp0_1,
        borderColor: "#F69E8250",
        marginTop: -metrics.hp4_5
    };

    return (
        <>
            <Animated.View style={[styles.pulse, sizeStyle, pulseStyle(anim)]} />
            <Animated.View style={[styles.pulse, sizeStyle, pulseStyle(animTwo)]} />
        </>
    );
});

type ProfileListCardProps = {
    item: any;
    onLike: (item: any) => void;
    onDislike: (item: any) => void;
    onOpenPreview: (item: any) => void;
    userData: any;
};

// Memoized row: re-renders only when its own profile changes, not on every
// list update / swipe elsewhere.
const ProfileListCard = memo(({ item, onLike, onDislike, onOpenPreview, userData }: ProfileListCardProps) => {

    return (
        <ImageBackground source={newProfileBackground} resizeMode='stretch' style={styles.cardBackground}>
            <TouchableOpacityView activeOpacity={1} onPress={() => onOpenPreview(item)} style={styles.cardHeaderRow}>
                <FastImage
                    source={{ uri: item?.gallery?.[0]?.url, priority: FastImage.priority.normal, cache: FastImage.cacheControl.immutable }}
                    resizeMode='cover'
                    style={styles.avatar}
                />
                <View style={styles.headerInfo}>
                    <AppText type={SIXTEEN} weight={SCHEHERAZADE_BOLD} style={styles.nameText}>
                        {item.username ? item.username : item.name}, {item.age} y
                    </AppText>
                    <View style={styles.metaRow}>
                        <FastImage source={locIcon} resizeMode='contain' style={styles.metaIcon} />
                        <AppText color={WHITE} weight={INTER_SEMI_BOLD}>
                            {" "}{item.distanceInKm < 10 ? "Near You" : `${item.distanceInKm} Km`}
                        </AppText>
                    </View>
                    <View style={[styles.metaRow, { marginTop: metrics.hp0_5 }]}>
                        <FastImage source={straightenIcon} resizeMode='contain' style={styles.metaIcon} />
                        <AppText color={WHITE} weight={INTER_SEMI_BOLD}>
                            {" "}{item.height} ft
                        </AppText>
                    </View>
                </View>
                <FastImage source={newIcon} resizeMode='contain' style={styles.newBadge} />
            </TouchableOpacityView>

            <View style={styles.galleryWrap}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryContent}>
                    {item?.gallery?.map((img: any, idx: number) => (
                        <TouchableOpacityView activeOpacity={1} onPress={() => userData?.gender === "male" || userData?.isPublish === false? NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN) : console.log()} key={img?.url ?? idx} style={styles.galleryItem}>
                            <Image source={{ uri: img.url }} blurRadius={userData?.gender === "male"|| userData?.isPublish === false ? 10 : 0} style={styles.galleryImage} />
                            {userData?.gender === "male" || userData?.isPublish === false? <>
                                <View style={styles.galleryDim} />
                                <View style={styles.lockOverlay}>
                                    <FastImage source={lockIconWhite} resizeMode='contain' style={styles.lockIcon} />
                                </View>
                            </> : <></>
                            }
                        </TouchableOpacityView>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.actionsRow}>
                <TouchableOpacityView activeOpacity={1} onPress={() => userData?.gender === "male" || userData?.isPublish === false ? NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN) : onDislike(item)}>
                    <FastImage source={newCloseIcon} resizeMode='contain' style={styles.dislikeButton} />
                </TouchableOpacityView>
                <TouchableOpacityView activeOpacity={1} onPress={() => userData?.gender === "male" || userData?.isPublish === false ? NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN) : onLike(item)}>
                    <FastImage source={newLikeIcon} resizeMode='contain' style={styles.likeButton} />
                </TouchableOpacityView>
                <TouchableOpacityView activeOpacity={1} onPress={() => userData?.gender === "male" || userData?.isPublish === false ? NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN) : NavigationService.navigate(NAVIGATION_CRUSH_PURCHESE_SCREEN)}>
                    <FastImage source={directChatIcon} resizeMode='contain' style={styles.chatButton} />
                </TouchableOpacityView>
            </View>
        </ImageBackground>
    );
}, (prev, next) => prev.item === next.item && prev.onLike === next.onLike && prev.onDislike === next.onDislike && prev.onOpenPreview === next.onOpenPreview && prev.userData === next.userData);

const PeopleScreen = () => {
    const dispatch = useDispatch();
    const IsFocused = useIsFocused();
    const listProfilesData = useSelector((state: any) => state.auth.listProfiles ?? []);
    const userData = useSelector((state: any) => state.auth.userData);
    const profileHide = useSelector((state: any) => state.auth.profileHide);

    const [matchVisible, setMatchVisible] = useState(false);
    const [matchData, setMatchData] = useState([]);
    const [remainingSwipes, setRemainingSwipes] = useState(0);
    const [remainingSuperLikes, setRemainingSuperLikes] = useState(0);
    const [swipesPerDay, setSwipesPerDay] = useState(0);
    const [currentLocation, setCurrentLocation] = useState<{ lat: string; long: string }>({ lat: '', long: '' });
    const [modalVisible, setModalVisible] = useState(false);
    const [currentProfileData, setCurrentProfileData] = useState({})
    const [ageRange, setAgeRange] = useState([18, 60]);
    const [locationRadiusEnabled, setLocationRadiusEnabled] = useState(true);
    const [radius, setRadius] = useState([100]);
    const [photosOnly, setPhotosOnly] = useState(false);
    const filterSheetRef = useRef<any>(null);

    const onFilterPress = useCallback(() => {
        if (userData?.gender === "male"|| userData?.isPublish === false) {
            NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN)
        } else {
            filterSheetRef.current?.open();
        }
    }, [userData]);

    const handleResetFilter = () => {
        setAgeRange([18, 60]);
        setLocationRadiusEnabled(true);
        setRadius([100]);
        setPhotosOnly(false);
    };

    const handleSearchFilter = () => {
        filterSheetRef.current?.close();
        // Trigger fetch logic here if needed
    };

    // Refs mirror frequently-changing values so swipe handlers stay stable
    // (stable handlers = memoized rows never re-render unnecessarily).
    const profilesRef = useRef<any[]>(listProfilesData);
    const remainingSwipesRef = useRef(0);
    const userDataRef = useRef<any>(userData);
    const hasFetchedFeedOnceRef = useRef(false);
    const isFetchingMoreRef = useRef(false);
    const feedExhaustedRef = useRef(false);
    const prevListLengthRef = useRef(0);
    const preloadedAvatarUrlsRef = useRef<Set<string>>(new Set());

    const {
        runLikeAnimation,
        runDislikeAnimation,
        likeOverlayStyle,
        likeIconAnimatedStyle,
        dislikeOverlayStyle,
        dislikeIconAnimatedStyle,
        isSwipeAnimatingRef,
    } = useLikeDislikeAnimation();

    useEffect(() => {
        profilesRef.current = Array.isArray(listProfilesData) ? listProfilesData : [];
    }, [listProfilesData]);

    useEffect(() => {
        remainingSwipesRef.current = remainingSwipes;
    }, [remainingSwipes]);

    useEffect(() => {
        userDataRef.current = userData;
    }, [userData]);

    const hasReadCacheRef = useRef(false);

    // ---- Swipe counters: AsyncStorage persistence (read once, then sync) ----
    useEffect(() => {
        const userId = userData?._id;
        if (!userId || hasReadCacheRef.current) return;
        hasReadCacheRef.current = true;

        (async () => {
            try {
                const [swipes, superLikes, perDay] = await Promise.all([
                    AsyncStorage.getItem(`${SWIPES_REMAINING_KEY}_${userId}`),
                    AsyncStorage.getItem(`${SUPER_LIKES_REMAINING_KEY}_${userId}`),
                    AsyncStorage.getItem(`${SWIPES_PER_DAY_KEY}_${userId}`),
                ]);

                // If API data has already populated Redux, do NOT overwrite it!
                if (userDataRef.current?.swipesRemaining !== undefined) return;

                if (swipes !== null) setRemainingSwipes(parseInt(swipes, 10));
                if (superLikes !== null) setRemainingSuperLikes(parseInt(superLikes, 10));
                if (perDay !== null) setSwipesPerDay(parseInt(perDay, 10));
            } catch (error) {
                console.warn('Error loading stored values:', error);
            }
        })();
    }, [userData?._id]);

    useEffect(() => {
        if (userData && (userData.swipesRemaining !== undefined || userData.superLikesRemaining !== undefined || userData.swipesPerDay !== undefined)) {
            setRemainingSwipes(userData?.swipesRemaining ?? 0);
            setRemainingSuperLikes(userData?.superLikesRemaining ?? 0);
            setSwipesPerDay(userData?.swipesPerDay ?? 0);
        }
    }, [userData?.swipesRemaining, userData?.superLikesRemaining, userData?.swipesPerDay]);

    useEffect(() => {
        const userId = userData?._id;
        if (!userId) return;

        AsyncStorage.multiSet([
            [`${SWIPES_REMAINING_KEY}_${userId}`, String(remainingSwipes)],
            [`${SUPER_LIKES_REMAINING_KEY}_${userId}`, String(remainingSuperLikes)],
            [`${SWIPES_PER_DAY_KEY}_${userId}`, String(swipesPerDay)],
        ]).catch((error) => console.warn('Error saving stored values:', error));
    }, [remainingSwipes, remainingSuperLikes, swipesPerDay, userData?._id]);

    // ---- Initial data: profile + first feed batch ----
    useEffect(() => {
        if (!IsFocused) return;
        if (!userDataRef.current?._id) {
            dispatch(getProfile(true));
        }
        if (!hasFetchedFeedOnceRef.current && profilesRef.current.length === 0) {
            hasFetchedFeedOnceRef.current = true;
            dispatch(listProfiles(true, 0, PROFILE_BATCH_LIMIT, false));
        }
    }, [IsFocused, dispatch]);

    // ---- Infinite feed: append the next batch, stop when the server runs dry ----
    const fetchMoreProfiles = useCallback(async () => {
        if (isFetchingMoreRef.current || feedExhaustedRef.current) return;
        isFetchingMoreRef.current = true;
        try {
            const skip = profilesRef.current.length;
            const result: any = await dispatch(listProfiles(true, skip, PROFILE_BATCH_LIMIT, true));
            if (result?.skipped) return;
            const newCount = Array.isArray(result?.newProfiles) ? result.newProfiles.length : 0;
            if (newCount === 0) {
                feedExhaustedRef.current = true;
            }
        } catch (error) {
            console.warn('[HomeScreen] Feed top-up failed:', error);
        } finally {
            isFetchingMoreRef.current = false;
        }
    }, [dispatch]);

    // A fresh/replaced list (filter change, refresh) re-opens the feed.
    useEffect(() => {
        const length = listProfilesData.length;
        if (length > prevListLengthRef.current) {
            feedExhaustedRef.current = false;
        }
        prevListLengthRef.current = length;
    }, [listProfilesData.length]);

    // Low-water refill: swiping shrinks the list without scrolling, so
    // onEndReached alone isn't enough to keep the feed topped up.
    useEffect(() => {
        if (!IsFocused) return;
        if (listProfilesData.length > TOP_UP_TRIGGER_COUNT) return;

        const timer = setTimeout(() => {
            fetchMoreProfiles();
        }, 300);
        return () => clearTimeout(timer);
    }, [IsFocused, listProfilesData.length, fetchMoreProfiles]);

    const handleEndReached = useCallback(() => {
        fetchMoreProfiles();
    }, [fetchMoreProfiles]);

    // ---- Image preloading: warm the cache for upcoming avatars ----
    useEffect(() => {
        if (!listProfilesData.length) return;
        return runAfterInitialInteractions(() => {
            const cache = preloadedAvatarUrlsRef.current;
            const sources: any[] = [];
            listProfilesData.forEach((profile: any) => {
                const url = profile?.gallery?.[0]?.url;
                if (!url || cache.has(url)) return;
                cache.add(url);
                if (cache.size > AVATAR_PRELOAD_CACHE_LIMIT) {
                    const oldest = cache.values().next().value;
                    if (oldest) cache.delete(oldest);
                }
                sources.push({ uri: url, priority: FastImage.priority.normal, cache: FastImage.cacheControl.immutable });
            });
            if (sources.length > 0) {
                FastImage.preload(sources);
            }
        }, 300);
    }, [listProfilesData]);

    // ---- Like / Dislike (same business logic as the old swiper flow) ----
    const handleListSwipe = useCallback((item: any, type: "like" | "dislike") => {
        if (!item?._id) return;

        if (type === "like") {
            const unlimitedLikes = userDataRef.current?.subscription?.perks?.unlimitedLikes;
            if (unlimitedLikes !== true) {
                setRemainingSwipes((prev: number) => Math.max((prev ?? 0) - 1, 0));
            }
        }

        dispatch(swipeLikeDisLike({ swipedId: item._id, type }));

        // Remove the swiped card (same effect as the card leaving the deck);
        // the low-water effect above refills the feed.
        dispatch(setListProfiles(profilesRef.current.filter((p: any) => p._id !== item._id)));
    }, [dispatch]);

    const handleDislikePress = useCallback((item: any) => {
        setModalVisible(false)
        if (isSwipeAnimatingRef.current) return;
        runDislikeAnimation(() => {
            handleListSwipe(item, "dislike");
        });
    }, [handleListSwipe, isSwipeAnimatingRef, runDislikeAnimation]);

    const handleLikePress = useCallback((item: any) => {
        setModalVisible(false)
        if (isSwipeAnimatingRef.current) return;

        const unlimitedLikes = userDataRef.current?.subscription?.perks?.unlimitedLikes;
        if (unlimitedLikes !== true) {
            const swipes = remainingSwipesRef.current ?? userDataRef.current?.swipesRemaining ?? 0;
            if (swipes <= 0) {
                NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN, { comming: { id: '1', icon: silverCard, title: 'Silver' } });
                return;
            }
        }

        runLikeAnimation(() => {
            handleListSwipe(item, "like");
        });
    }, [handleListSwipe, isSwipeAnimatingRef, runLikeAnimation]);

    // ---- Socket: live match notifications ----
    const socketUrl = (() => {
        const currentUserId = userData?._id;
        if (!currentUserId) return null;
        const { config } = require('../../config/config');
        return `${config.BASE_URL}?userId=${encodeURIComponent(String(currentUserId))}&lat=${encodeURIComponent(
            currentLocation.lat
        )}&long=${encodeURIComponent(currentLocation.long)}`;
    })();

    const socketRef = useRef<any>(null);
    useEffect(() => {
        if (!socketUrl) return;
        const socket = createSocket(socketUrl);
        socketRef.current = socket;

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
            socketRef.current = null;
        };
    }, [socketUrl]);

    // Silent location for the socket only: no prompts, no gating — the app
    // already requested permission during onboarding (LocationScreen).
    useEffect(() => {
        (async () => {
            try {
                const permissions = Platform.OS === "ios"
                    ? [PERMISSIONS.IOS.LOCATION_WHEN_IN_USE]
                    : [PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION, PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION];
                const statuses = await checkMultiple(permissions);
                const granted = Object.values(statuses).some((s) => s === RESULTS.GRANTED);
                if (!granted) return;

                Geolocation.getCurrentPosition(
                    (position) => {
                        setCurrentLocation({
                            lat: String(position?.coords?.latitude ?? ''),
                            long: String(position?.coords?.longitude ?? ''),
                        });
                    },
                    (error) => console.warn("Location fetch failed:", error),
                    { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000, forceRequestLocation: true }
                );
            } catch (error) {
                console.warn("Location permission check failed:", error);
            }
        })();
    }, []);

    // ---- Push notification permission (deferred so it never blocks startup) ----
    useEffect(() => {
        return runAfterInitialInteractions(async () => {
            try {
                await messaging().registerDeviceForRemoteMessages();
                if (Platform.OS === 'android' && Platform.Version >= 33) {
                    await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
                }
                await messaging().requestPermission();
            } catch (e) {
                console.warn('Notification permission request failed:', e);
            }
        }, 3000);
    }, []);

    // ---- List rendering ----
    const handleOpenPreview = useCallback((item: any) => {
        setCurrentProfileData(item)
        setModalVisible(true);
    }, []);
    const renderItem = useCallback(({ item }: any) => (
        <ProfileListCard item={item} onLike={handleLikePress} onDislike={handleDislikePress} onOpenPreview={handleOpenPreview} userData={userData} />
    ), [handleLikePress, handleDislikePress, userData]);

    const keyExtractor = useCallback((item: any, index: number) => item?._id ?? `profile-${index}`, []);

    const getItemLayout = useCallback((_: any, index: number) => ({
        length: ITEM_HEIGHT,
        offset: LIST_TOP_PADDING + ITEM_HEIGHT * index,
        index,
    }), []);

    const listEmptyComponent = useCallback(() => (
        <View style={styles.emptyContainer}>
            <PulsingCircle size={metrics.hp15} />
            <View style={styles.emptyAvatarRing}>
                <FastImage resizeMode='cover' style={styles.emptyImage} source={{ uri: userData?.gallery?.[0]?.url }} />
            </View>
            <AppText style={styles.emptyText} type={TWELVE} color={WHITE} weight={INTER_MEDIUM}>
                Searching people near you...
            </AppText>
        </View>
    ), [userData?.gallery]);

    return (
        <AppSafeAreaView style={{ flexGrow: 1 }} color={newColor.blackNew}>
            <NewHeaderAndroid onFilterPress={onFilterPress} />
            <FlatList
                data={listProfilesData}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                getItemLayout={getItemLayout}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={listEmptyComponent}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.5}
                initialNumToRender={4}
                maxToRenderPerBatch={6}
                windowSize={7}
                updateCellsBatchingPeriod={50}
                removeClippedSubviews={Platform.OS === 'android'}
                showsVerticalScrollIndicator={false}
            />
            <LikeDislikeOverlays
                likeOverlayStyle={likeOverlayStyle}
                likeIconAnimatedStyle={likeIconAnimatedStyle}
                dislikeOverlayStyle={dislikeOverlayStyle}
                dislikeIconAnimatedStyle={dislikeIconAnimatedStyle}
            />
            <Modal
                animationType="fade"
                visible={modalVisible}
                statusBarTranslucent
                onRequestClose={() => setModalVisible(false)}>
                <ViewProfileAndroid currentProfileData={currentProfileData} setModalVisible={setModalVisible}
                    handleDislikePress={handleDislikePress}
                    handleLikePress={handleLikePress} />
            </Modal>
            <Modal
                animationType="fade"
                transparent
                statusBarTranslucent
                visible={matchVisible}
                onRequestClose={() => setMatchVisible(false)}>
                {matchVisible ? <MatchScreen setMatchVisible={setMatchVisible} matchData={matchData} /> : null}
            </Modal>

            {/* Filter RBSheet */}
            <RBSheet
                ref={filterSheetRef}
                draggable={true}
                height={metrics.hp60}
                customStyles={{
                    wrapper: {
                        backgroundColor: "rgba(0,0,0,0.5)"
                    },
                    draggableIcon: {
                        backgroundColor: "#E6B7A8"
                    },
                    container: {
                        backgroundColor: newColor.blackNew,
                        borderTopLeftRadius: metrics.hp3,
                        borderTopRightRadius: metrics.hp3,
                        paddingBottom: metrics.hp4
                    }
                }}
            >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
                    <AppText type={EIGHTEEN} weight={SCHEHERAZADE_BOLD} style={[styles.sheetTitle, { color: "#E6B7A8" }]}>
                        Search Preferences
                    </AppText>

                    <View style={styles.sheetSeparator} />

                    {/* Age Range */}
                    <AppText weight={INTER_SEMI_BOLD} color={WHITE} style={[styles.filterLabel, { fontSize: fontSize(14) }]}>
                        Age range {ageRange[0]} - {ageRange[1]}
                    </AppText>
                    <View style={styles.sliderWrapper}>
                        <MultiSlider
                            values={[ageRange[0], ageRange[1]]}
                            sliderLength={metrics.wp80}
                            onValuesChange={(values) => setAgeRange(values)}
                            min={18}
                            max={60}
                            step={1}
                            selectedStyle={{ backgroundColor: "#D08FA9" }}
                            unselectedStyle={{ backgroundColor: "#555" }}
                            markerStyle={{ backgroundColor: "#D08FA9", height: metrics.hp2_5, width: metrics.hp2_5, marginTop: metrics.hp0_5 }}
                        />
                    </View>

                    <View style={[styles.sheetSeparator, { marginTop: metrics.hp1 }]} />

                    {/* Location Radius */}
                    <View style={styles.filterRow}>
                        <AppText type={FOURTEEN} weight={INTER_SEMI_BOLD} color={WHITE} style={{ fontSize: fontSize(14) }}>
                            Location Radius
                        </AppText>
                        <TouchableOpacityView onPress={() => setLocationRadiusEnabled(!locationRadiusEnabled)}>
                            <FastImage
                                source={locationRadiusEnabled ? toggalOnButtonNew : toggalOffButtonNew}
                                resizeMode="contain"
                                style={styles.toggleIcon}
                            />
                        </TouchableOpacityView>
                    </View>
                    <View style={styles.radiusLabels}>
                        <AppText type={TWELVE} weight={INTER_SEMI_BOLD} color={WHITE}>{radius} Km</AppText>
                        <AppText type={TWELVE} weight={INTER_SEMI_BOLD} color={WHITE}>200 km</AppText>
                    </View>
                    <View style={styles.sliderWrapper}>
                        <MultiSlider
                            values={[radius[0]]}
                            sliderLength={metrics.wp80}
                            onValuesChange={(values) => setRadius(values)}
                            min={0}
                            max={200}
                            step={1}
                            selectedStyle={{ backgroundColor: "#D08FA9" }}
                            unselectedStyle={{ backgroundColor: "#555" }}
                            markerStyle={{ backgroundColor: "#D08FA9", height: metrics.hp2_5, width: metrics.hp2_5, marginTop: metrics.hp0_5 }}
                        />
                    </View>

                    <View style={[styles.sheetSeparator, { marginTop: metrics.hp1 }]} />

                    {/* Photos Only */}
                    <View style={styles.filterRow}>
                        <AppText weight={INTER_SEMI_BOLD} color={WHITE} style={{ fontSize: fontSize(14) }}>
                            Photos Only
                        </AppText>
                        <TouchableOpacityView onPress={() => setPhotosOnly(!photosOnly)}>
                            <FastImage
                                source={photosOnly ? toggalOnButtonNew : toggalOffButtonNew}
                                resizeMode="contain"
                                style={styles.toggleIcon}
                            />
                        </TouchableOpacityView>
                    </View>

                    <View style={[styles.sheetSeparator, { marginTop: metrics.hp2 }]} />

                    {/* Action Buttons */}
                    <View style={styles.filterActionRow}>
                        <TouchableOpacityView onPress={handleResetFilter}>
                            <ImageBackground source={resetButtonNew} resizeMode="contain" style={styles.actionBtnImage} >
                                <AppText color={WHITE} weight={SCHEHERAZADE_BOLD} type={EIGHTEEN}>
                                    Reset
                                </AppText>
                            </ImageBackground>
                        </TouchableOpacityView>
                        <TouchableOpacityView onPress={handleSearchFilter}>
                            <ImageBackground source={serachButtonNew} resizeMode="contain" style={styles.actionBtnImage} >
                                <AppText color={BLACK} weight={SCHEHERAZADE_BOLD} type={EIGHTEEN}>
                                    Search
                                </AppText>
                            </ImageBackground>
                        </TouchableOpacityView>
                    </View>
                </ScrollView>
            </RBSheet>

        </AppSafeAreaView>
    );
};

export default PeopleScreen;

const styles = StyleSheet.create({
    sheetContent: {
        paddingHorizontal: metrics.hp3,
        paddingTop: metrics.hp1,
    },
    sheetTitle: {
        textAlign: "center",
        marginBottom: metrics.hp2,
    },
    sheetSeparator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: "rgba(255,255,255,0.1)",
        marginVertical: metrics.hp2,
        marginTop: -metrics.hp1
    },
    filterLabel: {
        marginBottom: metrics.hp1,
    },
    sliderWrapper: {
        alignItems: "center",
        marginTop: -metrics.hp1,
    },
    filterRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    toggleIcon: {
        height: metrics.hp3_5,
        width: metrics.hp6,
    },
    radiusLabels: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: metrics.hp2,
    },
    filterActionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: metrics.hp2,
    },
    actionBtnImage: {
        height: metrics.hp6,
        width: metrics.hp18,
        alignItems: "center",
        justifyContent: "center"
    },
    listContent: {
        paddingHorizontal: metrics.hp2,
        paddingTop: LIST_TOP_PADDING,
        paddingBottom: metrics.hp15,
        flexGrow: 1,
    },
    cardBackground: {
        height: CARD_HEIGHT,
        width: "100%",
        marginBottom: CARD_MARGIN_BOTTOM,
    },
    cardHeaderRow: {
        paddingHorizontal: metrics.hp2,
        marginTop: metrics.hp2,
        flexDirection: "row",
        alignItems: "center",
    },
    avatar: {
        height: metrics.hp8,
        width: metrics.hp8,
        borderRadius: metrics.hp50,
        marginTop: metrics.hp1,
    },
    headerInfo: {
        marginLeft: metrics.hp3,
    },
    nameText: {
        color: "#E6B7A8",
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: -metrics.hp0_5,
    },
    metaIcon: {
        height: metrics.hp2,
        width: metrics.hp2,
    },
    newBadge: {
        height: metrics.hp3_7,
        width: metrics.hp4_5,
        position: "absolute",
        right: -metrics.hp0_4,
        top: -metrics.hp0_2,
    },
    galleryWrap: {
        width: "95%",
        paddingHorizontal: metrics.hp1,
        alignSelf: "center",
    },
    galleryContent: {
        overflow: "hidden",
        marginTop: metrics.hp3,
        gap: metrics.hp0_5,
    },
    galleryItem: {
        width: metrics.hp23,
        height: metrics.hp28,
        overflow: "hidden",
    },
    galleryImage: {
        width: "100%",
        height: "100%",
    },
    galleryDim: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.2)",
    },
    lockOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
    },
    lockIcon: {
        height: metrics.hp3,
        width: metrics.hp3,
    },
    actionsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: -metrics.hp3,
    },
    dislikeButton: {
        height: metrics.hp8,
        width: metrics.hp8,
        marginRight: metrics.hp1_5,
    },
    likeButton: {
        height: metrics.hp9,
        width: metrics.hp9,
    },
    chatButton: {
        height: metrics.hp8,
        width: metrics.hp8,
        marginLeft: metrics.hp1_5,
    },
    pulse: {
        position: 'absolute',
        backgroundColor: "#F69E8225",
    },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        marginTop: metrics.hp10,
    },
    emptyAvatarRing: {
        height: metrics.hp15,
        width: metrics.hp15,
        borderRadius: metrics.hp50,
        borderWidth: metrics.hp0_3,
        borderColor: "#F69E8250",
        alignItems: "center",
        justifyContent: "center",
    },
    emptyImage: {
        height: metrics.hp14,
        width: metrics.hp14,
        borderRadius: metrics.hp50,
        borderWidth: metrics.hp0_1,
        borderColor: colors.white,
    },
    emptyText: {
        marginTop: metrics.hp2,
    },
});

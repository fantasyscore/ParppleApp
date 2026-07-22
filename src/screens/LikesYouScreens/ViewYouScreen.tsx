import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
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
import { AppText, INTER_MEDIUM, INTER_SEMI_BOLD, SCHEHERAZADE_BOLD, SIXTEEN, TWELVE, WHITE, BLACK, TWENTY_FOUR, THIRTY, fontSize, TWENTY, FORTEEN } from '../../common/AppText';
import { directChatIcon, locIcon, lockIconWhite, newCloseIcon, newIcon, newLikeIcon, newProfileBackground, silverCard, straightenIcon, tabViewForLikes, likedYouNewIcon, youLikedNewIcon, viewedYouNewIcon, youViewednewIcon, whoVisitYourProfileWithOutPurches, viewedYouEmptyNew, youViewEmptuNew, dummyMaleProfile, dummyfemaleProfile, chatPurchaseColour } from '../../helper/ImageAssets';
import metrics from '../../assets/Metrics';
import FastImage from 'react-native-fast-image';
import { colors, newColor } from '../../theme/colors';
import { TouchableOpacityView } from '../../common/TouchableOpacityView';
import { useDispatch, useSelector } from 'react-redux';
import { AppSafeAreaView } from '../../common/AppSafeAreaView';
import { getProfile, swipeLikeDisLike, likeByOther, likeYou, viewProfileByOther, youView } from '../../actions/authActions';
import { useIsFocused } from '@react-navigation/native';
import { setListProfiles } from '../../slices/loginServices/authSlice';
import { createSocket } from '../../common/Socket';
import MatchScreen from '../HomeScreens/MatchScreen';
import NavigationService from '../../navigation/NavigationService';
import { NAVIGATION_BOTTOMTAB_SCREEN, NAVIGATION_CRUSH_PURCHESE_SCREEN, NAVIGATION_PEOPLE_SCREEN, NAVIGATION_SUBSCRIPTION_SCREEN } from '../../navigation/routes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SWIPES_PER_DAY_KEY, SWIPES_REMAINING_KEY, SUPER_LIKES_REMAINING_KEY } from '../../helper/Constants';
import messaging from "@react-native-firebase/messaging";
import { checkMultiple, PERMISSIONS, RESULTS } from "react-native-permissions";
import Geolocation from "react-native-geolocation-service";
import NewHeaderAndroid from '../../common/NewHeaderAndroid';
import { useLikeDislikeAnimation } from '../../hooks/useLikeDislikeAnimation';
import { LikeDislikeOverlays } from '../../common/LikeDislikeOverlays';
import ViewProfileAndroid from '../HomeScreens/ViewProfileAndroid';

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
                    source={item?.profilePicture?.length ? { uri: item?.profilePicture?.[0]?.url, priority: FastImage.priority.normal, cache: FastImage.cacheControl.immutable } : item?.gender === "male" ? dummyMaleProfile : dummyfemaleProfile}
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
                            {" "}{item.distanceInKm} Km
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
                {item?.profilePicture?.length ?
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryContent}>
                        {item?.profilePicture?.map((img: any, idx: number) => (
                            <View key={img?.url ?? idx} style={styles.galleryItem}>
                                <Image source={{ uri: img.url }} blurRadius={userData?.gender === "male" || userData?.isPublish === false ? 10 : 0} style={styles.galleryImage} />
                                {userData?.gender === "male" || userData?.isPublish === false ? <>
                                    <View style={styles.galleryDim} />
                                    <View style={styles.lockOverlay}>
                                        <FastImage source={lockIconWhite} resizeMode='contain' style={styles.lockIcon} />
                                    </View>
                                </> : <></>}
                            </View>

                        ))}
                    </ScrollView>
                    :
                    <ImageBackground source={chatPurchaseColour} tintColor={"#555359"} resizeMode='stretch' style={{
                        width: metrics.hp23,
                        height: metrics.hp28, marginTop: metrics.hp3,
                        paddingHorizontal: metrics.hp2,
                        paddingVertical: metrics.hp2,
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <AppText style={{ textAlign: "center", lineHeight: metrics.hp2 }} color={WHITE} type={TWELVE} weight={SCHEHERAZADE_BOLD}>
                            {item.bio}
                        </AppText>
                    </ImageBackground>
                }
            </View>

            <View style={styles.actionsRow}>
                <TouchableOpacityView activeOpacity={1} onPress={() => onDislike(item)}>
                    <FastImage source={newCloseIcon} resizeMode='contain' style={styles.dislikeButton} />
                </TouchableOpacityView>
                <TouchableOpacityView activeOpacity={1} onPress={() => onLike(item)}>
                    <FastImage source={newLikeIcon} resizeMode='contain' style={styles.likeButton} />
                </TouchableOpacityView>
                <TouchableOpacityView activeOpacity={1} onPress={() => NavigationService.navigate(NAVIGATION_CRUSH_PURCHESE_SCREEN)}>
                    <FastImage source={directChatIcon} resizeMode='contain' style={styles.chatButton} />
                </TouchableOpacityView>
            </View>
        </ImageBackground>
    );
}, (prev, next) => prev.item === next.item && prev.onLike === next.onLike && prev.onDislike === next.onDislike && prev.onOpenPreview === next.onOpenPreview && prev.userData === next.userData);

const ViewYouScreen = () => {
    const dispatch = useDispatch();
    const IsFocused = useIsFocused();
    const userData = useSelector((state: any) => state.auth.userData);

    const [tabSelect, setTabSelect] = useState('Views');
    const [likeYoue, setlikeYou] = useState('Likes You');
    const [ViewYoue, setViewYou] = useState('Viewed You');

    const likeByOtherData = useSelector((state: any) => state.auth.likeByOtherData);
    const likeYouData = useSelector((state: any) => state.auth.likeYouData);
    const viewByOtherData = useSelector((state: any) => state.auth.viewByOtherData);
    const viewYouData = useSelector((state: any) => state.auth.viewYouData);

    const [matchVisible, setMatchVisible] = useState(false);
    const [matchData, setMatchData] = useState([]);
    const [currentLocation, setCurrentLocation] = useState<{ lat: string; long: string }>({ lat: '', long: '' });
    const [modalVisible, setModalVisible] = useState(false);
    const [currentProfileData, setCurrentProfileData] = useState({});

    const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

    const userDataRef = useRef<any>(userData);

    useEffect(() => {
        dispatch(viewProfileByOther());
        dispatch(youView());
    }, [IsFocused]);

    const dataCorrect = () => {
        const { subscription } = userData || {};
        const { perks = {}, plan } = subscription || {};

        const canSeeLikes = perks?.canSeeLikes || plan !== "FREE";
        const canSeeViews = perks?.canSeeViews || plan !== "FREE";

        let data: any[] = [];

        if (ViewYoue === "Viewed You") {
            data = viewByOtherData?.length ? viewByOtherData : [];
            return data.map((item: any) => ({ ...item, see: canSeeViews }));
        }

        if (ViewYoue === "You Viewed") {
            data = viewYouData?.length ? viewYouData : [];
            return data.map((item: any) => ({ ...item, see: true }));
        }

        return [];
    };

    const filteredData = React.useMemo(() => {
        return dataCorrect().filter((item: any) => !hiddenIds.has(item._id));
    }, [dataCorrect, hiddenIds]);

    const {
        runLikeAnimation,
        runDislikeAnimation,
        likeOverlayStyle,
        likeIconAnimatedStyle,
        dislikeOverlayStyle,
        dislikeIconAnimatedStyle,
        isSwipeAnimatingRef,
    } = useLikeDislikeAnimation();

    // ---- Like / Dislike (same business logic as the old swiper flow) ----
    const handleListSwipe = useCallback((item: any, type: "like" | "dislike") => {
        if (!item?._id) return;
        const data = {
            swipedId: item.userId,
            type: "like"
        }
        dispatch(swipeLikeDisLike(data));
        // dispatch(swipeLikeDisLike({ swipedId: item._id, type }));

        // Remove the swiped card (same effect as the card leaving the deck);
        setHiddenIds(prev => new Set(prev).add(item._id));
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


    if (userData?.gender === "male" || userData?.isPublish === false) {
        return (
            <ImageBackground source={whoVisitYourProfileWithOutPurches} resizeMode="stretch"
                style={{
                    ...StyleSheet.absoluteFillObject,
                    zIndex: 0,
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                <AppText weight={SCHEHERAZADE_BOLD} style={{ color: "#D08FA9", fontSize: fontSize(50) }}>
                    Who’s
                </AppText>
                <AppText type={THIRTY} weight={SCHEHERAZADE_BOLD} style={{ color: "#D08FA9", marginTop: -metrics.hp9, fontSize: fontSize(50) }}>
                    watching You?
                </AppText>
                <AppText type={FORTEEN} weight={INTER_SEMI_BOLD} style={{ color: "#D08FA9", marginTop: -metrics.hp4 }}>
                    Let Your Mystery Drew Someone In.
                </AppText>
                <TouchableOpacity activeOpacity={1} onPress={() => NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN)} style={{ height: metrics.hp7, position: "absolute", bottom: metrics.hp13, borderWidth: metrics.hp0_1, borderColor: "#D08FA9", width: "95%", backgroundColor: "#00000050" }}>
                    <AppText type={TWENTY} weight={SCHEHERAZADE_BOLD} style={{ color: "#D08FA9", marginTop: metrics.hp0_5, textAlign: "center" }}>
                        Unlock Now
                    </AppText>
                </TouchableOpacity>
            </ImageBackground>
        )
    }
    return (
        <AppSafeAreaView style={{ flexGrow: 1 }} color={newColor.blackNew}>
            <View style={{ zIndex: 1 }}>
                <View
                    style={{
                        position: "absolute",
                        top: metrics.hp11,
                        alignSelf: "center",
                        flexDirection: "row",
                        zIndex: 0,
                    }}>
                    <TouchableOpacityView
                        onPress={() => setViewYou("Viewed You")}
                        activeOpacity={1}
                        style={{
                            zIndex: ViewYoue === "Viewed You" ? 2 : 1,
                            elevation: ViewYoue === "Viewed You" ? 2 : 1,
                        }}>
                        <ImageBackground
                            source={tabViewForLikes}
                            resizeMode="stretch"
                            style={{
                                height: metrics.hp6,
                                width: metrics.hp22,
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                            imageStyle={{
                                tintColor: ViewYoue === "Viewed You" ? "#E6B7A8" : "#555359",
                            }}>
                            <View style={{ flexDirection: "row", alignItems: "center", marginTop: metrics.hp1 }}>
                                <FastImage
                                    source={viewedYouNewIcon}
                                    tintColor={ViewYoue === "Viewed You" ? "black" : "#FAFAFA66"}
                                    resizeMode="contain"
                                    style={{
                                        width: metrics.hp3,
                                        height: metrics.hp3,
                                    }}
                                />
                                <AppText style={{ marginTop: -metrics.hp0_5, color: ViewYoue === "Viewed You" ? "black" : "#FAFAFA66" }} weight={SCHEHERAZADE_BOLD} type={SIXTEEN}>
                                    {" "}Viewed You
                                </AppText>
                            </View>
                        </ImageBackground>
                    </TouchableOpacityView>

                    <TouchableOpacityView
                        onPress={() => setViewYou("You Viewed")}
                        activeOpacity={1}
                        style={{
                            marginLeft: -metrics.hp4,
                            zIndex: ViewYoue === "You Viewed" ? 2 : 1,
                            elevation: ViewYoue === "You Viewed" ? 2 : 1,
                        }}>
                        <ImageBackground
                            source={tabViewForLikes}
                            resizeMode="contain"
                            style={{
                                height: metrics.hp6,
                                width: metrics.hp22,
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                            imageStyle={{
                                tintColor: ViewYoue === "You Viewed" ? "#E6B7A8" : "#555359",
                            }}>
                            <View style={{ flexDirection: "row", alignItems: "center", marginTop: metrics.hp1 }}>
                                <FastImage tintColor={ViewYoue === "You Viewed" ? "black" : "#FAFAFA66"} source={youViewednewIcon} resizeMode="contain" style={{ height: metrics.hp3, width: metrics.hp3 }} />
                                <AppText style={{ marginTop: -metrics.hp0_5, color: ViewYoue === "You Viewed" ? "black" : "#FAFAFA66" }} weight={SCHEHERAZADE_BOLD} type={SIXTEEN}>
                                    {" "}You Viewed
                                </AppText>
                            </View>
                        </ImageBackground>
                    </TouchableOpacityView>
                </View>
                <NewHeaderAndroid filterShow={false} />
            </View>
            {filteredData?.length === 0 ?
                <ImageBackground source={ViewYoue === "You Viewed" ? youViewEmptuNew : viewedYouEmptyNew} resizeMode='stretch' style={{ flex: 1, alignItems: "center" }} >
                    {ViewYoue === "You Viewed" ? <></> :
                        <TouchableOpacity activeOpacity={1} onPress={() => NavigationService.navigate(NAVIGATION_PEOPLE_SCREEN)} style={{ height: metrics.hp7, position: "absolute", bottom: metrics.hp13, borderWidth: metrics.hp0_1, borderColor: "#D08FA9", width: "95%", backgroundColor: "#00000050" }}>
                            <AppText type={TWENTY} weight={SCHEHERAZADE_BOLD} style={{ color: "#D08FA9", marginTop: metrics.hp0_5, textAlign: "center" }}>
                                Visit Now
                            </AppText>
                        </TouchableOpacity>
                    }
                </ImageBackground> :
                <FlatList
                    data={filteredData}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    getItemLayout={getItemLayout}
                    contentContainerStyle={styles.listContent}
                    initialNumToRender={4}
                    maxToRenderPerBatch={6}
                    windowSize={7}
                    updateCellsBatchingPeriod={50}
                    removeClippedSubviews={Platform.OS === 'android'}
                    showsVerticalScrollIndicator={false}
                />
            }
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
        </AppSafeAreaView>
    );
};

export default ViewYouScreen;

const styles = StyleSheet.create({

    listContent: {
        paddingHorizontal: metrics.hp2,
        paddingTop: LIST_TOP_PADDING,
        paddingBottom: metrics.hp15,
        flexGrow: 1,
        marginTop: metrics.hp4,

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

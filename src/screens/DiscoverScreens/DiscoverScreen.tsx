import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    ImageBackground,
    StyleSheet,
    View,
    Dimensions,
    FlatList,
    ScrollView,
    Modal,
} from "react-native";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import PeopleHeader from "../../common/PeopleHeader";
import {
    AppText,
    ELEVEN,
    FORTEEN,
    INTER_BOLD,
    INTER_MEDIUM,
    INTER_REGULAR,
    INTER_SEMI_BOLD,
    LIGHT_BLACK,
    OPECITY_DARK,
    SCHEHERAZADE_BOLD,
    TEN,
    TWELVE,
    TWENTY,
    TWENTY_FOUR,
    WHITE,
} from "../../common/AppText";
import metrics from "../../assets/Metrics";
import FastImage from "react-native-fast-image";
import { accountcircleIcon, blueTikeIcon, bussnisIcon, closeIcon, disLikeNewIcon, filterIcon, goldCard, heartRed, likeNewICon, locationCIon, moonIcon, recommonedICon } from "../../helper/ImageAssets";
import { datapersonal, editDiscover, editProfileData, profileDataDiscover, similarProfileFilter } from "../../common/UiltData";
import { colors } from "../../theme/colors";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import RBSheet from "react-native-raw-bottom-sheet";
import ListCheckBox from "../../common/ListCheckbox";
import PurpuleButton from "../../common/PurpuleButton";
import { useDispatch, useSelector } from "react-redux";
import Animated2, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
} from "react-native-reanimated";
import { discoverProfile, getOtherProfile, swipeLikeDisLike } from "../../actions/authActions";
import { setDiscoverData } from "../../slices/loginServices/authSlice";
import { SwiperCardRefType } from "rn-swiper-list";
import SuperLikeScreen from "../HomeScreens/SuperLikeScreen";
import PreviewDetails from "../HomeScreens/PreviewDetails";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_SUBSCRIPTION_SCREEN } from "../../navigation/routes";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = metrics.hp34;
const SPACING = metrics.hp1;
const PLACEHOLDER_CARDS = [
    { id: 'empty-1', isEmpty: true },
    { id: 'empty-2', isEmpty: true },
    { id: 'empty-3', isEmpty: true },
    { id: 'empty-4', isEmpty: true },
];

const DiscoverScreen = () => {
    const discoverProfileData = useSelector((state: any) => state.auth.discoverProfileData);
    const userData = useSelector((state: any) => state.auth.userData);
    const dispatch = useDispatch();
    const ref = useRef<SwiperCardRefType>(null);
    const refFilter: any = useRef(null);
    const scrollX = useRef(new Animated.Value(0)).current;
    const [selectPronoun, setSelectPronoun] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
    const [swipeUp, setSwipeUp] = useState(false);
    const [swipeLeft, setSwipeLeft] = useState(false);
    const [swipeRight, setSwipeRight] = useState(false);
    const [superLikeVisible, setSuperLikeVisible] = useState(false);
    const [profileData, setProfileData] = useState<any>(null);
    const [likedProfiles, setLikedProfiles] = useState<any[]>([]);
    const [remainingSuperLikes, setRemainingSuperLikes] = useState(userData?.superLikesRemaining ?? 0);
    const [remainingSwipes, setRemainingSwipes] = useState(0);
    const subscriptionItem = useMemo(() => ({ id: '2', icon: goldCard, title: 'Gold' }), []);
    const middleIndex = Math.ceil(discoverProfileData?.length / 2);
    const firstPart = discoverProfileData?.slice(0, middleIndex);
    const secondPart = discoverProfileData?.slice(middleIndex);
    // Sync remaining super likes whenever user data updates
    useEffect(() => {
        setRemainingSuperLikes(userData?.superLikesRemaining ?? 0);
    }, [userData?.superLikesRemaining]);

    useEffect(() => {
        const swipes = Number(userData?.swipesRemaining ?? 0);
        setRemainingSwipes(Number.isFinite(swipes) ? swipes : 0);
    }, [userData?.swipesRemaining]);

    const isDislikeFxRunningRef = useRef(false);
    const dislikeFxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isLikeFxRunningRef = useRef(false);
    const likeFxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const dislikeOverlayOpacity = useSharedValue(0);
    const dislikeIconScale = useSharedValue(0.7);
    const likeOverlayOpacity = useSharedValue(0);
    const likeIconScale = useSharedValue(0.7);

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
            setSwipeLeft(true);
            dislikeOverlayOpacity.value = withTiming(0, { duration: 90 });
            isDislikeFxRunningRef.current = false;
            dislikeFxTimerRef.current = null;
        }, 240);
    }, [dislikeIconScale, dislikeOverlayOpacity]);

    const runLikeAnimation = useCallback(() => {
        const unlimitedLikes = userData?.subscription?.perks?.unlimitedLikes === true;
        if (!unlimitedLikes) {
            if (remainingSwipes <= 0) {
                NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN, { comming: subscriptionItem });
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
            setSwipeRight(true);
            if (!unlimitedLikes) {
                setRemainingSwipes((prev) => Math.max(prev - 1, 0));
            }
            likeOverlayOpacity.value = withTiming(0, { duration: 90 });
            isLikeFxRunningRef.current = false;
            likeFxTimerRef.current = null;
        }, 240);
    }, [likeIconScale, likeOverlayOpacity, remainingSwipes, subscriptionItem, userData?.subscription?.perks?.unlimitedLikes]);

    useEffect(() => {
        return () => {
            if (dislikeFxTimerRef.current) {
                clearTimeout(dislikeFxTimerRef.current);
            }
            if (likeFxTimerRef.current) {
                clearTimeout(likeFxTimerRef.current);
            }
        };
    }, []);

    const setSwipeLeftProxy = useCallback(
        (val: boolean) => {
            if (!val) return;
            setModalVisible(false);
            runDislikeAnimation();
        },
        [runDislikeAnimation]
    );

    const setSwipeRightProxy = useCallback(
        (val: boolean) => {
            if (!val) return;
            setModalVisible(false);
            runLikeAnimation();
        },
        [runLikeAnimation]
    );

    const canSuperLike = useCallback(() => {
        if ((remainingSuperLikes ?? 0) <= 0) {
            NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN, { comming: subscriptionItem });
            return false;
        }
        return true;
    }, [remainingSuperLikes, subscriptionItem]);

    const datalist = [
        {
            id: "1",
            title: "Similar Interests",
        },
        {
            id: "2",
            title: "Similar Lifestyle",
        },
        {
            id: "3",
            title: "Dating Goals",
        },
        {
            id: "4",
            title: "Communities in Common",
        },
    ];
    const dataCorrect = () => {
        const { subscription } = userData || {};
        const { perks = {}, plan } = subscription || {};
        const canSeeLikes = perks?.canSeediscovery || plan !== "FREE";
        let data: any[] = [];
        data = firstPart?.length ? firstPart : [];
        return data.map((item) => ({ ...item, see: canSeeLikes }));
    }
    const dataCorrectTwo = () => {
        const { subscription } = userData || {};
        const { perks = {}, plan } = subscription || {};
        const canSeeLikes = perks?.canSeediscovery || plan !== "FREE";
        let data: any[] = [];
        data = secondPart?.length ? secondPart : [];
        return data.map((item) => ({ ...item, see: canSeeLikes }));
    }
    const viewProfile = (item: any, onlyheart: any) => {
        if (onlyheart) {
            let data = {
                "userId": item?._id
            };
            let isNavigate = true
            dispatch(getOtherProfile(data, isNavigate, setProfileData));
        } else {
            let data = {
                "userId": item?._id
            };
            let isNavigate = true
            dispatch(getOtherProfile(data, isNavigate, setProfileData));
            setModalVisible(true)
        }
    };

    const discoverRender = ({ item, index }: any) => {
        const inputRange = [
            (index - 1) * (ITEM_WIDTH + SPACING),
            index * (ITEM_WIDTH + SPACING),
            (index + 1) * (ITEM_WIDTH + SPACING),
        ];

        const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.95, 1, 0.95],
            extrapolate: "clamp",
        });

        const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.9, 1, 0.9],
            extrapolate: "clamp",
        });
        if (item.isEmpty) {
            return (
                <Animated.View
                    style={{
                        transform: [{ scale }],
                        opacity,
                        marginLeft: index === 0 ? metrics.hp2_5 : 0,
                        marginRight: SPACING,
                    }}>
                    <View
                        style={[
                            styles.discoverImage,
                            { backgroundColor: colors.nanoOpecity },
                        ]}
                    />
                </Animated.View>
            );
        }
        return (

            <TouchableOpacityView key={item?._id} onPress={() => item.see == false ? NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN, { comming: subscriptionItem }) : viewProfile(item, false)} activeOpacity={1}>
                <Animated.View
                    style={{
                        transform: [{ scale }],
                        opacity,
                        marginLeft: index === 0 ? metrics.hp2_5 : 0,
                        marginRight: SPACING,
                    }}>
                    <ImageBackground
                        blurRadius={item?.see == false ? metrics.hp3 : metrics.hp0}
                        resizeMode="cover"
                        imageStyle={{ borderRadius: metrics.hp1_5 }}
                        style={styles.discoverImage}
                        source={{ uri: item?.profilePicture[0]?.url }}>
                        <View style={{ flex: 1 }} />
                        <View style={styles.bottomDetails}>

                            <View>
                                {item?.online && userData?.subscription?.plan !== "FREE" &&
                                    <View style={styles.activeContainer}>
                                        <View style={styles.activeBackground}>
                                            <View style={styles.activeDot} />
                                        </View>
                                        <AppText type={TEN} color={WHITE} weight={INTER_SEMI_BOLD}>
                                            {" "}Active
                                        </AppText>
                                    </View>
                                }
                                {item?.see == false ?
                                    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#ffffff50", borderRadius: metrics.hp2, height: metrics.hp3, marginTop: metrics.hp1, width: metrics.hp12 }}>
                                        <AppText></AppText>
                                    </View> :
                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        <AppText type={TWENTY} style={{ textTransform: "capitalize" }} color={WHITE} weight={INTER_BOLD}>
                                            {`${item.firstName}, ${item.age}`}{" "}
                                        </AppText>
                                     
                                             {item?.faceVerified == true ?  <FastImage source={blueTikeIcon} resizeMode="contain" style={styles.blueTikIcon} />:<></>}
                                    </View>
                                }

                                <View style={{ flexDirection: "row", alignItems: "center", marginTop: metrics.hp1 }}>
                                    <FastImage
                                        source={bussnisIcon}
                                        tintColor={colors.white}
                                        resizeMode="contain"
                                        style={styles.loctionIcon}
                                    />
                                    <AppText type={ELEVEN} color={WHITE} weight={INTER_MEDIUM}>
                                        {" "}
                                        {item.jobTitle}
                                    </AppText>
                                </View>
                                <View style={{ flexDirection: "row", alignItems: "center", marginTop: metrics.hp1 }}>
                                    <FastImage source={locationCIon} resizeMode="contain" style={styles.loctionIcon} />
                                    <AppText type={ELEVEN} color={WHITE} weight={INTER_MEDIUM}>
                                        {" "}
                                        5 Km away
                                    </AppText>
                                </View>
                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: ITEM_WIDTH - metrics.hp4, marginBottom: -metrics.hp1 }}>
                                    <View style={styles.wrapContainer}>
                                        <View style={styles.listContainer}>
                                            <FastImage
                                                tintColor={colors.white}
                                                source={moonIcon}
                                                resizeMode="contain"
                                                style={styles.icons}
                                            />
                                            <AppText color={WHITE} weight={INTER_MEDIUM} type={ELEVEN}>
                                                {"  "}
                                                {item.zodiaSign}
                                            </AppText>
                                        </View>
                                        <View style={styles.listContainer} >
                                            <FastImage
                                                tintColor={colors.white}
                                                source={locationCIon}
                                                resizeMode="contain"
                                                style={styles.icons}
                                            />
                                            <AppText color={WHITE} weight={INTER_MEDIUM} type={ELEVEN}>
                                                {"  "}
                                                {item.city}
                                            </AppText>
                                        </View>
                                    </View>
                                    {/* <TouchableOpacityView onPress={() => {
                                        if (item.see == false) {
                                            NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN, { comming: subscriptionItem })
                                            return;
                                        }
                                        else if (!canSuperLike()) return;
                                        setSuperLikeVisible(true);
                                        viewProfile(item, true);
                                    }} style={[styles.flasContaier]}>
                                        <FastImage source={heartRed} resizeMode="contain" style={styles.flasIcon} />
                                    </TouchableOpacityView> */}
                                </View>
                            </View>
                        </View>

                    </ImageBackground>
                </Animated.View>
            </TouchableOpacityView>
        );
    };
    const SimilarRender = ({ item, index }: any) => {
        if (item.isEmpty) {
            return (
                <Animated.View
                    style={{
                        marginLeft: index === 0 ? metrics.hp2_5 : 0,
                        marginRight: SPACING,
                    }}>
                    <View
                        style={[
                            styles.simlierImage,
                            { backgroundColor: colors.nanoOpecity },
                        ]}
                    />
                </Animated.View>
            );
        }
        return (
            <TouchableOpacityView key={item?._id} onPress={() => item.see == false ? NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN, { comming: subscriptionItem }) : viewProfile(item, false)} activeOpacity={1}>
                <Animated.View
                    style={{
                        marginLeft: index === 0 ? metrics.hp2_5 : 0,
                        marginRight: SPACING,
                    }}>
                    <ImageBackground
                        resizeMode="cover"
                        blurRadius={item?.see == false ? metrics.hp3 : metrics.hp0}
                        imageStyle={{ borderRadius: metrics.hp1_5 }}
                        style={styles.simlierImage}
                        source={{ uri: item?.profilePicture[0]?.url }}>
                        <View style={{ flex: 1 }} />
                        <View style={[styles.newdetails, { marginBottom: metrics.hp1 }]}>
                            {item?.online && userData?.subscription?.plan !== "FREE" &&
                                <View style={styles.activeContainer}>
                                    <View style={styles.activeBackground}>
                                        <View style={styles.activeDot} />
                                    </View>
                                    <AppText type={TEN} color={WHITE} weight={INTER_SEMI_BOLD}>
                                        {" "}Active
                                    </AppText>
                                </View>
                            }
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                {item?.see == false ?
                                    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#ffffff50", borderRadius: metrics.hp2, height: metrics.hp3, marginTop: metrics.hp1, width: metrics.hp8 }}>
                                        <AppText></AppText>
                                    </View> :
                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        <AppText type={FORTEEN} style={{ textTransform: "capitalize" }} color={WHITE} weight={INTER_BOLD}>
                                            {`${item.firstName}, ${item.age}`}{" "}
                                        </AppText>
                                        {item?.faceVerified == true ?  <FastImage source={blueTikeIcon} resizeMode="contain"   style={[styles.blueTikIcon, {
                                                height: metrics.hp2,
                                                width: metrics.hp2,
                                            }]} />:<></>}
                                    </View>
                                }
                                {/* <TouchableOpacityView onPress={() => {
                                    if (item.see == false) {
                                        NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN, { comming: subscriptionItem })
                                        return;
                                    }
                                    else if (!canSuperLike()) return;
                                    setSuperLikeVisible(true);
                                    viewProfile(item, true);
                                }} style={[styles.flasContaier, { marginLeft: metrics.hp1 }]}>
                                    <FastImage source={heartRed} resizeMode="contain" style={styles.flasIcon} />
                                </TouchableOpacityView> */}
                            </View>
                        </View>
                    </ImageBackground>
                </Animated.View>
            </TouchableOpacityView >
        )
    };
    useEffect(() => {
        if (!modalVisible && swipeUp) {
            // Double-check if user can super like before dispatching
            if (!canSuperLike()) {
                setSuperLikeVisible(false);
                setSwipeUp(false);
                return;
            }
            const timer = setTimeout(() => {
                let datanew = {
                    "swipedId": profileData?._id,
                    "type": "superLike"
                };
                dispatch(swipeLikeDisLike(datanew));
                setRemainingSuperLikes((prev: number) => Math.max((prev ?? 0) - 1, 0));
                setSuperLikeVisible(false);
                setSwipeUp(false);
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [modalVisible, swipeUp, canSuperLike]);

    useEffect(() => {
        if (modalVisible || !swipeLeft || !profileData?._id) return;
        const timer = setTimeout(() => {
            dispatch(
                swipeLikeDisLike({
                    swipedId: profileData?._id,
                    type: "dislike",
                })
            );
            const nextDiscoverProfiles = (discoverProfileData ?? []).filter(
                (item: any) => item?._id !== profileData?._id
            );
            dispatch(setDiscoverData(nextDiscoverProfiles));
            setSwipeLeft(false);
        }, 200);
        return () => clearTimeout(timer);
    }, [discoverProfileData, dispatch, modalVisible, profileData?._id, swipeLeft]);

    useEffect(() => {
        if (modalVisible || !swipeRight || !profileData?._id) return;
        const timer = setTimeout(() => {
            dispatch(
                swipeLikeDisLike({
                    swipedId: profileData?._id,
                    type: "like",
                })
            );
            setLikedProfiles((prev) => {
                if (prev.some((item: any) => item?._id === profileData?._id)) return prev;
                return [...prev, profileData];
            });
            const nextDiscoverProfiles = (discoverProfileData ?? []).filter(
                (item: any) => item?._id !== profileData?._id
            );
            dispatch(setDiscoverData(nextDiscoverProfiles));
            setSwipeRight(false);
        }, 200);
        return () => clearTimeout(timer);
    }, [discoverProfileData, dispatch, modalVisible, profileData, profileData?._id, swipeRight]);

    return (
        <AppSafeAreaView>
            <PeopleHeader profile={true} filter={true} setModalVisible={setModalVisible}/>
            <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                <View style={{ paddingHorizontal: metrics.hp2 }}>
                    <AppText
                        type={TWENTY_FOUR}
                        weight={SCHEHERAZADE_BOLD}
                        color={LIGHT_BLACK}>
                        Discover New Souls
                    </AppText>
                    <AppText
                        style={{ marginTop: -metrics.hp1_7 }}
                        type={ELEVEN}
                        weight={INTER_REGULAR}
                        color={OPECITY_DARK}>
                        Get matched with your similar vibe Souls, refreshed every 24{"\n"}
                        hours.
                    </AppText>

                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginTop: metrics.hp2,
                        }}>
                        <FastImage
                            source={recommonedICon}
                            resizeMode="contain"
                            style={styles.recommonedIcon}
                        />
                        <AppText type={TWELVE} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                            {"  "}Recommended for you
                        </AppText>
                    </View>
                </View>
                <View>
                    <Animated.FlatList
                        data={dataCorrect()?.length > 0 ? dataCorrect() : PLACEHOLDER_CARDS}
                        renderItem={discoverRender}
                        keyExtractor={(item) => item?._id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={ITEM_WIDTH + SPACING}
                        decelerationRate="fast"
                        bounces={false}
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                            { useNativeDriver: true }
                        )}
                        scrollEventThrottle={16}
                        contentContainerStyle={{ paddingVertical: metrics.hp2 }}
                    />
                </View>
                <View style={styles.containerBottom}>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingHorizontal: metrics.hp2,
                            marginTop: metrics.hp2
                        }}>
                        <FastImage
                            source={accountcircleIcon}
                            resizeMode="contain"
                            style={styles.recommonedIcon}
                            tintColor={colors.lightBlack}
                        />
                        <AppText type={TWELVE} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                            {"  "}Similar Soulmates Profiles
                        </AppText>
                    </View>
                    {/* <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.wrapContainerTwo}>
                            {similarProfileFilter?.map((item: any, index: any) => {
                                return (
                                    <View key={index} style={[styles.containerSelect, {
                                        backgroundColor: index == 0 ? colors.green : colors.white,
                                        marginRight: SPACING,
                                    }]}>
                                        <AppText style={{ marginTop: -metrics.hp0_3 }} type={TWELVE} weight={INTER_MEDIUM}>
                                            {item.title}
                                        </AppText>
                                        {index == 0 ?
                                            <FastImage source={closeIcon} tintColor={colors.lightBlack} resizeMode="contain" style={styles.closeIcon} /> : <></>
                                        }
                                    </View>
                                )
                            })}
                        </ScrollView>
                        <TouchableOpacityView onPress={() => refFilter?.current?.open()} style={styles.filterButton}>
                            <FastImage source={filterIcon} resizeMode="contain" style={styles.filterIcon} />
                        </TouchableOpacityView>
                    </View> */}
                    <FlatList
                        data={dataCorrectTwo()?.length ? dataCorrectTwo() : PLACEHOLDER_CARDS}
                        renderItem={SimilarRender}
                        keyExtractor={(item) => String(item?._id)}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingVertical: metrics.hp2 }}
                    />
                </View>
            </Animated.ScrollView>
            <RBSheet ref={refFilter} openDuration={100}
                height={Dimensions.get('window').height / 2.20}
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
                <View style={styles.headerRB}>
                    <FastImage source={closeIcon} tintColor={colors.transparent} resizeMode="contain" style={styles.closeIconTwo} />

                    <AppText type={FORTEEN} weight={INTER_BOLD}>
                        Filter
                    </AppText>
                    <TouchableOpacityView onPress={() => refFilter?.current?.close()}>
                        <FastImage source={closeIcon} tintColor={colors.lightBlack} resizeMode="contain" style={styles.closeIconTwo} />
                    </TouchableOpacityView>
                </View>
                <FlatList data={datalist}
                    renderItem={({ item, index }: any) => <ListCheckBox item={item} round={true} index={index} selectPronoun={selectPronoun} setSelectPronoun={setSelectPronoun} />}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ marginTop: metrics.hp2, paddingBottom: metrics.hp20, paddingHorizontal: metrics.hp2 }}
                    showsVerticalScrollIndicator={false}
                />
                <PurpuleButton title={"Apply"} />
            </RBSheet>
            <Modal
                animationType="slide"
                transparent={true}
                statusBarTranslucent
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}>
                <PreviewDetails data={profileData} setModalVisible={setModalVisible}
                    setSwipeUp={setSwipeUp} modalVisible={modalVisible}
                    setSwipeRight={setSwipeRightProxy}
                    setSwipeLeft={setSwipeLeftProxy}
                    setProfileData={setProfileData}
                    discover={true}
                    setSuperLikeVisible={setSuperLikeVisible}
                    canSuperLike={canSuperLike} />
            </Modal>
            <Modal
                animationType="fade"
                transparent={true}
                visible={superLikeVisible}
                onRequestClose={() => setSuperLikeVisible(false)}>
                <SuperLikeScreen data={profileData} setSuperLikeVisible={setSuperLikeVisible}
                    setSwipeUp={setSwipeUp} ref={ref} />
            </Modal>
            <Animated2.View pointerEvents="none" style={[styles.dislikeFxOverlay, dislikeOverlayStyle]}>
                <Animated2.View style={dislikeIconAnimatedStyle}>
                    <FastImage source={disLikeNewIcon} tintColor={colors.black} resizeMode="contain" style={styles.dislikeFxIcon} />
                </Animated2.View>
            </Animated2.View>
            <Animated2.View pointerEvents="none" style={[styles.likeFxOverlay, likeOverlayStyle]}>
                <Animated2.View style={likeIconAnimatedStyle}>
                    <FastImage source={likeNewICon} tintColor={colors.black} resizeMode="contain" style={styles.likeFxIcon} />
                </Animated2.View>
            </Animated2.View>
        </AppSafeAreaView>
    );
};

export default DiscoverScreen;

const styles = StyleSheet.create({
    recommonedIcon: {
        height: metrics.hp2,
        width: metrics.hp2,
    },
    discoverImage: {
        height: metrics.hp38,
        width: ITEM_WIDTH,
        borderRadius: metrics.hp1_5,
    },
    bottomDetails: {
        marginLeft: metrics.hp2,
        marginBottom: metrics.hp3,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    newdetails: {
        paddingHorizontal: metrics.hp1
    },
    blueTikIcon: {
        height: metrics.hp2_5,
        width: metrics.hp2_5,
        marginTop: metrics.hp0_5,
    },
    loctionIcon: {
        height: metrics.hp2,
        width: metrics.hp2,
    },
    wrapContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: metrics.hp1,
        marginTop: metrics.hp1,
        marginBottom: -metrics.hp1
    },
    listContainer: {
        height: metrics.hp3,
        paddingHorizontal: metrics.hp1_6,
        borderRadius: metrics.hp4,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.brownBack,
        flexDirection: "row",
    },
    icons: {
        height: metrics.hp1_6,
        width: metrics.hp1_6,
    },
    flasContaier: {
        height: metrics.hp5,
        width: metrics.hp5,
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
    flasIcon: {
        height: metrics.hp3_5,
        width: metrics.hp3_5,
    },
    containerBottom: {
        backgroundColor: colors.darkWhite,
    },
    simlierImage: {
        height: metrics.hp25,
        width: metrics.hp20,
        borderRadius: metrics.hp1_5,
    },
    wrapContainerTwo: {
        marginTop: metrics.hp1,
        paddingHorizontal: metrics.hp2,
        marginBottom: metrics.hp2
    },
    containerSelect: {
        height: metrics.hp3,
        paddingHorizontal: metrics.hp1_6,
        borderRadius: metrics.hp4,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.green,
        flexDirection: "row",
    },
    closeIcon: {
        height: metrics.hp2_5,
        width: metrics.hp2_5,
    },
    filterIcon: {
        height: metrics.hp2_5,
        width: metrics.hp2_5
    },
    filterButton: {
        height: metrics.hp3,
        width: metrics.hp3,
        borderRadius: metrics.hp50,
        backgroundColor: colors.white,
        alignItems: "center",
        justifyContent: "center",
        marginTop: -metrics.hp1,
        marginLeft: metrics.hp2,
        marginRight: metrics.hp2,
        padding: metrics.hp1
    },
    closeIconTwo: {
        height: metrics.hp4,
        width: metrics.hp4,
    },
    headerRB: {
        height: metrics.hp5_5,
        backgroundColor: colors.nanoOpecity,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: metrics.hp2,
        justifyContent: "space-between"
    },
    activeContainer: { height: metrics.hp2, paddingHorizontal: metrics.hp1, flexDirection: "row", alignItems: "center", borderRadius: metrics.hp5, backgroundColor: "#FFFFFF33", marginTop: metrics.hp0_5, width: metrics.hp8 },
    activeBackground: { height: metrics.hp1_2, width: metrics.hp1_2, borderWidth: metrics.hp0_1, borderColor: "#28EC594D", backgroundColor: "#28EC591A", borderRadius: metrics.hp20, alignItems: "center", justifyContent: "center", marginRight: metrics.hp0_3 },
    activeDot: { height: metrics.hp0_8, width: metrics.hp0_8, backgroundColor: "#28EC59", borderRadius: metrics.hp50 },
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
});

import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, GestureResponderEvent, Modal, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import Animated, {
    Extrapolation,
    SharedValue,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';

import { AppSafeAreaView } from '../../common/AppSafeAreaView';
import { TouchableOpacityView } from '../../common/TouchableOpacityView';
import {
    AppText,
    fontSize,
    FORTEEN,
    INTER_BOLD,
    INTER_MEDIUM,
    INTER_SEMI_BOLD,
    OPECITY_DARK,
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
import { blueTikeIcon, bussinessIcon, disLikeNewIcon, flashIcon, likeNewICon, locationCIon } from '../../helper/ImageAssets';
import PeopleHeader from '../../common/PeopleHeader';
import { useBoostTimer } from '../../hooks/useBoostTimer';
import NavigationService from '../../navigation/NavigationService';
import { NAVIGATION_PROFILE_BOOST_PURCHASE_SCREEN } from '../../navigation/routes';
import { setGetProfile, setListProfiles } from '../../slices/loginServices/authSlice';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';
import { appOperation } from '../../appOperation';
import PulsingCircle from '../../common/PulsingCircle';
import PreviewDetails from './PreviewDetails';
import { viewProfileICon } from '../../helper/ImageAssets';
import { NAVIGATION_SUPERLIKE_PURCHESE_SCREEN } from '../../navigation/routes';

const { width, height } = Dimensions.get('window');

const CARD_WIDTH = width * 0.90;
const CARD_HEIGHT = height * 0.75;
const SIDE_PEEK = width * 0.01;
const STEP = CARD_WIDTH - SIDE_PEEK;
const TRANSITION_MS = 320;

type SwipeType = 'dislike' | 'like' | 'superLike';


const NewHomeScreen = () => {
    const dispatch = useDispatch();
    const listProfilesData = useSelector((state: any) => state.auth.listProfiles ?? []);
    const userData = useSelector((state: any) => state.auth.userData);
    const [boostModalVisible, setBoostModalVisible] = useState(false);
    const [isBoostActivating, setIsBoostActivating] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const activeIndex = useSharedValue(0);

    useEffect(() => {
        const maxIndex = Math.max(listProfilesData.length - 1, 0);
        if (currentIndex > maxIndex) {
            setCurrentIndex(maxIndex);
            activeIndex.value = maxIndex;
        }
    }, [activeIndex, currentIndex, listProfilesData.length]);

    const handleNext = useCallback(
        (type: SwipeType) => {
            const current = listProfilesData[currentIndex];
            if (!current) return;

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
                }
            });
        },
        [activeIndex, currentIndex, dispatch, listProfilesData]
    );

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
                    FastImage.preload([{ uri: targetImageUrl, priority: FastImage.priority.high }]);

                    if (newIndex > 0 && p.gallery[newIndex - 1]?.url) {
                        FastImage.preload([{ uri: p.gallery[newIndex - 1].url, priority: FastImage.priority.normal }]);
                    }
                    if (newIndex < totalImages - 1 && p.gallery[newIndex + 1]?.url) {
                        FastImage.preload([{ uri: p.gallery[newIndex + 1].url, priority: FastImage.priority.normal }]);
                    }
                }

                return { ...p, index: newIndex };
            });

            dispatch(setListProfiles(updatedProfiles));
        },
        [dispatch, listProfilesData]
    );

    useEffect(() => {
        if (!listProfilesData?.length) return;

        listProfilesData.forEach((profile: any) => {
            if (!profile?.gallery?.length) return;
            const currentIdx = profile.index || 0;
            const gallery = profile.gallery;

            const urls = [
                gallery[currentIdx]?.url,
                currentIdx > 0 ? gallery[currentIdx - 1]?.url : null,
                currentIdx < gallery.length - 1 ? gallery[currentIdx + 1]?.url : null,
            ].filter(Boolean) as string[];

            urls.forEach((url) => {
                FastImage.preload([{ uri: url, priority: FastImage.priority.normal }]);
            });
        });
    }, [listProfilesData]);

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

    // PreviewDetails triggers actions using these "swipe" setter props.
    // Since NewHomeScreen moves via button presses, proxy those setters to handleNext().
    const setSwipeRightProxy = useCallback(
        (val: boolean) => {
            if (!val) return;
            setModalVisible(false);
            handleNext('like');
        },
        [handleNext]
    );

    const setSwipeLeftProxy = useCallback(
        (val: boolean) => {
            if (!val) return;
            setModalVisible(false);
            handleNext('dislike');
        },
        [handleNext]
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

    const ProfileCard = memo(function ProfileCard({
        profile,
        index,
        activeIndex,
        onImageTap,
        onOpenPreview,
    }: {
        profile: any;
        index: number;
        activeIndex: SharedValue<number>;
        onImageTap: (evt: GestureResponderEvent, profile: any) => void;
        onOpenPreview: (profile: any) => void;
    }) {
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

        const currentImageIndex = profile?.index || 0;
        const gallery = profile?.gallery || [];
        const currentImage = gallery[currentImageIndex];
        const prevImage = currentImageIndex > 0 ? gallery[currentImageIndex - 1] : null;
        const nextImage = currentImageIndex < gallery.length - 1 ? gallery[currentImageIndex + 1] : null;

        return (
            <Animated.View style={[styles.card, animatedStyle]}>
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={(evt) => onImageTap(evt, profile)}
                    style={styles.imageTapArea}
                >
                    <View style={styles.imageContainer}>
                        {prevImage?.url ? (
                            <FastImage
                                source={{ uri: prevImage.url }}
                                style={styles.hiddenImage}
                                resizeMode={FastImage.resizeMode.cover}
                            />
                        ) : null}
                        {nextImage?.url ? (
                            <FastImage
                                source={{ uri: nextImage.url }}
                                style={styles.hiddenImage}
                                resizeMode={FastImage.resizeMode.cover}
                            />
                        ) : null}
                        {currentImage?.url ? (
                            <FastImage
                                source={{ uri: currentImage.url, priority: FastImage.priority.high }}
                                style={styles.image}
                                resizeMode={FastImage.resizeMode.cover}
                            />
                        ) : (
                            <View style={[styles.image, styles.imageFallback]} />
                        )}
                    </View>
             
                </TouchableOpacity>
                <View
                    pointerEvents="none"
                    style={{
                    height: metrics.hp4, borderWidth: 0.1, borderColor: colors.white, flexDirection: "row", alignItems: "center", borderRadius: metrics.hp6, justifyContent: "space-between",
                    position: "absolute", top: metrics.hp1,
                    overflow: "hidden",
                    alignSelf: "center",
                    paddingHorizontal: metrics.hp0_4
                }}>
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
                                    style={{ height: metrics.hp3, width: metrics.hp3, borderRadius: metrics.hp50, borderWidth:thumbIdx === (profile?.index ?? 0) ?  metrics.hp0_1 : 0, borderColor:colors.white }}
                                />
                                {!isLast ? <AppText> </AppText> : null}
                            </React.Fragment>
                        );
                    })}
                </View>
                <LinearGradient start={{ x: 1, y: 1 }}
                    end={{ x: 1, y: 0 }} colors={Platform.OS === "ios" ? ["#00000090", "#00000040", "#00000000"] : ["#000000", "#00000099", "#00000000"]}
                    style={{ height: metrics.hp30, width: "100%", position: "absolute", bottom: 0, alignItems: "center", justifyContent: "center" }}>
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
                        <AppText style={{ fontWeight: "700", fontSize:fontSize(28) }}  color={WHITE} weight={INTER_BOLD}>
                            {profile?.name ?? 'Unknown'}, {profile?.age ?? '--'}
                        </AppText>
                        <FastImage source={blueTikeIcon} style={styles.blueTickIcon} resizeMode="contain" />
                    </View>

                    <View style={[styles.metaRow,{marginTop:metrics.hp0_5}]}>
                        <FastImage source={locationCIon} style={styles.metaIcon} resizeMode="contain" />
                        <AppText type={THIRTEEN} color={WHITE} weight={INTER_BOLD}>
                            {'  '}
                            {profile?.distanceInKm ? `${profile.distanceInKm} Km away` : 'Nearby'}
                        </AppText>
                    </View>

                    {!!profile?.work ? (
                        <View style={[styles.metaRow,{marginTop:metrics.hp1}]}>
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
                    >
                        <AppText color={WHITE} type={THIRTEEN}>
                            View Profile{'  '}
                        </AppText>
                        <FastImage source={viewProfileICon} resizeMode="contain" style={styles.viewProfileIcon} />
                    </TouchableOpacityView>

                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "95%", position: "absolute", bottom: metrics.hp1 }}>
                        <TouchableOpacityView onPress={() => handleNext("dislike")}
                            style={{
                                height: metrics.hp7,
                                width: metrics.hp7,
                                borderRadius: metrics.hp50,
                                overflow: 'hidden',
                            }}>
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
                                }}>
                                <FastImage
                                    source={disLikeNewIcon}
                                    resizeMode="contain"
                                    style={{ height: metrics.hp3, width: metrics.hp3 }}
                                />
                            </View>
                        </TouchableOpacityView>
                        <TouchableOpacityView onPress={() => handleNext("like")}
                            style={{
                                height: metrics.hp7,
                                width: metrics.hp7,
                                borderRadius: metrics.hp50,
                                overflow: 'hidden',
                            }}>
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

            </Animated.View>
        );
    });

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
                    {hasProfiles ? (
                        <View style={styles.carouselLayer}>
                            {listProfilesData.map((profile: any, index: number) => (
                                <ProfileCard
                                    key={profile?._id ?? `profile-${index}`}
                                    profile={profile}
                                    index={index}
                                    activeIndex={activeIndex}
                                    onImageTap={handleTap}
                                    onOpenPreview={(p) => {
                                        setModalVisible(true);
                                    }}
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
                            {userData?.globalSearch === false &&
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
                            }
                        </>
                    )}
                </View>
            </View>

            <Modal
                animationType="fade"
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
                    setProfileData={() => {}}
                    setSuperLikeVisible={setSuperLikeVisibleProxy}
                    canSuperLike={canSuperLike}
                />
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
        borderRadius: metrics.hp3_7,
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
        marginTop: metrics.hp0_5,
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
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: metrics.hp12,
        height: metrics.hp5,
        borderRadius: metrics.hp50,
        borderWidth: metrics.hp0_1,
        borderColor: '#FFFFFF4D',
        backgroundColor: '#00000033',
        marginTop: metrics.hp1,
        paddingHorizontal: metrics.hp1,
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
});


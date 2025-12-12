import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { AppText, ELEVEN, INTER_BOLD, INTER_MEDIUM, TWENTY_TWO, WHITE } from '../../common/AppText';
import { blueTikeIcon, bussinessIcon, CloseBlueIcon, flashIcon, heartGreen, heartRed, locationCIon, nopeIcon, shareRedIcon, superlike, upArrowIcon, yesIcon } from '../../helper/ImageAssets';
import metrics from '../../assets/Metrics';
import FastImage from 'react-native-fast-image';
import { colors } from '../../theme/colors';
import { Screen } from '../../theme/dimens';
import { TouchableOpacityView } from '../../common/TouchableOpacityView';
import LinearGradient from 'react-native-linear-gradient';
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

const { width, height } = Dimensions.get("window");
const FULL_IMAGE_HEIGHT = height * 0.75;
const PeopleScreen = () => {
    const dispatch = useDispatch();
    const ref = useRef<SwiperCardRefType>();
    const IsFocused = useIsFocused();
    const listProfilesData = useSelector((state: any) => state.auth.listProfiles);
    const userData = useSelector((state: any) => state.auth.userData);
    const position: any = useRef(new Animated.ValueXY()).current;
    const [getCurrentIndex, setGetCurrentIndex] = useState(0);
    const [modalVisible, setModalVisible] = useState(false)
    const [swipeRight, setSwipeRight] = useState(false);
    const [swipeLeft, setSwipeLeft] = useState(false);
    const [swipeUp, setSwipeUp] = useState(false);
    const [matchVisible, setMatchVisible] = useState(false);
    const [superLikeVisible, setSuperLikeVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
    const [matchData, setMatchData] = useState([]);
    const cardWidthRef = useRef(0);
    const url = `http://13.201.74.29/?userId=${userData?._id}`
    const socket = useMemo(() => createSocket(url), [url]);
    useEffect(() => {
        socket.on('connect', () => {
            console.log('Socket connected ✅', socket.id);
        });
        socket.on('newMatch', (response) => {
            if (response) {
                setMatchVisible(true)
                setMatchData(response?.matchData)
            }
        });
    }, [])
    const nopeColor = position.x.interpolate({
        inputRange: [-width / 2, 0],
        outputRange: [colors.purple, colors.white],
        extrapolate: "clamp",
    });
    const nopeColorImage = position.x.interpolate({
        inputRange: [-width / 2, 0],
        outputRange: [colors.white, colors.purple],
        extrapolate: "clamp",
    });
    const yesColor = position.x.interpolate({
        inputRange: [0, width / 2],
        outputRange: [colors.white, colors.singleButtonGreen],
        extrapolate: 'clamp',
    });
    const yesImage = position.x.interpolate({
        inputRange: [0, width / 2],
        outputRange: [colors.singleButtonGreen, colors.white],
        extrapolate: 'clamp',
    });
    useEffect(() => {
        dispatch(getProfile(true))
        dispatch(listProfiles(true));
    }, [IsFocused])
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
            <View style={{ backgroundColor: "red", top: metrics.hp25, opacity:0 }}>
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
                return { ...p, index: newIndex };
            }
            return p;
        });
        dispatch(setListProfiles(updatedProfiles));
    };
    const renderCard = ((profile: any, index: any) => {
        return (
            <View style={styles.card}>
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={(evt) => handleTap(evt, profile)}
                    onLayout={(e) => {
                        const layout = e?.nativeEvent?.layout;
                        if (layout?.width) cardWidthRef.current = layout.width;
                    }}>
                    <FastImage
                        source={{ uri: profile?.gallery?.[profile?.index]?.url }}
                        style={[styles.image, { height: FULL_IMAGE_HEIGHT }]}
                        resizeMode="cover"
                    />
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
            const timer = setTimeout(() => {
                ref.current?.swipeRight();
                setSwipeRight(false)
            }, 200);
            return () => clearTimeout(timer);
        } else if (!modalVisible && swipeLeft) {
            const timer = setTimeout(() => {
                ref.current?.swipeLeft();
                setSwipeLeft(false)
            }, 200);
            return () => clearTimeout(timer);
        } else if (!modalVisible && swipeUp) {
            const timer = setTimeout(() => {
                ref.current?.swipeTop();
                setSwipeUp(false);
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [swipeRight, modalVisible, swipeLeft, swipeUp])
    const swipeFunction = async (index: any, swipe: any) => {
        if (swipe === "like") {
            setGetCurrentIndex(index + 1);
            let data = {
                "swipedId": listProfilesData[index]?._id,
                "type": "like"
            };
            dispatch(swipeLikeDisLike(data));
        } else if (swipe === "superLike") {
            console.log("i am there for you")
            setGetCurrentIndex(getCurrentIndex + 1);
            let datanew = {
                "swipedId": listProfilesData[index]?._id,
                "type": "superLike"
            };
            dispatch(swipeLikeDisLike(datanew));
            setSuperLikeVisible(false);
        } else if (swipe === "dislike") {
            setGetCurrentIndex(index + 1);
            let data = {
                "swipedId": listProfilesData[index]?._id,
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
                    <PeopleHeader profile={false} useName={true} />
                </View>
                {/* <View style={{flex:1, backgroundColor:colors.red, zIndex:10, position:"absolute"}}/> */}
                <View style={styles.swiperContainer}>
                    {listProfilesData?.length === getCurrentIndex &&
                        <View style={{ alignItems: "center", justifyContent: "center", flex: 1, marginTop: -metrics.hp5 }}>
                            <PulsingCircle size={metrics.hp12} />
                            <FastImage resizeMode='cover' style={styles.emptyImage} source={{ uri: userData?.gallery[0]?.url }} />
                        </View>}
                    {listProfilesData?.length !== getCurrentIndex &&
                        <Swiper
                            ref={ref}
                            data={listProfilesData} 
                            cardStyle={styles.cardStyle}
                            overlayLabelContainerStyle={styles.overlayLabelContainerStyle}
                            renderCard={renderCard}
                            disableBottomSwipe
                            disableTopSwipe
                            OverlayLabelRight={OverlayLabelRight}
                            OverlayLabelLeft={OverlayLabelLeft}
                            OverlayLabelTop={OverlayLabelTop}
                            onSwipeRight={(index) => swipeFunction(index, "like")}
                            onSwipeLeft={(index) => swipeFunction(index, "dislike")}
                            onSwipeTop={(index) => swipeFunction(index, "superLike")}
                            onSwipeActive={()=>console.log("askjdhakjdsahaksjhdjkahdkshas")}
                           
                        />}
                </View>
                <View style={styles.likeUnLikeCOntainer}>
                    <View style={styles.flasContaier}>
                        <FastImage source={flashIcon} resizeMode="contain" style={styles.flasIcon} />
                    </View>
                    <Animated.View style={[styles.unlickContainer, { backgroundColor: nopeColor }]} >
                        <TouchableOpacityView onPress={() => {
                            ref.current?.swipeLeft();
                        }}>
                            <Animated.Image source={CloseBlueIcon} resizeMode="contain" style={[styles.flasIconClose, {
                                tintColor: nopeColorImage
                            }]} />
                        </TouchableOpacityView>
                    </Animated.View>
                    <View style={styles.flasContaier}>
                        <TouchableOpacityView onPress={() => {
                            setSuperLikeVisible(true)
                        }}>
                            <FastImage source={heartRed} resizeMode="contain" style={styles.flasIcon} />
                        </TouchableOpacityView>
                    </View>
                    <Animated.View style={[styles.unlickContainer, { backgroundColor: yesColor }]} >
                        <TouchableOpacityView onPress={() => {
                            ref.current?.swipeRight();
                        }}>
                            <Animated.Image source={heartGreen} resizeMode="contain" style={[styles.flasIconClose, {
                                tintColor: yesImage
                            }]} />
                        </TouchableOpacityView>
                    </Animated.View>
                    <View style={styles.flasContaier}>
                        <FastImage source={shareRedIcon} resizeMode="contain" style={styles.flasIcon} />
                    </View>
                </View>
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}>
                    <PreviewDetails data={listProfilesData[getCurrentIndex]} setModalVisible={setModalVisible}
                        setSwipeRight={setSwipeRight}
                        setSwipeLeft={setSwipeLeft}
                        setSwipeUp={setSwipeUp} modalVisible={modalVisible} ref={ref}
                        ImageIndex={currentImageIndex}
                        CurrentImageIndex={setCurrentImageIndex}
                        setSuperLikeVisible={setSuperLikeVisible} />
                </Modal>
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={matchVisible}
                    onRequestClose={() => setMatchVisible(false)}>
                    <MatchScreen setMatchVisible={setMatchVisible} matchData={matchData} />
                </Modal>
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={superLikeVisible}
                    onRequestClose={() => setSuperLikeVisible(false)}>
                    <SuperLikeScreen data={listProfilesData[getCurrentIndex]} setSuperLikeVisible={setSuperLikeVisible} setGetCurrentIndex={setGetCurrentIndex}
                        setSwipeUp={setSwipeUp} ref={ref} getCurrentIndex={getCurrentIndex} />
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
    image: {
        borderRadius: metrics.hp2,
        width: "100%",
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
        backgroundColor: "#fff",
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


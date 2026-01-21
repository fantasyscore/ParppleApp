import React, { useEffect, useMemo, useRef, useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { Dimensions, Image, ImageBackground, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import PeopleHeader from "../../common/PeopleHeader";
import FastImage from "react-native-fast-image";
import metrics from "../../assets/Metrics";
import { colors } from "../../theme/colors";
import { CloseBlueIcon, flashIcon, heartGreen, heartRed, shareRedIcon, superlikeiconwhite, upArrowIcon } from "../../helper/ImageAssets";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import NavigationService from "../../navigation/NavigationService";
import { Screen } from "../../theme/dimens";
import { useDispatch, useSelector } from "react-redux";
import { setListProfiles } from "../../slices/loginServices/authSlice";
import ProfileBottomDetails from "./ProfileBottomDetail";
import LinearGradient from "react-native-linear-gradient";
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from "react-native-svg";
import { NAVIGATION_CRUSH_PURCHESE_SCREEN, NAVIGATION_SUPERLIKE_PURCHESE_SCREEN } from "../../navigation/routes";
import CrushNotesSender from "./CrushNotesSender";

const { width, height } = Dimensions.get("window");
const COLLAPSED_IMAGE_HEIGHT = height * 0.67;
const PreviewDetails = ({ data, setModalVisible, setSwipeRight, setSwipeUp, setSwipeLeft, setProfileData, discover, setSuperLikeVisible, canSuperLike }: any) => {
    const dispatch = useDispatch();
    const cardWidthRef = useRef(0);
    const listProfilesData = useSelector((state: any) => state.auth.listProfiles);
    const userData = useSelector((state: any) => state.auth.userData);
    const [crushNotesVisible, setCrushNotesVisible] = useState(false);

    const crushNotesRemaining = useMemo(() => {
        const n = Number(userData?.crushNotesRemaining);
        return Number.isFinite(n) ? n : 0;
    }, [userData?.crushNotesRemaining]);
    const handleTap = (evt: any, profile: any) => {
        const totalImages = profile?.gallery?.length || 0;
        if (!evt?.nativeEvent?.locationX || !cardWidthRef.current) return;
        const x = evt.nativeEvent.locationX;
        if (discover) {
            let newIndex = profile.index || 0;
            if (x > cardWidthRef.current / 2) {
                newIndex = newIndex < totalImages - 1 ? newIndex + 1 : newIndex;
            } else {
                newIndex = newIndex > 0 ? newIndex - 1 : newIndex;
            }
            
            // Preload images when index changes
            if (newIndex !== profile.index && profile.gallery && profile.gallery[newIndex]?.url) {
                const targetImageUrl = profile.gallery[newIndex].url;
                FastImage.preload([{ uri: targetImageUrl, priority: FastImage.priority.high }]);
                
                if (newIndex > 0 && profile.gallery[newIndex - 1]?.url) {
                    FastImage.preload([{ uri: profile.gallery[newIndex - 1].url, priority: FastImage.priority.normal }]);
                }
                if (newIndex < totalImages - 1 && profile.gallery[newIndex + 1]?.url) {
                    FastImage.preload([{ uri: profile.gallery[newIndex + 1].url, priority: FastImage.priority.normal }]);
                }
            }
            
            const updatedObject = { ...profile, index: newIndex };
            setProfileData(updatedObject);
        } else {
            const updatedProfiles = listProfilesData.map((p: any) => {
                if (p._id === profile._id) {
                    let newIndex = p.index || 0;
                    if (x > cardWidthRef.current / 2) {
                        newIndex = newIndex < totalImages - 1 ? newIndex + 1 : newIndex;
                    } else {
                        newIndex = newIndex > 0 ? newIndex - 1 : newIndex;
                    }
                    
                    // Preload images when index changes
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
        }
    };
    const scrollViewRef: any = useRef(null);

    // Preload images when component mounts or data changes
    useEffect(() => {
        if (data?.gallery && data.gallery.length > 0) {
            const currentIndex = data.index || 0;
            const gallery = data.gallery;
            
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
    }, [data]);

    return (
        <AppSafeAreaView>
            <PeopleHeader profile={false} userName={true} name={discover ? data?.firstName : data?.name} age={data?.age} />
            <ScrollView
                ref={scrollViewRef}
                style={styles.container}
                contentContainerStyle={{ paddingBottom: metrics.hp20, flexGrow: 1 }}
                showsVerticalScrollIndicator={false}>

                <TouchableOpacityView
                    activeOpacity={1}
                    onPress={(evt) => handleTap(evt, data)}
                    delayPressIn={0}
                    onLayout={(e) => {
                        const layout = e?.nativeEvent?.layout;
                        if (layout?.width) cardWidthRef.current = layout.width;
                    }}>
                    <ImageBackground
                        imageStyle={{ borderRadius: metrics.hp2 }}
                        source={{ uri: data?.gallery?.[data?.index]?.url }}
                        style={[styles.image, { height: COLLAPSED_IMAGE_HEIGHT }]}
                        resizeMode="cover">
                        <View style={styles.paginationContainer}>
                            {data?.gallery?.map((_: any, i: number) => (
                                <View
                                    key={i}
                                    style={[
                                        styles.paginationBar,
                                        {
                                            opacity: i === data?.index ? 1 : 0.3,
                                            backgroundColor:
                                                i === data?.index ? colors.white : "gray",
                                        },
                                    ]}
                                />
                            ))}
                        </View>
                        <TouchableOpacityView
                            style={styles.flasContaierTwo}
                            onPress={() => {
                                if ((crushNotesRemaining ?? 0) <= 0) {
                                    NavigationService.navigate(NAVIGATION_CRUSH_PURCHESE_SCREEN);
                                    return;
                                }
                                setCrushNotesVisible(true);
                            }}
                        >
                            <FastImage source={shareRedIcon} resizeMode="contain" style={styles.flasIcon} />
                        </TouchableOpacityView>
                        <TouchableOpacityView style={styles.upArrowContainer} onPress={() => {setModalVisible(false),setSwipeUp(false)}}>
                            <FastImage
                                source={upArrowIcon}
                                resizeMode="contain"
                                style={styles.uparrowIcon}
                            />
                        </TouchableOpacityView>
                    </ImageBackground>
                </TouchableOpacityView>
                <ProfileBottomDetails visibleCards={data} discover={discover} setModalVisibleHome={setModalVisible} setSwipeLeft={setSwipeLeft}/>
            </ScrollView>
            <View style={styles.likeUnLikeCOntainer}>
                <View style={[styles.flasContaier, { opacity: 0 }]}>
                    <FastImage source={flashIcon} resizeMode="contain" style={styles.flasIcon} />
                </View>
                <View style={[styles.unlickContainer, { opacity: discover ? 0 : 1 }]} >
                    <Pressable
                        disabled={discover}
                        onPress={() => {
                            // Tinder-style: instant tap feedback reset + trigger swipe immediately (no timeouts)
                            scrollViewRef.current?.scrollTo({ y: 0, animated: false });
                            setModalVisible(false);
                            // Trigger swipe via the same lifecycle used by HomeScreen
                            setSwipeLeft(true);
                        }}
                        style={{ width: metrics.hp7_2, height: metrics.hp7_2, alignItems: "center", justifyContent: "center" }}
                    >
                        {({ pressed }) => (
                            <>
                                {pressed && (
                                    <LinearGradient
                                        colors={["#6F13F2", "#400B8C"]}
                                        start={{ x: 0.5, y: 0 }}
                                        end={{ x: 0.5, y: 1 }}
                                        style={StyleSheet.absoluteFill}
                                    />
                                )}
                                {pressed && (
                                    <Svg width="100%" height="100%" viewBox="0 0 100 100" style={StyleSheet.absoluteFill}>
                                        <Defs>
                                            <SvgLinearGradient id="nopeBorderPreview" x1="0" y1="0.5" x2="1" y2="0.5">
                                                <Stop offset="0" stopColor="#6F13F2" />
                                                <Stop offset="1" stopColor="#400B8C" />
                                            </SvgLinearGradient>
                                        </Defs>
                                        <Circle cx="50" cy="50" r="48" fill="none" stroke="url(#nopeBorderPreview)" strokeWidth="3" />
                                    </Svg>
                                )}
                                <View style={{ width: metrics.hp4, height: metrics.hp4 }}>
                        <Image source={CloseBlueIcon} resizeMode="contain" style={styles.flasIconClose} />
                                    {pressed && (
                                        <Image
                                            source={CloseBlueIcon}
                                            resizeMode="contain"
                                            style={[styles.flasIconClose, { position: "absolute", top: 0, left: 0, tintColor: colors.white }]}
                                        />
                                    )}
                                </View>
                            </>
                        )}
                    </Pressable>
                </View>
                <View style={styles.flasContaier}>
                    <Pressable
                        onPress={() => {
                            // If user has 0 superlikes -> go to purchase
                            if (canSuperLike && !canSuperLike()) {
                                NavigationService.navigate(NAVIGATION_SUPERLIKE_PURCHESE_SCREEN);
                            return;
                        }
                            scrollViewRef.current?.scrollTo({ y: 0, animated: false });
                            setSuperLikeVisible(true);
                            setModalVisible(false);
                        }}
                        style={{ width: metrics.hp6_5, height: metrics.hp6_5, alignItems: "center", justifyContent: "center" }}
                    >
                        {({ pressed }) => (
                            <>
                                {pressed && (
                                    <LinearGradient
                                        colors={["#FF1A00", "#991000"]}
                                        start={{ x: 0.5, y: 0 }}
                                        end={{ x: 0.5, y: 1 }}
                                        style={StyleSheet.absoluteFill}
                                    />
                                )}
                                {pressed && (
                                    <Svg width="100%" height="100%" viewBox="0 0 100 100" style={StyleSheet.absoluteFill}>
                                        <Circle cx="50" cy="50" r="48" fill="none" stroke="#FF0000" strokeWidth="3" />
                                    </Svg>
                                )}
                                <View style={{ width: metrics.hp3_5, height: metrics.hp3_5 }}>
                        <FastImage source={heartRed} resizeMode="contain" style={styles.flasIcon} />
                                    {pressed && (
                                        <FastImage
                                            source={superlikeiconwhite}
                                            resizeMode="contain"
                                            style={[styles.flasIcon, { position: "absolute", top: 0, left: 0 }]}
                                        />
                                    )}
                                </View>
                            </>
                        )}
                    </Pressable>
                </View>
                <View style={[styles.unlickContainer, { opacity: discover ? 0 : 1 }]} >
                    <Pressable
                        disabled={discover}
                        onPress={() => {
                            scrollViewRef.current?.scrollTo({ y: 0, animated: false });
                            setModalVisible(false);
                            setSwipeRight(true);
                        }}
                        style={{ width: metrics.hp7_2, height: metrics.hp7_2, alignItems: "center", justifyContent: "center" }}
                    >
                        {({ pressed }) => (
                            <>
                                {pressed && (
                                    <LinearGradient
                                        colors={["#CCF63D", "#779024"]}
                                        start={{ x: 0.5, y: 0 }}
                                        end={{ x: 0.5, y: 1 }}
                                        style={StyleSheet.absoluteFill}
                                    />
                                )}
                                {pressed && (
                                    <Svg width="100%" height="100%" viewBox="0 0 100 100" style={StyleSheet.absoluteFill}>
                                        <Defs>
                                            <SvgLinearGradient id="likeBorderPreview" x1="0" y1="0.5" x2="1" y2="0.5">
                                                <Stop offset="0" stopColor="#C7FF09" />
                                                <Stop offset="1" stopColor="#8FB800" />
                                            </SvgLinearGradient>
                                        </Defs>
                                        <Circle cx="50" cy="50" r="48" fill="none" stroke="url(#likeBorderPreview)" strokeWidth="3" />
                                    </Svg>
                                )}
                                <View style={{ width: metrics.hp4, height: metrics.hp4 }}>
                        <Image source={heartGreen} resizeMode="contain" style={styles.flasIconClose} />
                                    {pressed && (
                                        <Image
                                            source={heartGreen}
                                            resizeMode="contain"
                                            style={[styles.flasIconClose, { position: "absolute", top: 0, left: 0, tintColor: colors.white }]}
                                        />
                                    )}
                                </View>
                            </>
                        )}
                    </Pressable>
                </View>
                <View style={[styles.flasContaier, { opacity: 0 }]}>
                    <FastImage source={shareRedIcon} resizeMode="contain" style={styles.flasIcon} />
                </View>
            </View>

            {/* Crush Notes: send directly from PreviewDetails (Home + Discover) */}
            <Modal
                animationType="slide"
                visible={crushNotesVisible}
                statusBarTranslucent
                onRequestClose={() => setCrushNotesVisible(false)}
            >
                <CrushNotesSender
                    data={data}
                    setModalVisible={setCrushNotesVisible}
                    setSwipeRight={setSwipeRight}
                    setSwipeLeft={setSwipeLeft}
                    setSwipeUp={setSwipeUp}
                    setProfileData={setProfileData}
                    discover={discover}
                    setSuperLikeVisible={setSuperLikeVisible}
                    canSuperLike={canSuperLike}
                />
            </Modal>
        </AppSafeAreaView>
    )
};
export default PreviewDetails;
const styles = StyleSheet.create({
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
    container: {
        paddingHorizontal: metrics.hp1,
        paddingVertical: metrics.hp2,
        // flexGrow: 1
    },
    image: {
        borderRadius: metrics.hp2,
        width: "100%",
    },
    flasIcon: {
        height: metrics.hp3_5,
        width: metrics.hp3_5,
    },
    flasContaierTwo: {
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
        bottom: metrics.hp2,
        position: "absolute",
        left: metrics.hp2
    },
    uparrowIcon: {
        height: metrics.hp2_5,
        width: metrics.hp2_3,
        transform: [{ rotate: "180deg" }]
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
        bottom: metrics.hp2_3
    },
    likeUnLikeCOntainer: {
        bottom: metrics.hp2,
        position: "absolute",
        width: Screen.Width / 1.05,
        zIndex: 1,
        alignSelf: "center",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-evenly",
    },
    unlickContainer: {
        height: metrics.hp7_2,
        width: metrics.hp7_2,
        backgroundColor: colors.white,
        borderRadius: metrics.hp50,
        alignItems: "center",
        justifyContent: "center",
        overflow: Platform.OS === "ios" ? "visible": "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: metrics.hp1,
        elevation: metrics.hp0_5,
    },
    flasIconClose: {
        height: metrics.hp4,
        width: metrics.hp4,
    },
    flasContaier: {
        height: metrics.hp6_5,
        width: metrics.hp6_5,
        backgroundColor: colors.white,
        borderRadius: metrics.hp50,
        alignItems: "center",
        justifyContent: "center",
        overflow: Platform.OS === "ios" ? "visible": "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: metrics.hp1,
        elevation: metrics.hp0_5,
    },
})
import React, { useRef } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { Dimensions, Image, ImageBackground, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import PeopleHeader from "../../common/PeopleHeader";
import FastImage from "react-native-fast-image";
import metrics from "../../assets/Metrics";
import { colors } from "../../theme/colors";
import { CloseBlueIcon, flashIcon, heartGreen, heartRed, shareRedIcon, upArrowIcon } from "../../helper/ImageAssets";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import NavigationService from "../../navigation/NavigationService";
import { Screen } from "../../theme/dimens";
import { useDispatch, useSelector } from "react-redux";
import { setListProfiles } from "../../slices/loginServices/authSlice";
import ProfileBottomDetails from "./ProfileBottomDetail";

const { width, height } = Dimensions.get("window");
const COLLAPSED_IMAGE_HEIGHT = height * 0.67;
const PreviewDetails = ({ data, setModalVisible, setSwipeRight, setSwipeUp, setSwipeLeft, setProfileData, discover, setSuperLikeVisible }: any) => {
    const dispatch = useDispatch();
    const cardWidthRef = useRef(0);
    const listProfilesData = useSelector((state: any) => state.auth.listProfiles);
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
                    return { ...p, index: newIndex };
                }
                return p;
            });
            dispatch(setListProfiles(updatedProfiles));
        }
    };
    const scrollViewRef: any = useRef(null);

    return (
        <AppSafeAreaView style={{ marginTop: -metrics.hp4 }}>
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
                        <View style={styles.flasContaierTwo}>
                            <FastImage source={shareRedIcon} resizeMode="contain" style={styles.flasIcon} />
                        </View>
                        <TouchableOpacityView style={styles.upArrowContainer} onPress={() => {setModalVisible(false),setSwipeUp(false)}}>
                            <FastImage
                                source={upArrowIcon}
                                resizeMode="contain"
                                style={styles.uparrowIcon}
                            />
                        </TouchableOpacityView>
                    </ImageBackground>
                </TouchableOpacityView>
                <ProfileBottomDetails visibleCards={data} discover={discover}/>
            </ScrollView>
            <View style={styles.likeUnLikeCOntainer}>
                <View style={[styles.flasContaier, { opacity: 0 }]}>
                    <FastImage source={flashIcon} resizeMode="contain" style={styles.flasIcon} />
                </View>
                <View style={[styles.unlickContainer, { opacity: discover ? 0 : 1 }]} >
                    <TouchableOpacityView disabled={discover} onPress={() => {
                        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                        setTimeout(() => {
                            setModalVisible(false);
                            setSwipeLeft(true);
                        }, 350);
                    }}>
                        <Image source={CloseBlueIcon} resizeMode="contain" style={styles.flasIconClose} />
                    </TouchableOpacityView>
                </View>
                <View style={styles.flasContaier}>
                    <TouchableOpacityView onPress={() => {
                        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                        setTimeout(() => {
                            setSuperLikeVisible(true)
                            setModalVisible(false);
                            // setSwipeUp(true);
                        }, 350);
                    }}>
                        <FastImage source={heartRed} resizeMode="contain" style={styles.flasIcon} />
                    </TouchableOpacityView>
                </View>
                <View style={[styles.unlickContainer, { opacity: discover ? 0 : 1 }]} >
                    <TouchableOpacityView disabled={discover} onPress={() => {
                        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                        setTimeout(() => {
                            setModalVisible(false);
                            setSwipeRight(true);
                        }, 350);
                    }}>
                        <Image source={heartGreen} resizeMode="contain" style={styles.flasIconClose} />
                    </TouchableOpacityView>
                </View>
                <View style={[styles.flasContaier, { opacity: 0 }]}>
                    <FastImage source={shareRedIcon} resizeMode="contain" style={styles.flasIcon} />
                </View>
            </View>
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
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: metrics.hp1,
        elevation: metrics.hp0_5,
    },
})
import React, { useEffect, useRef, useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { Dimensions, Image, ImageBackground, Keyboard, StyleSheet, TextInput, View } from "react-native";
import { BackSuper, bigHeart, sendButton, singleGirlDummy, superLikeAnime } from "../../helper/ImageAssets";
import { Screen } from "../../theme/dimens";
import metrics from "../../assets/Metrics";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { colors } from "../../theme/colors";
import { AppText, BLACK, fontSize, FORTEEN, INTER_SEMI_BOLD, WHITE } from "../../common/AppText";
import { interMedium } from "../../theme/typography";
import RBSheet from "react-native-raw-bottom-sheet";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import FastImage from "react-native-fast-image";
import { useDispatch, useSelector } from "react-redux";

const SuperLikeScreen = ({ data, setSuperLikeVisible, setGetCurrentIndex, setSwipeUp, ref, getCurrentIndex }: any) => {

    const dispatch = useDispatch();
    const userData = useSelector((state: any) => state.auth.userData);
    const inputRef: any = useRef(null);
    const openMessageSheet: any = useRef(null);
    const profilesOpacity = useSharedValue(0);
    const profile1TranslateX = useSharedValue(-200);
    const profile2TranslateX = useSharedValue(200);
    const matchTextOpacity = useSharedValue(0);
    const profilesScale = useSharedValue(0.5);
    const matchTextTranslateY = useSharedValue(50);
    const [message, setMessage] = useState("")

    useEffect(() => {
        profilesOpacity.value = withTiming(1, { duration: 700 });
        profilesScale.value = withTiming(1, { duration: 700 });
        profile1TranslateX.value = withTiming(-20, { duration: 700 });
        profile2TranslateX.value = withTiming(20, { duration: 700 });
        matchTextOpacity.value = withDelay(1200, withTiming(1, { duration: 600 }));
        matchTextTranslateY.value = withDelay(1200, withTiming(0, { duration: 600 }));
    }, []);
    const animatedProfile1Style = useAnimatedStyle(() => ({
        opacity: profilesOpacity.value,
        transform: [
            { translateX: profile1TranslateX.value },
            { scale: profilesScale.value },
            { rotate: '-15deg' }
        ],
    }));
    const animatedProfile2Style = useAnimatedStyle(() => ({
        opacity: profilesOpacity.value,
        transform: [
            { translateX: profile2TranslateX.value },
            { scale: profilesScale.value },
            { rotate: '15deg' }
        ],
    }));
    const animatedMatchTextStyle = useAnimatedStyle(() => ({
        opacity: matchTextOpacity.value,
        transform: [{ translateY: matchTextTranslateY.value }],
    }));

    // useEffect(() => {
    //     const keyboardHideListener = Keyboard.addListener("keyboardDidHide", () => {
    //         // openMessageSheet?.current?.close();
    //     });
    //     return () => {
    //         keyboardHideListener.remove();
    //     };
    // }, []);

    const superLike = () => {
        setSwipeUp(true);
        setSuperLikeVisible(false)
    }
    return (
        <AppSafeAreaView statusColor={"red"}>
            <ImageBackground source={BackSuper} resizeMode="cover" style={{ height: Screen.Height, width: Screen.Width, alignItems: "center" }}>
                <View style={styles.profilesWrapper}>
                    <Animated.Image
                        source={{ uri: userData?.gallery[0]?.url }}
                        style={[styles.profileImage, animatedProfile1Style, styles.profile1Position]}
                    />
                    <Animated.Image
                        source={{ uri: data?.gallery[0]?.url }}
                        style={[styles.profileImage, animatedProfile2Style, styles.profile2Position]}
                    />
                </View>
                <View style={styles.textContainer}>
                    <Animated.Image source={superLikeAnime} resizeMode={'contain'} style={[styles.matchText, animatedMatchTextStyle]} />
                    <Animated.Text style={[styles.sendSuperLike, animatedMatchTextStyle]}>
                        Send a Superlike and increase your chance by 2x
                    </Animated.Text>
                </View>
                <TouchableOpacityView onPress={superLike} /* onPress={() => openMessageSheet?.current?.open()} */ style={styles.addMessageBox}>
                    <AppText color={BLACK} type={FORTEEN} weight={INTER_SEMI_BOLD}>
                    Send super like
                    </AppText>
                </TouchableOpacityView>
                {/* <TouchableOpacityView onPress={superLike} style={styles.sendWithOut}>
                    <AppText color={WHITE} type={FORTEEN} weight={INTER_SEMI_BOLD}>
                        Send super like
                    </AppText>
                </TouchableOpacityView> */}

                <TouchableOpacityView style={{ padding: metrics.hp1_5 }} onPress={() => { setSuperLikeVisible(false), setSwipeUp(false) }}>
                    <AppText style={{ marginTop: metrics.hp1 }} color={WHITE} type={FORTEEN} weight={INTER_SEMI_BOLD}>
                        Not now
                    </AppText>
                </TouchableOpacityView>
            </ImageBackground>
            <RBSheet ref={openMessageSheet}
                openDuration={100}
                height={Dimensions.get('window').height / 8}
                // closeOnPressMask={openMessageSheet?.current?.close()}
                // closeOnPressBack={openMessageSheet?.current?.close()}
                // onOpen={() => {
                //     setTimeout(() => {
                //         inputRef?.current?.focus();
                //     }, 100);
                // }}
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
                <View style={styles.inputContainerbox}>
                    <TextInput
                        ref={inputRef}
                        allowFontScaling={false}
                        placeholder={"Send a message..."}
                        // maxLength={10}
                        value={message}
                        onChangeText={(text) => setMessage(text)}
                        placeholderTextColor={colors.black}
                        autoFocus={false}
                        style={styles.inputBox} />
                    <TouchableOpacityView
                        style={styles.sendButton}>
                        <FastImage source={sendButton} resizeMode='contain' style={{ height: metrics.hp3, width: metrics.hp3 }} />
                    </TouchableOpacityView>
                </View>
            </RBSheet>
        </AppSafeAreaView >
    )
};
export default SuperLikeScreen;
const styles = StyleSheet.create({
    profilesWrapper: {
        position: 'relative',
        width: metrics.hp35,
        marginTop: metrics.hp30,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    profileImage: {
        width: metrics.hp20,
        height: metrics.hp27,
        borderRadius: 20,
        position: 'absolute',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 10,
    },
    profile1Position: {
        left: '5%',
        zIndex: 1,
    },
    profile2Position: {
        right: '5%',
        zIndex: 2,
    },
    textContainer: {
        marginTop: metrics.hp12,
        alignItems: 'center',
        zIndex: 4,
    },
    matchText: {
        height: metrics.hp20,
        width: Screen.Width / 1.1,
        marginTop: metrics.hp2
    },
    sendSuperLike: {
        color: colors.white,
        fontSize: fontSize(12),
        fontFamily: interMedium,
        fontWeight: "500"
    },
    addMessageBox: {
        height: metrics.hp5,
        width: "90%",
        backgroundColor: colors.white,
        borderRadius: metrics.hp3,
        marginTop: metrics.hp3,
        alignItems: "center",
        justifyContent: "center"
    },
    sendWithOut: {
        height: metrics.hp5,
        width: "90%",
        borderWidth: metrics.hp0_1,
        borderColor: colors.white,
        borderRadius: metrics.hp3,
        marginTop: metrics.hp1_5,
        alignItems: "center",
        justifyContent: "center"
    },
    inputContainerbox: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: metrics.hp2,
        paddingVertical: metrics.hp2
    },
    inputBox: {
        width: "85%",
        height: metrics.hp5,
        borderWidth: metrics.hp0_1,
        borderColor: colors.nanoOpecity,
        borderRadius: metrics.hp5,
        paddingHorizontal: metrics.hp2
    },
    sendButton: { backgroundColor: '#6F13F2', borderRadius: metrics.hp50, marginLeft: 6, justifyContent: 'center', alignItems: 'center', height: metrics.hp5, width: metrics.hp5 },
})
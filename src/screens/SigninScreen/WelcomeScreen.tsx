import React from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { ImageBackground, StyleSheet, View } from "react-native";
import { applogo, callIcon, googleIcon, welcomeVideo } from "../../helper/ImageAssets";
import { Screen } from "../../theme/dimens";
import Video from "react-native-video";
import FastImage from "react-native-fast-image";
import metrics from "../../assets/Metrics";
import { colors } from "../../theme/colors";
import { AppText, FORTEEN, INTER_BOLD, INTER_MEDIUM, INTER_REGULAR, SIXTEEN, WHITE } from "../../common/AppText";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_LOGIN_SCREEN } from "../../navigation/routes";
const WelcomeScreen = () => {
    return (
        <AppSafeAreaView>
            <FastImage style={styles.welCom}
                resizeMode="cover" source={welcomeVideo} />
            <FastImage source={applogo} resizeMode="contain" style={styles.logo} />
            <View style={styles.bottomContainer}>
                <TouchableOpacityView onPress={()=>NavigationService.navigate(NAVIGATION_LOGIN_SCREEN)} style={styles.phoneContainer}>
                    <View style={styles.callIconContainer}>
                        <FastImage source={callIcon} resizeMode="contain" style={styles.callIcon} />
                    </View>
                    <AppText weight={INTER_BOLD} type={FORTEEN}>
                        {"          "}Continue with Phone Number
                    </AppText>
                </TouchableOpacityView>
                <View style={[styles.phoneContainer, { marginTop: metrics.hp2 }]}>
                    <View style={styles.callIconContainer}>
                        <FastImage source={googleIcon} resizeMode="contain" style={styles.googleIcon} />
                    </View>
                    <AppText weight={INTER_BOLD} type={FORTEEN}>
                        {"                  "}Continue with Google
                    </AppText>
                </View>
                <AppText type={INTER_REGULAR} style={{ textAlign: "center", marginTop: metrics.hp3 }} color={WHITE}>
                    By tapping Create Account or Sign In, you agree to our <AppText color={WHITE} type={INTER_REGULAR} style={{ textDecorationLine: "underline" }}>Terms &{'\n'} Services.</AppText> Learn how we process your data in our{'\n'}
                    <AppText color={WHITE} type={INTER_REGULAR} style={{ textDecorationLine: "underline" }}>Privacy Policy</AppText> and <AppText color={WHITE} type={INTER_REGULAR} style={{ textDecorationLine: "underline" }}>Cookies Policy.</AppText>
                </AppText>
            </View>
        </AppSafeAreaView>
    )
};
export default WelcomeScreen;
const styles = StyleSheet.create({
    welCom: {
        height: Screen.Height,
        width: Screen.Width,
        position: "absolute",

    },
    logo: {
        height: metrics.hp7,
        width: metrics.hp25,
        alignSelf: "center",
        marginTop: metrics.hp8,

    },
    bottomContainer: {
        height: metrics.hp30,
        width: Screen.Width,
        position: "absolute",
        bottom: 0,
        paddingHorizontal: metrics.hp2,
        paddingVertical: metrics.hp3
    },
    phoneContainer: {
        height: metrics.hp6,
        backgroundColor: colors.white,
        borderRadius: metrics.hp3,
        flexDirection: "row",
        alignItems: "center"
    },
    callIconContainer: {
        height: metrics.hp5_5,
        width: metrics.hp5_5,
        borderRadius: metrics.hp50,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.transparent,
        shadowColor: colors.black,
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
        alignItems: "center",
        justifyContent: "center"
    },
    callIcon: {
        height: metrics.hp2_5,
        width: metrics.hp2_5
    },
    googleIcon: {
        height: metrics.hp4,
        width: metrics.hp4
    }
})
import React, { useEffect, useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { ImageBackground, Platform, StyleSheet, View } from "react-native";
import { applogo, callIcon, googleIcon, welcomeVideo } from "../../helper/ImageAssets";
import { Screen } from "../../theme/dimens";
import Video from "react-native-video";
import FastImage from "react-native-fast-image";
import metrics from "../../assets/Metrics";
import { colors } from "../../theme/colors";
import { AppText, FORTEEN, INTER_BOLD, INTER_MEDIUM, INTER_REGULAR, SIXTEEN, WHITE } from "../../common/AppText";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_LOGIN_SCREEN, NAVIGATION_PROCCED_SCREEN } from "../../navigation/routes";
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, getAuth, signInWithCredential } from '@react-native-firebase/auth';
import { useDispatch } from "react-redux";
import { setEmailAuth } from "../../slices/loginServices/authSlice";
import { userLogin } from "../../actions/authActions";
import messaging from "@react-native-firebase/messaging";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FCM_TOKEN_KEY } from "../../helper/Constants";

const WelcomeScreen = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        GoogleSignin.configure({
            webClientId: '955105716636-4pf49jso1bitv7ohduq37vb23ujf46cs.apps.googleusercontent.com',
            offlineAccess: true,
            forceCodeForRefreshToken: true,
        });
    }, []);
    const [fcmtoken, setfcmToken] = useState("");

    useEffect(() => {
        let unsubscribeTokenRefresh: (() => void) | undefined;

        const initFCM = async () => {
            try {
                const authStatus = await messaging().requestPermission();
                const enabled =
                    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
                if (!enabled) return;
                if (Platform.OS === "ios") {
                    await messaging().registerDeviceForRemoteMessages();
                }
                const token = await messaging().getToken();
                console.log("i am here for that", token);
                if (token) {
                    setfcmToken(token)
                    await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
                    console.log("✅ FCM TOKEN:", token);
                }
                unsubscribeTokenRefresh = messaging().onTokenRefresh(
                    async (newToken) => {
                        if (newToken) {
                            await AsyncStorage.setItem(FCM_TOKEN_KEY, newToken);
                            console.log("🔁 FCM TOKEN REFRESHED:", newToken);
                        }
                    }
                );
            } catch (error) {
                console.log("❌ FCM INIT ERROR:", error);
            }
        };

        initFCM();

        return () => {
            if (unsubscribeTokenRefresh) unsubscribeTokenRefresh();
        };
    }, []);
    const onGoogleButtonPress = async () => {
        try {
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            // Always force account chooser (never silent sign-in)
            try {
                await GoogleSignin.signOut();
            } catch { }

            const signInResult: any = await GoogleSignin.signIn({ prompt: 'select_account' } as any);
            let idToken = signInResult.data?.idToken;
            if (!idToken) {
                idToken = signInResult.idToken;
            }
            if (!idToken) {
                throw new Error('No ID token found');
            }
            const googleCredential = GoogleAuthProvider.credential(idToken);
            dispatch(setEmailAuth(signInResult))
            let data = {
                phoneNumber: null,
                googleToken: idToken,
                fcmtoken: fcmtoken
            };
            dispatch(userLogin(data, true))
            return signInWithCredential(getAuth(), googleCredential);
        } catch (error: any) {
            // Handle user cancellation + play services issues gracefully
            if (error?.code === statusCodes.SIGN_IN_CANCELLED) return;
            if (error?.code === statusCodes.IN_PROGRESS) return;
            if (error?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) return;
            console.log(error);
        }
    };
    
    return (
        <AppSafeAreaView>
            <FastImage style={styles.welCom}
                resizeMode="cover" source={welcomeVideo} />
            <FastImage source={applogo} resizeMode="contain" style={styles.logo} />
            <View style={styles.bottomContainer}>
                <TouchableOpacityView onPress={() => NavigationService.navigate(NAVIGATION_LOGIN_SCREEN)} style={styles.phoneContainer}>
                    <View style={styles.callIconContainer}>
                        <FastImage source={callIcon} resizeMode="contain" style={styles.callIcon} />
                    </View>
                    <AppText weight={INTER_BOLD} type={FORTEEN}>
                        {"          "}Continue with Phone Number
                    </AppText>
                </TouchableOpacityView>
                <TouchableOpacityView onPress={onGoogleButtonPress} style={[styles.phoneContainer, { marginTop: metrics.hp2 }]}>
                    <View style={styles.callIconContainer}>
                        <FastImage source={googleIcon} resizeMode="contain" style={styles.googleIcon} />
                    </View>
                    <AppText weight={INTER_BOLD} type={FORTEEN}>
                        {"                  "}Continue with Google
                    </AppText>
                </TouchableOpacityView>
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





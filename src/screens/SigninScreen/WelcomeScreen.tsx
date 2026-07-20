import React, { useEffect, useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { ImageBackground, Linking, Platform, StyleSheet, View } from "react-native";
import { Appleicon, applogo, BottomLayer, callIcon, googleIcon, homeLandImage, welcomeVideo } from "../../helper/ImageAssets";
import { Screen } from "../../theme/dimens";
import FastImage from "react-native-fast-image";
import SafeGifImage from "../../common/SafeGifImage";
import metrics from "../../assets/Metrics";
import { colors, newColor } from "../../theme/colors";
import { AppText, BADSCRIPTREGALUR, FORTEEN, INTER_BOLD, INTER_MEDIUM, INTER_REGULAR, SCHEHERAZADE_BOLD, SCHEHERAZADE_SEMI_BOLD, SIXTEEN, THIRTEEN, THIRTY, TWELVE, TWENTY, WHITE } from "../../common/AppText";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_GANDER_SCREEN, NAVIGATION_LOGIN_SCREEN } from "../../navigation/routes";
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, getAuth, signInWithCredential } from '@react-native-firebase/auth';
import { useDispatch } from "react-redux";
import { setEmailAuth } from "../../slices/loginServices/authSlice";
import { userLogin } from "../../actions/authActions";
import messaging from "@react-native-firebase/messaging";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FCM_TOKEN_KEY } from "../../helper/Constants";
// Sign in with Apple (iOS only) – import is safe on Android; button and handler are gated by Platform.OS
import { appleAuth, AppleButton } from "@invertase/react-native-apple-authentication";

const WelcomeScreen = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        if (Platform.OS === "ios") {
            GoogleSignin.configure({
                // iosClientId: '232327857977-t4r5hu6rp0v0b3uihgprba5911vaiqqs.apps.googleusercontent.com',
                webClientId: '316625885811-s7ak9u8n13up5egaqa3l07hdi7i8sau1.apps.googleusercontent.com',
                offlineAccess: true,
                forceCodeForRefreshToken: true,
            });
        } else {
            GoogleSignin.configure({
                webClientId: '316625885811-s7ak9u8n13up5egaqa3l07hdi7i8sau1.apps.googleusercontent.com',
                offlineAccess: true,
                forceCodeForRefreshToken: true,
            });
        }
    }, []);
    const [fcmtoken, setfcmToken] = useState("");

    useEffect(() => {
        let unsubscribeTokenRefresh: (() => void) | undefined;

        const initFCM = async () => {
            try {
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
            console.log(signInResult, "signInResultsignInResultsignInResult");

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
                fcmtoken: fcmtoken,
                iosToken: null
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

    /**
     * Sign in with Apple (iOS only).
     * Requests FULL_NAME and EMAIL (order matters per Apple docs); identityToken is sent to backend.
     * Handles user cancel and errors without breaking the app.
     */
    const onAppleButtonPress = async () => {
        if (Platform.OS !== "ios") return;
        try {
            const appleAuthRequestResponse = await appleAuth.performRequest({
                requestedOperation: appleAuth.Operation.LOGIN,
                requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
            });
            console.log(appleAuthRequestResponse, "appleAuthRequestResponse");


            const { identityToken, fullName, email, user: appleUserIdentifier } = appleAuthRequestResponse;
            if (!identityToken) {
                console.warn("[Apple Sign-In] No identity token received");
                return;
            }
            let data = {
                phoneNumber: null,
                googleToken: null,
                iosToken: identityToken,
                fcmtoken: fcmtoken
            };
            dispatch(userLogin(data, true));
            dispatch(setEmailAuth(appleAuthRequestResponse))
        } catch (error: any) {
            // User cancelled or closed the Apple sign-in sheet (code 1001 / ERR_REQUEST_CANCELED)
            if (error?.code === "ERR_REQUEST_CANCELED" || error?.code === 1001 || error?.code === "1001") return;
            console.warn("[Apple Sign-In] Error:", error?.message ?? error);
        }
    };

    return (
        <AppSafeAreaView color={newColor.blackNew}>
            <FastImage source={applogo} resizeMode="contain" style={styles.logo} />
            <AppText style={{ textAlign: "center", }} weight={BADSCRIPTREGALUR} type={SIXTEEN} color={WHITE}>
                Where Secrets Spark Love
            </AppText>
            <FastImage source={homeLandImage} resizeMode="contain" style={styles.homeLandImage} />
            <View style={styles.bottomContainer}>
                {/* {Platform.OS === "ios" ?
                    <TouchableOpacityView onPress={onAppleButtonPress} style={[styles.phoneContainer, { marginTop: metrics.hp2 }]}>
                        <View style={styles.callIconContainer}>
                            <FastImage source={Appleicon} resizeMode="contain" style={[styles.callIcon, { height: metrics.hp3, width: metrics.hp3 }]} />
                        </View>
                        <AppText weight={INTER_BOLD} type={FORTEEN}>
                            {"                  "}Continue with Apple
                        </AppText>
                    </TouchableOpacityView> : <></>} */}
                <ImageBackground source={BottomLayer} resizeMode="stretch" style={styles.bottomLayer}>
                    <TouchableOpacityView onPress={onGoogleButtonPress} style={[styles.phoneContainer, { marginTop: metrics.hp4 }]}>
                        <FastImage source={googleIcon} resizeMode="contain" style={styles.googleIcon} />
                        <AppText weight={SCHEHERAZADE_BOLD} color={WHITE} type={TWENTY}>
                            Continue with Google
                        </AppText>
                    </TouchableOpacityView>
                    <AppText type={THIRTEEN} weight={INTER_MEDIUM} style={styles.adultsText}>
                        For adults aged 18+ only
                    </AppText>
                    <AppText type={TWELVE} style={{ textAlign: "center", marginTop: metrics.hp0_5 }} color={WHITE}>
                        By tapping Create Account or Sign In, you agree to our {'\n'}<AppText type={TWELVE} onPress={() => Linking.openURL("https://parpple.com/terms_conditions")} color={WHITE} style={{ textDecorationLine: "underline" }}>Terms & Services.{'\n'}</AppText>
                    </AppText>
                </ImageBackground>

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
        bottom: Platform.OS === "ios" ? metrics.hp5 : metrics.hp0,
        // paddingHorizontal: metrics.hp2,
        paddingVertical: metrics.hp3
    },
    phoneContainer: {
        height: metrics.hp7,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: metrics.hp0_1,
        borderColor: colors.white,
        marginHorizontal: metrics.hp2,
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
        height: metrics.hp3,
        width: metrics.hp3,
        marginRight: metrics.hp1
    },
    // Sign in with Apple: wrapper for spacing; button uses Apple's official styling
    appleButtonWrapper: {
        marginTop: metrics.hp2,
        width: "100%",
        height: metrics.hp6,
    },
    appleButton: {
        width: "100%",
        height: metrics.hp6,
        borderRadius: metrics.hp3,
    },
    homeLandImage: {
        height: metrics.hp45, width: metrics.hp45,
        alignSelf: "center",
        marginTop: metrics.hp8
    },
    bottomLayer: {
        height: metrics.hp30,
        width: "100%",
        paddingVertical: metrics.hp2,
    },
    adultsText: {
        color: "#E6B7A8",
        textAlign: "center",
        marginTop: metrics.hp2_5
    }

})





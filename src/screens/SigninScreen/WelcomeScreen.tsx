import React, { useEffect, useRef, useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { ActivityIndicator, ImageBackground, Linking, Platform, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import LinearGradient from "react-native-linear-gradient";
import { applogo, BottomLayer, closeNewWhiteIcon, googleIcon, homeLandImage } from "../../helper/ImageAssets";
import { Screen } from "../../theme/dimens";
import FastImage from "react-native-fast-image";
import SafeGifImage from "../../common/SafeGifImage";
import metrics from "../../assets/Metrics";
import { colors, newColor } from "../../theme/colors";
import { AppText, BADSCRIPTREGALUR, FORTEEN, INTER_BOLD, INTER_MEDIUM, INTER_REGULAR, SCHEHERAZADE_BOLD, SCHEHERAZADE_SEMI_BOLD, SIXTEEN, THIRTEEN, THIRTY, TWELVE, TWENTY, WHITE, BLACK } from "../../common/AppText";
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
import auth from '@react-native-firebase/auth';

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
    // True while the backend login request is running after Google sign-in, so the screen doesn't look frozen.
    const [loginLoading, setLoginLoading] = useState(false);
    const loaderSafetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => () => {
        if (loaderSafetyTimerRef.current) clearTimeout(loaderSafetyTimerRef.current);
    }, []);
    // After a successful login the app navigates away; keep the loader up until then so the Welcome screen
    // doesn't flash back into view. The timer is only a safety net in case no navigation happens.
    const keepLoaderUntilNavigation = () => {
        if (loaderSafetyTimerRef.current) clearTimeout(loaderSafetyTimerRef.current);
        loaderSafetyTimerRef.current = setTimeout(() => setLoginLoading(false), 5000);
    };

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
            setLoginLoading(true);
            // Backend login and Firebase sign-in run in parallel, as before; the loader covers both.
            const result = await Promise.all([
                dispatch(userLogin(data, true)),
                signInWithCredential(getAuth(), googleCredential),
            ]);
            keepLoaderUntilNavigation();
            return result;
        } catch (error: any) {
            setLoginLoading(false);
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
    const onReviewPress = async (email: string, password: string): Promise<boolean> => {
        try {
            const result = await auth().signInWithEmailAndPassword(email, password);

            console.log('Firebase login successful:', result);

            // Same hand-off as onGoogleButtonPress: store the auth result and log in to the backend.
            const idToken = await result.user.getIdToken();
            if (!idToken) {
                throw new Error('No ID token found');
            }
            dispatch(setEmailAuth(result));
            let data = {
                phoneNumber: null,
                googleToken: idToken,
                fcmtoken: fcmtoken,
                iosToken: null
            };
            // userLogin resolves true once the backend accepted the login; keep the loader up until then.
            return (await dispatch(userLogin(data, true))) === true;
        } catch (error) {
            console.log('Review login failed:', error);
            return false;
        }
    }
    const REVIEW_TAP_COUNT = 5;
    const reviewTapCountRef = useRef(0);
    const reviewInFlightRef = useRef(false);
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [reviewEmail, setReviewEmail] = useState("");
    const [reviewPassword, setReviewPassword] = useState("");
    const [reviewError, setReviewError] = useState("");
    const passwordInputRef = useRef<TextInput>(null);
    const onLogoPress = () => {
        reviewTapCountRef.current += 1;
        if (reviewTapCountRef.current < REVIEW_TAP_COUNT) return;
        reviewTapCountRef.current = 0;
        setReviewModalVisible(true);
    };
    const resetReviewForm = () => {
        setReviewEmail("");
        setReviewPassword("");
        setReviewError("");
    };
    const closeReviewModal = () => {
        if (reviewInFlightRef.current) return;
        setReviewModalVisible(false);
        resetReviewForm();
    };
    const onReviewContinue = async () => {
        if (reviewInFlightRef.current) return;
        const email = reviewEmail.trim();
        if (!email || !reviewPassword) {
            setReviewError("Please enter your email and password.");
            return;
        }
        reviewInFlightRef.current = true;
        setReviewError("");
        // Swap the form for the full-screen loader in a single render so there is no dark gap in between.
        setReviewModalVisible(false);
        setLoginLoading(true);
        const ok = await onReviewPress(email, reviewPassword);
        reviewInFlightRef.current = false;
        if (ok) {
            resetReviewForm();
            keepLoaderUntilNavigation();
        } else {
            // Bring the form back (with what was typed) so the user can correct it.
            setLoginLoading(false);
            setReviewModalVisible(true);
            setReviewError("Login failed. Please check your details and try again.");
        }
    };
    return (
        <AppSafeAreaView color={newColor.blackNew}>
            <TouchableOpacityView activeOpacity={1} onPress={onLogoPress}>
                <FastImage source={applogo} resizeMode="contain" style={styles.logo} />
            </TouchableOpacityView>
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
                    <TouchableOpacityView onPress={onGoogleButtonPress} disabled={loginLoading} style={[styles.phoneContainer, { marginTop: metrics.hp4 }]}>
                        <FastImage source={googleIcon} resizeMode="contain" style={styles.googleIcon} />
                        <AppText weight={SCHEHERAZADE_BOLD} color={WHITE} type={TWENTY}>
                            Continue with Google
                        </AppText>
                    </TouchableOpacityView>
                    <AppText type={THIRTEEN} weight={INTER_MEDIUM} style={styles.adultsText}>
                        For adults aged 18+ only
                    </AppText>
                    <AppText type={TWELVE} style={{ textAlign: "center", marginTop: metrics.hp0_5 }} color={WHITE}>
                        By tapping Create Account or Sign In, you agree to our {'\n'}<AppText type={TWELVE} onPress={() => Linking.openURL("https://parpple.com/terms_conditions")} color={WHITE} style={{ textDecorationLine: "underline" }}>Terms & Services{`\n`}</AppText>
                    </AppText>

                </ImageBackground>

            </View>
            {reviewModalVisible ? (
                <View style={styles.reviewOverlay}>
                    <KeyboardAvoidingView behavior="padding" style={styles.reviewKeyboardView} pointerEvents="box-none">
                        <ScrollView
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.reviewScrollContent}
                        >
                            <View style={styles.reviewCard}>
                                <TouchableOpacityView onPress={closeReviewModal} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.reviewCloseButton}>
                                    <FastImage source={closeNewWhiteIcon} resizeMode="contain" style={styles.reviewCloseIcon} />
                                </TouchableOpacityView>
                                <AppText style={{ textAlign: "center" }} weight={SCHEHERAZADE_BOLD} type={TWENTY} color={WHITE}>
                                    Sign In
                                </AppText>
                                <TextInput
                                    value={reviewEmail}
                                    onChangeText={setReviewEmail}
                                    placeholder="Email"
                                    placeholderTextColor="#FFFFFF80"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    returnKeyType="next"
                                    onSubmitEditing={() => passwordInputRef.current?.focus()}
                                    style={[styles.reviewInput, { marginTop: metrics.hp2 }]}
                                />
                                <TextInput
                                    ref={passwordInputRef}
                                    value={reviewPassword}
                                    onChangeText={setReviewPassword}
                                    placeholder="Password"
                                    placeholderTextColor="#FFFFFF80"
                                    secureTextEntry
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    returnKeyType="done"
                                    onSubmitEditing={onReviewContinue}
                                    style={[styles.reviewInput, { marginTop: metrics.hp1_5 }]}
                                />
                                {reviewError ? (
                                    <AppText style={{ textAlign: "center", marginTop: metrics.hp1 }} type={TWELVE} color={WHITE}>
                                        {reviewError}
                                    </AppText>
                                ) : null}
                                <TouchableOpacityView onPress={onReviewContinue} style={{ marginTop: metrics.hp2 }}>
                                    <LinearGradient colors={["#D08FA9", "#FDD2C1"]} style={styles.reviewButton}>
                                        <AppText type={SIXTEEN} weight={SCHEHERAZADE_BOLD} color={BLACK}>
                                            Continue
                                        </AppText>
                                    </LinearGradient>
                                </TouchableOpacityView>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            ) : null}
            {loginLoading ? (
                <View style={styles.loginLoadingOverlay}>
                    <ActivityIndicator size="large" color={colors.white} />
                </View>
            ) : null}
        </AppSafeAreaView>
    )
};
export default WelcomeScreen;
const styles = StyleSheet.create({
    loginLoadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#000000B3",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 20,
        elevation: 20,
    },
    reviewOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#000000B3",
        zIndex: 10,
        elevation: 10,
    },
    reviewKeyboardView: {
        flex: 1,
    },
    reviewScrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: metrics.hp2,
    },
    reviewCard: {
        backgroundColor: newColor.blackNew,
        borderWidth: metrics.hp0_1,
        borderColor: colors.white,
        padding: metrics.hp2,
    },
    reviewCloseButton: {
        alignSelf: "flex-end",
        marginBottom: -metrics.hp1,
        zIndex: 1,
    },
    reviewCloseIcon: {
        height: metrics.hp3,
        width: metrics.hp3,
    },
    reviewInput: {
        height: metrics.hp7,
        borderWidth: metrics.hp0_1,
        borderColor: "#524440",
        color: colors.white,
        paddingHorizontal: metrics.hp2,
        fontSize: 15,
    },
    reviewButton: {
        height: metrics.hp7,
        alignItems: "center",
        justifyContent: "center",
    },
    welCom: {
        height: Screen.Height,
        width: Screen.Width,
        position: "absolute",
    },
    logo: {
        height: metrics.hp7,
        width: metrics.hp20,
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





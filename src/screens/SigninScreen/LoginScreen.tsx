import React, { useEffect, useState } from "react";
import { StyleSheet, TextInput, View, Platform } from "react-native";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import HeaderCommon from "../../common/HeaderCommon";
import metrics from "../../assets/Metrics";
import {
    AppText,
    fontSize,
    INTER_BOLD,
    INTER_MEDIUM,
    INTER_SEMI_BOLD,
    OPECITY,
    SCHEHERAZADE_BOLD,
    TWENTY,
} from "../../common/AppText";
import FastImage from "react-native-fast-image";
import { dropDownIcon } from "../../helper/ImageAssets";
import { Screen } from "../../theme/dimens";
import { colors } from "../../theme/colors";
import GoButton from "../../common/GoButton";
import { CountryPicker } from "react-native-country-codes-picker";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import { useDispatch } from "react-redux";
import { sendOtpApi, userLogin } from "../../actions/authActions";
import { toastAlert } from "../../actions/UploadImageActions";
import LinearGradient from "react-native-linear-gradient";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from "@react-native-firebase/messaging";
import { FCM_TOKEN_KEY } from "../../helper/Constants";

const LoginScreen = () => {
    const dispatch = useDispatch();
    const [phoneNumber, setPhoneNumber] = useState("");
    const [show, setShow] = useState(false);
    const [countryCode, setCountryCode] = useState("+91");
    const [fcmtoken, setfcmToken] = useState("");
    const [isLoading, setIsLoading] = useState(false);

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

    /* ===================== LOGIN ===================== */
    const loginButton = async () => {
        // Prevent multiple clicks
        if (isLoading) {
            return;
        }

        if (phoneNumber.length === 10) {
            let data = {
                phoneNumber: phoneNumber,
                fcmtoken: fcmtoken
                // googleToken: signInResult?.data?.idToken
            };
            console.log(data, "datadatadatadata");
            
            setIsLoading(true);
            try {
                await dispatch(userLogin(data, true));
            } catch (error) {
                // Error is already handled in the action
            } finally {
                setIsLoading(false);
            }
            // const data = {
            //     phoneNumber:phoneNumber,
            //     fcmtoken:fcmtoken
            // }
            // dispatch(sendOtpApi(data));
        } else {
            toastAlert.showToastError("Please enter a valid mobile number");
        }
    };

    return (
        <AppSafeAreaView>
            <KeyboardAwareScrollView
                showsVerticalScrollIndicator={false}
                enableOnAndroid
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ flexGrow: 1 }}
            >
                <HeaderCommon />

                <View style={styles.container}>
                    <AppText style={{ fontSize: fontSize(27) }} weight={SCHEHERAZADE_BOLD}>
                        Can you provide us your
                    </AppText>
                    <AppText
                        style={{ fontSize: fontSize(27), marginTop: -metrics.hp3_5 }}
                        weight={SCHEHERAZADE_BOLD}
                    >
                        phone number?
                    </AppText>

                    <View style={styles.inputFlow}>
                        <TouchableOpacityView
                            onPress={() => setShow(true)}
                            style={styles.countryInput}
                        >
                            <AppText type={TWENTY} weight={INTER_BOLD}>
                                IN {countryCode}
                            </AppText>
                            <FastImage
                                source={dropDownIcon}
                                resizeMode="contain"
                                style={styles.dropDownIcon}
                            />
                        </TouchableOpacityView>

                        <View style={styles.countryInputTwo}>
                            <TextInput
                                maxLength={10}
                                keyboardType="numeric"
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                style={styles.input}
                            />
                        </View>
                    </View>

                    <AppText
                        style={{ marginTop: metrics.hp1 }}
                        color={OPECITY}
                        weight={INTER_MEDIUM}
                    >
                        We’ll send you a verification code on your mobile number.
                    </AppText>
                </View>

                <LinearGradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={{ height: metrics.hp19 }}
                    colors={["#ffffff50", colors.white, colors.white]}
                >
                    <View style={{ marginTop: metrics.hp9 }}>
                        <GoButton
                            colortrue={phoneNumber.length === 10 && !isLoading}
                            onPress={loginButton}
                            disabled={isLoading}
                        />
                    </View>
                </LinearGradient>

                <CountryPicker
                    show={show}
                    lang="en"
                    onBackdropPress={() => setShow(false)}
                    pickerButtonOnPress={(item: any) => {
                        setCountryCode(item.dial_code);
                        setShow(false);
                    }}
                />
            </KeyboardAwareScrollView>
        </AppSafeAreaView>
    );
};

export default LoginScreen;

/* ===================== STYLES ===================== */
const styles = StyleSheet.create({
    container: {
        marginTop: metrics.hp3,
        paddingHorizontal: metrics.hp2,
        flex: 1,
    },
    countryInput: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        paddingVertical: metrics.hp0_8,
    },
    countryInputTwo: {
        borderBottomWidth: 1,
    },
    dropDownIcon: {
        height: metrics.hp3,
        width: metrics.hp3,
        marginLeft: metrics.hp0_5,
    },
    inputFlow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: metrics.hp3,
    },
    input: {
        width: Screen.Width / 1.6,
        fontSize: fontSize(18),
        fontFamily: INTER_BOLD,
        fontWeight:"700"
    },
});

import React, { useState, useEffect } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { StyleSheet, View } from "react-native";
import HeaderCommon from "../../common/HeaderCommon";
import metrics from "../../assets/Metrics";
import { AppText, fontSize, INTER_MEDIUM, OPECITY, PURPLE, RED, TWELVE } from "../../common/AppText";
import { OtpInput } from "react-native-otp-entry";
import { colors } from "../../theme/colors";
import { interBold } from "../../theme/typography";
import GoButton from "../../common/GoButton";
import DubleTextLine from "../../common/DubleTextLine";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_PROCCED_SCREEN } from "../../navigation/routes";
import LinearGradient from "react-native-linear-gradient";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { toastAlert } from "../../actions/UploadImageActions";
import { getHash, startOtpListener, removeListener } from "react-native-otp-verify";
import { useDispatch } from "react-redux";
import { otpVerifyAPIOne, sendOtpApi } from "../../actions/authActions";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";

const OtpScreen = ({ route }: any) => {
    const dispatch = useDispatch();
    const [otpNumber, setOtpNumber] = useState("");
    const [hashKey, setHashKey] = useState("");
    const [resendTimer, setResendTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        // Get hash key for backend team
        getHash()
            .then((hashArray: string[]) => {
                // Get the release hash key (usually the first one or filter for release)
                const hash = hashArray && hashArray.length > 0 ? hashArray[0] : "";
                setHashKey(hash);
            })
            .catch((error: any) => {
                console.log("Error getting hash:", error);
            });

        // Start listening for OTP
        startOtpListener((message: string) => {
            const otpRegex = /(\d{6})/g;
            const match = otpRegex.exec(message);
            if (match && match[1]) {
                const otp = match[1];
                setOtpNumber(otp);
            }
        });

        return () => {
            removeListener();
        };
    }, []);

    // Countdown timer for OTP resend
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setInterval(() => {
                setResendTimer((prev) => {
                    if (prev <= 1) {
                        setCanResend(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        } else {
            setCanResend(true);
        }
    }, [resendTimer]);

    const onSubmit = () => {
        if (otpNumber?.length !== 6) return toastAlert.showToastError("please add currect otp")
        const data = {
            phoneNumber: route?.params?.PhoneNumber,
            otp: otpNumber
        };
        dispatch(otpVerifyAPIOne(data))
    }

    const handleResendOtp = () => {
        if (!canResend) return;
        
        const data = {
            phoneNumber: route?.params?.PhoneNumber,
        };
        
        dispatch(sendOtpApi(data));
        
        // Reset timer to 30 seconds
        setResendTimer(30);
        setCanResend(false);
        toastAlert.showToastError("OTP sent successfully");
    }
    return (
        <AppSafeAreaView>
            <KeyboardAwareScrollView
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ flexGrow: 1 }}>
                <HeaderCommon />
                <View style={styles.container}>
                    {/* {hashKey ? (
                        <View style={styles.hashKeyContainer}>
                            <AppText color={PURPLE} weight={INTER_MEDIUM} type={TWELVE}>
                                Hash Key: {hashKey}
                            </AppText>
                        </View>
                    ) : null} */}
                    <DubleTextLine firstText={"Enter your verification"} secondText={"code."} thirdText={`+91 ${route?.params?.PhoneNumber}`} />
                    <OtpInput
                        numberOfDigits={6}
                        focusColor="transparnet"
                        autoFocus={true}
                        hideStick={true}
                        placeholder=""
                        blurOnFilled={true}
                        disabled={false}
                        type="numeric"
                        secureTextEntry={false}
                        focusStickBlinkingDuration={500}
                        onFocus={() => console.log("Focused")}
                        onBlur={() => console.log("Blurred")}
                        onTextChange={(text) => setOtpNumber(text)}
                        onFilled={(text) => console.log(`OTP is ${text}`)}
                        textInputProps={{
                            accessibilityLabel: "One-Time Password",
                        }}
                        textProps={{
                            accessibilityRole: "text",
                            accessibilityLabel: "OTP digit",
                            allowFontScaling: false,
                        }}
                        theme={{
                            containerStyle: styles.containerOTP,
                            pinCodeContainerStyle: styles.pinCodeContainer,
                            pinCodeTextStyle: styles.pinCodeText,
                            focusStickStyle: styles.focusStick,
                            focusedPinCodeContainerStyle: styles.activePinCodeContainer,
                            placeholderTextStyle: styles.placeholderText,
                            filledPinCodeContainerStyle: styles.filledPinCodeContainer,
                            disabledPinCodeContainerStyle: styles.disabledPinCodeContainer,
                        }}
                    />
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: metrics.hp1 }}>
                        <AppText color={OPECITY} weight={INTER_MEDIUM} type={TWELVE}>
                            Didn't received code?
                        </AppText>
                        {canResend ? (
                            <TouchableOpacityView onPress={handleResendOtp}>
                                <AppText style={{ textDecorationLine: "underline", }} color={PURPLE} weight={INTER_MEDIUM} type={TWELVE}>
                                    Resend
                                </AppText>
                            </TouchableOpacityView>
                        ) : (
                            <AppText color={RED} weight={INTER_MEDIUM} type={TWELVE}>
                                Resend in {resendTimer}s
                            </AppText>
                        )}
                    </View>
                </View>
                <LinearGradient start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }} style={{ height: metrics.hp19 }} colors={["#ffffff50", colors.white, colors.white]}>
                    <View style={{ marginTop: metrics.hp9 }}>
                        <GoButton colortrue={otpNumber?.length == 6 ? true : false} onPress={() => onSubmit()} />
                    </View>
                </LinearGradient>
            </KeyboardAwareScrollView>
        </AppSafeAreaView>
    )
};
export default OtpScreen;
const styles = StyleSheet.create({
    container: {
        marginTop: metrics.hp3,
        paddingHorizontal: metrics.hp2,
        flex: 1,
    },
    hashKeyContainer: {
        marginBottom: metrics.hp2,
        padding: metrics.hp1,
        backgroundColor: colors.white,
        borderRadius: metrics.hp0_5,
        borderWidth: 1,
        borderColor: PURPLE,
    },
    containerOTP: { marginTop: metrics.hp2 },
    pinCodeContainer: {
        height: metrics.hp5_5, width: metrics.hp5_7,
        borderBottomRightRadius: metrics.hp0,
        borderBottomLeftRadius: metrics.hp0,
        borderWidth: 1,
        borderColor: colors.black,
        marginTop: metrics.hp3
    },
    pinCodeText: {
        fontSize: fontSize(20), fontFamily: interBold,
        height: metrics.hp5_5, width: metrics.hp5_7,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.black,
        textAlign: "center",
    },
    focusStick: {},
    activePinCodeContainer: {
        height: metrics.hp5_5, width: metrics.hp6,
        borderBottomRightRadius: metrics.hp0,
        borderBottomLeftRadius: metrics.hp0,
        borderWidth: 1,
        borderColor: colors.white
    },
    placeholderText: { fontSize: fontSize(20), fontFamily: interBold, color: colors.black },
    filledPinCodeContainer: {},
    disabledPinCodeContainer: {},
})
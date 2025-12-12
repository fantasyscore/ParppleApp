import React, { useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { StyleSheet, View } from "react-native";
import HeaderCommon from "../../common/HeaderCommon";
import metrics from "../../assets/Metrics";
import { AppText, fontSize, INTER_MEDIUM, OPECITY, PURPLE, TWELVE } from "../../common/AppText";
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

const OtpScreen = ({ route }: any) => {
    const [otpNumber, setOtpNumber] = useState("");
    const onSubmit = () => {
        if (route?.params?.PhoneNumber === "1234567890") {
            if (otpNumber === "123456") {
                NavigationService.navigate(NAVIGATION_PROCCED_SCREEN, { comming: "OTP" })
            } else {
                toastAlert.showToastError("Please enter vaild otp")
            }
        } else {
            // if (otpNumber?.length == 6) {
                NavigationService.navigate(NAVIGATION_PROCCED_SCREEN, { comming: "OTP" })
            // }else{
            //     toastAlert.showToastError("Please enter vaild otp")
            // }
            // if (otpNumber == "000000") {
            //     NavigationService.navigate(NAVIGATION_PROCCED_SCREEN, { comming: "OTP" })
            // } else {
            //     toastAlert.showToastError("Please enter vaild otp")
            // }
        }
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
                            Didn’t received code?
                        </AppText>
                        <AppText style={{ textDecorationLine: "underline", }} color={PURPLE} weight={INTER_MEDIUM} type={TWELVE}>
                            Resend
                        </AppText>
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
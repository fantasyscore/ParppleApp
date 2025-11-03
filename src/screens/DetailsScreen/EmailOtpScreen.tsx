import React, { useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { StyleSheet, View } from "react-native";
import HeaderCommon from "../../common/HeaderCommon";
import { AppText, fontSize, INTER_MEDIUM, OPECITY, PURPLE, SCHEHERAZADE_BOLD, TWELVE } from "../../common/AppText";
import metrics from "../../assets/Metrics";
import DubleTextLine from "../../common/DubleTextLine";
import { OtpInput } from "react-native-otp-entry";
import { colors } from "../../theme/colors";
import { interBold } from "../../theme/typography";
import GoButton from "../../common/GoButton";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_NAME_SCREEN } from "../../navigation/routes";

const EmailOtpScreen = () => {
    const [otpNumber, setOtpNumber] = useState("");
    return (
        <AppSafeAreaView>
            <HeaderCommon />
            <View style={styles.container}>
                <DubleTextLine firstText={"Enter Verification code"} secondText={"from your mail"} thirdText={"example@gmail.com"} />
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
            <GoButton onPress={()=>NavigationService.navigate(NAVIGATION_NAME_SCREEN)}/>
        </AppSafeAreaView>
    )
};
export default EmailOtpScreen;
const styles = StyleSheet.create({
    container: {
        marginTop: metrics.hp3,
        paddingHorizontal: metrics.hp2,
        flex: 1
    },
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
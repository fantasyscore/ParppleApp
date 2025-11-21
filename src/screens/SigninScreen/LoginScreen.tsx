import React, { useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { StyleSheet, TextInput, View } from "react-native";
import HeaderCommon from "../../common/HeaderCommon";
import metrics from "../../assets/Metrics";
import { AppText, fontSize, INTER_BOLD, INTER_MEDIUM, INTER_SEMI_BOLD, OPECITY, SCHEHERAZADE_BOLD, TWENTY, TWENTY_TWO } from "../../common/AppText";
import FastImage from "react-native-fast-image";
import { dropDownIcon, rightArrow } from "../../helper/ImageAssets";
import { Screen } from "../../theme/dimens";
import { colors } from "../../theme/colors";
import GoButton from "../../common/GoButton";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_OTP_SCREEN } from "../../navigation/routes";
import { CountryPicker } from "react-native-country-codes-picker";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import { useDispatch, useSelector } from "react-redux";
import { discoverProfile, userLogin } from "../../actions/authActions";
import { toastAlert } from "../../actions/UploadImageActions";
import LinearGradient from "react-native-linear-gradient";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const LoginScreen = () => {
    const dispatch = useDispatch();
    const emailAuth = useSelector((state: any) => state.auth.emailAuth);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [show, setShow] = useState(false);
    const [countryCode, setCountryCode] = useState('+91');
    const loginButton = () => {
        if (phoneNumber) {
            let data = {
                phoneNumber: phoneNumber,
                googleToken:null,
            };
            dispatch(userLogin(data))
        } else {
            toastAlert.showToastError("Please enter valid mobile number");
        }
    };
    
    return (
        <AppSafeAreaView>
              <KeyboardAwareScrollView
              showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ flexGrow: 1 }}>
            <HeaderCommon />
            <View style={styles.container}>
                <AppText style={{ fontSize: fontSize(27) }} weight={SCHEHERAZADE_BOLD}>
                    Can you provide us your
                </AppText>
                <AppText style={{ fontSize: fontSize(27), marginTop: -metrics.hp3_5 }} weight={SCHEHERAZADE_BOLD}>
                    phone number?
                </AppText>
                <View style={styles.inputFlow}>
                    <TouchableOpacityView onPress={() => setShow(true)} style={styles.countryInput}>
                        <AppText type={TWENTY} weight={INTER_BOLD}>
                            IN {countryCode}
                        </AppText>
                        <FastImage source={dropDownIcon} resizeMode="contain" style={styles.dropDownIcon} />
                    </TouchableOpacityView>
                    <View style={styles.countryInputTwo}>
                        <TextInput
                            allowFontScaling={false}
                            placeholder=""
                            maxLength={10}
                            keyboardType="numeric"
                            value={phoneNumber}
                            inputMode="numeric"
                            onChangeText={(text) => setPhoneNumber(text)}
                            placeholderTextColor={colors.black}
                            style={{ width: Screen.Width / 1.60, fontSize: fontSize(18), fontWeight: "700", fontFamily: INTER_BOLD }}
                        />
                    </View>
                </View>
                <AppText style={{ marginTop: metrics.hp1 }} color={OPECITY} weight={INTER_MEDIUM}>
                    We’ll send you a notification for verification code for verification on your mobile number.
                </AppText>
            </View>
            <LinearGradient start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }} style={{ height: metrics.hp19 }} colors={["#ffffff50", colors.white, colors.white]}>
                <View style={{ marginTop: metrics.hp9 }}>
                    <GoButton colortrue={phoneNumber?.length == 10 ? true : false} onPress={() => loginButton()} />
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
                disableBackdrop={false}
                style={{
                    modal: {
                        flex: 0.5
                        // height: metrics.hp50,
                    },
                    line: {
                        backgroundColor: "transparent",
                    },
                    textInput: {
                        height: metrics.hp6,
                        borderRadius: metrics.hp8,
                        paddingHorizontal: metrics.hp2,
                        fontFamily: INTER_MEDIUM,
                        fontSize: fontSize(13),
                        fontWeight: "500",
                        backgroundColor: colors.lightBack
                    },
                    countryButtonStyles: {
                        height: metrics.hp6,
                        borderRadius: metrics.hp8,
                        marginVertical: metrics.hp0_5,
                        backgroundColor: colors.white,
                        borderBottomWidth: metrics.hp0_1,
                        borderBottomColor: colors.nanoOpecity
                    },
                    flag: {
                        // height: metrics.hp5, // 👈 yaha size badhao
                        // width: metrics.hp5,
                    },
                    countryName: {
                        fontFamily: INTER_MEDIUM,
                        fontSize: fontSize(14),
                        fontWeight: "400"
                    },
                    dialCode: {
                        fontFamily: INTER_SEMI_BOLD,
                        fontSize: fontSize(14),
                        fontWeight: "600",
                        position: "absolute",
                        right: metrics.hp2,
                    },
                    searchMessageText: {
                        fontFamily: INTER_BOLD,
                        fontSize: fontSize(14),
                        fontWeight: "700"
                    },
                }}
            />
</KeyboardAwareScrollView>
        </AppSafeAreaView>
    )
};
export default LoginScreen;
const styles = StyleSheet.create({
    container: {
        marginTop: metrics.hp3,
        paddingHorizontal: metrics.hp2,
        flex: 1
    },
    countryInput: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        paddingVertical: metrics.hp0_8
    },
    countryInputTwo: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
    },
    nuberInput: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
    },
    dropDownIcon: {
        height: metrics.hp3,
        width: metrics.hp3,
        marginLeft: metrics.hp0_5
    },
    inputFlow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: metrics.hp3
    },
})
import React, { useEffect, useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { StyleSheet, TextInput, View } from "react-native";
import HeaderCommon from "../../common/HeaderCommon";
import TopCommonLine from "../../common/TopCommonLine";
import DubleTextLine from "../../common/DubleTextLine";
import metrics from "../../assets/Metrics";
import { aboutIcon } from "../../helper/ImageAssets";
import { AppText, fontSize, INTER_MEDIUM, OPECITY, TWELVE } from "../../common/AppText";
import { colors } from "../../theme/colors";
import { interMedium } from "../../theme/typography";
import GoButton from "../../common/GoButton";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_PROCCED_SCREEN } from "../../navigation/routes";
import { useDispatch, useSelector } from "react-redux";
import { setAddProfile } from "../../slices/loginServices/authSlice";
import { toastAlert } from "../../actions/UploadImageActions";
import LinearGradient from "react-native-linear-gradient";
import { Screen } from "../../theme/dimens";
import { editProfile } from "../../actions/authActions";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const AboutScreen = ({ route }: any) => {
    const dispatch = useDispatch();
    const filter = route?.params?.filter ?? "";
    const dataFilter = route?.params?.data ?? "";
    const addProfileData = useSelector((state: any) => state?.auth?.addProfileData);
    const datalistnew = new Array(1).fill(null).map((_, index) => ({ id: String(index), }));
    const [about, setAbout] = useState(dataFilter ? dataFilter : "");

    const onSubmit = () => {
        if (!about) return toastAlert.showToastError("Please tell us about your story");
        if (filter) {
            const dataToSave = {
                bio: about,
            };
            dispatch(editProfile(dataToSave))
        } else {
            const data = {
                ...addProfileData,
                bio: about,
                fieldVisibility: { ...addProfileData?.fieldVisibility }
            };
            dispatch(setAddProfile(data))
            NavigationService.navigate(NAVIGATION_PROCCED_SCREEN, { comming: "About" })
        }
    }
    return (
        <AppSafeAreaView>
            <KeyboardAwareScrollView
                enableOnAndroid={true}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ flexGrow: 1 }}>
                <HeaderCommon title={filter} />
                {filter ?
                    <View style={styles.singleLine} /> : <></>}
                <View style={styles.container}>
                    {filter ? <></> :
                        <TopCommonLine icon={aboutIcon} datalist={datalistnew} />}
                    <View style={{ paddingHorizontal: metrics.hp2 }}>
                        {filter ? <></> :
                            <DubleTextLine firstText={"Tell us about your story"} secondText={"in few words?"} />}
                        {filter ? <></> :
                            <AppText style={{ marginTop: -metrics.hp2 }} type={TWELVE} weight={INTER_MEDIUM} color={OPECITY}>
                                Fill up your bio, whether it’s about your fun fact or you wildest fantasy.
                            </AppText>}
                        <View style={[styles.inputContainer, { marginTop: filter ? metrics.hp0 : metrics.hp5 }]}>
                            <TextInput
                                allowFontScaling={false}
                                placeholder="Write about you..."
                                placeholderTextColor={colors.opecity}
                                numberOfLines={5}
                                multiline={true}
                                maxLength={200}
                                value={about}
                                onChangeText={(text) => setAbout(text)}
                                style={{
                                    fontSize: fontSize(12),
                                    fontFamily: interMedium,
                                    fontWeight: "500",
                                    color: colors.black,
                                }}
                            />
                        </View>
                    </View>
                </View>
                <LinearGradient start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }} style={{ height: metrics.hp19 }} colors={["#ffffff50", colors.white, colors.white]}>
                    <View style={{ marginTop: metrics.hp9 }}>
                        <GoButton onPress={() => onSubmit()} colortrue={about} />
                    </View>
                </LinearGradient>
            </KeyboardAwareScrollView>
        </AppSafeAreaView>
    )
};
export default AboutScreen;
const styles = StyleSheet.create({
    container: {
        marginTop: metrics.hp3,
        flex: 1,
    },
    inputContainer: {
        height: metrics.hp12,
        backgroundColor: colors.lightBack,
        borderRadius: metrics.hp1_5,
        marginTop: metrics.hp5,
        paddingHorizontal: metrics.hp1
    },
    singleLine: {
        height: metrics.hp0_2,
        width: Screen.Width,
        backgroundColor: colors.nanoOpecity,
        marginTop: metrics.hp2
    },
})
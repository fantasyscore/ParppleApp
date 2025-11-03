import React, { useState } from "react";
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

const AboutScreen = () => {
    const dispatch = useDispatch();
    const addProfileData = useSelector((state: any) => state?.auth?.addProfileData);
    const datalistnew = new Array(1).fill(null).map((_, index) => ({ id: String(index), }));
    const [about, setAbout] = useState("")
    const onSubmit = () => {
        if(!about) return toastAlert.showToastError("Please tell us about your story")
        const data = {
            ...addProfileData,
            bio: about,
            fieldVisibility: { ...addProfileData?.fieldVisibility}
        };
        dispatch(setAddProfile(data))
        NavigationService.navigate(NAVIGATION_PROCCED_SCREEN, { comming: "About" })
    }
    return (
        <AppSafeAreaView>
            <HeaderCommon />
            <View style={styles.container}>
                <TopCommonLine icon={aboutIcon} datalist={datalistnew} />
                <View style={{ paddingHorizontal: metrics.hp2 }}>
                    <DubleTextLine firstText={"Tell us about your story"} secondText={"in few words?"} />
                    <AppText style={{ marginTop: -metrics.hp2 }} type={TWELVE} weight={INTER_MEDIUM} color={OPECITY}>
                        Fill up your bio, whether it’s about your fun fact or you wildest fantasy.
                    </AppText>
                    <View style={styles.inputContainer}>
                        <TextInput
                            allowFontScaling={false}
                            placeholder="Write about you..."
                            placeholderTextColor={colors.opecity}
                            numberOfLines={5}
                            multiline={true}
                            maxLength={200}
                            onChangeText={(text) =>setAbout(text)}
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
            <GoButton onPress={() => onSubmit()} colortrue={about} />

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
    }
})
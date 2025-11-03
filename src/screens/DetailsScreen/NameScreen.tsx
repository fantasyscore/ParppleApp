import React, { useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { StyleSheet, View } from "react-native";
import HeaderCommon from "../../common/HeaderCommon";
import metrics from "../../assets/Metrics";
import DubleTextLine from "../../common/DubleTextLine";
import InputCommon from "../../common/InputCommon";
import { AppText, INTER_MEDIUM, LIGHT_BLACK, TWELVE } from "../../common/AppText";
import GoButton from "../../common/GoButton";
import TopCommonLine from "../../common/TopCommonLine";
import { nameIcon } from "../../helper/ImageAssets";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_DOB_SCREEN } from "../../navigation/routes";
import { useDispatch, useSelector } from "react-redux";
import { toastAlert } from "../../actions/UploadImageActions";
import { setAddProfile } from "../../slices/loginServices/authSlice";

const NameScreen = () => {
    const dispatch = useDispatch();
    const addProfileData = useSelector((state: any) => state?.auth?.addProfileData);
    const datalist = new Array(13).fill(null).map((_, index) => ({ id: String(index), }))
    const [firstNmae, setFirstName] = useState("");
    const [lastNmae, setLastName] = useState("");
    const onSubmit = () => {
        if (!firstNmae) toastAlert.showToastError("Please enter your first name")
        const data = {
            ...addProfileData,
            firstName: firstNmae,
            lastName: lastNmae,
        };
        dispatch(setAddProfile(data))
        NavigationService.navigate(NAVIGATION_DOB_SCREEN)
    }

    return (
        <AppSafeAreaView>
            <HeaderCommon />
            <View style={styles.container}>
                <TopCommonLine icon={nameIcon} datalist={datalist} />
                <View style={{ paddingHorizontal: metrics.hp2, }}>
                    <DubleTextLine firstText={"What’s your name?"} />
                    <InputCommon value={firstNmae} onChangeText={setFirstName} placeholder={"Enter your first name"} />
                    <InputCommon style={{ marginTop: metrics.hp2, }} value={lastNmae} onChangeText={setLastName} placeholder={"Enter your last name (Optional)"} />
                    <AppText style={{ marginTop: metrics.hp1 }} color={LIGHT_BLACK} weight={INTER_MEDIUM} type={TWELVE}>
                        This name will appear on your profile. Finalize now, can’t change lter.
                    </AppText>
                </View>
            </View>
            <GoButton colortrue={firstNmae} onPress={() => onSubmit()} />

        </AppSafeAreaView>
    )
};
export default NameScreen;
const styles = StyleSheet.create({
    container: {
        marginTop: metrics.hp3,
        flex: 1
    },
})
import React, { useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { StyleSheet, View } from "react-native";
import HeaderCommon from "../../common/HeaderCommon";
import TopCommonLine from "../../common/TopCommonLine";
import DubleTextLine from "../../common/DubleTextLine";
import metrics from "../../assets/Metrics";
import { bussnisIcon, homeIcon, schoolIcon } from "../../helper/ImageAssets";
import InputCommon from "../../common/InputCommon";
import GoButton from "../../common/GoButton";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_RELIGIOUS_SCREEN, NAVIGATION_ZODIACSING_SCREEN } from "../../navigation/routes";
import { Screen } from "../../theme/dimens";
import { colors } from "../../theme/colors";
import { useDispatch, useSelector } from "react-redux";
import { setAddProfile } from "../../slices/loginServices/authSlice";
import { toastAlert } from "../../actions/UploadImageActions";
import { editProfile } from "../../actions/authActions";

const JobTitle = ({ route }: any) => {
    const dispatch = useDispatch();
    const addProfileData = useSelector((state: any) => state?.auth?.addProfileData);
    const filter = route?.params?.filter ?? "";
    const dataFilter = route?.params?.data ?? "";
    const datalist = new Array(3).fill(null).map((_, index) => ({ id: String(index), }))
    const [email, setEmail] = useState(dataFilter ? dataFilter : "");
    const [showProfile, setShowProfile] = useState(true);

    const onSkip = () => {
        const dataToSave = {
            ...addProfileData,
            jobTitle: "",
            fieldVisibility: { ...addProfileData?.fieldVisibility, jobTitle: true }
        };
        dispatch(setAddProfile(dataToSave));
        NavigationService.navigate(NAVIGATION_ZODIACSING_SCREEN)
    };
    const onSubmit = () => {
        if (!email) return toastAlert.showToastError("Please add your job title")
        if (filter) {
            const dataToSave = {
                jobTitle: email,
            };
            dispatch(editProfile(dataToSave))
        } else {
            const data = {
                ...addProfileData,
                jobTitle: email,
                fieldVisibility: { ...addProfileData?.fieldVisibility, jobTitle: showProfile }
            };
            dispatch(setAddProfile(data))
            NavigationService.navigate(NAVIGATION_ZODIACSING_SCREEN)
        }
    }
    return (
        <AppSafeAreaView>
            <HeaderCommon title={filter} skip={filter ? false : true} />
            {filter ?
                <View style={styles.singleLine} /> : <></>}
            <View style={styles.container}>
                {filter ? <></> :
                    <TopCommonLine icon={bussnisIcon} datalist={datalist} />}
                <View style={{ paddingHorizontal: metrics.hp2 }}>
                    {filter ? <></> :
                        <DubleTextLine firstText={"Tell us about your job"} secondText={"title?"} />}
                    <InputCommon value={email} closeVisible={true} onPress={() => setEmail("")} onChangeText={setEmail} placeholder={"Job title"} />
                </View>
            </View>
                <GoButton onPress={() => onSubmit()} colortrue={email} visiBleProfile={true} visible={showProfile} setShowProfile={setShowProfile} />
        </AppSafeAreaView>
    )
};
export default JobTitle;
const styles = StyleSheet.create({
    container: {
        marginTop: metrics.hp3,
        flex: 1,
    },
    singleLine: {
        height: metrics.hp0_2,
        width: Screen.Width,
        backgroundColor: colors.nanoOpecity,
        marginTop: metrics.hp2
    },
})
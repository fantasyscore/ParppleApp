import React, { useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { StyleSheet, View } from "react-native";
import HeaderCommon from "../../common/HeaderCommon";
import TopCommonLine from "../../common/TopCommonLine";
import DubleTextLine from "../../common/DubleTextLine";
import metrics from "../../assets/Metrics";
import { homeIcon, schoolIcon } from "../../helper/ImageAssets";
import InputCommon from "../../common/InputCommon";
import GoButton from "../../common/GoButton";
import { AppText, INTER_MEDIUM, OPECITY, TWELVE } from "../../common/AppText";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_WORK_PLACE_SCREEN } from "../../navigation/routes";
import { Screen } from "../../theme/dimens";
import { colors } from "../../theme/colors";
import { useDispatch, useSelector } from "react-redux";
import { setAddProfile } from "../../slices/loginServices/authSlice";
import { toastAlert } from "../../actions/UploadImageActions";
import { editProfile } from "../../actions/authActions";

const BelongFrom = ({ route }: any) => {
    const dispatch = useDispatch();
    const addProfileData = useSelector((state: any) => state?.auth?.addProfileData);
    const filter = route?.params?.filter ?? "";
    const dataFilter = route?.params?.data ?? "";
    const datalist = new Array(6).fill(null).map((_, index) => ({ id: String(index), }))
    const [email, setEmail] = useState(dataFilter?.length ? dataFilter :"");
    const [showProfile, setShowProfile] = useState(true);
    const onSkip = () => {
        const dataToSave = {
            ...addProfileData,
            homeTown: "",
            fieldVisibility: { ...addProfileData?.fieldVisibility, homeTown: true }
        };
        dispatch(setAddProfile(dataToSave));
        NavigationService.navigate(NAVIGATION_WORK_PLACE_SCREEN)
    };
    const onSubmit = () => {
        if (!email) return toastAlert.showToastError("Please add belong from")
        if (filter) {
            const dataToSave = {
                homeTown: email,
            };
            dispatch(editProfile(dataToSave))
        } else {
            const data = {
                ...addProfileData,
                homeTown: email,
                fieldVisibility: { ...addProfileData?.fieldVisibility, homeTown: showProfile }
            };
            dispatch(setAddProfile(data))
            NavigationService.navigate(NAVIGATION_WORK_PLACE_SCREEN)
        }
    }
    return (
        <AppSafeAreaView>
            <HeaderCommon onSkip={onSkip} title={filter} skip={filter ? false : true} />
            {filter ?
                <View style={styles.singleLine} /> : <></>}
            <View style={styles.container}>
                {filter ? <></> :
                    <TopCommonLine icon={homeIcon} datalist={datalist} />}
                <View style={{ paddingHorizontal: metrics.hp2 }}>
                    {filter ? <></> :
                        <DubleTextLine firstText={"Where do you belong"} secondText={'from?'} />}
                    {filter ? <></> :
                        <AppText style={{ marginTop: -metrics.hp2 }} type={TWELVE} weight={INTER_MEDIUM} color={OPECITY}>
                            Tell us about your hometown.
                        </AppText>}
                    <InputCommon value={email} closeVisible={true} onPress={() => setEmail("")} onChangeText={setEmail} placeholder={"Hometown"} />
                </View>
            </View>
                <GoButton colortrue={email} onPress={() => onSubmit()} visiBleProfile={true} visible={showProfile} setShowProfile={setShowProfile} />
        </AppSafeAreaView>
    )
};
export default BelongFrom;
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
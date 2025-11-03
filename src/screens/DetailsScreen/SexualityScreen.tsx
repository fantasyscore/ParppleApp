import React, { useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { FlatList, StyleSheet, View } from "react-native";
import HeaderCommon from "../../common/HeaderCommon";
import TopCommonLine from "../../common/TopCommonLine";
import DubleTextLine from "../../common/DubleTextLine";
import GoButton from "../../common/GoButton";
import metrics from "../../assets/Metrics";
import ListCheckBox from "../../common/ListCheckbox";
import { ganderIcon, sexualityIcon } from "../../helper/ImageAssets";
import { AppText, INTER_MEDIUM, OPECITY, TWELVE } from "../../common/AppText";
import LinearGradient from "react-native-linear-gradient";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_DATE_SCREEN, NAVIGATION_HEIGHT_SCREEN } from "../../navigation/routes";
import { Screen } from "../../theme/dimens";
import { colors } from "../../theme/colors";
import { sexualityDATA } from "../../common/UiltData";
import { useDispatch, useSelector } from "react-redux";
import { setAddProfile } from "../../slices/loginServices/authSlice";
import { toastAlert } from "../../actions/UploadImageActions";
import { editProfile } from "../../actions/authActions";

const SexualityScreen = ({ route }: any) => {
    const dispatch = useDispatch();
    const filter = route?.params?.filter ?? "";
    const dataFilter = route?.params?.data ?? "";
    const addProfileData = useSelector((state: any) => state?.auth?.addProfileData);
    const datalistnew = new Array(8).fill(null).map((_, index) => ({ id: String(index), }))
    const [selectPronoun, setSelectPronoun] = useState(dataFilter ? dataFilter : "");
    const [showProfile, setShowProfile] = useState(true);

    const datalist = new Array(10).fill(null).map((_, index) => ({
        id: String(index),
        title: "Prefer not to say",
    }));
    const onSkip = () => {
        const dataToSave = {
            ...addProfileData,
            sexualOrientation: "",
            fieldVisibility: { ...addProfileData?.fieldVisibility, sexualOrientation: true }
        };
        dispatch(setAddProfile(dataToSave));
        NavigationService.navigate(NAVIGATION_HEIGHT_SCREEN)
    };
    const onSubmit = () => {
        if (!selectPronoun) return toastAlert.showToastError("Please add sexuality")
        if (filter) {
            const dataToSave = {
                sexualOrientation: selectPronoun,
            };
            dispatch(editProfile(dataToSave))
        } else {
            const data = {
                ...addProfileData,
                sexualOrientation: selectPronoun,
                fieldVisibility: { ...addProfileData?.fieldVisibility, sexualOrientation: showProfile }

            };
            dispatch(setAddProfile(data))
            NavigationService.navigate(NAVIGATION_HEIGHT_SCREEN)
        }
    }
    return (
        <AppSafeAreaView>
            <HeaderCommon onSkip={onSkip} title={filter} />
            {filter ?
                <View style={styles.singleLine} /> : <></>}
            <View style={styles.container}>
                {filter ? <></> :
                    <TopCommonLine icon={sexualityIcon} datalist={datalistnew} />}
                <View style={{ paddingHorizontal: metrics.hp2 }}>
                    {filter ? <></> :
                        <DubleTextLine firstText={"What’s your sexuality?"} />}
                    {filter ? <></> :
                        <AppText style={{ marginTop: -metrics.hp2 }} type={TWELVE} weight={INTER_MEDIUM} color={OPECITY}>
                            Select that describes you to reflect your identity.
                        </AppText>}
                    <FlatList data={sexualityDATA}
                        renderItem={({ item, index }: any) => <ListCheckBox item={item} index={index} round={true} selectPronoun={selectPronoun} setSelectPronoun={setSelectPronoun} />}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ marginTop: filter ? 0 : metrics.hp2, paddingBottom: metrics.hp20 }}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </View>
                <LinearGradient colors={["#FFFFFF00", "#FFFFFF"]} style={{ paddingVertical: metrics.hp0 }}>
                    <GoButton visiBleProfile={true} colortrue={selectPronoun} onPress={() => onSubmit()} visible={showProfile} setShowProfile={setShowProfile} />
                </LinearGradient>
        </AppSafeAreaView>
    )
};
export default SexualityScreen;
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
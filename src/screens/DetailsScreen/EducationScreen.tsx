import React, { useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { FlatList, StyleSheet, View } from "react-native";
import HeaderCommon from "../../common/HeaderCommon";
import TopCommonLine from "../../common/TopCommonLine";
import DubleTextLine from "../../common/DubleTextLine";
import metrics from "../../assets/Metrics";
import { schoolIcon } from "../../helper/ImageAssets";
import ListCheckBox from "../../common/ListCheckbox";
import LinearGradient from "react-native-linear-gradient";
import GoButton from "../../common/GoButton";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_BELONG_SCREEN } from "../../navigation/routes";
import { educationDATA } from "../../common/UiltData";
import { useDispatch, useSelector } from "react-redux";
import { setAddProfile } from "../../slices/loginServices/authSlice";
import { toastAlert } from "../../actions/UploadImageActions";
import { editProfile } from "../../actions/authActions";

const EducationScreen = ({ route }: any) => {
    const dispatch = useDispatch();
    const addProfileData = useSelector((state: any) => state?.auth?.addProfileData);
    const filter = route?.params?.filter ?? "";
    const dataFilter = route?.params?.data ?? "";
    const datalistnew = new Array(6).fill(null).map((_, index) => ({ id: String(index), }))
    const [selectPronoun, setSelectPronoun] = useState(dataFilter ? dataFilter : "");
    const [showProfile, setShowProfile] = useState(true);
    const onSkip = () => {
        const dataToSave = {
            ...addProfileData,
            education: "",
            fieldVisibility: { ...addProfileData?.fieldVisibility, education: true }
        };
        dispatch(setAddProfile(dataToSave));
        NavigationService.navigate(NAVIGATION_BELONG_SCREEN)
    };
    const onSubmit = () => {
        if (!selectPronoun) return toastAlert.showToastError("Please add education")
        if (filter) {
            const dataToSave = {
                education: selectPronoun,
            };
            dispatch(editProfile(dataToSave))
        } else {
            const data = {
                ...addProfileData,
                education: selectPronoun,
                fieldVisibility: { ...addProfileData?.fieldVisibility, education: showProfile }

            };
            dispatch(setAddProfile(data))
            NavigationService.navigate(NAVIGATION_BELONG_SCREEN)
        }

    }
    return (
        <AppSafeAreaView>
            <HeaderCommon onSkip={onSkip} title={filter} skip={filter ? false : true} />
            <View style={styles.container}>
                {filter ? <></> :
                    <TopCommonLine icon={schoolIcon} datalist={datalistnew} />}
                <View style={{ paddingHorizontal: metrics.hp2 }}>
                    {filter ? <></> :
                        <DubleTextLine firstText={"What’s your highest level"} secondText={"of education?"} />}
                    <FlatList data={educationDATA}
                        renderItem={({ item, index }: any) => <ListCheckBox notsend={true} item={item} index={index} round={true} selectPronoun={selectPronoun} setSelectPronoun={setSelectPronoun} />}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ marginTop: filter ? 0 : metrics.hp2, paddingBottom: metrics.hp20 }}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </View>
            <LinearGradient colors={["#FFFFFF00", "#FFFFFF"]} style={{ paddingVertical: metrics.hp0 }}>
                <GoButton colortrue={selectPronoun} onPress={() => onSubmit()} visiBleProfile={true} visible={showProfile} setShowProfile={setShowProfile} />
            </LinearGradient>
        </AppSafeAreaView>
    )
};
export default EducationScreen;
const styles = StyleSheet.create({
    container: {
        marginTop: metrics.hp3,
        flex: 1,
    }
})
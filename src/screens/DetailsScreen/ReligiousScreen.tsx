import React, { useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { FlatList, StyleSheet, View } from "react-native";
import HeaderCommon from "../../common/HeaderCommon";
import TopCommonLine from "../../common/TopCommonLine";
import metrics from "../../assets/Metrics";
import { religiousIcon } from "../../helper/ImageAssets";
import DubleTextLine from "../../common/DubleTextLine";
import ListCheckBox from "../../common/ListCheckbox";
import LinearGradient from "react-native-linear-gradient";
import GoButton from "../../common/GoButton";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_DISTANCE_SCREEN, NAVIGATION_POLITICAL_SCREEN } from "../../navigation/routes";
import { colors } from "../../theme/colors";
import { Screen } from "../../theme/dimens";
import { religiousBeliefsDATA } from "../../common/UiltData";
import { useDispatch, useSelector } from "react-redux";
import { setAddProfile } from "../../slices/loginServices/authSlice";
import { toastAlert } from "../../actions/UploadImageActions";
import { editProfile } from "../../actions/authActions";

const ReligiousScreen = ({ route }: any) => {
    const dispatch = useDispatch();
    const addProfileData = useSelector((state: any) => state?.auth?.addProfileData);
    const filter = route?.params?.filter ?? "";
    const dataFilter = route?.params?.data ?? "";
    const datalistnew = new Array(4).fill(null).map((_, index) => ({ id: String(index), }))
    const [selectPronoun, setSelectPronoun] = useState(dataFilter?.length ? dataFilter : []);
    const [showProfile, setShowProfile] = useState(true);
    const onSkip = () => {
        const dataToSave = {
            ...addProfileData,
            relegiousBelief: [],
            fieldVisibility: { ...addProfileData?.fieldVisibility, relegiousBelief: true }
        };
        dispatch(setAddProfile(dataToSave));
        NavigationService.navigate(NAVIGATION_DISTANCE_SCREEN)
    };
    const onSubmit = () => {
        if (selectPronoun?.length == 0) return toastAlert.showToastError("Please add your religious beliefs")
        if (filter) {
            const dataToSave = {
                relegiousBelief: selectPronoun,
            };
            dispatch(editProfile(dataToSave))
        } else {
            const dataToSave = {
                ...addProfileData,
                relegiousBelief: selectPronoun,
                fieldVisibility: { ...addProfileData?.fieldVisibility, relegiousBelief: showProfile }
            };
            dispatch(setAddProfile(dataToSave));
            NavigationService.navigate(NAVIGATION_DISTANCE_SCREEN)
        }
    };
    return (
        <AppSafeAreaView>
            <HeaderCommon onSkip={onSkip} title={filter} skip={filter ? false : true} />
            {filter ?
                <View style={styles.singleLine} /> : <></>}
            <View style={styles.container}>
                {filter ? <></> :
                    <TopCommonLine icon={religiousIcon} datalist={datalistnew} />}
                <View style={{ paddingHorizontal: metrics.hp2 }}>
                    {filter ? <></> :
                        <DubleTextLine firstText={"Tell us about your"} secondText={"religious beliefs?"} />}
                    <FlatList data={religiousBeliefsDATA}
                        renderItem={({ item, index }: any) => <ListCheckBox notsend={true} item={item} index={index} selectPronoun={selectPronoun} setSelectPronoun={setSelectPronoun} />}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ marginTop: filter ? 0 : metrics.hp2, paddingBottom: metrics.hp20 }}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </View>
            <LinearGradient start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }} colors={["#FFFFFF00", colors.white, colors.white]}>
                <GoButton colortrue={selectPronoun?.length} onPress={() => onSubmit()} visiBleProfile={true} visible={showProfile} setShowProfile={setShowProfile} />
            </LinearGradient>
        </AppSafeAreaView>
    )
};
export default ReligiousScreen;
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
    }
})
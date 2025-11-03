import React, { useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { FlatList, StyleSheet, View } from "react-native";
import HeaderCommon from "../../common/HeaderCommon";
import TopCommonLine from "../../common/TopCommonLine";
import metrics from "../../assets/Metrics";
import { drikingIcon, moonIcon, workoutIcon } from "../../helper/ImageAssets";
import DubleTextLine from "../../common/DubleTextLine";
import ListCheckBox from "../../common/ListCheckbox";
import LinearGradient from "react-native-linear-gradient";
import GoButton from "../../common/GoButton";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_LANGUAGE_SPEAK_SCREEN, NAVIGATION_MEET_SOME_ONE_SCREEN } from "../../navigation/routes";
import { colors } from "../../theme/colors";
import { Screen } from "../../theme/dimens";
import { zodiacSignsDATA } from "../../common/UiltData";
import { useDispatch, useSelector } from "react-redux";
import { setAddProfile } from "../../slices/loginServices/authSlice";
import { toastAlert } from "../../actions/UploadImageActions";
import { editProfile } from "../../actions/authActions";

const ZodiacsignScreen = ({ route }: any) => {
    const dispatch = useDispatch();
    const addProfileData = useSelector((state: any) => state?.auth?.addProfileData);
    const filter = route?.params?.filter ?? "";
    const dataFilter = route?.params?.data ?? "";
    const datalistnew = new Array(2).fill(null).map((_, index) => ({ id: String(index), }))
    const [selectPronoun, setSelectPronoun] = useState(dataFilter ? dataFilter : "");
    const [showProfile, setShowProfile] = useState(true);

    const onSkip = () => {
        const dataToSave = {
            ...addProfileData,
            zodiaSign: "",
            fieldVisibility: { ...addProfileData?.fieldVisibility, zodiaSign: true }
        };
        dispatch(setAddProfile(dataToSave));
        NavigationService.navigate(NAVIGATION_LANGUAGE_SPEAK_SCREEN)
    };
    const onSubmit = () => {
        if (!selectPronoun) return toastAlert.showToastError("Please add your zodiac sing");
        if (filter) {
            const dataToSave = {
                zodiaSign: selectPronoun,
                fieldVisibility: { ...addProfileData?.fieldVisibility, zodiaSign: showProfile }
            };
            dispatch(editProfile(dataToSave))
        }
        else {
            const data = {
                ...addProfileData,
                zodiaSign: selectPronoun,
                fieldVisibility: { ...addProfileData?.fieldVisibility, zodiaSign: showProfile }

            };
            dispatch(setAddProfile(data))
            NavigationService.navigate(NAVIGATION_LANGUAGE_SPEAK_SCREEN)
        }
    }
    return (
        <AppSafeAreaView>
            <HeaderCommon onSkip={onSkip} title={filter} skip={filter ? false : true} />
            {filter ?
                <View style={styles.singleLine} /> : <></>}
            <View style={styles.container}>
                {filter ? <></> :
                    <TopCommonLine icon={moonIcon} datalist={datalistnew} />}
                <View style={{ paddingHorizontal: metrics.hp2 }}>
                    {filter ? <></> :
                        <DubleTextLine firstText={"What’s your zodiac sign?"} />}
                    <FlatList data={zodiacSignsDATA}
                        renderItem={({ item, index }: any) => <ListCheckBox notsend={true} item={item} index={index} round={true} selectPronoun={selectPronoun} setSelectPronoun={setSelectPronoun} />}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ marginTop: filter ? 0 : metrics.hp2, paddingBottom: metrics.hp20 }}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </View>
                <LinearGradient start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }} colors={["#FFFFFF00", colors.white, colors.white]}>
                    <GoButton onPress={() => onSubmit()} colortrue={selectPronoun} visiBleProfile={true} visible={showProfile} setShowProfile={setShowProfile} />
                </LinearGradient>
        </AppSafeAreaView>
    )
};
export default ZodiacsignScreen;
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
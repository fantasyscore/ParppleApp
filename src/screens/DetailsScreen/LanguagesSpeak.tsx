import React, { useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { FlatList, StyleSheet, View } from "react-native";
import HeaderCommon from "../../common/HeaderCommon";
import TopCommonLine from "../../common/TopCommonLine";
import DubleTextLine from "../../common/DubleTextLine";
import metrics from "../../assets/Metrics";
import { langIcon } from "../../helper/ImageAssets";
import SearchContainer from "../../common/SearchContainer";
import ListCheckBox from "../../common/ListCheckbox";
import LinearGradient from "react-native-linear-gradient";
import GoButton from "../../common/GoButton";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_PROCCED_SCREEN } from "../../navigation/routes";
import { colors } from "../../theme/colors";
import { Screen } from "../../theme/dimens";
import { languagesDATA } from "../../common/UiltData";
import { useDispatch, useSelector } from "react-redux";
import { setAddProfile } from "../../slices/loginServices/authSlice";
import { toastAlert } from "../../actions/UploadImageActions";
import { attributesGet, editProfile } from "../../actions/authActions";

const LanguageSpeak = ({ route }: any) => {
    const dispatch = useDispatch();
    const addProfileData = useSelector((state: any) => state?.auth?.addProfileData);
    const filter = route?.params?.filter ?? "";
    const dataFilter = route?.params?.data ?? "";
    const fieldVisibility = route?.params?.fieldVisibility ?? "";
    const datalistnew = new Array(1).fill(null).map((_, index) => ({ id: String(index), }))
    const [search, setSearch] = useState("");
    const [selectPronoun, setSelectPronoun] = useState(dataFilter?.length ? dataFilter : [])
    const [showProfile, setShowProfile] = useState(fieldVisibility ? fieldVisibility?.languages : true);
    const onSkip = () => {
        const dataToSave = {
            ...addProfileData,
            languages: [],
            fieldVisibility: { ...addProfileData?.fieldVisibility, languages: true }
        };
        dispatch(setAddProfile(dataToSave));
        NavigationService.navigate(NAVIGATION_PROCCED_SCREEN, { comming: "languages" })
    };
    const onSubmit = () => {
        if (selectPronoun?.length == 0) return toastAlert.showToastError("Please add language do you speak")
        if (filter) {
            const dataToSave = {
                languagePrefrence: selectPronoun,
                fieldVisibility: { languages: showProfile }
            };
            dispatch(editProfile(dataToSave))
        } else {
            const dataToSave = {
                ...addProfileData,
                languages: selectPronoun,
                fieldVisibility: { ...addProfileData?.fieldVisibility, languages: showProfile }
            };
            dispatch(setAddProfile(dataToSave));
            dispatch(attributesGet())
            NavigationService.navigate(NAVIGATION_PROCCED_SCREEN, { comming: "languages" })
        }
    };
    return (
        <AppSafeAreaView>
            <HeaderCommon onSkip={onSkip} title={filter} skip={false} />
            {filter ?
                <View style={styles.singleLine} /> : <></>}
            <View style={styles.container}>
                {filter ? <></> :
                    <TopCommonLine icon={langIcon} datalist={datalistnew} />}
                <View style={{ paddingHorizontal: metrics.hp2 }}>
                    {filter ? <></> :
                        <DubleTextLine firstText={"What languages do you"} secondText={"speak?"} />}
                    <SearchContainer onChangeText={setSearch} value={search} placeholder={"Search language"} />
                    <FlatList data={languagesDATA}
                        renderItem={({ item, index }: any) => <ListCheckBox notsend={true} item={item} index={index} selectPronoun={selectPronoun} setSelectPronoun={setSelectPronoun} />}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ marginTop: metrics.hp2, paddingBottom: metrics.hp30 }}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </View>
            <LinearGradient start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }} style={{ height: metrics.hp19 }} colors={["#ffffff50", colors.white, colors.white]}>
                <View style={{ marginTop: metrics.hp9 }}>
                    <GoButton colortrue={selectPronoun?.length == 0 ? false : true} onPress={() => onSubmit()} visiBleProfile={true} visible={showProfile} setShowProfile={setShowProfile} />
                </View>
            </LinearGradient>
        </AppSafeAreaView>
    )
};
export default LanguageSpeak;
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
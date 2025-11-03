import React, { useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { FlatList, StyleSheet, View } from "react-native";
import HeaderCommon from "../../common/HeaderCommon";
import TopCommonLine from "../../common/TopCommonLine";
import DubleTextLine from "../../common/DubleTextLine";
import GoButton from "../../common/GoButton";
import metrics from "../../assets/Metrics";
import ListCheckBox from "../../common/ListCheckbox";
import { familyIcon, ganderIcon, sexualityIcon } from "../../helper/ImageAssets";
import { AppText, INTER_MEDIUM, OPECITY, TWELVE } from "../../common/AppText";
import LinearGradient from "react-native-linear-gradient";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_DISTANCE_SCREEN, NAVIGATION_LIFE_STYLE_SCREEN } from "../../navigation/routes";
import { Screen } from "../../theme/dimens";
import { colors } from "../../theme/colors";
import { useDispatch, useSelector } from "react-redux";
import { setAddProfile } from "../../slices/loginServices/authSlice";
import { familyPlaingDATA } from "../../common/UiltData";
import { editProfile } from "../../actions/authActions";

const FamilyPlaningScreen = ({ route }: any) => {
    const dispatch = useDispatch();
    const addProfileData = useSelector((state: any) => state?.auth?.addProfileData);
    const filter = route?.params?.filter ?? "";
    const dataFilter = route?.params?.data ?? "";
    const datalistnew = new Array(8).fill(null).map((_, index) => ({ id: String(index), }))
    const [selectPronoun, setSelectPronoun] = useState(dataFilter ? dataFilter : "Don’t want children");
    const [showProfile, setShowProfile] = useState(true);
    const onSubmit = () => {
        if (filter) {
            const dataToSave = {
                familyPlanning: selectPronoun,
            };
            dispatch(editProfile(dataToSave))
        } else {
            const data = {
                ...addProfileData,
                familyPlanning: selectPronoun,
                fieldVisibility: { ...addProfileData?.fieldVisibility, familyPlanning: showProfile }
            };
            dispatch(setAddProfile(data))
            NavigationService.navigate(NAVIGATION_LIFE_STYLE_SCREEN)
        }
    }
    return (
        <AppSafeAreaView>
            <HeaderCommon title={filter} />
            {filter ?
                <View style={styles.singleLine} /> : <></>}
            <View style={styles.container}>
                {filter ? <></> :
                    <TopCommonLine icon={familyIcon} datalist={datalistnew} />}
                <View style={{ paddingHorizontal: metrics.hp2 }}>
                    {filter ? <></> :
                        <DubleTextLine firstText={"Tell us about your family"} secondText={"planning?"} />}
                    <FlatList data={familyPlaingDATA}
                        renderItem={({ item, index }: any) => <ListCheckBox notsend={true} item={item} index={index} round={true} selectPronoun={selectPronoun} setSelectPronoun={setSelectPronoun} />}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ marginTop: filter ? metrics.hp0 : metrics.hp2, paddingBottom: metrics.hp20 }}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </View>
                <LinearGradient colors={["#FFFFFF00", "#FFFFFF"]} style={{ paddingVertical: metrics.hp0 }}>
                    <GoButton visiBleProfile={true} onPress={() => onSubmit()} colortrue={true} visible={showProfile} setShowProfile={setShowProfile} />
                </LinearGradient>
        </AppSafeAreaView>
    )
};
export default FamilyPlaningScreen;
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
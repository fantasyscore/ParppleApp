import React, { useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { FlatList, StyleSheet, View } from "react-native";
import HeaderCommon from "../../common/HeaderCommon";
import TopCommonLine from "../../common/TopCommonLine";
import metrics from "../../assets/Metrics";
import { politicalIcon, religiousIcon } from "../../helper/ImageAssets";
import DubleTextLine from "../../common/DubleTextLine";
import ListCheckBox from "../../common/ListCheckbox";
import LinearGradient from "react-native-linear-gradient";
import GoButton from "../../common/GoButton";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_DISTANCE_SCREEN, NAVIGATION_SMOKING_SCREEN } from "../../navigation/routes";
import { useDispatch, useSelector } from "react-redux";
import { setAddProfile } from "../../slices/loginServices/authSlice";
import { toastAlert } from "../../actions/UploadImageActions";

const PoliticalScreen = ({ route }: any) => {
    const dispatch = useDispatch();
    const addProfileData = useSelector((state: any) => state?.auth?.addProfileData);
    const filter = route?.params?.filter ?? "";
    const datalistnew = new Array(3).fill(null).map((_, index) => ({ id: String(index), }))

    const [selectPronoun, setSelectPronoun] = useState(0);
    const [showProfile, setShowProfile] = useState(true);
    const datalist = new Array(5).fill(null).map((_, index) => ({
        id: String(index),
        title: "Not Political",
    }));
    const onSkip = () => {
        const dataToSave = {
            ...addProfileData,
            pronouns: "",
            fieldVisibility: { ...addProfileData?.fieldVisibility, relegiousBelief: true }
        };
        dispatch(setAddProfile(dataToSave));
        NavigationService.navigate(NAVIGATION_DISTANCE_SCREEN)
    };
    const onSubmit = () => {
        if(!selectPronoun) return toastAlert.showToastError("Please add your political beliefs")
        const dataToSave = {
            ...addProfileData,
            pronouns: selectPronoun,
            fieldVisibility: { ...addProfileData?.fieldVisibility, relegiousBelief: showProfile }
        };
        dispatch(setAddProfile(dataToSave));
        NavigationService.navigate(NAVIGATION_DISTANCE_SCREEN)
    };
    return (
        <AppSafeAreaView>
            <HeaderCommon title={filter} skip={filter ? false : true} />
            <View style={styles.container}>
                {filter ? <></> :
                    <TopCommonLine icon={politicalIcon} datalist={datalistnew} />}
                <View style={{ paddingHorizontal: metrics.hp2 }}>
                    {filter ? <></> :
                        <DubleTextLine firstText={"Tell us about your"} secondText={"political beliefs?"} />}
                    <FlatList data={datalist}
                        renderItem={({ item, index }: any) => <ListCheckBox item={item} index={index} round={true} selectPronoun={selectPronoun} setSelectPronoun={setSelectPronoun} />}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ marginTop: filter ? 0 : metrics.hp2, paddingBottom: metrics.hp20 }}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </View>
            {filter ? <></> :
                <LinearGradient start={{ x: 0, y: 1 }}
                    end={{ x: 0, y: 0 }} colors={["#FFFFFF00", "#FFFFFF"]} style={{ paddingVertical: metrics.hp2 }}>
                    <GoButton onPress={() => NavigationService.navigate(NAVIGATION_DISTANCE_SCREEN)} visiBleProfile={true} visible={showProfile} setShowProfile={setShowProfile} />
                </LinearGradient>}
        </AppSafeAreaView>
    )
};
export default PoliticalScreen;
const styles = StyleSheet.create({
    container: {
        marginTop: metrics.hp3,
        flex: 1,
    }
})
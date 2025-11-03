import React, { useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { FlatList, StyleSheet, View } from "react-native";
import HeaderCommon from "../../common/HeaderCommon";
import TopCommonLine from "../../common/TopCommonLine";
import DubleTextLine from "../../common/DubleTextLine";
import metrics from "../../assets/Metrics";
import { ganderIcon } from "../../helper/ImageAssets";
import ListCheckBox from "../../common/ListCheckbox";
import GoButton from "../../common/GoButton";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_SEXUALITY_SCREEN } from "../../navigation/routes";
import { useDispatch, useSelector } from "react-redux";
import { setAddProfile } from "../../slices/loginServices/authSlice";
import { ganderDATA } from "../../common/UiltData";
import { toastAlert } from "../../actions/UploadImageActions";
import { Screen } from "../../theme/dimens";
import { colors } from "../../theme/colors";
import { editProfile } from "../../actions/authActions";

const GanderScreen = ({ route }: any) => {
    const dispatch = useDispatch();
    const filter = route?.params?.filter ?? "";
    const dataFilter = route?.params?.data ?? "";
    const addProfileData = useSelector((state: any) => state?.auth?.addProfileData);
    const datalistnew = new Array(9).fill(null).map((_, index) => ({ id: String(index), }))
    const [selectPronoun, setSelectPronoun] = useState(dataFilter ? dataFilter : 'male');
    const [showProfile, setShowProfile] = useState(true);

    const onSubmit = () => {
        if (!selectPronoun) return toastAlert.showToastError("Please add gender")
        if (filter) {
            const dataToSave = {
                gender: selectPronoun,
            };
            dispatch(editProfile(dataToSave))
        } else {
            const data = {
                ...addProfileData,
                gender: selectPronoun,
                fieldVisibility: { gender: showProfile }
            };
            dispatch(setAddProfile(data))
            NavigationService.navigate(NAVIGATION_SEXUALITY_SCREEN)
        }
    }

    return (
        <AppSafeAreaView>
            <HeaderCommon title={filter} />
            {filter ?
                <View style={styles.singleLine} /> : <></>}
            <View style={styles.container}>
                {filter ? <></> :
                    <TopCommonLine icon={ganderIcon} datalist={datalistnew} />}
                <View style={{ paddingHorizontal: metrics.hp2 }}>
                    {filter ? <></> :
                        <DubleTextLine firstText={"Tell us about your"} secondText={"gender?"} />}
                    <FlatList data={ganderDATA}
                        renderItem={({ item, index }: any) => <ListCheckBox notsend={false} item={item} index={index} round={true} selectPronoun={selectPronoun} setSelectPronoun={setSelectPronoun} />}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ marginTop: filter ? 0 : metrics.hp2, paddingBottom: metrics.hp20 }}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </View>
            <GoButton visiBleProfile={true} colortrue={selectPronoun ? true : false} visible={showProfile} onPress={() => onSubmit()} setShowProfile={setShowProfile} />
        </AppSafeAreaView>
    )
};
export default GanderScreen;
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
import React, { useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { FlatList, StyleSheet, View } from "react-native";
import HeaderCommon from "../../common/HeaderCommon";
import TopCommonLine from "../../common/TopCommonLine";
import DubleTextLine from "../../common/DubleTextLine";
import GoButton from "../../common/GoButton";
import metrics from "../../assets/Metrics";
import ListCheckBox from "../../common/ListCheckbox";
import { dateIcon } from "../../helper/ImageAssets";
import { AppText, INTER_MEDIUM, OPECITY, TWELVE } from "../../common/AppText";
import LinearGradient from "react-native-linear-gradient";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_DATING_SCREEN } from "../../navigation/routes";
import { useDispatch, useSelector } from "react-redux";
import { setAddProfile } from "../../slices/loginServices/authSlice";
import { ganderDATA_DATING } from "../../common/UiltData";
import { toastAlert } from "../../actions/UploadImageActions";
import { editProfile } from "../../actions/authActions";
import { Screen } from "../../theme/dimens";
import { colors } from "../../theme/colors";

const DateScreen = ({ route }: any) => {
    const dispatch = useDispatch();
    const filter = route?.params?.filter ?? "";
    const dataFilter = route?.params?.data ?? "";
    const datalistnew = new Array(11).fill(null).map((_, index) => ({ id: String(index), }))
    const addProfileData = useSelector((state: any) => state?.auth?.addProfileData);
    const [selectPronoun, setSelectPronoun] = useState(dataFilter ? dataFilter : "");
    const onSubmit = () => {
        if (!selectPronoun) return toastAlert.showToastError("Please add gender")
        if (filter) {
            const dataToSave = {
                preferredGender: selectPronoun,
            };
            dispatch(editProfile(dataToSave))
        } else {
            const data = {
                ...addProfileData,
                preferredGender: selectPronoun,
                fieldVisibility: { ...addProfileData?.fieldVisibility }
            };
            dispatch(setAddProfile(data))
            NavigationService.navigate(NAVIGATION_DATING_SCREEN)
        }
    }
    return (
        <AppSafeAreaView>
            <HeaderCommon title={filter} />
            {filter ?
                <View style={styles.singleLine} /> : <></>}
            <View style={styles.container}>
                {filter ? <></> :
                    <TopCommonLine icon={dateIcon} datalist={datalistnew} />
                }
                <View style={{ paddingHorizontal: metrics.hp2 }}>
                    {filter ? <></> :
                        <DubleTextLine firstText={"Whom would you like to"} secondText={"date?"} />}
                    {filter ? <></> :
                        <AppText style={{ marginTop: -metrics.hp2 }} type={TWELVE} weight={INTER_MEDIUM} color={OPECITY}>
                            Select whom you like to date.
                        </AppText>}
                    <FlatList data={ganderDATA_DATING}
                        renderItem={({ item, index }: any) => <ListCheckBox item={item} index={index} round={true} selectPronoun={selectPronoun} setSelectPronoun={setSelectPronoun} />}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ marginTop: filter ? 0 : metrics.hp2, paddingBottom: metrics.hp20 }}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </View>
            <LinearGradient start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }} style={{ height: metrics.hp19 }} colors={["#ffffff50", colors.white, colors.white]}>
                <View style={{ marginTop: metrics.hp9 }}>
                    <GoButton visiBleProfile={false} colortrue={selectPronoun} onPress={() => onSubmit()} />
                </View>
            </LinearGradient>
        </AppSafeAreaView>
    )
};
export default DateScreen;
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
import React, { useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { FlatList, StyleSheet, View } from "react-native";
import HeaderCommon from "../../common/HeaderCommon";
import TopCommonLine from "../../common/TopCommonLine";
import DubleTextLine from "../../common/DubleTextLine";
import metrics from "../../assets/Metrics";
import { partnerheart } from "../../helper/ImageAssets";
import ListCheckBox from "../../common/ListCheckbox";
import LinearGradient from "react-native-linear-gradient";
import GoButton from "../../common/GoButton";
import NavigationService from "../../navigation/NavigationService";
import { colors } from "../../theme/colors";
import { NAVIGATION_DATE_SCREEN } from "../../navigation/routes";
import { useDispatch, useSelector } from "react-redux";
import { setAddProfile } from "../../slices/loginServices/authSlice";
import { relationShipStatus } from "../../common/UiltData";
import { Screen } from "../../theme/dimens";
import { editProfile } from "../../actions/authActions";

const RelationStatus = ({ route }: any) => {
    const dispatch = useDispatch();
    const filter = route?.params?.filter ?? "";
    const dataFilter = route?.params?.data ?? "";
    const addProfileData = useSelector((state: any) => state?.auth?.addProfileData);
    const datalistnew = new Array(12).fill(null).map((_, index) => ({ id: String(index), }))
    const [selectPronoun, setSelectPronoun] = useState(dataFilter ? dataFilter : "single");
    const onSubmit = () => {
        if (filter) {
            const dataToSave = {
                relationsShipStatus: selectPronoun,
            };
            dispatch(editProfile(dataToSave))
        } else {
            const data = {
                ...addProfileData,
                relationsShipStatus: selectPronoun,
                fieldVisibility: { ...addProfileData?.fieldVisibility }
            };
            dispatch(setAddProfile(data))
            NavigationService.navigate(NAVIGATION_DATE_SCREEN)
        }
    }
    return (
        <AppSafeAreaView>
            <HeaderCommon title={filter} />
            {filter ?
                <View style={styles.singleLine} /> : <></>}
            <View style={styles.container}>
                {filter ? <></> :
                    <TopCommonLine icon={partnerheart} datalist={datalistnew} />}
                <View style={{ paddingHorizontal: metrics.hp2 }}>
                    {filter ? <></> :
                        <DubleTextLine firstText={"What’s your relationship"} secondText={"status?"} />}
                    <FlatList data={relationShipStatus}
                        renderItem={({ item, index }: any) => <ListCheckBox item={item} index={index} round={true} selectPronoun={selectPronoun} setSelectPronoun={setSelectPronoun} notsend={true}/>}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ marginTop: filter ? 0 : metrics.hp2, paddingBottom: metrics.hp20 }}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </View>
            <LinearGradient colors={["#FFFFFF00", colors.white, colors.white]}>
                <GoButton visiBleProfile={false} colortrue={selectPronoun} onPress={() => onSubmit()} />
            </LinearGradient>
        </AppSafeAreaView>
    )
};
export default RelationStatus;
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
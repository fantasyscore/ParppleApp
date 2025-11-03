import React, { useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { FlatList, StyleSheet, View } from "react-native";
import HeaderCommon from "../../common/HeaderCommon";
import TopCommonLine from "../../common/TopCommonLine";
import DubleTextLine from "../../common/DubleTextLine";
import metrics from "../../assets/Metrics";
import { pronounIcon } from "../../helper/ImageAssets";
import ListCheckBox from "../../common/ListCheckbox";
import GoButton from "../../common/GoButton";
import { colors } from "../../theme/colors";
import LinearGradient from 'react-native-linear-gradient';
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_GANDER_SCREEN } from "../../navigation/routes";
import { Screen } from "../../theme/dimens";
import { pronounDATA } from "../../common/UiltData";
import { useDispatch, useSelector } from "react-redux";
import { setAddProfile } from "../../slices/loginServices/authSlice";
import { toastAlert } from "../../actions/UploadImageActions";
import { editProfile } from "../../actions/authActions";

const PronounScreen = ({ route }: any) => {
    const dispatch = useDispatch();
    const filter = route?.params?.filter ?? "";
    const dataFilter = route?.params?.data ?? "";
    const datalistnew = new Array(10).fill(null).map((_, index) => ({ id: String(index), }))
    const addProfileData = useSelector((state: any) => state?.auth?.addProfileData);
    const [selectPronoun, setSelectPronoun] = useState(dataFilter?.length ? dataFilter : []);
    const [showProfile, setShowProfile] = useState(true);
    const onSkip = () => {
        const dataToSave = {
            ...addProfileData,
            pronouns: [],
        };

        dispatch(setAddProfile(dataToSave));
        NavigationService.navigate(NAVIGATION_GANDER_SCREEN)
    };
    const onSubmit = () => {
        if (filter) {
            const dataToSave = {
                pronouns: selectPronoun,
            };
            dispatch(editProfile(dataToSave))
        }
        else {
            if (selectPronoun?.length == 0) return toastAlert.showToastError("Please add pronoun")
            const dataToSave = {
                ...addProfileData,
                pronouns: selectPronoun,
            };
            dispatch(setAddProfile(dataToSave));
            NavigationService.navigate(NAVIGATION_GANDER_SCREEN)
        }
    };
    return (
        <AppSafeAreaView>
            <HeaderCommon onSkip={onSkip} skip={filter ? false : true} title={filter} />
            {filter ?
                <View style={styles.singleLine} /> : <></>}
            <View style={styles.container}>
                {filter ? <></> :
                    <TopCommonLine icon={pronounIcon} datalist={datalistnew} />}
                <View style={{ paddingHorizontal: metrics.hp2 }}>
                    {filter ? <></> :
                        <DubleTextLine firstText={"How your pronoun would"} secondText={"you be like to be called?"} />}
                    <FlatList data={pronounDATA}
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
export default PronounScreen;
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
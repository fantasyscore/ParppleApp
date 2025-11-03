import React, { useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { FlatList, StyleSheet, View } from "react-native";
import HeaderCommon from "../../common/HeaderCommon";
import TopCommonLine from "../../common/TopCommonLine";
import DubleTextLine from "../../common/DubleTextLine";
import metrics from "../../assets/Metrics";
import { homeIcon, schoolIcon, workIcon } from "../../helper/ImageAssets";
import InputCommon from "../../common/InputCommon";
import GoButton from "../../common/GoButton";
import { AppText, INTER_MEDIUM, OPECITY, TWELVE } from "../../common/AppText";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_JOB_TITLE_SCREEN } from "../../navigation/routes";
import ListCheckBox from "../../common/ListCheckbox";
import { Screen } from "../../theme/dimens";
import { colors } from "../../theme/colors";
import { workDATA } from "../../common/UiltData";
import { useDispatch, useSelector } from "react-redux";
import { setAddProfile } from "../../slices/loginServices/authSlice";
import { toastAlert } from "../../actions/UploadImageActions";
import { editProfile } from "../../actions/authActions";

const WorkPlace = ({ route }: any) => {
    const dispatch = useDispatch();
    const addProfileData = useSelector((state: any) => state?.auth?.addProfileData);
    const filter = route?.params?.filter ?? "";
    const dataFilter = route?.params?.data ?? "";
    const datalistnew = new Array(4).fill(null).map((_, index) => ({ id: String(index), }))
    const [email, setEmail] = useState("");
    const [selectPronoun, setSelectPronoun] = useState(dataFilter ? dataFilter : "");
    const [showProfile, setShowProfile] = useState(true);

    const onSkip = () => {
        const dataToSave = {
            ...addProfileData,
            work: "",
            fieldVisibility: { ...addProfileData?.fieldVisibility, work: true }
        };
        dispatch(setAddProfile(dataToSave));
        NavigationService.navigate(NAVIGATION_JOB_TITLE_SCREEN)
    };
    const onSubmit = () => {
        if (!selectPronoun) return toastAlert.showToastError("Please add working place")
        if (filter) {
            const dataToSave = {
                work: selectPronoun,
            };
            dispatch(editProfile(dataToSave))
        } else {
            const data = {
                ...addProfileData,
                work: selectPronoun,
                fieldVisibility: { ...addProfileData?.fieldVisibility, work: showProfile }

            };
            dispatch(setAddProfile(data))
            NavigationService.navigate(NAVIGATION_JOB_TITLE_SCREEN)
        }
    }
    return (
        <AppSafeAreaView>
            <HeaderCommon onSkip={onSkip} title={filter} skip={filter ? false : true} />
            {filter ?
                <View style={styles.singleLine} /> : <></>}
            <View style={styles.container}>
                {filter ? <></> :
                    <TopCommonLine icon={workIcon} datalist={datalistnew} />}
                <View style={{ paddingHorizontal: metrics.hp2 }}>
                    {filter ? <></> :
                        <DubleTextLine firstText={"Where do you work?"} />}
                    {filter ? <></> :
                        <AppText style={{ marginTop: -metrics.hp2 }} type={TWELVE} weight={INTER_MEDIUM} color={OPECITY}>
                            Tell us about your working place.
                        </AppText>}
                    <FlatList data={workDATA}
                        renderItem={({ item, index }: any) => <ListCheckBox notsend={true} item={item} index={index} round={true} selectPronoun={selectPronoun} setSelectPronoun={setSelectPronoun} />}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ marginTop: filter ? 0 : metrics.hp2, paddingBottom: metrics.hp20 }}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </View>
            <GoButton onPress={() => onSubmit()} colortrue={selectPronoun} visiBleProfile={true} visible={showProfile} setShowProfile={setShowProfile} />
        </AppSafeAreaView>
    )
};
export default WorkPlace;
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
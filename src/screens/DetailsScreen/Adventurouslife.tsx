import React, { useEffect, useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { ScrollView, StyleSheet, View } from "react-native";
import HeaderCommon from "../../common/HeaderCommon";
import TopCommonLine from "../../common/TopCommonLine";
import DubleTextLine from "../../common/DubleTextLine";
import { AppText, INTER_MEDIUM, OPECITY, TWELVE } from "../../common/AppText";
import metrics from "../../assets/Metrics";
import { advantureIcob, crewIcon, getawayIcoin, nightPreferenceIcon, sheekIcon } from "../../helper/ImageAssets";
import { Screen } from "../../theme/dimens";
import { colors } from "../../theme/colors";
import MultyContainer from "../../common/MultyContainer";
import GoButton from "../../common/GoButton";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_PERSONAL_INTEREST_SCREEN } from "../../navigation/routes";
import { useDispatch, useSelector } from "react-redux";
import { toastAlert } from "../../actions/UploadImageActions";
import { setAddProfile, setfilterData } from "../../slices/loginServices/authSlice";

const Adcenturouslife = ({ route }: any) => {
    const dispatch = useDispatch();
    const filter = route?.params?.filter ?? "";
    const dataFilter = route?.params?.data ?? [];
    const ids = route?.params?.ids ?? [];
    const isAdvanceFilter = route?.params?.isAdvanceFilter ?? false;
    const advanceFilterKey = route?.params?.advanceFilterKey ?? "prefferedAdventureAttributes";
    const datalistnew = new Array(6).fill(null).map((_, index) => ({ id: String(index), }));
    const addProfileData = useSelector((state: any) => state?.auth?.addProfileData);
    const attributes = useSelector((state: any) => state.auth.attributes);
    const filterDataState = useSelector((state: any) => state?.auth?.filterData);
    const getaway = attributes.find((item: any) => item._id === 'getaway');
    const dateNight = attributes.find((item: any) => item._id === 'dateNight');
    const traitsSeeks = attributes.find((item: any) => item._id === 'traitsSeeks');
    const crew = attributes.find((item: any) => item._id === 'crew');
    const [selectedgetway, setSelectedgetway] = useState<string | null>(null);
    const [selectedcrew, setSelectedcrew] = useState<string | null>(null);
    const [selectedpreference, setSelectedpreference] = useState<string | null>(null);
    const [selectedseek, setSelectedseek] = useState<string | null>(null);
    const selectedCategories = [selectedgetway, selectedcrew, selectedpreference, selectedseek].filter(Boolean);

    useEffect(() => {
        if (dataFilter?.length) {
            const findMatch = (category: any) => {
                const match = category?.attributes?.find((attr: any) =>
                    dataFilter?.find((value: any) => attr?._id == value?._id)
                );
                return match?._id || null;
            };
            setSelectedgetway(findMatch(getaway));
            setSelectedcrew(findMatch(crew));
            setSelectedpreference(findMatch(dateNight));
            setSelectedseek(findMatch(traitsSeeks));
        }
    }, [dataFilter, attributes]);

    const onSkip = () => {
        const dataToSave = {
            ...addProfileData,
            attribute: [
                ...(addProfileData?.attribute || []),
                ...[],
            ],
        };
        dispatch(setAddProfile(dataToSave));
        NavigationService.navigate(NAVIGATION_PERSONAL_INTEREST_SCREEN)
    };
    const onSubmit = () => {
        if (isAdvanceFilter && filter) {
            if (selectedCategories.length < 1) {
                return toastAlert.showToastError("Please select at least 1 option");
            }
            const combined = [...ids, ...selectedCategories].filter(Boolean);
            const unique = Array.from(new Set(combined));
            const dataToSave = {
                ...filterDataState,
                [advanceFilterKey]: unique,
            };
            dispatch(setfilterData(dataToSave));
            NavigationService.goBack();
            return;
        }

        if (selectedgetway && selectedcrew && selectedpreference && selectedseek) {
            const dataToSave = {
                ...addProfileData,
                attribute: [
                    ...(addProfileData?.attribute || []),
                    ...selectedCategories,
                ],
            };
            dispatch(setAddProfile(dataToSave));
            NavigationService.navigate(NAVIGATION_PERSONAL_INTEREST_SCREEN)
        } else {
            return toastAlert.showToastError(`Please Select any ${4 - selectedCategories?.length} interests`);
        }
    };
    const onNavigate = () => {
        if (selectedgetway && selectedcrew && selectedpreference && selectedseek) {
            return true
        } else {
            return false
        }
    }
    return (
        <AppSafeAreaView>
            <HeaderCommon onSkip={onSkip} skip={filter ? false : true} title={filter} />
            {filter ?
                <View style={styles.singleLine} /> : <></>}
            <View style={styles.container}>
                {filter ? <></> :
                    <TopCommonLine icon={advantureIcob} datalist={datalistnew} />}
                <View style={{ paddingHorizontal: metrics.hp2 }}>
                    {filter ? <></> : <DubleTextLine firstText={"How’s your adventurous"} secondText={"life?"} />}
                    <AppText style={{ marginTop: -metrics.hp2 }} type={TWELVE} weight={INTER_MEDIUM} color={OPECITY}>
                        Select any 4 interests.
                    </AppText>
                </View>
                {filter ? <></> :
                    <View style={styles.singleLine} />}
                <ScrollView contentContainerStyle={{ paddingBottom: metrics.hp10 }} showsVerticalScrollIndicator={false}>
                    <MultyContainer data={getaway?.attributes?.length ? getaway?.attributes : []} setSelectedCategory={setSelectedgetway} selectedCategory={selectedgetway} firstIcon={getawayIcoin} title={"What’s your ultimate getaway?"} />
                    <MultyContainer data={crew?.attributes?.length ? crew?.attributes : []} setSelectedCategory={setSelectedcrew} selectedCategory={selectedcrew} firstIcon={crewIcon} title={"Who’s your ideal crew?"} />
                    <MultyContainer data={dateNight?.attributes?.length ? dateNight?.attributes : []} setSelectedCategory={setSelectedpreference} selectedCategory={selectedpreference} firstIcon={sheekIcon} title={"What’s your date night preference?"} />
                    <MultyContainer data={traitsSeeks?.attributes?.length ? traitsSeeks?.attributes : []} setSelectedCategory={setSelectedseek} selectedCategory={selectedseek} firstIcon={nightPreferenceIcon} title={"What Traits do you seek?"} />
                </ScrollView>
            </View>
            <View style={{
                position: "absolute", bottom: metrics.hp1,
                right: metrics.hp0,
            }}>
                <GoButton colortrue={filter ? selectedCategories?.length >= 1 : onNavigate()} onPress={() => onSubmit()} />
            </View>
        </AppSafeAreaView>
    )
};
export default Adcenturouslife;
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
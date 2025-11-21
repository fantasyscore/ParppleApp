import React, { useEffect, useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { ScrollView, StyleSheet, View } from "react-native";
import HeaderCommon from "../../common/HeaderCommon";
import TopCommonLine from "../../common/TopCommonLine";
import DubleTextLine from "../../common/DubleTextLine";
import { AppText, TWELVE, INTER_MEDIUM, OPECITY } from "../../common/AppText";
import metrics from "../../assets/Metrics";
import { drikingIcon, lifeStyleIcon, petsIcon, smookingIcon, workIcon } from "../../helper/ImageAssets";
import { Screen } from "../../theme/dimens";
import { colors } from "../../theme/colors";
import MultyContainer from "../../common/MultyContainer";
import GoButton from "../../common/GoButton";
import { NAVIGATION_ADCENTUOURS_SCREEN } from "../../navigation/routes";
import NavigationService from "../../navigation/NavigationService";
import { useDispatch, useSelector } from "react-redux";
import { toastAlert } from "../../actions/UploadImageActions";
import { setAddProfile } from "../../slices/loginServices/authSlice";
import { editProfile } from "../../actions/authActions";

const LifestyleScreen = ({ route }: any) => {
    const dispatch = useDispatch();
    const filter = route?.params?.filter ?? "";
    const dataFilter = route?.params?.data ?? [];
    const ids = route?.params?.ids ?? [];
    const attributes = useSelector((state: any) => state.auth.attributes);
    const addProfileData = useSelector((state: any) => state?.auth?.addProfileData);
    const workout = attributes.find((item: any) => item._id === "workout");
    const smoke = attributes.find((item: any) => item._id === "smoke");
    const drink = attributes.find((item: any) => item._id === "drink");
    const pets = attributes.find((item: any) => item._id === "pets");
    const [selectedSmoke, setSelectedSmoke] = useState<string | null>(null);
    const [selectedDrink, setSelectedDrink] = useState<string | null>(null);
    const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);
    const [selectedPets, setSelectedPets] = useState<string | null>(null);
    const selectedCategories = [selectedSmoke, selectedDrink, selectedWorkout, selectedPets].filter(Boolean);
    useEffect(() => {
        if (dataFilter?.length) {
            const findMatch = (category: any) => {
                const match = category?.attributes?.find((attr: any) =>
                    dataFilter?.find((value: any) => attr?._id == value?._id)
                );
                return match?._id || null;
            };
            setSelectedSmoke(findMatch(smoke));
            setSelectedDrink(findMatch(drink));
            setSelectedWorkout(findMatch(workout));
            setSelectedPets(findMatch(pets));
        }
    }, [dataFilter, attributes]);
    const onSkip = () => {
        const dataToSave = {
            ...addProfileData,
            attribute: [],
        };
        dispatch(setAddProfile(dataToSave));
        NavigationService.navigate(NAVIGATION_ADCENTUOURS_SCREEN);
    };
    const onSubmit = () => {
        if (filter) {
            const combined = [...ids, ...selectedCategories];
            const dataToSave = {
                attribute: combined,
            };
            dispatch(editProfile(dataToSave))
        } else {
            if (selectedCategories.length != 4) return toastAlert.showToastError(`Please select ${4 - selectedCategories?.length} answer`);
            const dataToSave = {
                ...addProfileData,
                attribute: selectedCategories,
            };
            dispatch(setAddProfile(dataToSave));
            NavigationService.navigate(NAVIGATION_ADCENTUOURS_SCREEN);
        }
    };

    return (
        <AppSafeAreaView>
            <HeaderCommon onSkip={onSkip}    skip={filter ? false : true} title={filter} />
            {filter ? <View style={styles.singleLine} /> : null}
            <View style={styles.container}>
                {!filter &&
                    <>
                        <TopCommonLine icon={lifeStyleIcon} datalist={new Array(7).fill(null)} />
                        <View style={{ paddingHorizontal: metrics.hp2 }}>
                            <DubleTextLine firstText={"Tell us about your"} secondText={"lifestyle."} />
                            <AppText style={{ marginTop: -metrics.hp2 }} type={TWELVE} weight={INTER_MEDIUM} color={OPECITY}>
                                Select one per question.
                            </AppText>
                        </View>
                        <View style={styles.singleLine} />
                    </>
                }
                <ScrollView contentContainerStyle={{ paddingBottom: metrics.hp10 }} showsVerticalScrollIndicator={false}>
                    <MultyContainer
                        data={smoke?.attributes || []}
                        selectedCategory={selectedSmoke}
                        setSelectedCategory={setSelectedSmoke}
                        firstIcon={smookingIcon}
                        title={"How often do you smoke?"}
                    />
                    <MultyContainer
                        data={drink?.attributes || []}
                        selectedCategory={selectedDrink}
                        setSelectedCategory={setSelectedDrink}
                        firstIcon={drikingIcon}
                        title={"How often do you drink?"}
                    />
                    <MultyContainer
                        data={workout?.attributes || []}
                        selectedCategory={selectedWorkout}
                        setSelectedCategory={setSelectedWorkout}
                        firstIcon={workIcon}
                        title={"Do you workout?"}
                    />
                    <MultyContainer
                        data={pets?.attributes || []}
                        selectedCategory={selectedPets}
                        setSelectedCategory={setSelectedPets}
                        firstIcon={petsIcon}
                        title={"Do you have any pets?"}
                    />
                </ScrollView>
            </View>
            <View style={{ position: "absolute", bottom: metrics.hp1, right: metrics.hp0 }}>
                <GoButton colortrue={filter ? selectedCategories?.length >= 1 ? true : false : selectedCategories?.length == 4 ? true : false} onPress={onSubmit} />
            </View>
        </AppSafeAreaView>
    );
};

export default LifestyleScreen;

const styles = StyleSheet.create({
    container: {
        marginTop: metrics.hp3,
        flex: 1,
    },
    singleLine: {
        height: metrics.hp0_2,
        width: Screen.Width,
        backgroundColor: colors.nanoOpecity,
        marginTop: metrics.hp2,
    },
});

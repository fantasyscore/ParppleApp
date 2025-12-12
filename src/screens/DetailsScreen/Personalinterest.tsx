import React, { useState, useEffect } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { ScrollView, StyleSheet, View } from "react-native";
import HeaderCommon from "../../common/HeaderCommon";
import TopCommonLine from "../../common/TopCommonLine";
import DubleTextLine from "../../common/DubleTextLine";
import { AppText, INTER_MEDIUM, OPECITY, TWELVE } from "../../common/AppText";
import metrics from "../../assets/Metrics";
import {
    activityIcon,
    creativeIcon,
    crewIcon,
    filmIcon,
    foodIcon,
    gamingIcon,
    getawayIcoin,
    musicIcon,
    nightPreferenceIcon,
    personHeartIcon,
    popularIcon,
    sheekIcon,
    sportsIcon,
} from "../../helper/ImageAssets";
import { Screen } from "../../theme/dimens";
import { colors } from "../../theme/colors";
import MultyContainer from "../../common/MultyContainer";
import GoButton from "../../common/GoButton";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_DISTANCE_SCREEN, NAVIGATION_RELIGIOUS_SCREEN } from "../../navigation/routes";
import { useDispatch, useSelector } from "react-redux";
import { toastAlert } from "../../actions/UploadImageActions";
import { setAddProfile } from "../../slices/loginServices/authSlice";
import { editProfile } from "../../actions/authActions";

const Personalinterest = ({ route }: any) => {
    const dispatch = useDispatch();
    const filter = route?.params?.filter ?? "";
    const dataFilter = route?.params?.data ?? [];
    const ids = route?.params?.ids ?? [];
    const datalistnew = new Array(5).fill(null).map((_, index) => ({ id: String(index) }));
    const attributes = useSelector((state: any) => state.auth.attributes);
    const addProfileData = useSelector((state: any) => state?.auth?.addProfileData);
    const popular = attributes.find((item: any) => item._id === "popular");
    const creativity = attributes.find((item: any) => item._id === "creativity");
    const filmAndLiterature = attributes.find((item: any) => item._id === "filmAndLiterature");
    const music = attributes.find((item: any) => item._id === "music");
    const activity = attributes.find((item: any) => item._id === "activity");
    const foodAndDrink = attributes.find((item: any) => item._id === "foodAndDrink");
    const sports = attributes.find((item: any) => item._id === "sports");
    const gaming = attributes.find((item: any) => item._id === "gaming");
    const getaway = attributes.find((item: any) => item._id === 'getaway');
    const dateNight = attributes.find((item: any) => item._id === 'dateNight');
    const traitsSeeks = attributes.find((item: any) => item._id === 'traitsSeeks');
    const crew = attributes.find((item: any) => item._id === 'crew');
    const [selectedpopular, setSelectedPopular] = useState<string | null>(null);
    const [selectedcreativity, setSelectedcreativity] = useState<string | null>(null);
    const [selectedfilmAndLiterature, setSelectedfilmAndLiterature] = useState<string | null>(null);
    const [selectedmusic, setSelectedmusic] = useState<string | null>(null);
    const [selectedfoodAndDrink, setSelectedfoodAndDrink] = useState<string | null>(null);
    const [selectedactivity, setSelectedactivity] = useState<string | null>(null);
    const [selectedsports, setSelectedsports] = useState<string | null>(null);
    const [selectedgaming, setSelectedgaming] = useState<string | null>(null);
    const [selectedgetway, setSelectedgetway] = useState<string | null>(null);
    const [selectedcrew, setSelectedcrew] = useState<string | null>(null);
    const [selectedpreference, setSelectedpreference] = useState<string | null>(null);
    const [selectedseek, setSelectedseek] = useState<string | null>(null);
    useEffect(() => {
        if (dataFilter?.length) {
            const findMatch = (category: any) => {
                const match = category?.attributes?.find((attr: any) =>
                    dataFilter?.find((value: any) => attr?._id == value?._id)
                );
                return match?._id || null;
            };
            setSelectedPopular(findMatch(popular));
            setSelectedcreativity(findMatch(creativity));
            setSelectedfilmAndLiterature(findMatch(filmAndLiterature));
            setSelectedmusic(findMatch(music));
            setSelectedfoodAndDrink(findMatch(foodAndDrink));
            setSelectedactivity(findMatch(activity));
            setSelectedsports(findMatch(sports));
            setSelectedgaming(findMatch(gaming));
            setSelectedgetway(findMatch(getaway));
            setSelectedcrew(findMatch(crew));
            setSelectedpreference(findMatch(dateNight));
            setSelectedseek(findMatch(traitsSeeks));
        }
    }, [dataFilter, attributes]);

    const selectedCategories = [
        selectedpopular,
        selectedcreativity,
        selectedfilmAndLiterature,
        selectedmusic,
        selectedfoodAndDrink,
        selectedactivity,
        selectedsports,
        selectedgaming,
    ].filter(Boolean);
    const selectedCategoriesTwo = [
        selectedpopular,
        selectedcreativity,
        selectedfilmAndLiterature,
        selectedmusic,
        selectedfoodAndDrink,
        selectedactivity,
        selectedsports,
        selectedgaming,
        selectedgetway,
        selectedcrew,
        selectedpreference,
        selectedseek
    ].filter(Boolean);

    const onSkip = () => {
        const dataToSave = {
            ...addProfileData,
            attribute: [...(addProfileData?.attribute || []), ...[]],
        };
        dispatch(setAddProfile(dataToSave));
        NavigationService.navigate(NAVIGATION_DISTANCE_SCREEN);
    };
    const onSubmit = () => {
        if (filter) {
            const combined = [...ids, ...selectedCategoriesTwo];
            const dataToSave = {
                attribute: combined,
            };
            dispatch(editProfile(dataToSave))
        } else {
            if (selectedCategories?.length < 5)
                return toastAlert.showToastError(`Please select any ${5 - selectedCategories?.length} interests`);

            const dataToSave = {
                ...addProfileData,
                attribute: [...(addProfileData?.attribute || []), ...selectedCategories],
            };
            dispatch(setAddProfile(dataToSave));
            NavigationService.navigate(NAVIGATION_DISTANCE_SCREEN);
        }
    };

    return (
        <AppSafeAreaView>
            <HeaderCommon onSkip={onSkip} skip={filter ? false : true} title={filter} />
            {filter ? <View style={styles.singleLine} /> : null}
            <View style={styles.container}>
                {!filter && (
                    <>
                        <TopCommonLine icon={personHeartIcon} datalist={datalistnew} />
                        <View style={{ paddingHorizontal: metrics.hp2 }}>
                            <DubleTextLine firstText={"Tell us about your"} secondText={"personal interest?"} />
                            <AppText style={{ marginTop: -metrics.hp1 }} type={TWELVE} weight={INTER_MEDIUM} color={OPECITY}>
                                Select any 5 interests.
                            </AppText>
                        </View>
                        <View style={styles.singleLine} />
                    </>
                )}
                <ScrollView contentContainerStyle={{ paddingBottom: metrics.hp10 }} showsVerticalScrollIndicator={false}>
                    <MultyContainer data={popular?.attributes ?? []} setSelectedCategory={setSelectedPopular} selectedCategory={selectedpopular} firstIcon={popularIcon} title={"Popular"} />
                    <MultyContainer data={creativity?.attributes ?? []} setSelectedCategory={setSelectedcreativity} selectedCategory={selectedcreativity} firstIcon={creativeIcon} title={"Creativity"} />
                    <MultyContainer data={filmAndLiterature?.attributes ?? []} setSelectedCategory={setSelectedfilmAndLiterature} selectedCategory={selectedfilmAndLiterature} firstIcon={filmIcon} title={"Film & Literature"} />
                    <MultyContainer data={music?.attributes ?? []} setSelectedCategory={setSelectedmusic} selectedCategory={selectedmusic} firstIcon={musicIcon} title={"Music"} />
                    <MultyContainer data={activity?.attributes ?? []} setSelectedCategory={setSelectedactivity} selectedCategory={selectedactivity} firstIcon={activityIcon} title={"Activity"} />
                    <MultyContainer data={gaming?.attributes ?? []} setSelectedCategory={setSelectedgaming} selectedCategory={selectedgaming} firstIcon={gamingIcon} title={"Gaming"} />
                    <MultyContainer data={foodAndDrink?.attributes ?? []} setSelectedCategory={setSelectedfoodAndDrink} selectedCategory={selectedfoodAndDrink} firstIcon={foodIcon} title={"Food & Drink"} />
                    <MultyContainer data={sports?.attributes ?? []} setSelectedCategory={setSelectedsports} selectedCategory={selectedsports} firstIcon={sportsIcon} title={"Sports"} />
                    {filter &&
                        <>
                            <MultyContainer data={getaway?.attributes?.length ? getaway?.attributes : []} setSelectedCategory={setSelectedgetway} selectedCategory={selectedgetway} firstIcon={getawayIcoin} title={"What’s your ultimate getaway?"} />
                            <MultyContainer data={crew?.attributes?.length ? crew?.attributes : []} setSelectedCategory={setSelectedcrew} selectedCategory={selectedcrew} firstIcon={crewIcon} title={"Who’s your ideal crew?"} />
                            <MultyContainer data={dateNight?.attributes?.length ? dateNight?.attributes : []} setSelectedCategory={setSelectedpreference} selectedCategory={selectedpreference} firstIcon={sheekIcon} title={"What’s your date night preference?"} />
                            <MultyContainer data={traitsSeeks?.attributes?.length ? traitsSeeks?.attributes : []} setSelectedCategory={setSelectedseek} selectedCategory={selectedseek} firstIcon={nightPreferenceIcon} title={"What Traits do you seek?"} />
                        </>
                    }
                </ScrollView>
            </View>

            <View style={{ position: "absolute", bottom: metrics.hp1, right: metrics.hp0 }}>
                <GoButton colortrue={filter ? selectedCategories?.length >= 1 ? true : false : selectedCategories?.length >= 5} onPress={onSubmit} />
            </View>
        </AppSafeAreaView>
    );
};

export default Personalinterest;

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

import React, { useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { ScrollView, StyleSheet, View } from "react-native";
import HeaderCommon from "../../common/HeaderCommon";
import TopCommonLine from "../../common/TopCommonLine";
import DubleTextLine from "../../common/DubleTextLine";
import { AppText, FORTEEN, INTER_MEDIUM, INTER_SEMI_BOLD, OPECITY, TWELVE } from "../../common/AppText";
import metrics from "../../assets/Metrics";
import { drikingIcon, lifeStyleIcon, petsIcon, smookingIcon, workIcon } from "../../helper/ImageAssets";
import { Screen } from "../../theme/dimens";
import { colors } from "../../theme/colors";
import FastImage from "react-native-fast-image";
import MultyContainer from "../../common/MultyContainer";
import GoButton from "../../common/GoButton";
import { NAVIGATION_ADCENTUOURS_SCREEN } from "../../navigation/routes";
import NavigationService from "../../navigation/NavigationService";

const LifestyleScreen = () => {
  const datalistnew = new Array(7).fill(null).map((_, index) => ({ id: String(index), }))

    const [selectedCategories, setSelectedCategories] = useState<any[]>([]);
    let datasmoke = [{ id: "1", title: "Non-smoker" }, { id: "2", title: "Social smoker" },
    { id: "3", title: "Chain smoker" }, { id: "4", title: "Smoking while drinking" },
    { id: "5", title: "Trying to quit" }, { id: "6", title: "Prefer not say" },
    ];
    let dataDrink = [{ id: "1", title: "Not for me" }, { id: "2", title: "Sober" },
    { id: "3", title: "Sober Curiour" }, { id: "4", title: "Most Nights" },
    { id: "5", title: "On Special Occassions" }, { id: "6", title: "Trying to quit" },
    { id: "7", title: "Pefer not to say" },
    ];
    let dataWrokout = [{ id: "1", title: "Everyday" }, { id: "2", title: "Often" },
    { id: "3", title: "Sometimes" }, { id: "4", title: "Never" },
    { id: "5", title: "Gym Freak" }
    ];
    let dataPets = [{ id: "1", title: "Dog" }, { id: "2", title: "Cat" },
    { id: "3", title: "Reptile" }, { id: "4", title: "Amphibian" },
    { id: "5", title: "Bird" }, { id: "6", title: "Fish" },
    { id: "7", title: "Don’t have but love" }, { id: "8", title: "Turtle" },
    { id: "9", title: "Hamster" }, { id: "10", title: "Rabbit" }, { id: "11", title: "Want a pet" }, { id: "12", title: "Allergic to pets" },
    ];


    return (
        <AppSafeAreaView>
            <HeaderCommon skip={true}/>
            <View style={styles.container}>
                <TopCommonLine icon={lifeStyleIcon} datalist={datalistnew}/>
                <View style={{ paddingHorizontal: metrics.hp2 }}>
                    <DubleTextLine firstText={"Tell us about your"} secondText={"lifestyle."} />
                    <AppText style={{ marginTop: -metrics.hp2 }} type={TWELVE} weight={INTER_MEDIUM} color={OPECITY}>
                        Select any 4.
                    </AppText>
                </View>
                <View style={styles.singleLine} />
                <ScrollView contentContainerStyle={{ paddingBottom: metrics.hp10 }} showsVerticalScrollIndicator={false}>
                    <MultyContainer data={datasmoke} setSelectedCategories={setSelectedCategories} selectedCategories={selectedCategories} firstIcon={smookingIcon} title={"How often do you smoke?"} />
                    <MultyContainer data={dataDrink} setSelectedCategories={setSelectedCategories} selectedCategories={selectedCategories} firstIcon={drikingIcon} title={"How often do you drink?"} />
                    <MultyContainer data={dataWrokout} setSelectedCategories={setSelectedCategories} selectedCategories={selectedCategories} firstIcon={workIcon} title={"Do you workout?"} />
                    <MultyContainer data={dataPets} setSelectedCategories={setSelectedCategories} selectedCategories={selectedCategories} firstIcon={petsIcon} title={"Do you have any pets?"} />
                </ScrollView>
            </View>
            <View style={{
                position: "absolute", bottom: metrics.hp3,
                right: metrics.hp2,
            }}>
                <GoButton onPress={()=>NavigationService.navigate(NAVIGATION_ADCENTUOURS_SCREEN)} />
            </View>
        </AppSafeAreaView>
    )
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
        marginTop: metrics.hp2
    },

})
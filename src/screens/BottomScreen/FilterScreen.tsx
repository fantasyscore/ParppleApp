import React, { useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { ScrollView, StyleSheet, View } from "react-native";
import HeaderCommon from "../../common/HeaderCommon";
import metrics from "../../assets/Metrics";
import { AppText, INTER_BOLD, INTER_MEDIUM, OPECITY, PURPLE, THIRTEEN } from "../../common/AppText";
import { colors } from "../../theme/colors";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import ButtonSheet from "../../common/ButtonSheet";
import { advantureIcob, ageBox, childrenIcon, dateIcon, drikingIcon, familyIcon, moonIcon, partnerheart, personHeartIcon, politicalIcon, religiousIcon, schoolIcon, smookingIcon, social_distanceIcon, straightenIcon, verifyBlack, workoutIcon } from "../../helper/ImageAssets";
import AgeSlider from "../../common/AgeSlider";
import PurpuleButton from "../../common/PurpuleButton";
import CheckBoxlist from "../../common/CheckBoxList";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_ADCENTUOURS_SCREEN, NAVIGATION_CHILDERN_SCREEN, NAVIGATION_COMMONSELECT_PAGE_SCREEN, NAVIGATION_EDUCATION_SCREEN, NAVIGATION_FAMILY_PLANING_SCREEN, NAVIGATION_PERSONAL_INTEREST_SCREEN, NAVIGATION_POLITICAL_SCREEN, NAVIGATION_RELATION_SCREEN, NAVIGATION_RELIGIOUS_SCREEN, NAVIGATION_ZODIACSING_SCREEN } from "../../navigation/routes";
import { DrinkData, ExerciseData, LanguageData, LookignForData, SmokeData, womenData } from "../../common/UiltData";

const FilterScreen = () => {
    const [tabSelect, setTabSelect] = useState("Basic");
    const [ageRange, setAgeRange] = useState([18, 45]);
    const [klMiter, setKlMiter] = useState([1]);
    const [lookingShow, setlookinShow] = useState(false);
    const [kiloKMShow, setkiloKMShow] = useState(false);
    const [verifiedTogle, setVerifiedTogel] = useState(false);
    const [heightRange, setHeightRange] = useState([18, 45]);
    const [heightTogle, setHeightTogel] = useState(false);
    const [selectRelationType, setSelectRealtionType] = useState("")
    const [lookingForToggle, setLookingForToggle] = useState(false);

    const lookingList = [{ id: "1", title: "Long-term partner" }, { id: "2", title: "Long-term, Open to Short" }, { id: "3", title: "Short-term, open to long" },
    { id: "4", title: "Short-term fun" }, { id: "5", title: "New Friends" }, { id: "6", title: "Still figuring it out" },
    ]


    return (
        <AppSafeAreaView>
            <HeaderCommon title={"Filter"} />
            <View style={styles.headerTabs}>
                <TouchableOpacityView onPress={() => setTabSelect("Basic")} style={styles.contaierTabs}>
                    <AppText type={THIRTEEN} weight={tabSelect == "Basic" ? INTER_BOLD : INTER_MEDIUM} color={tabSelect == "Basic" ? PURPLE : OPECITY}>
                        Basic
                    </AppText>
                    <View style={[styles.tabLine, { backgroundColor: tabSelect == "Basic" ? colors.purple : colors.transparent }]} />
                </TouchableOpacityView>
                <TouchableOpacityView onPress={() => setTabSelect("Advance")} style={styles.contaierTabs}>
                    <AppText type={THIRTEEN} weight={tabSelect == "Advance" ? INTER_BOLD : INTER_MEDIUM} color={tabSelect == "Advance" ? PURPLE : OPECITY}>
                        Advance
                    </AppText>
                    <View style={[styles.tabLine, { backgroundColor: tabSelect == "Advance" ? colors.purple : colors.transparent }]} />
                </TouchableOpacityView>
            </View>
            <ScrollView contentContainerStyle={{ paddingBottom: metrics.hp4 }} showsVerticalScrollIndicator={false}>
                {tabSelect == "Basic" ?
                    <View style={{ flex: 1 }}>
                        <ButtonSheet Icons={dateIcon} headLines={"Who would you like to see?"}
                            titile={"Women"}
                            onPress={() => NavigationService.navigate(NAVIGATION_COMMONSELECT_PAGE_SCREEN, { headline: "Who would you like to see?", data: womenData, secondHeadline: "Select whom you like to date." })} />
                        <ButtonSheet Icons={partnerheart} headLines={"What are you looking for?"}
                            titile={"Married"}
                            onPress={() => NavigationService.navigate(NAVIGATION_COMMONSELECT_PAGE_SCREEN, { headline: "What are you looking for", data: LookignForData, secondHeadline: "Select what you are looking for." })} />
                        <AgeSlider range={ageRange}
                            togleShow={lookingShow}
                            setToggleShow={setlookinShow}
                            innerUpertitle={"Between"}
                            underTitle={"Show people beyond my preference"} setRange={setAgeRange} Icons={ageBox} headLines={"What are you looking for?"} />
                        <AgeSlider range={klMiter}
                            togleShow={kiloKMShow}
                            setToggleShow={setkiloKMShow}
                            innerUpertitle={"Upto Kilometers"}
                            underTitle={"Show people beyond my preference"} setRange={setKlMiter} Icons={social_distanceIcon} headLines={"How far are you looking for?"}
                            singleSilde={true} />
                        <ButtonSheet Icons={social_distanceIcon} headLines={"What’s your preferred language they speak?"}
                            titile={"English, Hindi, Marwadi"}
                            onPress={() => NavigationService.navigate(NAVIGATION_COMMONSELECT_PAGE_SCREEN, { headline: "Language they speak", data: LanguageData, secondHeadline: "Select your preferred language they speak." })} />
                    </View>
                    :
                    <View style={{ flex: 1 }}>
                        <ButtonSheet Icons={verifyBlack} headLines={"Profiles should be verified?"}
                            titile={"Verified Only"} togleTure={true}
                            togleShow={verifiedTogle}
                            setToggleShow={setVerifiedTogel} />
                        <AgeSlider
                            height={true}
                            range={heightRange}
                            togleShow={heightTogle}
                            setToggleShow={setHeightTogel}
                            innerUpertitle={"Between"}
                            underTitle={"Show people beyond my preference"} setRange={setHeightRange} Icons={straightenIcon} headLines={"How Tall are they?"} />
                        <CheckBoxlist Icons={partnerheart} headLines={"What are they looking for?"}
                            listdata={lookingList} visible={selectRelationType} onClick={setSelectRealtionType}
                            underTitle={"Show people beyond my preference"}
                            togleShow={lookingForToggle}
                            setToggleShow={setLookingForToggle} />
                        <ButtonSheet Icons={personHeartIcon} headLines={"What are their interests?"}
                            titile={"Select"}
                            onPress={() => NavigationService.navigate(NAVIGATION_PERSONAL_INTEREST_SCREEN, { filter: "What are their interests" })} />
                        <ButtonSheet Icons={partnerheart} headLines={"What’s their relationship status?"}
                            titile={"Select"}
                            onPress={() => NavigationService.navigate(NAVIGATION_COMMONSELECT_PAGE_SCREEN, { headline: "What’s their relationship status", data: LookignForData, secondHeadline: "Select their relationship status" })} />
                        <ButtonSheet Icons={familyIcon} headLines={"What are their family plans?"}
                            titile={"Select"}
                            onPress={() => NavigationService.navigate(NAVIGATION_FAMILY_PLANING_SCREEN, { filter: "What are their family plans" })} />
                        <ButtonSheet Icons={childrenIcon} headLines={"Do they have kids?"}
                            titile={"Select"}
                            onPress={() => NavigationService.navigate(NAVIGATION_CHILDERN_SCREEN, { filter: "Do they have kids" })} />
                        <ButtonSheet Icons={advantureIcob} headLines={"What’s their adventurous life?"}
                            titile={"Select"}
                            onPress={() => NavigationService.navigate(NAVIGATION_ADCENTUOURS_SCREEN, { filter: "What’s their adventurous life" })} />
                        <ButtonSheet Icons={religiousIcon} headLines={"What’s their religion?"}
                            titile={"Select"}
                            onPress={() => NavigationService.navigate(NAVIGATION_RELIGIOUS_SCREEN, { filter: "What’s their religion" })} />
                        <ButtonSheet Icons={schoolIcon} headLines={"What’s their highest education level?"}
                            titile={"Select"}
                            onPress={() => NavigationService.navigate(NAVIGATION_EDUCATION_SCREEN, { filter: "What’s their highest education level" })} />
                        <ButtonSheet Icons={politicalIcon} headLines={"What are their political views?"}
                            titile={"Select"}
                            onPress={() => NavigationService.navigate(NAVIGATION_POLITICAL_SCREEN, { filter: "What are their political views" })} />
                        <ButtonSheet Icons={workoutIcon} headLines={"Do they exercise?"}
                            titile={"Select"}
                            onPress={() => NavigationService.navigate(NAVIGATION_COMMONSELECT_PAGE_SCREEN, { headline: "Do they exercise", data: ExerciseData })} />
                        <ButtonSheet Icons={smookingIcon} headLines={"Do they smoke?"}
                            titile={"Select"}
                            onPress={() => NavigationService.navigate(NAVIGATION_COMMONSELECT_PAGE_SCREEN, { headline: "Do they smoke?", data: SmokeData })} />
                        <ButtonSheet Icons={drikingIcon} headLines={"Do they drink?"}
                            titile={"Select"}
                            onPress={() => NavigationService.navigate(NAVIGATION_COMMONSELECT_PAGE_SCREEN, { headline: "Do they drink", data: DrinkData })} />
                        <ButtonSheet Icons={moonIcon} headLines={"What’s their zodiac sign?"}
                            titile={"Select"}
                            onPress={() => NavigationService.navigate(NAVIGATION_ZODIACSING_SCREEN, { filter: "What’s their zodiac sign" })} />
                    </View>
                }
            </ScrollView>
            <PurpuleButton title={tabSelect == "Advance" ? "Unlock with Premium" : "Apply"} tabSelect={tabSelect} />
        </AppSafeAreaView>
    )
};
export default FilterScreen;
const styles = StyleSheet.create({
    headerTabs: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: metrics.hp3,
        paddingHorizontal: metrics.hp2,
        borderBottomWidth: metrics.hp0_1,
        borderBottomColor: colors.nanoOpecity
    },
    contaierTabs: {
        width: metrics.hp11,
        alignItems: "center",
        justifyContent: "center"
    },
    tabLine: {
        height: metrics.hp0_3,
        backgroundColor: colors.purple,
        width: metrics.hp11,
        borderTopRightRadius: metrics.hp1,
        borderTopLeftRadius: metrics.hp1
    }
})
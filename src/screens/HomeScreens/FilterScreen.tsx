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
import { NAVIGATION_ADCENTUOURS_SCREEN, NAVIGATION_CHILDERN_SCREEN, NAVIGATION_COMMONSELECT_PAGE_SCREEN, NAVIGATION_EDUCATION_SCREEN, NAVIGATION_FAMILY_PLANING_SCREEN, NAVIGATION_LANGUAGE_SPEAK_SCREEN, NAVIGATION_LIFE_STYLE_SCREEN, NAVIGATION_PERSONAL_INTEREST_SCREEN, NAVIGATION_POLITICAL_SCREEN, NAVIGATION_RELATION_SCREEN, NAVIGATION_RELIGIOUS_SCREEN, NAVIGATION_ZODIACSING_SCREEN } from "../../navigation/routes";
import { DrinkData, ExerciseData, ganderDATA, LanguageData, LookignForData, relationShipStatus, SmokeData, womenData } from "../../common/UiltData";
import { useDispatch, useSelector } from "react-redux";
import { attributesGet, editFilter } from "../../actions/authActions";

const FilterScreen = () => {
    const dispatch = useDispatch();
    const userData = useSelector((state: any) => state.auth.userData);
    const filterData = useSelector((state: any) => state.auth.filterData);
    const [tabSelect, setTabSelect] = useState("Basic");
    const [ageRange, setAgeRange] = useState([18, 45]);
    const [klMiter, setKlMiter] = useState(userData?.preferredDistanceKm ? [userData?.preferredDistanceKm] : [1]);
    const [lookingShow, setlookinShow] = useState(false);
    const [kiloKMShow, setkiloKMShow] = useState(userData?.globalSearch ? userData?.globalSearch : false);
    const [verifiedTogle, setVerifiedTogel] = useState(false);
    const [heightRange, setHeightRange] = useState([18, 45]);
    const [heightTogle, setHeightTogel] = useState(false);
    const [selectRelationType, setSelectRealtionType] = useState(userData ? userData?.relationshipPreference : "")
    const [lookingForToggle, setLookingForToggle] = useState(false);
    const attributesRemove = userData?.attributes?.filter((item: any) =>
        ["smoke", "drink", "workout", "pets"].includes(item?.type)
    );
    const workout = attributesRemove?.find((item: any) => item.type === "workout");
    const smoke = attributesRemove?.find((item: any) => item.type === "smoke");
    const drink = attributesRemove?.find((item: any) => item.type === "drink");
    const lookingList = [
        {
            id: "1",
            title: "Long-term partner",
            sendTitle: "longTermPartner",
        },
        {
            id: "2",
            title: "Long-term ,Open to short",
            sendTitle: "longTermAndOpenToShort",
        },
        {
            id: "3",
            title: "Short-term,open to long",
            sendTitle: "OpenToShortAndlongTerm",
        },
        {
            id: "4",
            title: "Short-term fun",
            sendTitle: "openToShort",
        },
        {
            id: "5",
            title: "New friends",
            sendTitle: "friends",
        },
        {
            id: "6",
            title: "Still figuring it out",
            sendTitle: "notSure",
        },
    ];

    const onSubmit = () => {
        const data = {
            "preferredGender": filterData?.preferredGender ? filterData?.preferredGender : userData?.preferredGender,
            "relationshipPreference": filterData?.relationshipPreference ? filterData?.relationshipPreference : filterData?.relationsShipStatus,
            "preferredAgeRange": {
                "min": ageRange[0],
                "max": ageRange[1]
            },
            "preferredDistanceKm": klMiter[0],
            "globalSearch": kiloKMShow,
        };
        dispatch(editFilter(data))
    }

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
                            titile={filterData?.preferredGender ? filterData?.preferredGender : userData?.preferredGender}
                            onPress={() => NavigationService.navigate(NAVIGATION_COMMONSELECT_PAGE_SCREEN, { headline: "Who would you like to see?", data: ganderDATA, secondHeadline: "Select whom you like to date.", title: "gender", select: userData?.preferredGender })} />
                        <ButtonSheet Icons={partnerheart} headLines={"What are you looking for?"}
                            titile={filterData?.relationshipPreference ? filterData?.relationshipPreference : userData?.relationsShipStatus}
                            onPress={() => NavigationService.navigate(NAVIGATION_COMMONSELECT_PAGE_SCREEN, { headline: "What are you looking for", data: relationShipStatus, secondHeadline: "Select what you are looking for.", title: "relationsShipStatus", select: userData?.relationsShipStatus?.toLowerCase() })} />
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
                            titile={"Add Language"}
                            data={userData?.languages}
                            onPress={() => NavigationService.navigate(NAVIGATION_LANGUAGE_SPEAK_SCREEN, { filter: "Add Language", data: userData?.languages, fieldVisibility: userData?.fieldVisibility })} />
                        {/* onPress={() => NavigationService.navigate(NAVIGATION_COMMONSELECT_PAGE_SCREEN, { headline: "Language they speak", data: LanguageData, secondHeadline: "Select your preferred language they speak." })} /> */}
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
                            titile={userData?.relationsShipStatus ? userData?.relationsShipStatus : "Select"}
                            onPress={() => NavigationService.navigate(NAVIGATION_RELATION_SCREEN, { filter: "What’s their relationship status", data: userData?.relationsShipStatus })} />
                        <ButtonSheet Icons={familyIcon} headLines={"What are their family plans?"}
                            titile={userData?.familyPlanning ? userData?.familyPlanning : "Select"}
                            onPress={() => NavigationService.navigate(NAVIGATION_FAMILY_PLANING_SCREEN, { filter: "What are their family plans", data: userData?.familyPlanning, })} />
                        <ButtonSheet Icons={childrenIcon} headLines={"Do they have kids?"}
                            titile={userData?.children ? userData?.children : "Select"}
                            onPress={() => NavigationService.navigate(NAVIGATION_CHILDERN_SCREEN, { filter: "Do they have kids", data: userData?.children, })} />
                        <ButtonSheet Icons={advantureIcob} headLines={"What’s their adventurous life?"}
                            titile={"Select"}
                            onPress={() => NavigationService.navigate(NAVIGATION_ADCENTUOURS_SCREEN, { filter: "What’s their adventurous life" })} />
                        <ButtonSheet Icons={religiousIcon} headLines={"What’s their religion?"}
                            titile={userData?.relegiousBelief?.length ? userData?.relegiousBelief
                                ?.map((item: any, index: any) =>
                                    index === userData?.relegiousBelief?.length - 1 ? `${item}` : `${item}, `
                                )
                                .join('') : "Select"}
                            onPress={() => NavigationService.navigate(NAVIGATION_RELIGIOUS_SCREEN, { filter: "What’s their religion", data: userData?.relegiousBelief })} />
                        <ButtonSheet Icons={schoolIcon} headLines={"What’s their highest education level?"}
                            titile={userData?.education ? userData?.education : "Select"}
                            onPress={() => NavigationService.navigate(NAVIGATION_EDUCATION_SCREEN, { filter: "What’s their highest education level", data: userData?.education })} />
                        <ButtonSheet Icons={workoutIcon} headLines={"Do they exercise?"}
                            titile={workout?.displayLabel ? workout?.displayLabel : "Select"}
                            onPress={() => { dispatch(attributesGet()), NavigationService.navigate(NAVIGATION_LIFE_STYLE_SCREEN, { filter: "Do they exercise", data: attributesRemove }) }} />
                        <ButtonSheet Icons={smookingIcon} headLines={"Do they smoke?"}
                            titile={smoke?.displayLabel ? smoke?.displayLabel : "Select"}
                            onPress={() => { dispatch(attributesGet()), NavigationService.navigate(NAVIGATION_LIFE_STYLE_SCREEN, { filter: "Do they smoke?", data: attributesRemove }) }} />
                        <ButtonSheet Icons={drikingIcon} headLines={"Do they drink?"}
                            titile={drink?.displayLabel ? drink?.displayLabel : "Select"}
                            onPress={() => { dispatch(attributesGet()), NavigationService.navigate(NAVIGATION_LIFE_STYLE_SCREEN, { filter: "Do they drink", data: attributesRemove }) }} />
                        <ButtonSheet Icons={moonIcon} headLines={"What’s their zodiac sign?"}
                            titile={userData?.zodiaSign ? userData?.zodiaSign : "Select"}
                            onPress={() => NavigationService.navigate(NAVIGATION_ZODIACSING_SCREEN, { filter: "What’s their zodiac sign", data: userData?.zodiaSign, })} />
                    </View>
                }
            </ScrollView>
            <PurpuleButton onPress={onSubmit} title={tabSelect == "Advance" ? "Unlock with Premium" : "Apply"} tabSelect={tabSelect} />
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
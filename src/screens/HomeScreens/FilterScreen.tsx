import React, { useMemo, useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { ScrollView, StyleSheet, View } from "react-native";
import HeaderCommon from "../../common/HeaderCommon";
import metrics from "../../assets/Metrics";
import { AppText, INTER_BOLD, INTER_MEDIUM, OPECITY, PURPLE, THIRTEEN } from "../../common/AppText";
import { colors } from "../../theme/colors";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import ButtonSheet from "../../common/ButtonSheet";
import { advantureIcob, ageBox, childrenIcon, dateIcon, drikingIcon, familyIcon, langIcon, moonIcon, partnerheart, personHeartIcon, politicalIcon, religiousIcon, schoolIcon, smookingIcon, social_distanceIcon, straightenIcon, verifyBlack, workoutIcon } from "../../helper/ImageAssets";
import AgeSlider from "../../common/AgeSlider";
import PurpuleButton from "../../common/PurpuleButton";
import CheckBoxlist from "../../common/CheckBoxList";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_ADCENTUOURS_SCREEN, NAVIGATION_CHILDERN_SCREEN, NAVIGATION_COMMONSELECT_PAGE_SCREEN, NAVIGATION_EDUCATION_SCREEN, NAVIGATION_FAMILY_PLANING_SCREEN, NAVIGATION_HEIGHT_SCREEN, NAVIGATION_LANGUAGE_SPEAK_SCREEN, NAVIGATION_LIFE_STYLE_SCREEN, NAVIGATION_PERSONAL_INTEREST_SCREEN, NAVIGATION_POLITICAL_SCREEN, NAVIGATION_RELATION_SCREEN, NAVIGATION_RELIGIOUS_SCREEN, NAVIGATION_ZODIACSING_SCREEN } from "../../navigation/routes";
import { DrinkData, ExerciseData, ganderDATA, LanguageData, LookignForData, relationShipStatus, SmokeData, womenData } from "../../common/UiltData";
import { useDispatch, useSelector } from "react-redux";
import { attributesGet, discoverProfile, getNewMatches, getProfile, listProfiles, sendAdvanceFilter } from "../../actions/authActions";
import { appOperation } from "../../appOperation";

const FilterScreen = () => {
    const dispatch = useDispatch();
    const userData = useSelector((state: any) => state.auth.userData);
    const filterData = useSelector((state: any) => state.auth.filterData);
    const attributes = useSelector((state: any) => state.auth.attributes);
    const subscriptionPlan = userData?.subscription?.plan;
    const subscriptionExpiresAt = userData?.subscription?.expiresAt;
    const hasActiveSubscription =
        !!subscriptionPlan &&
        subscriptionPlan !== "FREE" &&
        (!subscriptionExpiresAt || new Date(subscriptionExpiresAt).getTime() > Date.now());
    const [tabSelect, setTabSelect] = useState("Basic");
    const [ageRange, setAgeRange] = useState(
        userData?.preferredAgeRange 
            ? [userData.preferredAgeRange.min, userData.preferredAgeRange.max]
            : [18, 45]
    );
    const [klMiter, setKlMiter] = useState(userData?.preferredDistanceKm ? [userData?.preferredDistanceKm] : [1]);
    const [lookingShow, setlookinShow] = useState(false);
    const [kiloKMShow, setkiloKMShow] = useState(userData?.globalSearch ? userData?.globalSearch : false);
    const [verifiedTogle, setVerifiedTogel] = useState(false);
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

    const onSubmitBasic = async () => {
        const data = {
            "preferredGender": filterData?.preferredGender || userData?.preferredGender,
            "relationshipPreference": filterData?.relationshipPreference || userData?.relationshipPreference || userData?.relationsShipStatus,
            "preferredAgeRange": {
                "min": ageRange[0],
                "max": ageRange[1]
            },
            "preferredDistanceKm": klMiter[0],
            "globalSearch": kiloKMShow,
            "languagePrefrence": userData?.languagePrefrence || [],
        };
        
        try {
            const response: any = await appOperation.customer.editFilterAPI(data);
            if (response?.statusCode === 200) {
                // Dispatch discoverProfile and getNewMatches after successful filter update
                dispatch(listProfiles())
                dispatch(getNewMatches());
                dispatch(getProfile(true));
                // Navigate back
                // NavigationService.goBack();
            }
        } catch (error) {
            console.log("Error updating filter:", error);
        }
    };

    const onSubmitAdvance = async () => {
        // Build advanced filter payload aligned with profile data + any updates user made on this screen
        const interestsIdsRaw = filterData?.prefferedInterestAttributes ?? [];
        const adventureIdsRaw = filterData?.prefferedAdventureAttributes ?? [];
        const lifestyleIdsRaw = filterData?.prefferedLifestyleAttributes ?? [];

        const normalizeIds = (raw: any) =>
            Array.isArray(raw) ? raw.map((x: any) => (typeof x === "string" ? x : x?._id)).filter(Boolean) : [];

        const interestsIds = normalizeIds(interestsIdsRaw);
        const adventureIds = normalizeIds(adventureIdsRaw);
        const lifestyleIds = normalizeIds(lifestyleIdsRaw);

        const combinedPreferredAttributes = Array.from(new Set([
            ...normalizeIds(userData?.prefferedAttributes ?? []),
            ...interestsIds,
            ...adventureIds,
            ...lifestyleIds,
        ]));

        const advancefilter = {
            preferredGender: filterData?.preferredGender || userData?.preferredGender || "",
            relationshipPreference:
                filterData?.relationshipPreference || userData?.relationshipPreference || userData?.relationsShipStatus || "",
            preferredAgeRange: {
                min: String(ageRange?.[0] ?? userData?.preferredAgeRange?.min ?? ""),
                max: String(ageRange?.[1] ?? userData?.preferredAgeRange?.max ?? ""),
            },
            preferredDistanceKm: String(klMiter?.[0] ?? userData?.preferredDistanceKm ?? ""),
            languagePrefrence: userData?.languagePrefrence || [],
            prefferredHeights: filterData?.prefferredHeights || userData?.height || "",
            prefferedEducation: userData?.education || "",
            prefferedAttributes: combinedPreferredAttributes,
            prefferedRelationGoals: selectRelationType || "",
            filterZodiac: userData?.zodiaSign || "",
            relegiousPreference: Array.isArray(userData?.relegiousPreference)
                ? (userData?.relegiousPreference?.[0] || "")
                : (userData?.relegiousPreference || ""),
            preferedChildren: userData?.children || "",
            filterRelationShip: userData?.relationsShipStatus || "",
        };

        try {
            const response: any = await dispatch(sendAdvanceFilter(advancefilter));
            if (response?.statusCode === 200) {
                dispatch(listProfiles())
                dispatch(getNewMatches());
                NavigationService.goBack();
            }
        } catch (error) {
            console.log("Error applying advance filter:", error);
        }
    };

    const preferredInterestIds: string[] = useMemo(() => {
        const raw = filterData?.prefferedInterestAttributes;
        if (!Array.isArray(raw)) return [];
        return raw.map((x: any) => (typeof x === "string" ? x : x?._id)).filter(Boolean);
    }, [filterData?.prefferedInterestAttributes]);

    const preferredAdventureIds: string[] = useMemo(() => {
        const raw = filterData?.prefferedAdventureAttributes;
        if (!Array.isArray(raw)) return [];
        return raw.map((x: any) => (typeof x === "string" ? x : x?._id)).filter(Boolean);
    }, [filterData?.prefferedAdventureAttributes]);

    const preferredLifestyleIds: string[] = useMemo(() => {
        const raw = filterData?.prefferedLifestyleAttributes;
        if (!Array.isArray(raw)) return [];
        return raw.map((x: any) => (typeof x === "string" ? x : x?._id)).filter(Boolean);
    }, [filterData?.prefferedLifestyleAttributes]);

    const attrMetaById = useMemo(() => {
        const map = new Map<string, { label: string; groupId: string }>();
        if (!Array.isArray(attributes)) return map;
        for (const group of attributes) {
            const groupId = group?._id;
            const list = group?.attributes;
            if (!groupId || !Array.isArray(list)) continue;
            for (const attr of list) {
                const id = attr?._id;
                const label = attr?.displayLabel || attr?.title;
                if (id && label) map.set(id, { label, groupId });
            }
        }
        return map;
    }, [attributes]);

    const selectedLabels = useMemo(() => {
        return [...preferredInterestIds, ...preferredAdventureIds, ...preferredLifestyleIds]
            .map((id) => {
                const label = attrMetaById.get(id)?.label;
                if (!label) return undefined;
                return label.startsWith("#") ? label.slice(1) : label;
            })
            .filter(Boolean) as string[];
    }, [preferredInterestIds, preferredAdventureIds, preferredLifestyleIds, attrMetaById]);

    const interestsTitle = useMemo(() => {
        const labels = preferredInterestIds
            .map((id) => attrMetaById.get(id)?.label)
            .filter(Boolean)
            .map((l: any) => (typeof l === "string" && l.startsWith("#") ? l.slice(1) : l));
        if (labels.length > 0) {
            const top = labels.slice(0, 2).join(", ");
            return labels.length > 2 ? `${top} +${labels.length - 2}` : top;
        }
        return preferredInterestIds.length > 0 ? `${preferredInterestIds.length} selected` : "Select";
    }, [preferredInterestIds, attrMetaById]);

    const adventureTitle = useMemo(() => {
        const labels = preferredAdventureIds
            .map((id) => attrMetaById.get(id)?.label)
            .filter(Boolean)
            .map((l: any) => (typeof l === "string" && l.startsWith("#") ? l.slice(1) : l));
        if (labels.length > 0) {
            const top = labels.slice(0, 2).join(", ");
            return labels.length > 2 ? `${top} +${labels.length - 2}` : top;
        }
        return preferredAdventureIds.length > 0 ? `${preferredAdventureIds.length} selected` : "Select";
    }, [preferredAdventureIds, attrMetaById]);

    const smokeTitle = useMemo(() => {
        const id = preferredLifestyleIds.find((x) => attrMetaById.get(x)?.groupId === "smoke");
        return id ? (attrMetaById.get(id)?.label || "Select") : "Select";
    }, [preferredLifestyleIds, attrMetaById]);

    const drinkTitle = useMemo(() => {
        const id = preferredLifestyleIds.find((x) => attrMetaById.get(x)?.groupId === "drink");
        return id ? (attrMetaById.get(id)?.label || "Select") : "Select";
    }, [preferredLifestyleIds, attrMetaById]);

    const workoutTitle = useMemo(() => {
        const id = preferredLifestyleIds.find((x) => attrMetaById.get(x)?.groupId === "workout");
        return id ? (attrMetaById.get(id)?.label || "Select") : "Select";
    }, [preferredLifestyleIds, attrMetaById]);
    

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
                            togaloff={true}
                            underTitle={"Show people beyond my preference"} setRange={setAgeRange} Icons={ageBox} headLines={"How Old are you looking for?"}
                            min={18}
                            max={70} />
                        <AgeSlider range={klMiter}
                            togleShow={kiloKMShow}
                            setToggleShow={setkiloKMShow}
                            innerUpertitle={"Upto Kilometers"}
                            underTitle={"Show people beyond my preference"} setRange={setKlMiter} Icons={social_distanceIcon} headLines={"How far are you looking for?"}
                            singleSilde={true}
                            min={1}
                            max={200} />
                        <ButtonSheet Icons={langIcon} headLines={"What’s your preferred language they speak?"}
                            titile={"Add Language"}
                            data={userData?.languagePrefrence}
                            onPress={() => NavigationService.navigate(NAVIGATION_LANGUAGE_SPEAK_SCREEN, { filter: "Add Language", data: userData?.languagePrefrence, fieldVisibility: userData?.fieldVisibility })} />
                        {/* onPress={() => NavigationService.navigate(NAVIGATION_COMMONSELECT_PAGE_SCREEN, { headline: "Language they speak", data: LanguageData, secondHeadline: "Select your preferred language they speak." })} /> */}
                    </View>
                    :
                    <View style={{ flex: 1 }}>
                        <ButtonSheet Icons={verifyBlack} headLines={"Profiles should be verified?"}
                            titile={"Verified Only"} togleTure={true}
                            togleShow={verifiedTogle}
                            setToggleShow={setVerifiedTogel} />
                        <ButtonSheet
                            Icons={straightenIcon}
                            headLines={"Preferred height (FT)"}
                            titile={filterData?.prefferredHeights || userData?.height || "Select"}
                            onPress={() =>
                                NavigationService.navigate(NAVIGATION_HEIGHT_SCREEN, {
                                    filter: "Preferred height",
                                    data: filterData?.prefferredHeights || userData?.height,
                                    onlyFt: true,
                                    isAdvanceFilter: true,
                                })
                            }
                        />
                        <CheckBoxlist Icons={partnerheart} headLines={"What are they looking for?"}
                            listdata={lookingList} visible={selectRelationType} onClick={setSelectRealtionType}
                            underTitle={"Show people beyond my preference"}
                            togleShow={lookingForToggle}
                            notshow={true}
                            setToggleShow={setLookingForToggle} />
                        <ButtonSheet Icons={personHeartIcon} headLines={"What are their interests?"}
                            titile={interestsTitle}
                            onPress={() => {
                                dispatch(attributesGet());
                                NavigationService.navigate(NAVIGATION_PERSONAL_INTEREST_SCREEN, {
                                    filter: "What are their interests",
                                    data: (filterData?.prefferedInterestAttributes || []).map((id: any) => ({ _id: id })),
                                    ids: filterData?.prefferedInterestAttributes || [],
                                    isAdvanceFilter: true,
                                    advanceFilterKey: "prefferedInterestAttributes",
                                });
                            }} />
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
                            titile={adventureTitle}
                            onPress={() => {
                                dispatch(attributesGet());
                                NavigationService.navigate(NAVIGATION_ADCENTUOURS_SCREEN, {
                                    filter: "What’s their adventurous life",
                                    data: (filterData?.prefferedAdventureAttributes || []).map((id: any) => ({ _id: id })),
                                    ids: filterData?.prefferedAdventureAttributes || [],
                                    isAdvanceFilter: true,
                                    advanceFilterKey: "prefferedAdventureAttributes",
                                });
                            }} />
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
                            titile={workoutTitle}
                            onPress={() => {
                                dispatch(attributesGet());
                                NavigationService.navigate(NAVIGATION_LIFE_STYLE_SCREEN, {
                                    filter: "Lifestyle",
                                    data: (filterData?.prefferedLifestyleAttributes || []).map((id: any) => ({ _id: id })),
                                    ids: filterData?.prefferedLifestyleAttributes || [],
                                    isAdvanceFilter: true,
                                    advanceFilterKey: "prefferedLifestyleAttributes",
                                });
                            }} />
                        <ButtonSheet Icons={smookingIcon} headLines={"Do they smoke?"}
                            titile={smokeTitle}
                            onPress={() => {
                                dispatch(attributesGet());
                                NavigationService.navigate(NAVIGATION_LIFE_STYLE_SCREEN, {
                                    filter: "Lifestyle",
                                    data: (filterData?.prefferedLifestyleAttributes || []).map((id: any) => ({ _id: id })),
                                    ids: filterData?.prefferedLifestyleAttributes || [],
                                    isAdvanceFilter: true,
                                    advanceFilterKey: "prefferedLifestyleAttributes",
                                });
                            }} />
                        <ButtonSheet Icons={drikingIcon} headLines={"Do they drink?"}
                            titile={drinkTitle}
                            onPress={() => {
                                dispatch(attributesGet());
                                NavigationService.navigate(NAVIGATION_LIFE_STYLE_SCREEN, {
                                    filter: "Lifestyle",
                                    data: (filterData?.prefferedLifestyleAttributes || []).map((id: any) => ({ _id: id })),
                                    ids: filterData?.prefferedLifestyleAttributes || [],
                                    isAdvanceFilter: true,
                                    advanceFilterKey: "prefferedLifestyleAttributes",
                                });
                            }} />
                        <ButtonSheet Icons={moonIcon} headLines={"What’s their zodiac sign?"}
                            titile={userData?.zodiaSign ? userData?.zodiaSign : "Select"}
                            onPress={() => NavigationService.navigate(NAVIGATION_ZODIACSING_SCREEN, { filter: "What’s their zodiac sign", data: userData?.zodiaSign, })} />
                    </View>
                }
            </ScrollView>
            <PurpuleButton
                disabled={tabSelect == "Advance" ? !hasActiveSubscription : false}
                onPress={tabSelect == "Advance" ? (hasActiveSubscription ? onSubmitAdvance : undefined) : onSubmitBasic}
                title={tabSelect == "Advance" ? (hasActiveSubscription ? "Apply" : "Unlock with Premium") : "Apply"}
                tabSelect={tabSelect}
            />
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
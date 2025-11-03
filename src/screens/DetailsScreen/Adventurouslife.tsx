import React, { useState } from "react";
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

const Adcenturouslife = ({ route }: any) => {
    const filter = route?.params?.filter ?? "";
    const datalistnew = new Array(6).fill(null).map((_, index) => ({ id: String(index), }))

    const [selectedCategories, setSelectedCategories] = useState<any[]>([]);

    const dataultimateGetaway = [
        { "id": "1", "title": "Safari Adventurous" },
        { "id": "2", "title": "Island Relaxation" },
        { "id": "3", "title": "Beachfront Chill" },
        { "id": "4", "title": "Cultural Exploration" },
        { "id": "5", "title": "VIP Luxury Retreat" },
        { "id": "6", "title": "Hiking Through Nature" },
        { "id": "7", "title": "Mountain Escape" },
        { "id": "8", "title": "Snow Ski Vacation" }
    ];
    const dataidealCrew = [
        { "id": "1", "title": "Lively Party Crew" },
        { "id": "2", "title": "Close Circle" },
        { "id": "3", "title": "Just My Bestie" },
        { "id": "4", "title": "Solo Vibes" },
        { "id": "5", "title": "Family Time" },
        { "id": "6", "title": "Hanging Out with Pets" },
        { "id": "7", "title": "Outdoor Adventurous" },
        { "id": "8", "title": "Creative Group Hang" }
    ];
    const datadateNightPreference = [
        { "id": "1", "title": "Fancy Dinner" },
        { "id": "2", "title": "Movie Night" },
        { "id": "3", "title": "Adventure Date" },
        { "id": "4", "title": "Cozy Coffee Date" },
        { "id": "5", "title": "Cooking Date" },
        { "id": "6", "title": "Music Festival" },
        { "id": "7", "title": "Camping Getaway" },
        { "id": "8", "title": "Live Theatre or Concert" },
        { "id": "9", "title": "Fun Activity" }
    ];
    const datatraitsSeek = [
        { "id": "1", "title": "Honesty" },
        { "id": "2", "title": "Peacefulness" },
        { "id": "3", "title": "Kindness" },
        { "id": "4", "title": "Confidence" },
        { "id": "5", "title": "Loyalty" },
        { "id": "6", "title": "Adventure" },
        { "id": "7", "title": "Creativity" },
        { "id": "8", "title": "Intelligence" }
    ]




    return (
        <AppSafeAreaView>
            <HeaderCommon skip={true} title={filter} />
            {filter ?
                <View style={styles.singleLine} /> : <></>}
            <View style={styles.container}>
                {filter ? <></> :
                    <TopCommonLine icon={advantureIcob} datalist={datalistnew} />}
                <View style={{ paddingHorizontal: metrics.hp2 }}>
                    {filter ? <></> : <DubleTextLine firstText={"How’s your adventurous"} secondText={"life?"} />}
                    <AppText style={{ marginTop: -metrics.hp2 }} type={TWELVE} weight={INTER_MEDIUM} color={OPECITY}>
                        Select any 5 interests.
                    </AppText>
                </View>
                {filter ? <></> :
                    <View style={styles.singleLine} />}
                <ScrollView contentContainerStyle={{ paddingBottom: metrics.hp10 }} showsVerticalScrollIndicator={false}>
                    <MultyContainer data={dataultimateGetaway} setSelectedCategories={setSelectedCategories} selectedCategories={selectedCategories} firstIcon={getawayIcoin} title={"What’s your ultimate getaway?"} />
                    <MultyContainer data={dataidealCrew} setSelectedCategories={setSelectedCategories} selectedCategories={selectedCategories} firstIcon={crewIcon} title={"Who’s your ideal crew?"} />
                    <MultyContainer data={datadateNightPreference} setSelectedCategories={setSelectedCategories} selectedCategories={selectedCategories} firstIcon={sheekIcon} title={"What’s your date night preference?"} />
                    <MultyContainer data={datatraitsSeek} setSelectedCategories={setSelectedCategories} selectedCategories={selectedCategories} firstIcon={nightPreferenceIcon} title={"What Traits do you seek?"} />
                </ScrollView>
            </View>
            {filter ? <></> :
            <View style={{
                position: "absolute", bottom: metrics.hp3,
                right: metrics.hp2,
            }}>
                <GoButton onPress={() => NavigationService.navigate(NAVIGATION_PERSONAL_INTEREST_SCREEN)} />
            </View>}
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
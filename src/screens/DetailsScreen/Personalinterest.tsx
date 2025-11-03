import React, { useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { ScrollView, StyleSheet, View } from "react-native";
import HeaderCommon from "../../common/HeaderCommon";
import TopCommonLine from "../../common/TopCommonLine";
import DubleTextLine from "../../common/DubleTextLine";
import { AppText, INTER_MEDIUM, OPECITY, TWELVE } from "../../common/AppText";
import metrics from "../../assets/Metrics";
import { activityIcon, advantureIcob, creativeIcon, crewIcon, filmIcon, foodIcon, gamingIcon, getawayIcoin, musicIcon, nightPreferenceIcon, personHeartIcon, popularIcon, sheekIcon, sportsIcon } from "../../helper/ImageAssets";
import { Screen } from "../../theme/dimens";
import { colors } from "../../theme/colors";
import MultyContainer from "../../common/MultyContainer";
import GoButton from "../../common/GoButton";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_RELIGIOUS_SCREEN } from "../../navigation/routes";

const Personalinterest = ({ route }: any) => {
    const filter = route?.params?.filter ?? "";
    const datalistnew = new Array(5).fill(null).map((_, index) => ({ id: String(index), }))

    const [selectedCategories, setSelectedCategories] = useState<any[]>([]);


    const datapopular = [
        { "id": "1", "title": "#music" },
        { "id": "2", "title": "#movies" },
        { "id": "3", "title": "#travel" },
        { "id": "4", "title": "#dating" },
        { "id": "5", "title": "#food" },
        { "id": "6", "title": "#gaming" },
        { "id": "7", "title": "#romance" },
        { "id": "8", "title": "#single" },
        { "id": "9", "title": "#comedy" },
        { "id": "10", "title": "#friends" },
        { "id": "11", "title": "#funny" },
        { "id": "12", "title": "#dogs" },
        { "id": "13", "title": "#cooking" },
        { "id": "14", "title": "#longtermrelationship" },
        { "id": "15", "title": "#photography" },
        { "id": "16", "title": "#outdoors" },
        { "id": "17", "title": "#anime" },
        { "id": "18", "title": "#technology" },
        { "id": "19", "title": "#shortterm" },
        { "id": "20", "title": "#memes" }
    ];
    const datacreativity = [
        { "id": "1", "title": "#art" },
        { "id": "2", "title": "#photography" },
        { "id": "3", "title": "#singing" },
        { "id": "4", "title": "#drawing" },
        { "id": "5", "title": "#writing" },
        { "id": "6", "title": "#design" },
        { "id": "7", "title": "#cosplay" },
        { "id": "8", "title": "#dance" },
        { "id": "9", "title": "#fashion" },
        { "id": "10", "title": "#painting" },
        { "id": "11", "title": "#crafts" },
        { "id": "12", "title": "#makeup" },
        { "id": "13", "title": "#beauty" }
    ];
    const datafilmLiterature = [
        { "id": "1", "title": "#movies" },
        { "id": "2", "title": "#anime" },
        { "id": "3", "title": "#romance" },
        { "id": "4", "title": "#comedy" },
        { "id": "5", "title": "#horror" },
        { "id": "6", "title": "#books" },
        { "id": "7", "title": "#fantasy" },
        { "id": "8", "title": "#action" },
        { "id": "9", "title": "#animation" },
        { "id": "10", "title": "#crime" },
        { "id": "11", "title": "#scifi" },
        { "id": "12", "title": "#mystery" },
        { "id": "13", "title": "#documentaries" },
        { "id": "14", "title": "#kdrama" },
        { "id": "15", "title": "#drama" },
        { "id": "16", "title": "#television" },
        { "id": "17", "title": "#poetry" },
        { "id": "18", "title": "#filmmaking" },
        { "id": "19", "title": "#bollywood" },
        { "id": "20", "title": "#realitytv" }
    ];
    const datamusic = [
        { "id": "1", "title": "#music" },
        { "id": "2", "title": "#rock" },
        { "id": "3", "title": "#rap" },
        { "id": "4", "title": "#pop" },
        { "id": "5", "title": "#metal" },
        { "id": "6", "title": "#hiphop" },
        { "id": "7", "title": "#kpop" },
        { "id": "8", "title": "#indie" },
        { "id": "9", "title": "#country" },
        { "id": "10", "title": "#jazz" },
        { "id": "11", "title": "#punk" },
        { "id": "12", "title": "#techno" },
        { "id": "13", "title": "#classical" },
        { "id": "14", "title": "#blues" }
    ];
    const dataactivity = [
        { "id": "1", "title": "#travel" },
        { "id": "2", "title": "#outdoors" },
        { "id": "3", "title": "#concerts" },
        { "id": "4", "title": "#museums" },
        { "id": "5", "title": "#festival" },
        { "id": "6", "title": "#partying" },
        { "id": "7", "title": "#standup" },
        { "id": "8", "title": "#theatre" },
        { "id": "9", "title": "#gardening" }
    ];
    const datagaming = [
        { "id": "1", "title": "#boardgames" },
        { "id": "2", "title": "#minecraft" },
        { "id": "3", "title": "#pokemon" },
        { "id": "4", "title": "#chess" },
        { "id": "5", "title": "#fortnite" },
        { "id": "6", "title": "#starcraft" },
        { "id": "7", "title": "#pcgaming" },
        { "id": "8", "title": "#pubg" }
    ];
    const datafoodDrink = [
        { "id": "1", "title": "#food" },
        { "id": "2", "title": "#cooking" },
        { "id": "3", "title": "#baking" },
        { "id": "4", "title": "#vegetarian" },
        { "id": "5", "title": "#non-vegetarian" },
        { "id": "6", "title": "#vegan" }
    ];
    const datasports = [
        { "id": "1", "title": "#gym" },
        { "id": "2", "title": "#football" },
        { "id": "3", "title": "#fitness" },
        { "id": "4", "title": "#basketball" },
        { "id": "5", "title": "#cricket" },
        { "id": "6", "title": "#badminton" },
        { "id": "7", "title": "#yoga" },
        { "id": "8", "title": "#running" },
        { "id": "9", "title": "#volleyball" },
        { "id": "10", "title": "#cycling" },
        { "id": "11", "title": "#skateboarding" },
        { "id": "12", "title": "#golf" },
        { "id": "13", "title": "#hockey" },
        { "id": "14", "title": "#tennis" },
        { "id": "15", "title": "#skiing" },
        { "id": "16", "title": "#boxing" }
    ]






    return (
        <AppSafeAreaView>
            <HeaderCommon skip={true} title={filter} />
            {filter ?
                <View style={styles.singleLine} /> : <></>}
            <View style={styles.container}>
                {filter ? <></> :
                    <TopCommonLine icon={personHeartIcon} datalist={datalistnew} />}
                <View style={{ paddingHorizontal: metrics.hp2 }}>
                    {filter ? <></> :
                        <DubleTextLine firstText={"Tell us about your"} secondText={"personal interest?"} />}
                    <AppText style={{ marginTop: -metrics.hp1 }} type={TWELVE} weight={INTER_MEDIUM} color={OPECITY}>
                        Select any 5 interests.
                    </AppText>
                </View>
                {filter ? <></> :
                    <View style={styles.singleLine} />}
                <ScrollView contentContainerStyle={{ paddingBottom: metrics.hp10 }} showsVerticalScrollIndicator={false}>
                    <MultyContainer data={datapopular} setSelectedCategories={setSelectedCategories} selectedCategories={selectedCategories} firstIcon={popularIcon} title={"Popular"} />
                    <MultyContainer data={datacreativity} setSelectedCategories={setSelectedCategories} selectedCategories={selectedCategories} firstIcon={creativeIcon} title={"Creativity"} />
                    <MultyContainer data={datafilmLiterature} setSelectedCategories={setSelectedCategories} selectedCategories={selectedCategories} firstIcon={filmIcon} title={"Film & Literature"} />
                    <MultyContainer data={datamusic} setSelectedCategories={setSelectedCategories} selectedCategories={selectedCategories} firstIcon={musicIcon} title={"Music"} />
                    <MultyContainer data={dataactivity} setSelectedCategories={setSelectedCategories} selectedCategories={selectedCategories} firstIcon={activityIcon} title={"Activity"} />
                    <MultyContainer data={datagaming} setSelectedCategories={setSelectedCategories} selectedCategories={selectedCategories} firstIcon={gamingIcon} title={"Gaming"} />
                    <MultyContainer data={datafoodDrink} setSelectedCategories={setSelectedCategories} selectedCategories={selectedCategories} firstIcon={foodIcon} title={"Food & Drink"} />
                    <MultyContainer data={datasports} setSelectedCategories={setSelectedCategories} selectedCategories={selectedCategories} firstIcon={sportsIcon} title={"Sports"} />

                </ScrollView>
            </View>
            {filter ? <></> :
                <View style={{
                    position: "absolute", bottom: metrics.hp3,
                    right: metrics.hp2,
                }}>
                    <GoButton onPress={() => NavigationService.navigate(NAVIGATION_RELIGIOUS_SCREEN)} />
                </View>}
        </AppSafeAreaView>
    )
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
        marginTop: metrics.hp2
    },

})
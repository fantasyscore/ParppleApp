import React, { useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { FlatList, StyleSheet, View } from "react-native";
import HeaderCommon from "../../common/HeaderCommon";
import TopCommonLine from "../../common/TopCommonLine";
import DubleTextLine from "../../common/DubleTextLine";
import GoButton from "../../common/GoButton";
import metrics from "../../assets/Metrics";
import ListCheckBox from "../../common/ListCheckbox";
import { ganderIcon, sexualityIcon } from "../../helper/ImageAssets";
import { AppText, INTER_MEDIUM, OPECITY, TWELVE } from "../../common/AppText";
import LinearGradient from "react-native-linear-gradient";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_DATE_SCREEN, NAVIGATION_HOBBIES_SCREEN } from "../../navigation/routes";

const MeetSomeOne = () => {
    const [selectPronoun, setSelectPronoun] = useState(0);
    const [showProfile, setShowProfile] = useState(true);

    const datalist = new Array(5).fill(null).map((_, index) => ({
        id: String(index),
        title: "Movie Date",
    }));
    return (
        <AppSafeAreaView>
            <HeaderCommon skip={true}/>
            <View style={styles.container}>
                <TopCommonLine icon={sexualityIcon} />
                <View style={{ paddingHorizontal: metrics.hp2 }}>
                    <DubleTextLine firstText={"How would you like to"} secondText={"meet someone in person?"}/>
                    <FlatList data={datalist}
                        renderItem={({ item, index }: any) => <ListCheckBox item={item} index={index} selectPronoun={selectPronoun} setSelectPronoun={setSelectPronoun} />}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ marginTop: metrics.hp2, paddingBottom: metrics.hp20 }}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </View>
            <LinearGradient colors={["#FFFFFF00", "#FFFFFF"]} style={{ paddingVertical: metrics.hp0, }}>
            <GoButton  onPress={()=>NavigationService.navigate(NAVIGATION_HOBBIES_SCREEN)} visiBleProfile={true} visible={showProfile} setShowProfile={setShowProfile} />
            </LinearGradient>
        </AppSafeAreaView>
    )
};
export default MeetSomeOne;
const styles = StyleSheet.create({
    container: {
        marginTop: metrics.hp3,
        flex: 1,
    },
})
import React, { useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import { filterIcon, logoBlue, reversIcoin, settingIcon } from "../helper/ImageAssets";
import metrics from "../assets/Metrics";
import { AppText, EIGHTEEN, INTER_BOLD, INTER_MEDIUM, TWENTY } from "./AppText";
import { TouchableOpacityView } from "./TouchableOpacityView";
import NavigationService from "../navigation/NavigationService";
import { NAVIGATION_FILTER_SCREEN, NAVIGATION_SETTING_SCREEN } from "../navigation/routes";
import { colors } from "../theme/colors";

const PeopleHeader = ({ userName, profile, bottomDetailsOpacity, topTextOpacityRevers, filter, name, age }: any) => {


    return (
        <View style={styles.container}>

            {profile ? <FastImage source={logoBlue} resizeMode="contain" style={styles.logo} /> :
                <>
                    {userName ?
                        <Animated.View style={{ opacity: bottomDetailsOpacity }}>
                            <AppText type={EIGHTEEN} weight={INTER_BOLD}>{name},<AppText type={EIGHTEEN} weight={INTER_MEDIUM}> {age}</AppText></AppText>
                        </Animated.View> :
                        <FastImage source={logoBlue} resizeMode="contain" style={styles.logo} />
                    }
                </>
            }
            {!filter &&
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacityView onPress={() => profile ? NavigationService.navigate(NAVIGATION_FILTER_SCREEN) : console.log("I am in ")}>
                        <FastImage source={profile ? filterIcon : reversIcoin} resizeMode="contain" style={[styles.filterIcon, { marginRight: metrics.hp2 }]} />
                    </TouchableOpacityView>
                    <TouchableOpacityView onPress={() => profile ? NavigationService.navigate(NAVIGATION_SETTING_SCREEN) : NavigationService.navigate(NAVIGATION_FILTER_SCREEN)}>
                        <FastImage source={profile ? settingIcon : filterIcon} resizeMode="contain" style={styles.filterIcon} />
                    </TouchableOpacityView>
                </View>}
            {filter &&
                <TouchableOpacityView onPress={() => NavigationService.navigate(NAVIGATION_FILTER_SCREEN)}>
                    <FastImage source={filterIcon} resizeMode="contain" style={styles.filterIcon} />
                </TouchableOpacityView>}
        </View>
    )
};
export default PeopleHeader;
const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: metrics.hp2,
        justifyContent: "space-between",
        marginTop: metrics.hp5,
        backgroundColor: colors.white
    },
    logo: {
        height: metrics.hp4,
        width: metrics.hp10,
    },
    filterIcon: {
        height: metrics.hp2_5,
        width: metrics.hp2_5
    }
})
import React from "react";
import { StyleSheet, View } from "react-native";
import metrics from "../assets/Metrics";
import FastImage from "react-native-fast-image";
import { closeIcon, flasIcon, shareRedIcon } from "../helper/ImageAssets";
import { colors } from "../theme/colors";
import { AppText, BLACK, EIGHTEEN, SCHEHERAZADE_SEMI_BOLD, SIXTEEN } from "./AppText";
import { TouchableOpacityView } from "./TouchableOpacityView";
import NavigationService from "../navigation/NavigationService";

const OneTimeProductHeader = ({ title }: any) => {
    return (
        <TouchableOpacityView onPress={() => NavigationService.goBack()} style={styles.container}>
            <FastImage source={closeIcon} tintColor={colors.black} resizeMode="contain" style={styles.closeIcon} />
            <View style={styles.innerContainer}>
                <FastImage source={title? shareRedIcon: flasIcon} resizeMode="contain" style={styles.flasIcon} />
                <AppText type={EIGHTEEN} weight={SCHEHERAZADE_SEMI_BOLD} color={BLACK}>
                    {"  "}{title ? title : " Profile Boost"}
                </AppText>
            </View>
            <FastImage source={closeIcon} tintColor={colors.black} resizeMode="contain" style={[styles.closeIcon, { opacity: 0 }]} />
        </TouchableOpacityView>
    )
};
export default OneTimeProductHeader;
const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: metrics.hp2,
        marginTop: metrics.hp5,
        backgroundColor: "#FFFFFF12"
    },
    closeIcon: {
        height: metrics.hp4,
        width: metrics.hp4
    },
    flasIcon: {
        height: metrics.hp2_5,
        width: metrics.hp2_5
    },
    innerContainer: {
        flexDirection: "row",
        alignItems: "center",
    }
})
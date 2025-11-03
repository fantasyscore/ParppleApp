import React from "react";
import { StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import { eyeIcon, rightArrow, rightBlack } from "../helper/ImageAssets";
import metrics from "../assets/Metrics";
import { colors } from "../theme/colors";
import { TouchableOpacityView } from "./TouchableOpacityView";
import { AppText, ELEVEN, INTER_MEDIUM, LIGHT_BLACK, TEN } from "./AppText";

const GoButton = ({ onPress, colortrue, visible, setShowProfile, visiBleProfile, defaultVisible }: any) => {
    return (
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            {defaultVisible ?
                <View style={{
                    marginBottom: metrics.hp3,
                    marginLeft: metrics.hp2,
                    flexDirection: "row", alignItems: "center"
                }}>
                    <FastImage source={eyeIcon} resizeMode="contain" style={{ height: metrics.hp3, width: metrics.hp3 }} />
                    <AppText type={ELEVEN} weight={INTER_MEDIUM} color={LIGHT_BLACK}>
                        {"   "}Always visible on profile
                    </AppText>
                </View>
                : <></>}
            {visiBleProfile ?
                <TouchableOpacityView style={{
                    marginBottom: metrics.hp3,
                    marginLeft: metrics.hp2,
                    flexDirection: "row", alignItems: "center"
                }} onPress={() => setShowProfile(!visible)}>
                    <View style={[styles.checkBox, { backgroundColor: visible ? colors.purple : colors.lightBack }]}>
                        <FastImage source={rightBlack} tintColor={colors.white} resizeMode="contain" style={styles.rightIcon} />
                    </View>
                    <AppText type={TEN} weight={INTER_MEDIUM} color={LIGHT_BLACK}>
                        {"   "}Visible on profile
                    </AppText>
                </TouchableOpacityView>
                : <View />}
            <TouchableOpacityView onPress={onPress} style={[styles.arrowContainer, { backgroundColor: colortrue ? colors.purple : colors.nanoOpecity }]}>
                <FastImage tintColor={colortrue && colors.white} source={rightArrow} resizeMode="contain" style={styles.arrowIcon} />
            </TouchableOpacityView>
        </View>
    )
};
export default GoButton;
const styles = StyleSheet.create({
    arrowIcon: {
        height: metrics.hp2_5,
        width: metrics.hp2_5
    },
    arrowContainer: {
        height: metrics.hp6,
        width: metrics.hp6,
        backgroundColor: colors.nanoOpecity,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: metrics.hp50,
        alignSelf: "flex-end",
        marginBottom: metrics.hp3,
        marginRight: metrics.hp2,
    },
    checkBox: {
        height: metrics.hp2_5,
        width: metrics.hp2_5,
        borderWidth: metrics.hp0_1,
        borderColor: colors.darkOpecity,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: metrics.hp0_1
    },
    rightIcon: {
        height: metrics.hp1_5,
        width: metrics.hp1_5
    },
})
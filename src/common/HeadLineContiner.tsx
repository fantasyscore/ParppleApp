import React from "react";
import { StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import { AppText, INTER_BOLD, INTER_MEDIUM, INTER_SEMI_BOLD, NINE, OPECITY, TEN, TWELVE, WHITE } from "./AppText";
import metrics from "../assets/Metrics";
import { colors } from "../theme/colors";

const HeadLineContiner = ({ Icons, headLines, redText, secondLine, setting, circle }: any) => {
    return (
        <View style={{ marginTop: metrics.hp1_5 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {setting ? <></> :
                        <FastImage source={Icons} resizeMode="contain" style={styles.icons} />
                    }
                    <AppText type={TWELVE} weight={INTER_BOLD}>
                        {"   "}{headLines}
                    </AppText>
                    {redText &&
                        <View style={styles.redContainer}>
                            <AppText color={WHITE} type={TEN} weight={INTER_SEMI_BOLD}>
                                {redText}
                            </AppText>
                        </View>
                    }
                </View>
                {!circle && !setting &&
                    <View style={styles.roundRed} />}
            </View>
            {secondLine &&
                <AppText weight={INTER_MEDIUM} color={OPECITY} type={TWELVE}>
                    {secondLine}
                </AppText>
            }
        </View>
    )
};
export default HeadLineContiner;
const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center"
    },
    icons: {
        height: metrics.hp2,
        width: metrics.hp2
    },
    redContainer: {
        paddingHorizontal: metrics.hp1,
        borderRadius: metrics.hp2,
        backgroundColor: colors.red,
        paddingVertical: metrics.hp0_1,
        marginLeft: metrics.hp1
    },
    roundRed: {
        height: metrics.hp2,
        width: metrics.hp2,
        borderRadius: metrics.hp50,
        borderWidth: metrics.hp0_2,
        borderStyle: "dotted",
        borderColor: colors.red
    }
})
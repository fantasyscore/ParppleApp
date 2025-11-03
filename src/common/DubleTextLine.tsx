import React from "react";
import { StyleSheet, View } from "react-native";
import { AppText, EIGHTEEN, fontSize, OPECITY_DARK, SCHEHERAZADE_BOLD } from "./AppText";
import metrics from "../assets/Metrics";

const DubleTextLine = ({ firstText, secondText, thirdText }: any) => {
    return (
        <View>
            <AppText style={{ fontSize: fontSize(27) }} weight={SCHEHERAZADE_BOLD}>
                {firstText}
            </AppText>
            {secondText &&
                <AppText style={{ fontSize: fontSize(27), marginTop: -metrics.hp3_5 }} weight={SCHEHERAZADE_BOLD}>
                    {secondText}
                </AppText>
            }
            {thirdText &&
                <AppText style={{
                    textDecorationLine: "underline",
                    marginTop: -metrics.hp2
                }} color={OPECITY_DARK} type={EIGHTEEN} weight={SCHEHERAZADE_BOLD}>
                    {thirdText}
                </AppText>
            }
        </View>

    )
};
export default DubleTextLine;
const styles = StyleSheet.create({
})
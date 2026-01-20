import React from "react";
import { Platform, StyleSheet, TextInput, View } from "react-native";
import { colors } from "../theme/colors";
import { Screen } from "../theme/dimens";
import { AppText, fontSize, INTER_BOLD, INTER_MEDIUM } from "./AppText";
import metrics from "../assets/Metrics";
import FastImage from "react-native-fast-image";
import { closeIcon } from "../helper/ImageAssets";
import { TouchableOpacityView } from "./TouchableOpacityView";

const InputCommon = ({ placeholder, value, onChangeText, style, onPress, closeVisible }: any) => {
    return (
        <View style={[styles.countryInputTwo, style]}>
            <TextInput
                allowFontScaling={false}
                placeholder={placeholder}
                value={value}
                onChangeText={(text) => onChangeText(text)}
                placeholderTextColor={colors.opecity}
                style={{ width: Screen.Width / 1.20, fontSize: fontSize(18), fontWeight: Platform.OS === "ios" ? "600": "700", fontFamily: INTER_BOLD, color: colors.black, marginBottom:Platform.OS === "ios" ? metrics.hp0_5:0 }}
            />
            {closeVisible &&
                <TouchableOpacityView onPress={onPress}>
                    <FastImage source={closeIcon} resizeMode="contain" style={{ height: metrics.hp3, width: metrics.hp3 }} />
                </TouchableOpacityView>
            }
        </View>
    )
};
export default InputCommon;
const styles = StyleSheet.create({
    countryInputTwo: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        marginTop: metrics.hp3,
        borderBottomColor: colors.lightBlack,
    }
})
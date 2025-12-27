import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import metrics from "../assets/Metrics";
import { colors } from "../theme/colors";
import FastImage from "react-native-fast-image";
import { searchIcon } from "../helper/ImageAssets";
import { fontSize, INTER_MEDIUM } from "./AppText";
import { Screen } from "../theme/dimens";

const SearchContainer = ({placeholder,value, onChangeText,style}:any) => {
    return (
        <View style={[styles.container,style]}>
            <FastImage source={searchIcon} resizeMode="contain" tintColor={colors.darkOpecity} style={styles.iconSearch} />
            <TextInput
                allowFontScaling={false}
                placeholder={placeholder}
                value={value}
                onChangeText={(text) => onChangeText(text)}
                placeholderTextColor={colors.darkOpecity}
                style={{ width: Screen.Width / 1.20, fontSize: fontSize(12), fontWeight: "500", fontFamily: INTER_MEDIUM, color: colors.black }}
            />
        </View>
    )
};
export default SearchContainer;
const styles = StyleSheet.create({
    container: {
        height: metrics.hp5,
        backgroundColor: colors.lightBack,
        borderRadius: metrics.hp4,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: metrics.hp2
    },
    iconSearch: {
        height: metrics.hp2_5,
        width: metrics.hp2_5,
        marginRight:metrics.hp1
    }
})
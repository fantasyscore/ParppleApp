import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import metrics from "../assets/Metrics";
import { colors } from "../theme/colors";
import FastImage from "react-native-fast-image";
import { fontSize, INTER_MEDIUM } from "./AppText";
import { Screen } from "../theme/dimens";
import { searchIconNew } from "../helper/ImageAssets";

const SearchContainer = ({ placeholder, value, onChangeText, style, editable = true }: any) => {
    return (
        <View style={{flexDirection:"row", alignItems:"center", paddingHorizontal:metrics.hp2}}>
            <FastImage source={searchIconNew} resizeMode="contain" tintColor={colors.darkOpecity} style={styles.iconSearch} />
            <TextInput
                allowFontScaling={false}
                placeholder={placeholder}
                value={value}
                onChangeText={(text) => onChangeText(text)}
                placeholderTextColor={colors.darkOpecity}
                editable={editable}
                style={{ width: Screen.Width / 1.4, fontSize: fontSize(12), fontWeight: "500", fontFamily: INTER_MEDIUM, color: colors.white, }}
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
        marginRight: metrics.hp1
    }
})
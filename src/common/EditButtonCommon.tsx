import React from "react";
import { StyleSheet, View } from "react-native";
import metrics from "../assets/Metrics";
import { colors } from "../theme/colors";
import FastImage from "react-native-fast-image";
import { AppText, BLACK, INTER_SEMI_BOLD, LIGHT_BLACK, OPECITY, OPECITY_DARK, TEN, TWELVE } from "./AppText";
import { keywordRightArrow } from "../helper/ImageAssets";
import { TouchableOpacityView } from "./TouchableOpacityView";

const EditButtonCommon = ({ Icons, title, first, filluptext, onPress, setting, setToggleShow, togleShow, toggle, setSelectFtCm, selectFtCm, Distance, inText, inTextTwo, hidden = true }: any) => {
    return (
        <TouchableOpacityView onPress={onPress} style={[styles.container, { marginTop: first ? metrics.hp2 : metrics.hp0_5, borderWidth: setting ? 0 : filluptext ? metrics.hp0 : metrics.hp0_1, borderColor: colors.red }]}>
            <View style={{ flexDirection: "row", alignItems: "center", }}>
                {!setting && <FastImage tintColor={colors.darkOpecity} source={Icons} resizeMode="contain" style={styles.icons} />}
                <AppText color={OPECITY_DARK} weight={INTER_SEMI_BOLD} type={TWELVE}>
                    {"   "}{title}
                </AppText>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", }}>
                {filluptext &&
                    <AppText
                        style={{
                            textTransform: "capitalize",
                            maxWidth: metrics.hp20,
                            alignSelf: "flex-end",
                            marginBottom: metrics.hp0_4
                        }}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        color={!hidden ? OPECITY : LIGHT_BLACK}
                        weight={INTER_SEMI_BOLD}
                        type={!hidden ? TEN : TWELVE}
                    >
                        {!hidden ? "Hidden " : filluptext}{"   "}
                    </AppText>
                }

                {Distance &&
                    <View style={styles.selectCm}>
                        <TouchableOpacityView
                            onPress={() => setSelectFtCm(selectFtCm === "MI" ? "MI" : "FT")}
                            style={[
                                styles.selectedBack,
                                { backgroundColor: selectFtCm === "FT" || selectFtCm === "MI" ? colors.green : colors.nanoOpecity },
                            ]}>
                            <AppText type={TWELVE} color={selectFtCm === "FT" || selectFtCm === "MI" ? BLACK : "#999"} weight={INTER_SEMI_BOLD}>
                                {inText}
                            </AppText>
                        </TouchableOpacityView>
                        <TouchableOpacityView
                            onPress={() => setSelectFtCm(selectFtCm === "KM" ? "KM" : "CM")}
                            style={[
                                styles.selectedBack,
                                { backgroundColor: selectFtCm === "CM" || selectFtCm === "KM" ? colors.green : colors.nanoOpecity },
                            ]}>
                            <AppText type={TWELVE} color={selectFtCm === "CM" || selectFtCm === "KM" ? BLACK : "#999"} weight={INTER_SEMI_BOLD}>
                                {inTextTwo}
                            </AppText>
                        </TouchableOpacityView>
                    </View>
                }
                {toggle ?
                    <TouchableOpacityView onPress={() => setToggleShow(!togleShow)} style={[styles.slideContainer, { backgroundColor: togleShow ? colors.green : colors.nanoOpecity }]}>
                        {togleShow ?
                            <View style={styles.slideUnSelect} /> :
                            <View style={styles.slider} />
                        }
                        {togleShow ?
                            <View style={styles.sliderSelect} /> :
                            <View style={styles.slideUnSelect} />
                        }
                    </TouchableOpacityView> :
                    <>
                        {!Distance &&
                            <FastImage source={keywordRightArrow} resizeMode="contain" style={styles.keywordRightArrow} />}
                    </>
                }
            </View>
        </TouchableOpacityView>
    )
};
export default EditButtonCommon;
const styles = StyleSheet.create({
    container: {
        paddingHorizontal: metrics.hp1_5,
        paddingVertical: metrics.hp1_5,
        backgroundColor: colors.lightBack,
        borderRadius: metrics.hp1_5,
        marginTop: metrics.hp1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    icons: {
        height: metrics.hp2,
        width: metrics.hp2
    },
    keywordRightArrow: {
        height: metrics.hp2_4,
        width: metrics.hp2_4
    },
    slideContainer: {
        borderRadius: metrics.hp3,
        paddingHorizontal: metrics.hp0_2,
        paddingVertical: metrics.hp0_2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: colors.nanoOpecity
    },
    slider: {
        height: metrics.hp2_7,
        width: metrics.hp2_7,
        backgroundColor: colors.opecity,
        borderRadius: metrics.hp3
    },
    slideUnSelect: {
        height: metrics.hp2_7,
        width: metrics.hp2_7,
    },
    sliderSelect: {
        height: metrics.hp2_7,
        width: metrics.hp2_7,
        backgroundColor: colors.white,
        borderRadius: metrics.hp3
    },
    selectCm: {
        height: metrics.hp5,
        backgroundColor: colors.nanoOpecity,
        width: metrics.hp10,
        borderRadius: metrics.hp4,
        padding: metrics.hp0_2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    selectedBack: {
        height: metrics.hp5,
        width: metrics.hp5,
        borderRadius: metrics.hp50,
        alignItems: "center",
        justifyContent: "center",

    },
})
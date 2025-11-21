import React from "react";
import { StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import { AppText, INTER_BOLD, INTER_MEDIUM, INTER_SEMI_BOLD, OPECITY_DARK, TWELVE } from "./AppText";
import metrics from "../assets/Metrics";
import { colors } from "../theme/colors";
import { TouchableOpacityView } from "./TouchableOpacityView";
import { rightBlack } from "../helper/ImageAssets";

const CheckBoxlist = ({ Icons, headLines, listdata, visible, onClick, underTitle, setToggleShow, togleShow }: any) => {
    return (
        <View style={styles.headConatiner}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                <FastImage source={Icons} resizeMode="contain" style={styles.icons} />
                <AppText type={TWELVE} weight={INTER_BOLD}>
                    {"   "}{headLines}
                </AppText>
            </View>
            <View style={styles.container}>
                {listdata?.map((item: any, index: any) => {
                    const isLast = index === listdata.length - 1;
                    return (
                        <TouchableOpacityView key={index} onPress={() => onClick(item.sendTitle)} style={styles.checkBoxContianer}>
                            <AppText type={TWELVE} weight={INTER_SEMI_BOLD}>
                                {item.title}
                            </AppText>
                            <View style={[styles.checkBox, { backgroundColor: visible == item.sendTitle ? colors.purple : colors.lightBack }]}>
                                <FastImage source={rightBlack} tintColor={colors.white} resizeMode="contain" style={styles.rightIcon} />
                            </View>
                        </TouchableOpacityView>
                    )
                })}
                 <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop:metrics.hp1_5}}>
                    <AppText type={TWELVE} color={OPECITY_DARK} weight={INTER_MEDIUM}>
                        {underTitle}
                    </AppText>
                    <TouchableOpacityView onPress={() => setToggleShow(!togleShow)} style={[styles.slideContainer, { backgroundColor: togleShow ? colors.green : colors.nanoOpecity }]}>
                        {togleShow ?
                            <View style={styles.slideUnSelect} /> :
                            <View style={styles.slider} />
                        }
                        {togleShow ?
                            <View style={styles.sliderSelect} /> :
                            <View style={styles.slideUnSelect} />
                        }
                    </TouchableOpacityView>
                </View>
            </View>
        </View>
    )
};
export default CheckBoxlist;
const styles = StyleSheet.create({
    headConatiner: {
        paddingHorizontal: metrics.hp2,
        marginTop: metrics.hp2
    },
    container: {
        paddingHorizontal: metrics.hp1_5,
        paddingVertical: metrics.hp1_5,
        backgroundColor: colors.lightBack,
        borderRadius: metrics.hp1_5,
        marginTop: metrics.hp1,
        // shadowColor: colors.black,
        // shadowOpacity: 0.07,
        // shadowOffset: { width: 0, height: 1 },
        // shadowRadius: 6,
        // elevation: 2,
    },
    icons: {
        height: metrics.hp2,
        width: metrics.hp2
    },
    checkBoxContianer: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingVertical: metrics.hp1_5,
        borderBottomWidth: metrics.hp0_1,
        borderBottomColor: colors.nanoOpecity
    },
    checkBox: {
        height: metrics.hp2,
        width: metrics.hp2,
        borderWidth: metrics.hp0_1,
        borderColor: colors.darkOpecity,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: metrics.hp0_2
    },
    rightIcon: {
        height: metrics.hp1,
        width: metrics.hp1
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
    }
})
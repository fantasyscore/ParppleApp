import React from "react";
import { StyleSheet, View } from "react-native";
import metrics from "../assets/Metrics";
import { colors } from "../theme/colors";
import FastImage from "react-native-fast-image";
import { AppText, BLACK, INTER_BOLD, INTER_MEDIUM, INTER_SEMI_BOLD, OPECITY, TEN, TWELVE } from "./AppText";
import { keywordRightArrow } from "../helper/ImageAssets";
import { TouchableOpacityView } from "./TouchableOpacityView";

const ButtonSheet = ({ Icons, headLines, titile, onPress, togleTure, togleShow, setToggleShow, edit, hidden, data, color }: any) => {
    console.log(data,"datadatadatadatadata");
    
    return (
        data?.length ?
            <TouchableOpacityView onPress={onPress} style={styles.listData}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {data?.map((item: any, index: any) => {
                        return (
                            <View key={index} style={styles.containerSelect}>
                                <AppText type={TWELVE} weight={INTER_MEDIUM}>
                                    {item}
                                </AppText>
                            </View>
                        )
                    })}
                </View>
                <FastImage source={keywordRightArrow} resizeMode="contain" style={styles.keywordRightArrow} />
            </TouchableOpacityView> :
            <View style={[styles.headConatiner, {
                paddingHorizontal: !edit ? metrics.hp2 : 0,
                marginTop: !edit ? metrics.hp2 : metrics.hp1,
            }]}>
                {!edit ?
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <FastImage source={Icons} resizeMode="contain" style={styles.icons} />
                        <AppText type={TWELVE} weight={INTER_BOLD}>
                            {"   "}{headLines}
                        </AppText>
                    </View>
                    : <></>}
                <View style={styles.container}>
                    <TouchableOpacityView disabled={togleTure} onPress={onPress} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <AppText style={{ textTransform: "capitalize" }} type={TWELVE} color={color ? BLACK : titile == "Select" ? OPECITY : edit ? OPECITY : BLACK} weight={INTER_SEMI_BOLD}>
                            {titile}
                        </AppText>
                        {togleTure ?
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
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <AppText type={TEN} weight={INTER_SEMI_BOLD} color={OPECITY}>
                                    {hidden}{"   "}
                                </AppText>
                                <FastImage source={keywordRightArrow} resizeMode="contain" style={styles.keywordRightArrow} />
                            </View>
                        }

                    </TouchableOpacityView>
                </View>
            </View>
    )
};
export default ButtonSheet;
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
    listData: {
        height: metrics.hp6,
        borderWidth: metrics.hp0_1,
        borderColor: colors.nanoOpecity,
        marginTop: metrics.hp2,
        borderRadius: metrics.hp1_5,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: metrics.hp1,
        justifyContent: "space-between"
    },
    containerSelect: {
        height: metrics.hp3,
        paddingHorizontal: metrics.hp1_6,
        borderRadius: metrics.hp4,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.green,
        marginLeft: metrics.hp1
    }
})
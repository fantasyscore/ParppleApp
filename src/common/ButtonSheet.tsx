import React from "react";
import { StyleSheet, View } from "react-native";
import metrics from "../assets/Metrics";
import { colors } from "../theme/colors";
import FastImage from "react-native-fast-image";
import { AppText, BLACK, INTER_BOLD, INTER_MEDIUM, INTER_SEMI_BOLD, LIGHT_BLACK, OPECITY, TEN, TWELVE } from "./AppText";
import { keywordRightArrow } from "../helper/ImageAssets";
import { TouchableOpacityView } from "./TouchableOpacityView";

const ButtonSheet = ({ Icons, headLines, titile, onPress, togleTure, togleShow, setToggleShow, edit, hidden, data, color }: any) => {

    return (
        data?.length ?
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
            <TouchableOpacityView onPress={onPress} style={styles.listData}>
                  
                <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: metrics.hp0_5 }}>
                    {data?.map((item: any, index: any) => {
                        return (
                            <View key={index} style={styles.containerSelect}>
                                <AppText type={TWELVE} weight={INTER_MEDIUM}>
                                    {titile == "Add Language" ? item : item?.displayLabel}
                                </AppText>
                            </View>
                        )
                    })}
                </View>
                <View style={{
                    position: "absolute",
                    bottom: metrics.hp1_3,
                    right: metrics.hp1,
                    flexDirection: "row",
                    alignItems: "center"
                }}>
                    {hidden == "Hidden" &&
                        <AppText style={{ textTransform: "capitalize", marginBottom: metrics.hp0_3 }} color={OPECITY} weight={INTER_SEMI_BOLD} type={TEN}>
                            {"Hidden"}{"   "}
                        </AppText>
                    }
                    <FastImage source={keywordRightArrow} resizeMode="contain" style={[styles.keywordRightArrow, {}]} />
                </View>
            </TouchableOpacityView> 
            </View>:
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
                        <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: metrics.hp0_5 }}>
                            <AppText numberOfLines={1}
                                ellipsizeMode="tail" style={{ textTransform: "capitalize", maxWidth: metrics.hp30, }} type={TWELVE} color={color ? BLACK : titile == "Select" ? OPECITY : edit ? OPECITY : BLACK} weight={INTER_SEMI_BOLD}>
                                {titile}
                            </AppText>
                        </View>
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
                            <View style={{ flexDirection: "row", alignItems: "center", }}>
                                <AppText style={{ textTransform: "capitalize" }} color={hidden == "Hidden" ? OPECITY : LIGHT_BLACK} weight={INTER_SEMI_BOLD} type={hidden == "Hidden" ? TEN : TWELVE}>
                                    {hidden == "Hidden" ? hidden : hidden}{"   "}
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
        marginTop: metrics.hp2,
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
        width: metrics.hp2_4,

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
        borderWidth: metrics.hp0_1,
        borderColor: colors.nanoOpecity,
        marginTop: metrics.hp2,
        borderRadius: metrics.hp1_5,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: metrics.hp1,
        justifyContent: "space-between",
        paddingVertical: metrics.hp1,
    },
    containerSelect: {
        height: metrics.hp3,
        paddingHorizontal: metrics.hp1_6,
        borderRadius: metrics.hp4,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.green,
        marginLeft: metrics.hp1,
    }
})
import React from "react";
import { StyleSheet, View } from "react-native";
import metrics from "../assets/Metrics";
import { AppText, FORTEEN, INTER_MEDIUM } from "./AppText";
import { colors } from "../theme/colors";
import FastImage from "react-native-fast-image";
import { rightBlack } from "../helper/ImageAssets";
import { TouchableOpacityView } from "./TouchableOpacityView";

const ListCheckBox = ({ item, notsend, index, selectPronoun, setSelectPronoun, round }: any) => {
    const isSelected = round
        ? notsend ? selectPronoun === item?.title : selectPronoun === item?.sendTitle
        : notsend ? selectPronoun?.includes(item?.title) : selectPronoun?.includes(item?.sendTitle);
console.log(item,"itemitemitemitem");
console.log(selectPronoun,"selectPronoun")
    const handlePress = () => {
        if (round) {
            setSelectPronoun(notsend ? item?.title : item?.sendTitle);
        } else {
            if (isSelected) {
                setSelectPronoun(notsend ? selectPronoun.filter((v: any) => v !== item?.title) : selectPronoun.filter((v: any) => v !== item?.sendTitle));
            } else {
                setSelectPronoun(notsend ? [...selectPronoun, item?.title] : [...selectPronoun, item?.sendTitle]);
            }
        }
    };
    return (
        <TouchableOpacityView
            onPress={handlePress}
            style={[
                styles.container,
                { backgroundColor: isSelected ? colors.green : colors.lightBack },
            ]}>
            <AppText type={FORTEEN} weight={INTER_MEDIUM}>
                {item.title}
            </AppText>

            <View
                style={[
                    styles.checkBox,
                    {
                        backgroundColor: isSelected ? colors.purple : colors.lightBack,
                        borderRadius: round ? metrics.hp50 : metrics.hp0_5,
                    },
                ]}>
                {round ? (
                    <View style={isSelected ? styles.dot : styles.dotUnselect} />
                ) : (
                    isSelected && (
                        <FastImage
                            source={rightBlack}
                            tintColor={colors.white}
                            resizeMode="contain"
                            style={styles.rightIcon}
                        />
                    )
                )}
            </View>
        </TouchableOpacityView>
    )
};
export default ListCheckBox;
const styles = StyleSheet.create({
    container: {
        height: metrics.hp5,
        borderRadius: metrics.hp1_5,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: metrics.hp2,
        marginTop: metrics.hp1
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
    dot: {
        height: metrics.hp1_7,
        width: metrics.hp1_7,
        backgroundColor: colors.purple,
        borderRadius: metrics.hp50,
        borderWidth: 3,
        borderColor: colors.green
    },
    dotUnselect: {
        height: metrics.hp2,
        width: metrics.hp2,
        backgroundColor: colors.lightBack,
        borderRadius: metrics.hp50
    },
})
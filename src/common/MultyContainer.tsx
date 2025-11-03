import React from "react";
import { StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import { AppText, FORTEEN, INTER_MEDIUM, INTER_SEMI_BOLD, TWELVE } from "./AppText";
import metrics from "../assets/Metrics";
import { colors } from "../theme/colors";
import { TouchableOpacityView } from "./TouchableOpacityView";


const MultyContainer = ({ firstIcon, title, data, selectedCategories, setSelectedCategories }: any) => {
    const toggleCategory = (item: any) => {
        setSelectedCategories((prev: any) => {
            const exists = prev.some((i: any) => JSON.stringify(i) === JSON.stringify(item));
            if (exists) {
                return prev.filter((i: any) => JSON.stringify(i) !== JSON.stringify(item));
            } else {
                return [...prev, item];
            }
        });
    };

    const isItemSelected = (item: any) => {
        return selectedCategories.some((i: any) => JSON.stringify(i) === JSON.stringify(item));
    };
    
    return (
        <View style={styles.containerRender}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                <FastImage source={firstIcon} resizeMode="contain" style={styles.smookingIcon} />
                <AppText type={FORTEEN} weight={INTER_SEMI_BOLD}>
                    {"  "}{title}
                </AppText>
            </View>
            <View style={styles.wrapContainer}>
                {data.map((item: any, index: any) => {
                    const isSelected = isItemSelected(item);
                    return (
                        <TouchableOpacityView onPress={() => toggleCategory(item)} key={index} style={[styles.containerSelect, { backgroundColor: isSelected ? colors.green : colors.lightBack }]}>
                            <AppText type={TWELVE} weight={INTER_MEDIUM}>
                                {item.title}
                            </AppText>
                        </TouchableOpacityView>
                    );
                })}
            </View>
        </View>
    )
};
export default MultyContainer;
const styles = StyleSheet.create({
    containerRender: {
        marginVertical: metrics.hp2,
        borderBottomWidth: metrics.hp0_1,
        marginHorizontal: metrics.hp2,
        borderBottomColor: colors.nanoOpecity
    },
    smookingIcon: {
        height: metrics.hp2,
        width: metrics.hp2
    },
    wrapContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: metrics.hp1_3,
        marginTop: metrics.hp2,
        marginBottom: metrics.hp2
    },
    containerSelect: {
        height: metrics.hp4,
        paddingHorizontal: metrics.hp1_6,
        borderRadius: metrics.hp4,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.lightBack
    }
})
import React from "react";
import { StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import { AppText, FORTEEN, INTER_MEDIUM, INTER_SEMI_BOLD, TWELVE } from "./AppText";
import metrics from "../assets/Metrics";
import { colors } from "../theme/colors";
import { TouchableOpacityView } from "./TouchableOpacityView";

const MultyContainer = ({ firstIcon, title, data, selectedCategory, setSelectedCategory }: any) => {
    const toggleCategory = (item: any) => {
        setSelectedCategory((prev: any) => (prev === item._id ? null : item._id));
    };
    const isItemSelected = (item: any) => selectedCategory === item._id;

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
                        <TouchableOpacityView
                            key={index}
                            onPress={() => toggleCategory(item)}
                            style={[
                                styles.containerSelect,
                                { backgroundColor: isSelected ? colors.green : colors.lightBack },
                            ]}
                        >
                            <AppText type={TWELVE} weight={INTER_MEDIUM}>
                                {item.displayLabel}
                            </AppText>
                        </TouchableOpacityView>
                    );
                })}
            </View>
        </View>
    );
};
export default MultyContainer;

const styles = StyleSheet.create({
    containerRender: {
        marginVertical: metrics.hp2,
        borderBottomWidth: metrics.hp0_1,
        marginHorizontal: metrics.hp2,
        borderBottomColor: colors.nanoOpecity,
    },
    smookingIcon: {
        height: metrics.hp2,
        width: metrics.hp2,
    },
    wrapContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: metrics.hp1_3,
        marginTop: metrics.hp2,
        marginBottom: metrics.hp2,
    },
    containerSelect: {
        height: metrics.hp4,
        paddingHorizontal: metrics.hp1_6,
        borderRadius: metrics.hp4,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.lightBack,
    },
});

import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import metrics from "../assets/Metrics";
import { colors } from "../theme/colors";
import { TouchableOpacityView } from "./TouchableOpacityView";
import { AppText, FORTEEN, INTER_BOLD, INTER_MEDIUM, INTER_SEMI_BOLD, OPECITY, OPECITY_DARK, TWELVE, WHITE } from "./AppText";
import { Screen } from "../theme/dimens";
import FastImage from "react-native-fast-image";
import { googleIcon, lockIcon } from "../helper/ImageAssets";

const PurpuleButton = ({ gmail, onPress, title, tabSelect, onPressGoogle }: any) => {
    return (
        <View style={[styles.container, { height: gmail ? metrics.hp28 : metrics.hp11 }]}>
            <TouchableOpacityView onPress={onPress} style={tabSelect == "Advance" ? styles.buttonContinerNew : styles.buttonContiner}>
                <AppText color={tabSelect == "Advance" ? OPECITY_DARK : WHITE} weight={INTER_SEMI_BOLD} type={FORTEEN}>
                    {tabSelect == "Advance" && <FastImage source={lockIcon} resizeMode="contain" style={{
                        height: metrics.hp2,
                        width: metrics.hp2
                    }} />}   {title}
                </AppText>
            </TouchableOpacityView>
            {
                gmail &&
                <>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: metrics.hp2 }}>
                        <View style={{ height: metrics.hp0_1, width: Screen.Width / 3, backgroundColor: colors.nanoOpecity }} />
                        <AppText weight={INTER_BOLD} color={OPECITY} type={FORTEEN}>
                            {"   "}Or{"   "}
                        </AppText>
                        <View style={{ height: metrics.hp0_1, width: Screen.Width / 3, backgroundColor: colors.nanoOpecity }} />
                    </View>
                    <TouchableOpacityView onPress={onPressGoogle} style={[styles.phoneContainer, { marginTop: metrics.hp2 }]}>
                        <View style={styles.callIconContainer}>
                            <FastImage source={googleIcon} resizeMode="contain" style={styles.googleIcon} />
                        </View>
                        <AppText weight={INTER_BOLD} type={FORTEEN}>
                            {"                  "}Continue with Google
                        </AppText>
                    </TouchableOpacityView>
                    <AppText style={{ textAlign: "center", marginVertical: metrics.hp1 }} type={TWELVE} weight={INTER_MEDIUM} color={OPECITY}>
                        Get your google account instantly connected
                    </AppText>
                </>
            }
        </View >
    )
};
export default PurpuleButton;
const styles = StyleSheet.create({
    container: {
        height: metrics.hp11,
        backgroundColor: colors.white, // purple color
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -3 }, // 👈 negative Y for top shadow
                shadowOpacity: 0.2,
                shadowRadius: 4,
            },
            android: {
                elevation: 6, // works all sides
                shadowColor: "#000",
            },
        }),
        paddingHorizontal: metrics.hp2,
    },
    buttonContiner: {
        height: metrics.hp5,
        borderRadius: metrics.hp4,
        backgroundColor: colors.purple,
        alignItems: "center",
        justifyContent: "center",
        marginTop: metrics.hp2,

    },
    buttonContinerNew: {
        height: metrics.hp5,
        borderRadius: metrics.hp4,
        backgroundColor: colors.nanoOpecity,
        alignItems: "center",
        justifyContent: "center",
        marginTop: metrics.hp2,

    },
    phoneContainer: {
        height: metrics.hp6,
        borderRadius: metrics.hp3,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.nanoOpecity
    },
    callIconContainer: {
        height: metrics.hp5_5,
        width: metrics.hp5_5,
        borderRadius: metrics.hp50,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.transparent,
        shadowColor: colors.black,
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
        alignItems: "center",
        justifyContent: "center"
    },
    googleIcon: {
        height: metrics.hp4,
        width: metrics.hp4
    }
})
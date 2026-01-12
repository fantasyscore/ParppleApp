import React from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import { rightSuccesIcon } from "../../helper/ImageAssets";
import metrics from "../../assets/Metrics";
import { AppText, EIGHTEEN, FORTEEN, INTER_BOLD, INTER_REGULAR, INTER_SEMI_BOLD, LIGHT_BLACK, OPECITY_DARK, TWELVE, WHITE } from "../../common/AppText";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_CHATS_SCREEN } from "../../navigation/routes";
import { colors } from "../../theme/colors";

const SuceesReporting = () => {
    return (
        <AppSafeAreaView>
            <View style={{ flex: 1 }}>
                <FastImage source={rightSuccesIcon} resizeMode="cover" style={styles.icons} />
                <AppText style={{ textAlign: "center" }} type={EIGHTEEN} weight={INTER_BOLD} color={LIGHT_BLACK}>
                    Thank you for reporting.
                </AppText>
                <AppText style={{ textAlign: "center", marginTop: metrics.hp1 }} type={TWELVE} weight={INTER_REGULAR} color={OPECITY_DARK}>
                    Our Trust & Safety team will review your report{'\n'}as soon as possible and take action if the user{'\n'}has violated our guidelines.
                </AppText>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacityView
                    onPress={() => {
                        // If we arrived via resetStack([Chat, Success]) this will go back to Chat.
                        // Otherwise, fall back to resetting to Chat.
                        NavigationService.goBack();
                        NavigationService.reset(NAVIGATION_CHATS_SCREEN);
                    }}
                    style={[styles.button, { backgroundColor: colors.purple }]}
                >
                    <AppText type={FORTEEN} weight={INTER_SEMI_BOLD} color={WHITE}>
                        Done
                    </AppText>
                </TouchableOpacityView>
            </View>
        </AppSafeAreaView>
    )
};
export default SuceesReporting;
const styles = StyleSheet.create({
    icons: {
        height: metrics.hp35,
        width: metrics.hp35,
        alignSelf: "center",
        marginTop: metrics.hp20,
    },
    buttonContainer: {
        paddingHorizontal: metrics.hp2,
        paddingVertical: metrics.hp2,
        borderTopWidth: metrics.hp0_2,
        borderTopColor: colors.nanoOpecity
    },
    button: {
        height: metrics.hp5,
        borderRadius: metrics.hp4,
        alignItems: "center",
        justifyContent: "center"
    },
})
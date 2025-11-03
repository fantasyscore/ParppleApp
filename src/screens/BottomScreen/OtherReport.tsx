import React from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import FastImage from "react-native-fast-image";
import { AppText, BLACK, DARK_GREEN, ELEVEN, fontSize, FORTEEN, INTER_BOLD, INTER_MEDIUM, INTER_REGULAR, INTER_SEMI_BOLD, LIGHT_BLACK, RED, TEN, WHITE } from "../../common/AppText";
import metrics from "../../assets/Metrics";
import { reportProfileIcon, shieldIcon } from "../../helper/ImageAssets";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import NavigationService from "../../navigation/NavigationService";
import { colors } from "../../theme/colors";
import { interMedium } from "../../theme/typography";
import LinearGradient from "react-native-linear-gradient";
import { NAVIGATION_SUCCES_REPORTING_SCREEN } from "../../navigation/routes";

const OtherReport = ({ route }: any) => {
    const data = route?.params ?? "";
    return (
        <AppSafeAreaView>
            <View style={styles.mainContainer}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: metrics.hp0_5 }}>
                    <FastImage source={reportProfileIcon} resizeMode='contain' style={styles.flagRedIcon} />
                    <AppText type={FORTEEN} weight={INTER_BOLD} color={LIGHT_BLACK}>
                        {"  "}Report
                    </AppText>
                </View>
                <TouchableOpacityView onPress={() => NavigationService.goBack()}>
                    <AppText style={{ marginBottom: metrics.hp0_5 }} type={FORTEEN} weight={INTER_MEDIUM} color={RED}>
                        Cancel
                    </AppText>
                </TouchableOpacityView>
            </View>
            <ScrollView scrollEnabled={true} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: metrics.hp2, marginTop: metrics.hp2, flex: 1 }}>
                <AppText type={FORTEEN} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                    {data?.headline}
                </AppText>
                <AppText style={{ marginTop: metrics.hp1_5 }} type={ELEVEN} weight={INTER_REGULAR} color={LIGHT_BLACK}>
                    {data?.inLine}
                </AppText>
                <View style={styles.inputContainer}>
                    <TextInput
                        allowFontScaling={false}
                        placeholder="Write here..."
                        placeholderTextColor={colors.opecity}
                        numberOfLines={5}
                        multiline={true}
                        maxLength={200}
                        style={{
                            fontSize: fontSize(12),
                            fontFamily: interMedium,
                            fontWeight: "500",
                            color: colors.black,
                        }}
                    />
                </View>
            </ScrollView>
            <View style={styles.buttonContainer}>
                <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.securelyTitle} colors={["#CFFFDD", "#EDFFCF00"]}>
                    <View style={styles.lockIconView}>
                        <FastImage source={shieldIcon} resizeMode="contain" style={styles.shieldIcon} />
                    </View>
                    <AppText color={BLACK} weight={INTER_MEDIUM} type={ELEVEN}>
                        {"   "}Your report is confidential. <AppText color={DARK_GREEN} weight={INTER_BOLD} type={ELEVEN}>The user will never know{'\n'}{"    "}it was you who reported them.</AppText>
                    </AppText>
                </LinearGradient>
                <TouchableOpacityView onPress={() => NavigationService.reset(NAVIGATION_SUCCES_REPORTING_SCREEN)} style={[styles.button, { backgroundColor: colors.purple }]}>
                    <AppText type={FORTEEN} weight={INTER_SEMI_BOLD} color={WHITE}>
                        Submit
                    </AppText>
                </TouchableOpacityView>
            </View>
        </AppSafeAreaView>
    )
};
export default OtherReport;
const styles = StyleSheet.create({
    mainContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: metrics.hp2,
        marginTop: metrics.hp5,
        borderBottomWidth: metrics.hp0_1,
        borderBottomColor: colors.nanoOpecity,
        paddingVertical: metrics.hp1
    },
    flagRedIcon: {
        height: metrics.hp2_5,
        width: metrics.hp2_5
    },
    inputContainer: {
        height: metrics.hp12,
        backgroundColor: colors.lightBack,
        borderRadius: metrics.hp1_5,
        marginTop: metrics.hp2,
        paddingHorizontal: metrics.hp1
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
    lockIconView: {
        height: metrics.hp3_5,
        width: metrics.hp3_5,
        backgroundColor: colors.white,
        borderRadius: metrics.hp4,
        alignItems: "center",
        justifyContent: "center",
    },
    shieldIcon: { height: metrics.hp3_5, width: metrics.hp3_5 },
    securelyTitle: {
        height: metrics.hp5,
        borderRadius: metrics.hp4,
        paddingHorizontal: metrics.hp0_5,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: metrics.hp2
    },
})
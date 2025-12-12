import React, { useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { ScrollView, StyleSheet, View } from "react-native";
import metrics from "../../assets/Metrics";
import FastImage from "react-native-fast-image";
import { reportProfileIcon } from "../../helper/ImageAssets";
import { colors } from "../../theme/colors";
import { AppText, ELEVEN, FORTEEN, INTER_BOLD, INTER_MEDIUM, INTER_REGULAR, INTER_SEMI_BOLD, LIGHT_BLACK, OPECITY_DARK, RED, WHITE } from "../../common/AppText";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import NavigationService from "../../navigation/NavigationService";
import { fakeProfileReport, HarassmentReport, InappropriatePhotosReport, reportData, ScamsFraudReport, SexualReport } from "../../common/UiltData";
import { NAVIGATION_OHTER_REPORT_SCREEN, NAVIGATION_REPORT_COMMON_SCREEN } from "../../navigation/routes";

const ReportScreen = () => {
    const [selectReport, setSelectReport] = useState("");
    const onSubmit = () => {
        if (selectReport == "Fake Profile / Impersonation") NavigationService.navigate(NAVIGATION_REPORT_COMMON_SCREEN, { headline: "Fake Profile / Impersonation", inLine: "Please tell us what seems suspicious about this profile:", data: fakeProfileReport })
        if (selectReport == "Inappropriate Photos or Content") NavigationService.navigate(NAVIGATION_REPORT_COMMON_SCREEN, { headline: "Inappropriate Photos or Content", inLine: "What type of content do you want to report?", data: InappropriatePhotosReport })
        if (selectReport == "Harassment or Abusive Behavior") NavigationService.navigate(NAVIGATION_REPORT_COMMON_SCREEN, { headline: "Harassment or Abusive Behavior", inLine: "What happened in your interaction?", data: HarassmentReport })
        if (selectReport == "Sexual Misconduct or Solicitation") NavigationService.navigate(NAVIGATION_REPORT_COMMON_SCREEN, { headline: "Sexual Misconduct or Solicitation", inLine: "What describes the issue best?", data: SexualReport })
        if (selectReport == "Scams, Fraud, or Money Requests") NavigationService.navigate(NAVIGATION_REPORT_COMMON_SCREEN, { headline: "Scams, Fraud, or Money Requests", inLine: "What type of suspicious activity are you reporting?", data: ScamsFraudReport })
        if (selectReport == "Other") NavigationService.navigate(NAVIGATION_OHTER_REPORT_SCREEN, { headline: "Other", inLine: "Please tell us more about the issue in your own words." })

    }
    return (
        <AppSafeAreaView color={colors.white}>
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
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: metrics.hp2, marginTop: metrics.hp2, flex: 1 }}>
                <AppText type={FORTEEN} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                    What would you like to report to us?
                </AppText>
                <AppText style={{ marginTop: metrics.hp1 }} type={ELEVEN} weight={INTER_REGULAR} color={OPECITY_DARK}>
                    Your safety and comfort are our top priority. If you come across someone whose behavior makes you feel uncomfortable, unsafe, or who seems to be violating our community guidelines, please don’t hesitate to report them.
                </AppText>
                <AppText style={{ marginTop: metrics.hp1_5 }} type={ELEVEN} weight={INTER_REGULAR} color={LIGHT_BLACK}>
                    Please select the reason that best describes your concern:
                </AppText>
                <View style={{ flex: 1 }}>
                    {reportData?.map((item, index) => {
                        return (
                            <TouchableOpacityView onPress={() => setSelectReport(item.title)} style={[styles.listContainer, { marginTop: index == 0 ? metrics.hp2 : 0, backgroundColor: selectReport == item.title ? colors.darkGreenTen : colors.lightBack }]} key={index}>
                                <AppText type={ELEVEN} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                                    {item.title}
                                </AppText>
                            </TouchableOpacityView>
                        )
                    })}
                </View>
                <View style={styles.pragrapContainer}>
                    <AppText type={ELEVEN} weight={INTER_REGULAR} color={LIGHT_BLACK}>
                        When you report a user, our Trust & Safety team reviews the case carefully and takes appropriate action. Reports are always kept confidential, and the person you report will never know it was you who submitted it. By reporting, you’re helping us keep this community safe, respectful, and enjoyable for everyone.
                    </AppText>
                </View>
            </ScrollView>
            <View style={styles.buttonContainer}>
                <TouchableOpacityView onPress={onSubmit} style={[styles.button, { backgroundColor: selectReport ? colors.purple : colors.nanoOpecity, }]}>
                    <AppText type={FORTEEN} weight={INTER_SEMI_BOLD} color={selectReport ? WHITE : OPECITY_DARK}>
                        Next
                    </AppText>
                </TouchableOpacityView>
            </View>
        </AppSafeAreaView>
    )
};
export default ReportScreen;
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
    listContainer: {
        paddingHorizontal: metrics.hp1,
        paddingVertical: metrics.hp1_5,
        borderRadius: metrics.hp1_5,
        marginBottom: metrics.hp0_5
    },
    pragrapContainer: {
        paddingHorizontal: metrics.hp1,
        paddingVertical: metrics.hp1,
        borderRadius: metrics.hp1_5,
        backgroundColor: colors.darkWhite,
        marginBottom: metrics.hp2
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
    }
})
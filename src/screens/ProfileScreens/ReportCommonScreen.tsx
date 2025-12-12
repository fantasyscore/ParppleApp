import React, { useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { ScrollView, StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import { AppText, ELEVEN, FORTEEN, INTER_BOLD, INTER_MEDIUM, INTER_REGULAR, INTER_SEMI_BOLD, LIGHT_BLACK, RED, WHITE } from "../../common/AppText";
import metrics from "../../assets/Metrics";
import { reportProfileIcon } from "../../helper/ImageAssets";
import NavigationService from "../../navigation/NavigationService";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import { colors } from "../../theme/colors";
import GoButton from "../../common/GoButton";
import { NAVIGATION_OHTER_REPORT_SCREEN, NAVIGATION_SUCCES_REPORTING_SCREEN } from "../../navigation/routes";

const ReportCommonScreen = ({ route }: any) => {
    const data = route?.params ?? "";
    const [selectReport, setSelectReport] = useState("");
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
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: metrics.hp2, marginTop: metrics.hp2, flex: 1 }}>
                <AppText type={FORTEEN} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                    {data?.headline}
                </AppText>
                <AppText style={{ marginTop: metrics.hp1_5 }} type={ELEVEN} weight={INTER_REGULAR} color={LIGHT_BLACK}>
                    {data?.inLine}
                </AppText>
                <View style={{ flex: 1 }}>
                    {data?.data?.map((item: any, index: any) => {
                        return (
                            <TouchableOpacityView onPress={() => setSelectReport(item.title)} style={[styles.listContainer, { marginTop: index == 0 ? metrics.hp2 : 0, backgroundColor: selectReport == item.title ? colors.darkGreenTen : colors.lightBack }]} key={index}>
                                <AppText type={ELEVEN} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                                    {item.title}
                                </AppText>
                            </TouchableOpacityView>
                        )
                    })}
                </View>
            </ScrollView>
            <View style={styles.buttonContainer}>
                <TouchableOpacityView onPress={() => NavigationService.navigate(NAVIGATION_OHTER_REPORT_SCREEN, { headline: "Other", inLine: "Please tell us more about the issue in your own words." })} style={[styles.button, { backgroundColor: selectReport ? colors.purple : colors.nanoOpecity }]}>
                    <AppText type={FORTEEN} weight={INTER_SEMI_BOLD} color={WHITE}>
                        Next
                    </AppText>
                </TouchableOpacityView>
            </View>
        </AppSafeAreaView>
    )
};
export default ReportCommonScreen;
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
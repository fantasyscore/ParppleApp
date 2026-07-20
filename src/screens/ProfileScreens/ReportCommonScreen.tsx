import React, { useCallback, useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { ScrollView, StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import { AppText, ELEVEN, FORTEEN, INTER_BOLD, INTER_MEDIUM, INTER_REGULAR, INTER_SEMI_BOLD, LIGHT_BLACK, OPECITY, OPECITY_DARK, RED, SCHEHERAZADE_BOLD, TWENTY, WHITE } from "../../common/AppText";
import metrics from "../../assets/Metrics";
import { reportProfileIcon } from "../../helper/ImageAssets";
import NavigationService from "../../navigation/NavigationService";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import { colors, newColor } from "../../theme/colors";
import { NAVIGATION_BOTTOMTAB_SCREEN, NAVIGATION_CHATS_SCREEN, NAVIGATION_OHTER_REPORT_SCREEN, NAVIGATION_SUCCES_REPORTING_SCREEN } from "../../navigation/routes";
import { useDispatch } from "react-redux";
import { reportUserAPI } from "../../actions/authActions";

const ReportCommonScreen = ({ route }: any) => {
    const data = route?.params ?? "";
    const [selectReport, setSelectReport] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dispatch = useDispatch();

    const onSubmit = useCallback(async () => {
        if (isSubmitting) return;
        if (!data?.reportedUserId || !selectReport) return;

        // If "Other" is selected, navigate to OtherReport screen (same flow as ReportScreen → Other)
        if (selectReport === "Other") {
            NavigationService.navigate(NAVIGATION_OHTER_REPORT_SCREEN, {
                reportedUserId: data.reportedUserId,
                subject: "Other",
                headline: "Other",
                inLine: "Please tell us more about the issue in your own words.",
            });
            return;
        }

        // Otherwise, submit the report directly with the selected option as body
        if (!data?.subject) return;

        setIsSubmitting(true);
        try {
            const res: any = await (dispatch as any)(
                reportUserAPI({
                    reportedUserId: String(data.reportedUserId),
                    subject: String(data.subject),
                    body: String(selectReport),
                })
            );
            if (res?.statusCode == 200) {
                NavigationService.resetStack(
                    [{ name: NAVIGATION_BOTTOMTAB_SCREEN }, { name: NAVIGATION_SUCCES_REPORTING_SCREEN }],
                    1
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    }, [data?.reportedUserId, data?.subject, dispatch, isSubmitting, selectReport]);

    return (
        <AppSafeAreaView color={newColor.blackNew}>
            <View style={styles.mainContainer}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: metrics.hp0_5 }}>
                    <FastImage tintColor={colors.white} source={reportProfileIcon} resizeMode='contain' style={styles.flagRedIcon} />
                    <AppText type={FORTEEN} weight={INTER_BOLD} color={WHITE}>
                        {"    "}Report
                    </AppText>
                </View>
                <TouchableOpacityView onPress={() => NavigationService.goBack()}>
                    <AppText style={{ marginBottom: metrics.hp0_5 }} type={FORTEEN} weight={INTER_MEDIUM} color={RED}>
                        Cancel
                    </AppText>
                </TouchableOpacityView>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: metrics.hp2, marginTop: metrics.hp2, flex: 1 }}>
                <AppText type={FORTEEN} weight={INTER_SEMI_BOLD} color={OPECITY}>
                    {data?.headline}
                </AppText>
                <AppText style={{ marginTop: metrics.hp1_5, color: "#E6B7A8" }} type={ELEVEN} weight={INTER_REGULAR} color={LIGHT_BLACK}>
                    {data?.inLine}
                </AppText>
                <View style={{ flex: 1 }}>
                    {data?.data?.map((item: any, index: any) => {
                        return (
                            <TouchableOpacityView onPress={() => setSelectReport(item.title)} style={[styles.listContainer, { marginTop: index == 0 ? metrics.hp2 : 0, backgroundColor: selectReport == item.title ? "#7A4E40" : "#555359" }]} key={index}>
                                <AppText type={ELEVEN} weight={INTER_SEMI_BOLD} color={WHITE}>
                                    {item.title}
                                </AppText>
                            </TouchableOpacityView>
                        )
                    })}
                </View>
            </ScrollView>
            <View style={styles.buttonContainer}>
                <TouchableOpacityView
                    onPress={onSubmit}
                    disabled={!selectReport || isSubmitting}
                    style={[
                        styles.button,
                        { /* backgroundColor: selectReport && !isSubmitting ? colors.purple : colors.nanoOpecity */ },
                    ]}
                >
                    <AppText style={{marginTop:-metrics.hp0_5}} type={TWENTY} weight={SCHEHERAZADE_BOLD} color={selectReport ? WHITE : OPECITY_DARK}>
                        {isSubmitting ? "Submitting..." : "Submit"}
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
        // borderTopWidth: metrics.hp0_2,
        // borderTopColor: colors.nanoOpecity
    },
    button: {
        height: metrics.hp6,
        // borderRadius: metrics.hp4,
        alignItems: "center",
        justifyContent: "center",
        borderColor: "#FAFAFA",
        borderWidth: metrics.hp0_1,
    },
})
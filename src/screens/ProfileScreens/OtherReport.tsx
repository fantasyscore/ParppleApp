import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import FastImage from "react-native-fast-image";
import { AppText, BLACK, DARK_GREEN, ELEVEN, fontSize, FORTEEN, INTER_BOLD, INTER_MEDIUM, INTER_REGULAR, INTER_SEMI_BOLD, LIGHT_BLACK, OPECITY, OPECITY_DARK, RED, SCHEHERAZADE_BOLD, TEN, TWENTY, WHITE } from "../../common/AppText";
import metrics from "../../assets/Metrics";
import { reportProfileIcon, shieldIcon } from "../../helper/ImageAssets";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import NavigationService from "../../navigation/NavigationService";
import { colors, newColor } from "../../theme/colors";
import { interMedium } from "../../theme/typography";
import LinearGradient from "react-native-linear-gradient";
import { NAVIGATION_BOTTOMTAB_SCREEN, NAVIGATION_CHATS_SCREEN, NAVIGATION_SUCCES_REPORTING_SCREEN } from "../../navigation/routes";
import { useDispatch } from "react-redux";
import { reportUserAPI } from "../../actions/authActions";
import Toast from "react-native-toast-message";

const OtherReport = ({ route }: any) => {
    const data = route?.params ?? "";
    const dispatch = useDispatch();
    const [text, setText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = useCallback(async () => {
        const body = text.trim();
        if (!data?.reportedUserId) {
            Toast.show({ type: "error", text2: "Unable to report this user. Please try again." });
            return;
        }
        if (!body) {
            Toast.show({ type: "error", text2: "Please enter details to submit your report." });
            return;
        }
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const res: any = await (dispatch as any)(
                reportUserAPI({
                    reportedUserId: String(data.reportedUserId),
                    subject: String(data?.subject || "Other"),
                    body,
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
    }, [data?.reportedUserId, data?.subject, dispatch, isSubmitting, text]);

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
            <ScrollView scrollEnabled={true} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: metrics.hp2, marginTop: metrics.hp2, flex: 1 }}>
                <AppText type={FORTEEN} weight={INTER_SEMI_BOLD} color={OPECITY}>
                    {data?.headline}
                </AppText>
                <AppText style={{ marginTop: metrics.hp1_5, color: "#E6B7A8" }} type={ELEVEN} weight={INTER_REGULAR} >
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
                        value={text}
                        onChangeText={setText}
                        style={{
                            fontSize: fontSize(12),
                            fontFamily: interMedium,
                            fontWeight: "500",
                            color: colors.white,
                        }}
                    />
                </View>
            </ScrollView>
            <View style={styles.buttonContainer}>
                <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.securelyTitle} colors={["#D08FA9", "#FDD2C1"]}>
                    <View style={styles.lockIconView}>
                        <FastImage source={shieldIcon} resizeMode="contain" style={styles.shieldIcon} />
                    </View>
                    <AppText color={BLACK} weight={INTER_BOLD} type={ELEVEN}>
                        {"   "}Your report is confidential. <AppText color={BLACK} weight={INTER_BOLD} type={ELEVEN}>The user will never know{'\n'}{"    "}it was you who reported them.</AppText>
                    </AppText>
                </LinearGradient>
                <TouchableOpacityView
                    onPress={onSubmit}
                    disabled={isSubmitting}
                    style={[styles.button, { opacity: isSubmitting ? 0.7 : 1 }]}
                >
                    <AppText style={{marginTop:-metrics.hp0_5}} type={TWENTY} weight={SCHEHERAZADE_BOLD} color={ WHITE}>
                        {isSubmitting ? "Submitting..." : "Submit"}
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
        backgroundColor: "#555359",
        // borderRadius: metrics.hp1_5,
        marginTop: metrics.hp2,
        paddingHorizontal: metrics.hp1
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
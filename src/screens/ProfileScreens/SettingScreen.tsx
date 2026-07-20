import React, { useCallback, useEffect, useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { ActivityIndicator, ImageBackground, Linking, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import HeaderCommon from "../../common/HeaderCommon";
import { colors, newColor } from "../../theme/colors";
import { editButtonBackground, legalBackgroundSettin, messageIcon, shieldIcon, infoIcon, checkSafety, aboutIcon, keywordRightArrow, logOutIcon, deleteIcon, logoBlue, goldCard, emailNewIcon, privacyNewIcon, termsandConditionNewIcon, safetyCenterNewIcon, helpAndSupportNewIcon, ChatSearchIcon, rightGoNewIcon, deleteNewBackground, deleteNewIcon, BottomLayer, logOutnewIcon, applogo } from "../../helper/ImageAssets";
import metrics from "../../assets/Metrics";
import FastImage from "react-native-fast-image";
import Toast from "react-native-toast-message";

import { AppText, FOURTEEN, BLACK, INTER_BOLD, INTER_MEDIUM, INTER_SEMI_BOLD, LIGHT_BLACK, OPECITY, OPECITY_DARK, RED, SCHEHERAZADE_BOLD, TEN, TWELVE, TWENTY, WHITE, SIXTEEN, fontSize } from "../../common/AppText";


import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import { useDispatch, useSelector } from "react-redux";
import { deleteAccountAPI, userLogout } from "../../actions/authActions";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_SUBSCRIPTION_ALL_SCREEN, NAVIGATION_SUBSCRIPTION_SCREEN } from "../../navigation/routes";
import { disconnectAllSockets } from "../../common/Socket";
import { version as appVersion } from "../../../package.json";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { appOperation } from "../../appOperation";
import NewHeader from "../../common/NewHeader";

const PROFILE_DISCOVERY_ENABLED_KEY = "PROFILE_DISCOVERY_ENABLED";

type ConfirmAction = "logout" | "delete";

const SettingScreen = () => {
    const userData = useSelector((state: any) => state.auth.userData);
    const dispatch = useDispatch();
    const [toggleOne, setToggleOne] = useState(false);
    const [toggleTwo, setToggleTwo] = useState(false);
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [confirmAction, setConfirmAction] = useState<ConfirmAction>("logout");
    const [isProcessing, setIsProcessing] = useState(false);
    const [deleteSuccessVisible, setDeleteSuccessVisible] = useState(false);

    // Persist "Enable Profile Discover" (toggleTwo) via AsyncStorage
    useEffect(() => {
        let isMounted = true;
        (async () => {
            try {
                const raw = await AsyncStorage.getItem(PROFILE_DISCOVERY_ENABLED_KEY);
                if (!isMounted) return;
                if (raw === null) {
                    // Default: enabled unless user explicitly disabled it.
                    setToggleTwo(true);
                    return;
                }
                setToggleTwo(raw === "true");
            } catch {
                // Default safe behavior if storage read fails
                if (isMounted) setToggleTwo(true);
            }
        })();
        return () => {
            isMounted = false;
        };
    }, []);

    const setProfileDiscoverEnabled = useCallback(async (enabled: boolean) => {
        setToggleTwo(enabled);
        try {
            await AsyncStorage.setItem(PROFILE_DISCOVERY_ENABLED_KEY, enabled ? "true" : "false");
        } catch {
            // no-op: never crash settings due to storage failures
        }
    }, []);

    const handleLogoutConfirmed = () => {
        // 1) Disconnect ALL sockets
        disconnectAllSockets();
        // 2) Clear ALL redux slices
        dispatch({ type: "auth/logout" });
        // 3) Existing logout flow (token removal + navigation reset)
        dispatch(userLogout());
    };

    const openConfirm = useCallback((action: ConfirmAction) => {
        setConfirmAction(action);
        setConfirmVisible(true);
    }, []);

    const closeConfirm = useCallback(() => {
        if (isProcessing) return;
        setConfirmVisible(false);
    }, [isProcessing]);

    const handleConfirmYes = useCallback(async () => {
        if (confirmAction === "logout") {
            setConfirmVisible(false);
            handleLogoutConfirmed();
            return;
        }

        // delete flow
        setIsProcessing(true);
        try {
            const response: any = await appOperation.customer.deleteAccount();
            if (response?.statusCode === 200) {
                setConfirmVisible(false);
                setDeleteSuccessVisible(true);
            } else {
                Toast.show({
                    type: "error",
                    text2: "Unable to delete your account. Please try again.",
                });
            }
        } catch {
            Toast.show({
                type: "error",
                text2: "Unable to delete your account. Please try again.",
            });
        } finally {
            setIsProcessing(false);
        }
    }, [confirmAction, dispatch]);
    const onSubcription = () => {
        let itemtwo = { id: "2", icon: goldCard, title: "Gold" };

        NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN, { comming: itemtwo })
    }
    return (
        <AppSafeAreaView color={newColor.blackNew}>
            <NewHeader title={"Settings"} onPress={() => NavigationService.goBack()} />
            <ScrollView contentContainerStyle={{ paddingBottom: metrics.hp10, paddingHorizontal: metrics.hp2, paddingTop: metrics.hp2 }} showsVerticalScrollIndicator={false}>
                <AppText weight={INTER_BOLD} color={WHITE} style={[styles.sectionHeader, { fontSize: fontSize(13) }]}>
                    Account
                </AppText>
                <ImageBackground source={ChatSearchIcon} style={styles.singleItemCard} resizeMode="stretch">
                    <View style={[styles.rowContent, { marginLeft: metrics.hp2 }]}>
                        <FastImage source={emailNewIcon} resizeMode="contain" style={styles.leftIcon} />
                        <AppText type={TWELVE} weight={INTER_MEDIUM} color={OPECITY} style={styles.rowTitle}>
                            Email Id
                        </AppText>
                    </View>
                    <AppText type={TWELVE} weight={INTER_MEDIUM} color={WHITE}>
                        {userData?.email || ""}{"    "}
                    </AppText>
                </ImageBackground>

                {/* 2. Legal */}
                <AppText weight={INTER_BOLD} color={WHITE} style={[styles.sectionHeader, { fontSize: fontSize(13) }]}>
                    Legal
                </AppText>

                <ImageBackground source={legalBackgroundSettin} style={styles.legalCard} imageStyle={styles.cardImageStyle}>
                    <TouchableOpacityView style={styles.legalRow} onPress={() => Linking.openURL("https://parpple.com/privacy_policy")}>
                        <View style={styles.rowContent}>
                            <FastImage source={privacyNewIcon} resizeMode="contain" style={styles.leftIcon} tintColor={WHITE} />
                            <AppText type={TWELVE} weight={INTER_MEDIUM} color={WHITE} style={styles.rowTitle}>
                                Privacy Policy
                            </AppText>
                        </View>
                        <FastImage source={rightGoNewIcon} resizeMode="contain" style={styles.rightArrowIcon} />
                    </TouchableOpacityView>

                    {/* <View style={styles.legalSeparator} /> */}

                    <TouchableOpacityView style={styles.legalRow} onPress={() => Linking.openURL("https://parpple.com/terms_conditions")}>
                        <View style={styles.rowContent}>
                            <FastImage source={termsandConditionNewIcon} resizeMode="contain" style={styles.leftIcon} tintColor={WHITE} />
                            <AppText type={TWELVE} weight={INTER_MEDIUM} color={WHITE} style={styles.rowTitle}>
                                Terms & Conditions
                            </AppText>
                        </View>
                        <FastImage source={rightGoNewIcon} resizeMode="contain" style={styles.rightArrowIcon} />
                    </TouchableOpacityView>

                    {/* <View style={styles.legalSeparator} /> */}

                    <TouchableOpacityView style={styles.legalRow} onPress={() => Linking.openURL("https://parpple.com/safety")}>
                        <View style={styles.rowContent}>
                            <FastImage source={safetyCenterNewIcon} resizeMode="contain" style={styles.leftIcon} tintColor={WHITE} />
                            <AppText type={TWELVE} weight={INTER_MEDIUM} color={WHITE} style={styles.rowTitle}>
                                Safety Center
                            </AppText>
                        </View>
                        <FastImage source={rightGoNewIcon} resizeMode="contain" style={styles.rightArrowIcon} />
                    </TouchableOpacityView>
                </ImageBackground>

                {/* 3. Contact Us */}
                <AppText weight={INTER_BOLD} color={WHITE} style={[styles.sectionHeader, { fontSize: fontSize(13) }]}>
                    Contact Us
                </AppText>

                <TouchableOpacityView onPress={() => Linking.openURL("https://parpple.com/contact-us")}>
                    <ImageBackground source={ChatSearchIcon} style={styles.singleItemCard} imageStyle={styles.cardImageStyle}>
                        <View style={styles.rowContent}>
                            <FastImage source={helpAndSupportNewIcon} resizeMode="contain" style={[styles.leftIcon, { marginLeft: metrics.hp2 }]} tintColor={WHITE} />
                            <AppText type={TWELVE} weight={INTER_MEDIUM} color={WHITE} style={styles.rowTitle}>
                                Help & Support
                            </AppText>
                        </View>
                        <FastImage source={rightGoNewIcon} resizeMode="contain" style={[styles.rightArrowIcon, { marginRight: metrics.hp2 }]} />
                    </ImageBackground>
                </TouchableOpacityView>

                {/* 4. Leaving Soon */}
                <AppText weight={INTER_BOLD} color={WHITE} style={[styles.sectionHeader, { fontSize: fontSize(13) }]}>
                    Leaving Soon
                </AppText>
                <TouchableOpacityView onPress={() => openConfirm("delete")}>
                    <ImageBackground source={deleteNewBackground} style={styles.singleItemCard} imageStyle={styles.cardImageStyle}>
                        <View style={styles.rowContent}>
                            <FastImage source={deleteNewIcon} resizeMode="contain" style={[styles.leftIcon, { marginLeft: metrics.hp2 }]} tintColor={WHITE} />
                            <AppText color={RED} weight={INTER_SEMI_BOLD} type={TWELVE} style={styles.rowTitle}>
                                Delete Account Permanently
                            </AppText>
                        </View>
                        <FastImage source={rightGoNewIcon} tintColor={"#DF3744"} resizeMode="contain" style={[styles.rightArrowIcon, { marginRight: metrics.hp2 }]} />
                    </ImageBackground>
                </TouchableOpacityView>

                {/* <TouchableOpacityView onPress={() => openConfirm("logout")} style={styles.logoutButtonContaier}>
                    <FastImage source={logOutIcon} resizeMode="contain" style={styles.shareIcon} />
                    <AppText color={WHITE} weight={INTER_SEMI_BOLD} type={TWELVE}>
                        {"  "}
                        Log Out
                    </AppText>
                </TouchableOpacityView>

                <AppText style={styles.textVersion} color={OPECITY} weight={INTER_SEMI_BOLD} type={TWELVE}>
                    Version: {appVersion}
                </AppText> */}
            </ScrollView>
            <ImageBackground source={BottomLayer} resizeMode="stretch" style={styles.bottomLayer}>
                <TouchableOpacity onPress={() => openConfirm("logout")}>
                    <ImageBackground source={editButtonBackground} resizeMode="stretch" style={{ height: metrics.hp6, width: "95%", marginLeft: metrics.hp2_5, alignItems: "center", justifyContent: "center", flexDirection: "row" }}>
                        <FastImage source={logOutnewIcon} resizeMode="contain" style={{ height: metrics.hp2_5, width: metrics.hp2_5 }} />
                        <AppText weight={SCHEHERAZADE_BOLD} color={WHITE} type={TWENTY}>
                            {"  "}Logout{"   "}
                        </AppText>
                    </ImageBackground>
                </TouchableOpacity>
                {/* <TouchableOpacity activeOpacity={0.5} onPress={() => openConfirm("logout")}  style={styles.phoneContainer}>
                    <AppText weight={SCHEHERAZADE_BOLD} color={WHITE} type={TWENTY}>
                    Log Out
                    </AppText>
                </TouchableOpacity> */}
            </ImageBackground>
            {/* Confirm Modal (Logout / Delete) */}
            <Modal
                animationType="fade"
                transparent
                statusBarTranslucent
                visible={confirmVisible}
                onRequestClose={closeConfirm}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCardDark}>
                        <AppText type={TWENTY} weight={SCHEHERAZADE_BOLD} color={WHITE} style={{ textAlign: "center" }}>
                            {confirmAction === "delete" ? "Delete account" : "Logout"}
                        </AppText>

                        <AppText
                            style={{ marginTop: metrics.hp1, textAlign: "center" }}
                            type={TWELVE}
                            weight={INTER_MEDIUM}
                            color={OPECITY_DARK}
                        >
                            {confirmAction === "delete"
                                ? "Are you sure you want to delete your Parpple account?"
                                : "Are you sure you want to log out of Parpple?"}
                        </AppText>

                        {confirmAction === "delete" ? (
                            <AppText
                                style={{ marginTop: metrics.hp0_8, textAlign: "center" }}
                                type={TEN}
                                weight={INTER_MEDIUM}
                                color={RED}
                            >
                                This action cannot be undone.
                            </AppText>
                        ) : null}

                        <View style={styles.modalBtnRow}>
                            <TouchableOpacityView
                                onPress={closeConfirm}
                                disabled={isProcessing}
                                style={[styles.modalBtn, styles.modalBtnSecondaryDark, isProcessing && { opacity: 0.6 }]}
                            >
                                <AppText type={TWELVE} weight={INTER_BOLD} color={WHITE}>
                                    No
                                </AppText>
                            </TouchableOpacityView>

                            <TouchableOpacityView
                                onPress={handleConfirmYes}
                                disabled={isProcessing}
                                style={[
                                    styles.modalBtn,
                                    confirmAction === "delete" ? styles.modalBtnDanger : styles.modalBtnPrimary,
                                    isProcessing && { opacity: 0.6 },
                                ]}
                            >
                                {isProcessing ? (
                                    <ActivityIndicator color={colors.white} />
                                ) : (
                                    <AppText type={TWELVE} weight={INTER_BOLD} color={WHITE}>
                                        Yes
                                    </AppText>
                                )}
                            </TouchableOpacityView>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Delete Success Popup */}
            <Modal
                animationType="fade"
                transparent
                statusBarTranslucent
                visible={deleteSuccessVisible}
                onRequestClose={() => {
                    setDeleteSuccessVisible(false);
                    handleLogoutConfirmed();
                }}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.successCardDark}>
                        <FastImage source={applogo} resizeMode="contain" style={styles.appLogo} />
                        <AppText
                            style={{ textAlign: "center", marginTop: metrics.hp2 }}
                            type={TWELVE}
                            weight={INTER_MEDIUM}
                            color={OPECITY_DARK}>
                            Your Parpple account has been deleted successfully.
                        </AppText>
                        <TouchableOpacity onPress={() => {
                            setDeleteSuccessVisible(false);
                            handleLogoutConfirmed();
                        }} style={{ height: metrics.hp4, width: metrics.hp10, marginTop: metrics.hp1, backgroundColor: "#E6B7A8", alignItems: "center", justifyContent: "center" }}>
                            <AppText type={TWELVE} weight={SCHEHERAZADE_BOLD} color={BLACK}>
                                OK
                            </AppText>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </AppSafeAreaView>
    )
};

export default SettingScreen;

const styles = StyleSheet.create({
    sectionHeader: {
        marginBottom: metrics.hp1_5,
        marginLeft: metrics.hp1,
    },
    singleItemCard: {
        height: metrics.hp8,
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: metrics.hp1_5,
    },
    cardImageStyle: {
        resizeMode: "stretch",
    },
    legalCard: {
        width: "100%",
        paddingVertical: metrics.hp1,
        marginBottom: metrics.hp1_5,
    },
    legalRow: {
        height: metrics.hp6_5,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: metrics.hp2,
    },
    legalSeparator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.nanoOpecity,
        marginHorizontal: metrics.hp2,
    },
    rowContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    leftIcon: {
        height: metrics.hp2_5,
        width: metrics.hp2_5,
        marginRight: metrics.hp1_5,
    },
    rowTitle: {
        // specific style if any
    },
    rightArrowIcon: {
        height: metrics.hp2_5,
        width: metrics.hp2_5,
    },
    deleteAccountCard: {
        height: metrics.hp8,
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        // paddingHorizontal: metrics.hp2,
        backgroundColor: colors.lightBack,
        borderRadius: metrics.hp1_5,
        marginBottom: metrics.hp1_5,
        borderWidth: metrics.hp0_1,
        borderColor: colors.nanoOpecity,
    },
    logoutButtonContaier: {
        height: metrics.hp6,
        borderRadius: metrics.hp3,
        backgroundColor: colors.purple,
        marginTop: metrics.hp4,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        marginHorizontal: metrics.hp2,
    },
    shareIcon: {
        height: metrics.hp2_5,
        width: metrics.hp2_5,
    },
    textVersion: {
        textAlign: "center",
        marginTop: metrics.hp3,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: "#000000B3",
        justifyContent: "center",
        paddingHorizontal: metrics.hp2,
    },
    modalCardDark: {
        backgroundColor: "#151517",
        borderRadius: metrics.hp2,
        padding: metrics.hp3,
        borderWidth: metrics.hp0_1,
        borderColor: "#E6B7A8",
    },
    successCardDark: {
        backgroundColor: "#151517",
        borderRadius: metrics.hp2,
        padding: metrics.hp3,
        alignItems: "center",
        borderWidth: metrics.hp0_1,
        borderColor: "#E6B7A8",
    },
    modalBtnRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: metrics.hp1_5,
        marginTop: metrics.hp3,
    },
    modalBtn: {
        flex: 1,
        height: metrics.hp6,
        // borderRadius: metrics.hp3,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
    },
    modalBtnSecondaryDark: {
        backgroundColor: "transparent",
        borderWidth: metrics.hp0_1,
        // borderColor: colors.white,
        borderColor: "#E6B7A8",
    },
    modalBtnPrimary: {
        backgroundColor: "#E6B7A8",
    },
    modalBtnDanger: {
        backgroundColor: colors.red,
    },
    appLogo: {
        width: metrics.hp8,
        height: metrics.hp8,
    },
    bottomLayer: {
        height: metrics.hp13,
        width: "100%",
        paddingVertical: metrics.hp2,
        // alignItems: "center",
        justifyContent: "center",
    },
});

import React, { useCallback, useEffect, useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { ActivityIndicator, Linking, Modal, ScrollView, StyleSheet, View } from "react-native";
import HeaderCommon from "../../common/HeaderCommon";
import { colors } from "../../theme/colors";
import metrics from "../../assets/Metrics";
import FastImage from "react-native-fast-image";
import Toast from "react-native-toast-message";
import { applogo, deleteIcon, leftFair, lineGreen, logoBlue, logOutIcon, rightFair } from "../../helper/ImageAssets";
import { AppText, BLACK, INTER_BOLD, INTER_MEDIUM, INTER_SEMI_BOLD, LIGHT_BLACK, OPECITY, OPECITY_DARK, RED, SCHEHERAZADE_BOLD, TEN, TWELVE, TWENTY, WHITE } from "../../common/AppText";
import HeadLineContiner from "../../common/HeadLineContiner";
import EditButtonCommon from "../../common/EditButtonCommon";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import { useDispatch, useSelector } from "react-redux";
import { deleteAccountAPI, userLogout } from "../../actions/authActions";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_SUBSCRIPTION_ALL_SCREEN } from "../../navigation/routes";
import { disconnectAllSockets } from "../../common/Socket";
import { version as appVersion } from "../../../package.json";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { appOperation } from "../../appOperation";

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

    return (
        <AppSafeAreaView>
            <HeaderCommon title={"Settings"} />
            <ScrollView contentContainerStyle={{ paddingBottom: metrics.hp10 }} showsVerticalScrollIndicator={false}>
                <TouchableOpacityView onPress={() => NavigationService.navigate(NAVIGATION_SUBSCRIPTION_ALL_SCREEN)} style={styles.containerHead}>
                    <View style={styles.upgradeContainer}>
                        <FastImage source={lineGreen} resizeMode="contain" style={styles.lineContainer} />
                        <View style={{ marginTop: -metrics.hp1 }}>
                            <AppText type={TWENTY} weight={SCHEHERAZADE_BOLD}>
                                Upgrade membership now!
                            </AppText>
                            <AppText style={{ marginTop: -metrics.hp1 }} type={TEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                Enjoy all the benifits and explore all the possibilities.
                            </AppText>
                        </View>
                    </View>
                </TouchableOpacityView>
                <View style={{ paddingHorizontal: metrics.hp2 }}>
                    {/* <HeadLineContiner
                        headLines={"My Interests"} setting={true} />
                    <EditButtonCommon
                        setting={true}
                        title={"Profile Preferences"}
                    /> */}
                    {/* <EditButtonCommon
                        setting={true}
                        title={"Show Last Active Status"}
                        togleShow={toggleOne}
                        setToggleShow={setToggleOne}
                        toggle={true}
                    /> */}
                    <View style={styles.singleLine} />
                    <HeadLineContiner
                        headLines={"Profile Discovery"} setting={true} />
                    <EditButtonCommon
                        setting={true}
                        title={"Enable Profile Discover"}
                        togleShow={toggleTwo}
                        setToggleShow={setProfileDiscoverEnabled}
                        toggle={true}
                    />
                    <AppText style={{ marginTop: metrics.hp1 }} type={TEN} weight={INTER_MEDIUM} color={OPECITY}>
                        Your profile visibility will be hidden to people. People you have already liked may still see you and match you.
                    </AppText>
                    {/* <View style={styles.singleLine} /> */}
                    {/* <HeadLineContiner
                        headLines={"Message Control"} setting={true} />
                    <EditButtonCommon
                        setting={true}
                        title={"First Move"}
                        togleShow={toggleThree}
                        setToggleShow={setToggleThree}
                        toggle={true}
                    />
                    <AppText style={{ marginTop: metrics.hp1 }} type={TEN} weight={INTER_MEDIUM} color={OPECITY}>
                        Make a first move and start a conversation, unless they won’t be able to message you first.
                    </AppText> */}
                    <View style={styles.singleLine} />
                    <HeadLineContiner
                        headLines={"Account Settings"} setting={true} />
                    {userData?.phoneNumber &&
                        <EditButtonCommon
                            setting={true}
                            title={"Phone number"}
                            filluptext={userData?.phoneNumber}
                            arrow={true} />}
                    {userData?.email &&
                        <EditButtonCommon
                            setting={true}
                            title={"Email Id"}
                            filluptext={userData?.email}
                            arrow={true} />
                    }
                    <AppText style={{ marginTop: metrics.hp1 }} type={TEN} weight={INTER_MEDIUM} color={OPECITY}>
                        Updated phone number & email id keeps your account safe & secure.
                    </AppText>
                    <View style={styles.singleLine} />
                    <HeadLineContiner
                        headLines={"Notifications"} setting={true} />
                    <EditButtonCommon
                        setting={true}
                        title={"Push Notifications"}
                        togleShow={toggleOne}
                        setToggleShow={setToggleOne}
                        toggle={true}
                    />
                    {/* <EditButtonCommon
                        setting={true}
                        title={"Emails"} /> */}
                    {/* <View style={styles.singleLine} />
                    <HeadLineContiner
                        headLines={"Blocked Users"} setting={true} />
                    <EditButtonCommon
                        setting={true}
                        title={"Block List"} />*/}
                    <View style={styles.singleLine} />
                    <HeadLineContiner
                        headLines={"Subscription"} setting={true} />
                    <EditButtonCommon
                        onPress={() => NavigationService.navigate(NAVIGATION_SUBSCRIPTION_ALL_SCREEN)}
                        setting={true}
                        title={"Subscribe to Parpple"} />
                    {/* <EditButtonCommon
                        setting={true}
                        title={"Restore Subscription"} /> */}
                    {/* <View style={styles.singleLine} /> */}
                    {/* <HeadLineContiner
                        headLines={"Measurement Units"} setting={true} />
                    <EditButtonCommon
                        setting={true}
                        title={"Distance"}
                        selectFtCm={selectMIKM}
                        setSelectFtCm={setSelectMIKM}
                        Distance={true}
                        inText={"MI"}
                        inTextTwo={"KM"}
                    />
                    <EditButtonCommon
                        setting={true}
                        title={"Height"}
                        selectFtCm={selectFtCm}
                        setSelectFtCm={setSelectFtCm}
                        Distance={true}
                        inText={"FT"}
                        inTextTwo={"CM"}
                    /> */}
                    <View style={styles.singleLine} />

                    <HeadLineContiner
                        headLines={"Contact Us"} setting={true} />
                    <EditButtonCommon
                        onPress={() => Linking.openURL("https://parpple.com/contact-us")}
                        setting={true}
                        title={"Help & Support"} />
                    <View style={styles.singleLine} />

                    <HeadLineContiner
                        headLines={"Legal"} setting={true} />
                    <EditButtonCommon
                        setting={true}
                        onPress={() => Linking.openURL("https://parpple.com/terms_conditions")}
                        title={"Terms of Services"} />
                    <EditButtonCommon
                        setting={true}
                        onPress={() => Linking.openURL("https://parpple.com/privacy_policy")}
                        title={"Privacy Policy"} />
                    {/* <EditButtonCommon
                        setting={true}
                        title={"Privacy Preferences"} /> */}
                    {/* <EditButtonCommon
                        setting={true}
                        title={"Licences"} /> */}
                    <View style={styles.singleLine} />
                    <HeadLineContiner
                        headLines={"Community"} setting={true} />
                    {/* <EditButtonCommon
                        setting={true} 
                        onPress={() => Linking.openURL("https://parpple.com/safety")}
                        title={"Safe Dating Tips"} /> */}
                    <EditButtonCommon
                        setting={true}
                        onPress={() => Linking.openURL("https://parpple.com/safety")}
                        title={"Safety Center"} />
                    {/* <View style={styles.containerShare}>
                        <FastImage source={rightFair} resizeMode="contain" style={styles.rightFair} />
                        <View style={{ alignItems: "center", justifyContent: "center", }}>
                            <AppText style={{ textAlign: "center", marginTop: -metrics.hp1 }} type={TWENTY} weight={SCHEHERAZADE_BOLD} color={LIGHT_BLACK}>
                                Share Parpple
                            </AppText>
                            <AppText style={{ textAlign: "center", marginTop: -metrics.hp1 }} type={TEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                Share with your friends and let us help{'\n'} them tomeet with their partners.
                            </AppText>
                        </View>
                        <FastImage source={leftFair} resizeMode="contain" style={styles.rightFair} />
                    </View> */}
                    <TouchableOpacityView onPress={() => openConfirm("logout")} style={[styles.shareDetailsContaier, { marginTop: metrics.hp6 }]}>
                        <FastImage source={logOutIcon} resizeMode="contain" style={styles.shareIcon} />
                        <AppText color={RED} weight={INTER_SEMI_BOLD} type={TWELVE}>
                            {"  "}
                            Log Out
                        </AppText>
                    </TouchableOpacityView>
                    <TouchableOpacityView onPress={() => openConfirm("delete")} style={styles.shareDetailsContaier}>
                        <FastImage source={deleteIcon} resizeMode="contain" style={styles.shareIcon} />
                        <AppText color={BLACK} weight={INTER_SEMI_BOLD} type={TWELVE}>
                            {"  "}
                            Delete My Account
                        </AppText>
                    </TouchableOpacityView>
                    <AppText style={styles.textVersion} color={OPECITY} weight={INTER_SEMI_BOLD} type={TWELVE}>
                        {"  "}
                        Version: {appVersion}
                    </AppText>
                </View>
            </ScrollView>

            {/* Confirm Modal (Logout / Delete) */}
            <Modal
                animationType="fade"
                transparent
                statusBarTranslucent
                visible={confirmVisible}
                onRequestClose={closeConfirm}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <AppText type={TWENTY} weight={SCHEHERAZADE_BOLD} color={LIGHT_BLACK} style={{ textAlign: "center" }}>
                            {confirmAction === "delete" ? "Delete account" : "Log out"}
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
                                color={OPECITY}
                            >
                                This action cannot be undone.
                            </AppText>
                        ) : null}

                        <View style={styles.modalBtnRow}>
                            <TouchableOpacityView
                                onPress={closeConfirm}
                                disabled={isProcessing}
                                style={[styles.modalBtn, styles.modalBtnSecondary, isProcessing && { opacity: 0.6 }]}
                            >
                                <AppText type={TWELVE} weight={INTER_BOLD} color={LIGHT_BLACK}>
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
                    <View style={styles.successCard}>
                        <FastImage source={logoBlue} resizeMode="contain" style={styles.appLogo} />
                        <AppText type={TWENTY} weight={SCHEHERAZADE_BOLD} color={LIGHT_BLACK} style={{ textAlign: "center" }}>
                            Parpple
                        </AppText>
                        <AppText
                            style={{ marginTop: metrics.hp1, textAlign: "center" }}
                            type={TWELVE}
                            weight={INTER_MEDIUM}
                            color={OPECITY_DARK}
                        >
                            Your Parpple account has been deleted successfully.
                        </AppText>

                        <TouchableOpacityView
                            onPress={() => {
                                setDeleteSuccessVisible(false);
                                handleLogoutConfirmed();
                            }}
                            style={[styles.modalBtn, styles.modalBtnPrimary, { alignSelf: "center", marginTop: metrics.hp2 }]}
                        >
                            <AppText type={TWELVE} weight={INTER_BOLD} color={WHITE}>
                                OK
                            </AppText>
                        </TouchableOpacityView>
                    </View>
                </View>
            </Modal>
        </AppSafeAreaView>
    )
};
export default SettingScreen;
const styles = StyleSheet.create({
    singleLine: {
        height: metrics.hp0_2,
        backgroundColor: colors.nanoOpecity,
        marginTop: metrics.hp2
    },
    containerHead: {
        backgroundColor: colors.darkWhite,
        height: metrics.hp13,
        marginTop: metrics.hp2,
        paddingHorizontal: metrics.hp2,
        paddingVertical: metrics.hp2
    },
    upgradeContainer: {
        backgroundColor: colors.lightBack,
        borderWidth: metrics.hp0_1,
        borderColor: colors.foutyGreen,
        borderRadius: metrics.hp1_5,
        flexDirection: "row",
        alignItems: "center",
    },
    lineContainer: {
        height: metrics.hp9,
        width: metrics.hp9,
        borderTopLeftRadius: metrics.hp1_5,
        borderBottomLeftRadius: metrics.hp1_5
    },
    shareDetailsContaier: {
        height: metrics.hp5,
        borderRadius: metrics.hp1_5,
        backgroundColor: colors.lightBack,
        marginTop: metrics.hp1,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
    },
    shareIcon: {
        height: metrics.hp2,
        width: metrics.hp2,
    },
    rightFair: {
        height: metrics.hp7,
        width: metrics.hp7
    },
    containerShare: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: metrics.hp1,
        backgroundColor: "#F7F1FF",
        borderRadius: metrics.hp1_5,
        borderWidth: metrics.hp0_1,
        borderColor: "#ECE4F8",
        height: metrics.hp9,
        marginTop: metrics.hp3
    },
    textVersion: {
        textAlign: "center",
        marginTop: metrics.hp5
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: "#00000066",
        justifyContent: "center",
        paddingHorizontal: metrics.hp2,
    },
    modalCard: {
        backgroundColor: colors.white,
        borderRadius: metrics.hp2,
        padding: metrics.hp2,
    },
    successCard: {
        backgroundColor: colors.white,
        borderRadius: metrics.hp2,
        padding: metrics.hp2,
        alignItems: "center",
    },
    modalBtnRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: metrics.hp1,
        marginTop: metrics.hp2,
    },
    modalBtn: {
        flex: 1,
        height: metrics.hp5,
        borderRadius: metrics.hp1_5,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
    },
    modalBtnSecondary: {
        backgroundColor: colors.lightBack,
        borderWidth: metrics.hp0_1,
        borderColor: colors.nanoOpecity,
    },
    modalBtnPrimary: {
        backgroundColor: colors.purple,
    },
    modalBtnDanger: {
        backgroundColor: colors.red,
    },
    appLogo: {
        width: metrics.hp8,
        height: metrics.hp8,
        marginBottom: metrics.hp1,
    },
})
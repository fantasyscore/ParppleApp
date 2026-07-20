import re

with open('src/screens/ProfileScreens/SettingScreen.tsx', 'r') as f:
    content = f.read()

start_idx = content.find('    return (\n        <AppSafeAreaView>')
if start_idx == -1:
    print("Could not find exact return statement")
    exit(1)

new_return_content = """    return (
        <AppSafeAreaView>
            <HeaderCommon title={"Settings"} />
            <ScrollView contentContainerStyle={{ paddingBottom: metrics.hp10, paddingHorizontal: metrics.hp2, paddingTop: metrics.hp2 }} showsVerticalScrollIndicator={false}>
                
                {/* 1. Account */}
                <AppText type={FOURTEEN} weight={SCHEHERAZADE_BOLD} color={WHITE} style={styles.sectionHeader}>
                    Account
                </AppText>
                
                <ImageBackground source={editButtonBackground} style={styles.singleItemCard} imageStyle={styles.cardImageStyle}>
                    <View style={styles.rowContent}>
                        <FastImage source={messageIcon} resizeMode="contain" style={styles.leftIcon} />
                        <AppText type={TWELVE} weight={INTER_MEDIUM} color={WHITE} style={styles.rowTitle}>
                            Email Id
                        </AppText>
                    </View>
                    <AppText type={TWELVE} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                        {userData?.email || ""}
                    </AppText>
                </ImageBackground>

                {/* 2. Legal */}
                <AppText type={FOURTEEN} weight={SCHEHERAZADE_BOLD} color={WHITE} style={[styles.sectionHeader, { marginTop: metrics.hp3 }]}>
                    Legal
                </AppText>
                
                <ImageBackground source={legalBackgroundSettin} style={styles.legalCard} imageStyle={styles.cardImageStyle}>
                    <TouchableOpacityView style={styles.legalRow} onPress={() => Linking.openURL("https://parpple.com/privacy_policy")}>
                        <View style={styles.rowContent}>
                            <FastImage source={shieldIcon} resizeMode="contain" style={styles.leftIcon} tintColor={WHITE} />
                            <AppText type={TWELVE} weight={INTER_MEDIUM} color={WHITE} style={styles.rowTitle}>
                                Privacy Policy
                            </AppText>
                        </View>
                        <FastImage source={keywordRightArrow} resizeMode="contain" style={styles.rightArrowIcon} />
                    </TouchableOpacityView>
                    
                    <View style={styles.legalSeparator} />
                    
                    <TouchableOpacityView style={styles.legalRow} onPress={() => Linking.openURL("https://parpple.com/terms_conditions")}>
                        <View style={styles.rowContent}>
                            <FastImage source={infoIcon} resizeMode="contain" style={styles.leftIcon} tintColor={WHITE} />
                            <AppText type={TWELVE} weight={INTER_MEDIUM} color={WHITE} style={styles.rowTitle}>
                                Terms & Conditions
                            </AppText>
                        </View>
                        <FastImage source={keywordRightArrow} resizeMode="contain" style={styles.rightArrowIcon} />
                    </TouchableOpacityView>

                    <View style={styles.legalSeparator} />
                    
                    <TouchableOpacityView style={styles.legalRow} onPress={() => Linking.openURL("https://parpple.com/safety")}>
                        <View style={styles.rowContent}>
                            <FastImage source={checkSafety} resizeMode="contain" style={styles.leftIcon} tintColor={WHITE} />
                            <AppText type={TWELVE} weight={INTER_MEDIUM} color={WHITE} style={styles.rowTitle}>
                                Safety Center
                            </AppText>
                        </View>
                        <FastImage source={keywordRightArrow} resizeMode="contain" style={styles.rightArrowIcon} />
                    </TouchableOpacityView>
                </ImageBackground>

                {/* 3. Contact Us */}
                <AppText type={FOURTEEN} weight={SCHEHERAZADE_BOLD} color={WHITE} style={[styles.sectionHeader, { marginTop: metrics.hp3 }]}>
                    Contact Us
                </AppText>

                <TouchableOpacityView onPress={() => Linking.openURL("https://parpple.com/contact-us")}>
                    <ImageBackground source={editButtonBackground} style={styles.singleItemCard} imageStyle={styles.cardImageStyle}>
                        <View style={styles.rowContent}>
                            <FastImage source={aboutIcon} resizeMode="contain" style={styles.leftIcon} tintColor={WHITE} />
                            <AppText type={TWELVE} weight={INTER_MEDIUM} color={WHITE} style={styles.rowTitle}>
                                Help & Support
                            </AppText>
                        </View>
                        <FastImage source={keywordRightArrow} resizeMode="contain" style={styles.rightArrowIcon} />
                    </ImageBackground>
                </TouchableOpacityView>

                {/* 4. Leaving Soon */}
                <AppText type={FOURTEEN} weight={SCHEHERAZADE_BOLD} color={WHITE} style={[styles.sectionHeader, { marginTop: metrics.hp3 }]}>
                    Leaving Soon
                </AppText>
                
                <TouchableOpacityView onPress={() => openConfirm("delete")} style={styles.deleteAccountCard}>
                    <View style={styles.rowContent}>
                        <FastImage source={deleteIcon} resizeMode="contain" style={styles.leftIcon} />
                        <AppText color={RED} weight={INTER_SEMI_BOLD} type={TWELVE} style={styles.rowTitle}>
                            Delete Account Permanently
                        </AppText>
                    </View>
                    <FastImage source={keywordRightArrow} resizeMode="contain" style={styles.rightArrowIcon} tintColor={RED} />
                </TouchableOpacityView>

                <TouchableOpacityView onPress={() => openConfirm("logout")} style={styles.logoutButtonContaier}>
                    <FastImage source={logOutIcon} resizeMode="contain" style={styles.shareIcon} />
                    <AppText color={WHITE} weight={INTER_SEMI_BOLD} type={TWELVE}>
                        {"  "}
                        Log Out
                    </AppText>
                </TouchableOpacityView>
                
                <AppText style={styles.textVersion} color={OPECITY} weight={INTER_SEMI_BOLD} type={TWELVE}>
                    Version: {appVersion}
                </AppText>
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
                    <View style={styles.modalCardDark}>
                        <AppText type={TWENTY} weight={SCHEHERAZADE_BOLD} color={WHITE} style={{ textAlign: "center" }}>
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
                        <FastImage source={logoBlue} resizeMode="contain" style={styles.appLogo} />
                        <AppText
                            style={{ textAlign: "center", marginTop: metrics.hp2 }}
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
                            style={[styles.modalBtn, styles.modalBtnPrimary, { alignSelf: "center", marginTop: metrics.hp3, width: metrics.hp15 }]}
                        >
                            <AppText type={TWELVE} weight={SCHEHERAZADE_BOLD} color={WHITE}>
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
        paddingHorizontal: metrics.hp2,
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
        height: metrics.hp2,
        width: metrics.hp2,
    },
    deleteAccountCard: {
        height: metrics.hp8,
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: metrics.hp2,
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
        backgroundColor: colors.lightBack,
        borderRadius: metrics.hp2,
        padding: metrics.hp3,
        borderWidth: metrics.hp0_1,
        borderColor: colors.nanoOpecity,
    },
    successCardDark: {
        backgroundColor: colors.lightBack,
        borderRadius: metrics.hp2,
        padding: metrics.hp3,
        alignItems: "center",
        borderWidth: metrics.hp0_1,
        borderColor: colors.nanoOpecity,
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
        borderRadius: metrics.hp3,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
    },
    modalBtnSecondaryDark: {
        backgroundColor: "transparent",
        borderWidth: metrics.hp0_1,
        borderColor: colors.white,
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
    },
});
"""

imports_remove = ["import { applogo, deleteIcon, goldCard, leftFair, lineGreen, logoBlue, logOutIcon, rightFair } from \"../../helper/ImageAssets\";", 
                  "import HeadLineContiner from \"../../common/HeadLineContiner\";", 
                  "import EditButtonCommon from \"../../common/EditButtonCommon\";"]

new_content = content[:start_idx] + new_return_content
for imp in imports_remove:
    new_content = new_content.replace(imp, "")

new_content = new_content.replace('import { AppText', 'import { AppText, FOURTEEN')

# Make sure we add ImageBackground to react-native imports if not present. Wait, it might not be imported! Let's check.
if "ImageBackground" not in new_content:
    new_content = new_content.replace("ScrollView, StyleSheet, View", "ImageBackground, ScrollView, StyleSheet, View")

new_content = new_content.replace('import { colors } from "../../theme/colors";', 'import { colors } from "../../theme/colors";\nimport { editButtonBackground, legalBackgroundSettin, messageIcon, shieldIcon, infoIcon, checkSafety, aboutIcon, keywordRightArrow, logOutIcon, deleteIcon, logoBlue } from "../../helper/ImageAssets";')


with open('src/screens/ProfileScreens/SettingScreen.tsx', 'w') as f:
    f.write(new_content)

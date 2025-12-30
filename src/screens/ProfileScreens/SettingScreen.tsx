import React, { useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { ScrollView, StyleSheet, View } from "react-native";
import HeaderCommon from "../../common/HeaderCommon";
import { colors } from "../../theme/colors";
import metrics from "../../assets/Metrics";
import FastImage from "react-native-fast-image";
import { deleteIcon, leftFair, lineGreen, logOutIcon, pronounIcon, rightFair } from "../../helper/ImageAssets";
import { AppText, BLACK, INTER_MEDIUM, INTER_SEMI_BOLD, LIGHT_BLACK, OPECITY, OPECITY_DARK, RED, SCHEHERAZADE_BOLD, TEN, TWELVE, TWENTY } from "../../common/AppText";
import HeadLineContiner from "../../common/HeadLineContiner";
import EditButtonCommon from "../../common/EditButtonCommon";
import App from "../../App";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import { useDispatch, useSelector } from "react-redux";
import { userLogout } from "../../actions/authActions";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_SUBSCRIPTION_ALL_SCREEN } from "../../navigation/routes";

const SettingScreen = () => {
    const userData = useSelector((state: any) => state.auth.userData);
    const dispatch = useDispatch();
    const [toggleOne, setToggleOne] = useState(false);
    const [toggleTwo, setToggleTwo] = useState(false);
    const [toggleThree, setToggleThree] = useState(false);
    const [selectFtCm, setSelectFtCm] = useState("FT");
    const [selectMIKM, setSelectMIKM] = useState("MI");

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
                        setToggleShow={setToggleTwo}
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
                            filluptext={userData?.phoneNumber} />}
                    {userData?.email &&
                        <EditButtonCommon
                            setting={true}
                            title={"Email Id"}
                            filluptext={userData?.email} />
                    }
                    <AppText style={{ marginTop: metrics.hp1 }} type={TEN} weight={INTER_MEDIUM} color={OPECITY}>
                        Updated phone number & email id keeps your account safe & secure.
                    </AppText>
                    <View style={styles.singleLine} />
                    <HeadLineContiner
                        headLines={"Notifications"} setting={true} />
                    <EditButtonCommon
                        setting={true}
                        title={"Push Notifications"} />
                    {/* <EditButtonCommon
                        setting={true}
                        title={"Emails"} /> */}
                    <View style={styles.singleLine} />
                    <HeadLineContiner
                        headLines={"Blocked Users"} setting={true} />
                    <EditButtonCommon
                        setting={true}
                        title={"Block List"} />
                    <View style={styles.singleLine} />
                    <HeadLineContiner
                        headLines={"Subscription"} setting={true} />
                    <EditButtonCommon
                        onPress={() => NavigationService.navigate(NAVIGATION_SUBSCRIPTION_ALL_SCREEN)}
                        setting={true}
                        title={"Subscribe to Let’s Meet"} />
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
                        setting={true}
                        title={"Help & Support"} />
                    <HeadLineContiner
                        headLines={"Legal"} setting={true} />
                    <EditButtonCommon
                        setting={true}
                        title={"Terms of Services"} />
                    <EditButtonCommon
                        setting={true}
                        title={"Privacy Policy"} />
                    <EditButtonCommon
                        setting={true}
                        title={"Privacy Preferences"} />
                    <EditButtonCommon
                        setting={true}
                        title={"Licences"} />
                    <View style={styles.singleLine} />
                    <HeadLineContiner
                        headLines={"Community"} setting={true} />
                    <EditButtonCommon
                        setting={true}
                        title={"Safe Dating Tips"} />
                    <EditButtonCommon
                        setting={true}
                        title={"Safety Center"} />
                    <View style={styles.containerShare}>
                        <FastImage source={rightFair} resizeMode="contain" style={styles.rightFair} />
                        <View style={{ alignItems: "center", justifyContent: "center", }}>
                            <AppText style={{ textAlign: "center", marginTop: -metrics.hp1 }} type={TWENTY} weight={SCHEHERAZADE_BOLD} color={LIGHT_BLACK}>
                                Share Let’s Meet App
                            </AppText>
                            <AppText style={{ textAlign: "center", marginTop: -metrics.hp1 }} type={TEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                Share with your friends and let us help{'\n'} them tomeet with their partners.
                            </AppText>
                        </View>
                        <FastImage source={leftFair} resizeMode="contain" style={styles.rightFair} />
                    </View>
                    <TouchableOpacityView onPress={() => dispatch(userLogout())} style={[styles.shareDetailsContaier, { marginTop: metrics.hp6 }]}>
                        <FastImage source={logOutIcon} resizeMode="contain" style={styles.shareIcon} />
                        <AppText color={RED} weight={INTER_SEMI_BOLD} type={TWELVE}>
                            {"  "}
                            Log Out
                        </AppText>
                    </TouchableOpacityView>
                    <View style={styles.shareDetailsContaier}>
                        <FastImage source={deleteIcon} resizeMode="contain" style={styles.shareIcon} />
                        <AppText color={BLACK} weight={INTER_SEMI_BOLD} type={TWELVE}>
                            {"  "}
                            Delete My Account
                        </AppText>
                    </View>
                    <AppText style={styles.textVersion} color={OPECITY} weight={INTER_SEMI_BOLD} type={TWELVE}>
                        {"  "}
                        Version: 2.0.1
                    </AppText>
                </View>
            </ScrollView>
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
        height: metrics.hp9
    },
    textVersion: {
        textAlign: "center",
        marginTop: metrics.hp5
    }
})
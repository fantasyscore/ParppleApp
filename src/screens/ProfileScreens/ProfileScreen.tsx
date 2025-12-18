import React, { useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { FlatList, ImageBackground, StyleSheet, View } from "react-native";
import PeopleHeader from "../../common/PeopleHeader";
import { blueTikeIcon, checkSafety, pencilIcon, premiumIcon, profilebackGround, profileImage } from "../../helper/ImageAssets";
import metrics from "../../assets/Metrics";
import { colors } from "../../theme/colors";
import Svg, { Circle } from "react-native-svg";
import FastImage from "react-native-fast-image";
import { AppText, BLACK, EIGHTEEN, ELEVEN, FORTEEN, INTER_BOLD, INTER_MEDIUM, INTER_SEMI_BOLD, LIGHT_BLACK, OPECITY, OPECITY_DARK, PURPLE, RED, SCHEHERAZADE_BOLD, SKYBLUE, TEN, THIRTEEN, TWELVE, TWENTY, WHITE } from "../../common/AppText";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import { premiumDetaiData, PurchaseCards } from "../../common/UiltData";
import { Screen } from "../../theme/dimens";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_CRUSH_PURCHESE_SCREEN, NAVIGATION_EDIT_PROFILE_SCREEN, NAVIGATION_PROFILE_BOOST_PURCHASE_SCREEN, NAVIGATION_SUBSCRIPTION_SCREEN, NAVIGATION_SUPERLIKE_PURCHESE_SCREEN } from "../../navigation/routes";
import { useDispatch, useSelector } from "react-redux";

const ProfileScreen = () => {
    const dispatch = useDispatch();
    const [percentage, setPercentage] = useState(25);
    const [tabSelect, setTabSelect] = useState("Premium");
    const userData = useSelector((state: any) => state.auth.userData);
    console.log(userData, "userData");

    const size = metrics.hp12;
    const strokeWidth = metrics.hp0_5;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (percentage / 100) * circumference;
    const renderPurchaesCards = ({ item, index }: any) => {
        return (
            <TouchableOpacityView activeOpacity={1} onPress={() => NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN, { comming: item })} style={{ marginRight: index == 2 ? metrics.hp2 : 0 }}>
                <ImageBackground
                    source={item.icon}
                    resizeMode="cover"
                    style={styles.purchaesCardContainer}
                    imageStyle={{ borderRadius: metrics.hp1_5 }}>
                </ImageBackground>
            </TouchableOpacityView>
        )
    };
    const navigateButton = (item: any) => {
        if (item?.title === "Boost") return NavigationService.navigate(NAVIGATION_PROFILE_BOOST_PURCHASE_SCREEN);
        if (item?.title === "Super Like") return NavigationService.navigate(NAVIGATION_SUPERLIKE_PURCHESE_SCREEN);
        if (item?.title === "Subscription") return NavigationService.navigate(NAVIGATION_CRUSH_PURCHESE_SCREEN);

    }
    return (
        <AppSafeAreaView>
            <ImageBackground
                source={profilebackGround}
                resizeMode="cover"
                style={styles.imgaeContainer}>
                <PeopleHeader profile={true} />

                <View style={styles.inContainer}>
                    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
                        <Svg height={size} width={size}>
                            <Circle
                                stroke={colors.persentageBorder}
                                fill="none"
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                strokeWidth={strokeWidth}
                            />
                            <Circle
                                stroke={colors.singleButtonGreen}
                                fill="none"
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                strokeWidth={strokeWidth}
                                strokeDasharray={circumference}
                                strokeDashoffset={circumference - progress}
                                strokeLinecap="round"
                                rotation="90"
                                originX={size / 2}
                                originY={size / 2}
                            />
                        </Svg>
                        <FastImage
                            source={{ uri: userData?.gallery[0]?.url }}
                            resizeMode="cover"
                            style={styles.imageContainer}
                        />
                        <View style={styles.persentageContainer}>
                            <AppText type={TEN} weight={INTER_BOLD} color={WHITE}>
                                24%
                            </AppText>
                        </View>
                    </View>
                    <View>
                        <AppText style={{ marginTop: metrics.hp2 }} type={EIGHTEEN} weight={INTER_BOLD}>{"    "}{userData?.firstName},<AppText type={EIGHTEEN} weight={INTER_MEDIUM}> {userData?.age}{"  "}</AppText>
                            <FastImage source={blueTikeIcon} resizeMode="contain" style={styles.blueTikIcon} />
                        </AppText>
                        <TouchableOpacityView onPress={() => NavigationService.navigate(NAVIGATION_EDIT_PROFILE_SCREEN)} style={styles.completeContainer}>
                            <FastImage source={pencilIcon} tintColor={colors.lightBlack} resizeMode="contain" style={styles.pencilIcon} />
                            <AppText color={LIGHT_BLACK} type={ELEVEN} weight={INTER_MEDIUM}>
                                {"  "}Complete profile
                            </AppText>
                        </TouchableOpacityView>
                    </View>
                </View>
                <View style={styles.headerTabs}>
                    <TouchableOpacityView onPress={() => setTabSelect("Premium")} style={styles.contaierTabs}>
                        <AppText type={THIRTEEN} weight={tabSelect == "Premium" ? INTER_BOLD : INTER_MEDIUM} color={tabSelect == "Premium" ? PURPLE : OPECITY}>
                            Premium
                        </AppText>
                        <View style={[styles.tabLine, { backgroundColor: tabSelect == "Premium" ? colors.purple : colors.transparent }]} />
                    </TouchableOpacityView>
                    <TouchableOpacityView onPress={() => setTabSelect("Safety")} style={styles.contaierTabs}>
                        <AppText type={THIRTEEN} weight={tabSelect == "Safety" ? INTER_BOLD : INTER_MEDIUM} color={tabSelect == "Safety" ? PURPLE : OPECITY}>
                            Safety
                        </AppText>
                        <View style={[styles.tabLine, { backgroundColor: tabSelect == "Safety" ? colors.purple : colors.transparent }]} />
                    </TouchableOpacityView>
                </View>
                {tabSelect == "Premium" &&
                    <View style={styles.bottomContainer}>
                        <View style={styles.one}>
                            {premiumDetaiData?.map((item, index) => {
                                return (
                                    <TouchableOpacityView onPress={() => navigateButton(item)} key={index} style={styles.subDetails}>
                                        <FastImage source={item.icon} resizeMode="contain" style={styles.icons} />
                                        <AppText color={index == 0 ? SKYBLUE : index == 1 ? RED : PURPLE} style={{ marginTop: metrics.hp2 }} type={FORTEEN} weight={INTER_BOLD}>
                                            {item.numberText}
                                        </AppText>
                                        <AppText type={TEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                            {item.title}
                                        </AppText>
                                        <View style={styles.getMoreContainer}>
                                            <AppText weight={INTER_MEDIUM} type={TEN}>
                                                {item.headLine}
                                            </AppText>
                                        </View>
                                    </TouchableOpacityView>
                                )
                            })}
                        </View>
                        <View style={styles.PremiumText}>
                            <FastImage source={premiumIcon} resizeMode="contain" style={styles.pencilIcon} />
                            <AppText type={TWELVE} weight={INTER_SEMI_BOLD}>
                                {"  "}Premium Plans
                            </AppText>
                        </View>
                        <View>
                            <FlatList
                                data={PurchaseCards}
                                renderItem={renderPurchaesCards}
                                keyExtractor={(item) => item.id}
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ marginLeft: metrics.hp2, marginTop: metrics.hp3 }}
                                horizontal={true} />
                        </View>
                    </View>
                }
                {tabSelect == "Safety" &&
                    <View style={[styles.bottomContainer, { paddingHorizontal: metrics.hp2, }]}>
                        <View style={styles.safetyComesContainer}>
                            <FastImage source={checkSafety} resizeMode="contain" style={styles.checkSafetyIcon} />
                            <AppText weight={SCHEHERAZADE_BOLD} type={EIGHTEEN} color={BLACK}>
                                Your Safety Comes First
                            </AppText>
                            <AppText style={{ textAlign: "center", marginTop: -metrics.hp1 }} weight={INTER_SEMI_BOLD} color={OPECITY_DARK}>
                                We’re committed to keeping you safe — from your first swipe to your first date.
                            </AppText>
                            <View style={styles.flexContainer}>
                                <View style={styles.learnContainer}>
                                    <AppText weight={INTER_SEMI_BOLD} color={WHITE}>
                                        Learn Safety Tips
                                    </AppText>
                                </View>
                                <View style={styles.reportContainer}>
                                    <AppText weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                                        Report a Concern
                                    </AppText>
                                </View>
                            </View>
                        </View>
                    </View>
                }
            </ImageBackground>
        </AppSafeAreaView>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    imgaeContainer: {
        flex: 1,

    },
    inContainer: {
        paddingHorizontal: metrics.hp2,
        marginTop: metrics.hp6,
        flexDirection: "row",
        alignItems: "center"
    },
    imageContainer: {
        position: "absolute",
        height: metrics.hp10,
        width: metrics.hp10,
        borderRadius: metrics.hp50,
    },
    persentageContainer: {
        paddingHorizontal: metrics.hp1_5,
        paddingVertical: metrics.hp0_5,
        borderRadius: metrics.hp3,
        borderWidth: metrics.hp0_5,
        borderColor: colors.white,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.black,
        position: "absolute",
        bottom: -metrics.hp1
    },
    blueTikIcon: {
        height: metrics.hp2_5,
        width: metrics.hp2_5,
    },
    pencilIcon: {
        height: metrics.hp2,
        width: metrics.hp2,
    },
    completeContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: metrics.hp1_7,
        borderWidth: metrics.hp0_1,
        borderColor: colors.nanoOpecity,
        paddingVertical: metrics.hp0_7,
        borderRadius: metrics.hp5,
        justifyContent: "center",
        marginTop: metrics.hp1,
        width: metrics.hp17
    },
    headerTabs: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: metrics.hp3,
        paddingHorizontal: metrics.hp2,
        borderBottomWidth: metrics.hp0_1,
        borderBottomColor: colors.nanoOpecity
    },
    contaierTabs: {
        width: metrics.hp11,
        alignItems: "center",
        justifyContent: "center"
    },
    tabLine: {
        height: metrics.hp0_3,
        backgroundColor: colors.purple,
        width: metrics.hp11,
        borderTopRightRadius: metrics.hp1,
        borderTopLeftRadius: metrics.hp1
    },
    bottomContainer: {
        backgroundColor: "#F5F7FA",
        flex: 1,
        // paddingHorizontal: metrics.hp2
    },
    subDetails: {
        height: metrics.hp13,
        width: "30%",
        backgroundColor: colors.white,
        borderRadius: metrics.hp1_5,
        paddingHorizontal: metrics.hp1_5,
        paddingVertical: metrics.hp1_5
    },
    one: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        marginTop: metrics.hp2,
        paddingHorizontal: metrics.hp2
    },
    icons: {
        height: metrics.hp3,
        width: metrics.hp3
    },
    getMoreContainer: {
        paddingHorizontal: metrics.hp0_3,
        paddingVertical: metrics.hp0_1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.singleButtonGreen,
        borderRadius: metrics.hp0_8,
        width: metrics.hp7,
        alignSelf: "center",
        position: "absolute",
        bottom: -metrics.hp1
    },
    purchaesCardContainer: {
        height: metrics.hp26,
        width: Screen.Width / 1.12,
        marginRight: metrics.hp1,
        borderRadius: metrics.hp1_5, // ✅ container radius
    },
    PremiumText: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: metrics.hp4,
        paddingHorizontal: metrics.hp2
    },
    safetyComesContainer: {
        paddingHorizontal: metrics.hp2,
        paddingVertical: metrics.hp2,
        borderRadius: metrics.hp1_5,
        borderColor: "#6F13F233",
        backgroundColor: colors.white,
        marginTop: metrics.hp2,
        alignItems: "center",
        borderWidth: metrics.hp0_1
    },
    checkSafetyIcon: {
        height: metrics.hp5,
        width: metrics.hp5
    },
    learnContainer: {
        height: metrics.hp3,
        width: "48%",
        backgroundColor: colors.lightBlack,
        borderRadius: metrics.hp4,
        alignItems: "center",
        justifyContent: "center"
    },
    reportContainer: {
        height: metrics.hp3,
        width: "48%",
        borderRadius: metrics.hp4,
        borderWidth: metrics.hp0_1,
        borderColor: colors.lightBlack,
        alignItems: "center",
        justifyContent: "center"
    },
    flexContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        marginTop: metrics.hp2
    }
});

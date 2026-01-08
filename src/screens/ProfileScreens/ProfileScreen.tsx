import React, { useEffect, useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { Dimensions, FlatList, ImageBackground, Linking, ScrollView, StyleSheet, View } from "react-native";
import PeopleHeader from "../../common/PeopleHeader";
import { arrowBackForSafety, blockPurppleIcon, blueTikeIcon, callIcon, checkSafety, flasIcon, goldCardSmall, locationPurppleIcon, pencilIcon, platniumCardSmall, premiumIcon, profilebackGround, profileImage, pText, redHeart, rightArrow, sliverCardSmall, stylesRightArrow } from "../../helper/ImageAssets";
import metrics from "../../assets/Metrics";
import { colors } from "../../theme/colors";
import Svg, { Circle } from "react-native-svg";
import FastImage from "react-native-fast-image";
import { AppText, BLACK, EIGHTEEN, ELEVEN, FORTEEN, INTER_BOLD, INTER_MEDIUM, INTER_SEMI_BOLD, LIGHT_BLACK, NINE, OPECITY, OPECITY_DARK, PURPLE, RED, SCHEHERAZADE_BOLD, SKYBLUE, TEN, THIRTEEN, TWELVE, TWENTY, WHITE } from "../../common/AppText";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import { premiumDetaiData, PurchaseCards, SafetyTips, TrustTransparency } from "../../common/UiltData";
import { Screen } from "../../theme/dimens";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_CRUSH_PURCHESE_SCREEN, NAVIGATION_EDIT_PROFILE_SCREEN, NAVIGATION_PROFILE_BOOST_PURCHASE_SCREEN, NAVIGATION_SETTING_SCREEN, NAVIGATION_SUBSCRIPTION_ALL_SCREEN, NAVIGATION_SUBSCRIPTION_SCREEN, NAVIGATION_SUPERLIKE_PURCHESE_SCREEN } from "../../navigation/routes";
import { useDispatch, useSelector } from "react-redux";
import { getProfile } from "../../actions/authActions";
import Carousel from "react-native-reanimated-carousel";

const ProfileScreen = () => {
    const dispatch = useDispatch();
    const [percentage, setPercentage] = useState(25);
    const [tabSelect, setTabSelect] = useState("Premium");
    const [activeIndex, setActiveIndex] = useState(0);
    const userData = useSelector((state: any) => state.auth.userData);
console.log(userData,"userData");

    useEffect(() => {
        const n = Number(userData?.profileCompletion);
        setPercentage(Number.isFinite(n) ? n : 0);
    }, [userData?.profileCompletion])
    const size = metrics.hp12;
    const strokeWidth = metrics.hp0_5;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const safePct = Number.isFinite(Number(percentage)) ? Math.max(0, Math.min(100, Number(percentage))) : 0;
    const progress = (safePct / 100) * circumference;

    const premiumDetaiData = [
        { id: "1", icon: flasIcon, numberText: userData?.boostRemaining, title: "Boost", headLine: "Get more" },
        { id: "2", icon: redHeart, numberText: userData?.superLikesRemaining, title: "Super Like", headLine: "Get more" },
        { id: "3", icon: pText, numberText: userData?.subscription?.plan !== "FREE" ? `${userData?.subscription?.plan}\nSubscription` : "Get\nSubscription", title: "", headLine: userData?.subscription?.plan === "SILVER" || userData?.subscription?.plan === "GOLD" ? "Upgrade" : userData?.subscription?.plan === "PLATNIUM" ? "Elite" : "Purchase" },
    ];
    const renderPurchaesCards = ({ item, index }: any) => {
        return (
            <TouchableOpacityView key={index} activeOpacity={1} onPress={() => NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN, { comming: item })} style={{ marginRight: index == 2 ? metrics.hp2 : 0 }}>
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
        if (item?.id === "3") return NavigationService.navigate(NAVIGATION_SUBSCRIPTION_ALL_SCREEN);

    };
    const onSubmit = () => {
        let navigate = false;
        let profile = true;
        dispatch(getProfile(navigate, profile))
    };
    const width = Dimensions.get('screen').width;
    return (
        <AppSafeAreaView>
            <ImageBackground
                source={profilebackGround}
                resizeMode="cover"
                style={styles.imgaeContainer}>
                <PeopleHeader profile={true} />

                <View style={styles.inContainer}>
                    <TouchableOpacityView onPress={onSubmit} style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
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
                                {Math.trunc(percentage)}%
                            </AppText>
                        </View>
                    </TouchableOpacityView>
                    <View>
                        <AppText style={{ marginTop: metrics.hp2, textTransform: "capitalize" }} type={EIGHTEEN} weight={INTER_BOLD}>{"    "}{userData?.firstName},<AppText type={EIGHTEEN} weight={INTER_MEDIUM}> {userData?.age}{"  "}</AppText>
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
                                return userData?.subscription?.plan !== "FREE" && item.id === "3" ? (
                                    <TouchableOpacityView onPress={() => navigateButton(item)}>
                                        <ImageBackground source={userData?.subscription?.plan === "SILVER" ? sliverCardSmall :
                                            userData?.subscription?.plan === "GOLD" ? goldCardSmall : platniumCardSmall
                                        } resizeMode="contain" style={{
                                            height: metrics.hp13,
                                            width: metrics.hp13,
                                        }}>
                                            <View style={styles.getMoreContainer}>
                                                <AppText style={{ marginTop: -metrics.hp0_1 }} weight={INTER_MEDIUM} color={WHITE} type={TEN}>
                                                    {item.headLine}
                                                </AppText>
                                            </View>
                                        </ImageBackground>
                                    </TouchableOpacityView>
                                ) : (
                                    <TouchableOpacityView onPress={() => navigateButton(item)} key={index} style={[styles.subDetails, { marginLeft: item.id == "2" ? metrics.hp0_5 : 0 }]}>
                                        <FastImage source={item.icon} resizeMode="contain" style={styles.icons} />
                                        <AppText color={index == 0 ? SKYBLUE : index == 1 ? RED : PURPLE} style={{ marginTop: index == 2 ? metrics.hp2 : metrics.hp2 }} type={index == 2 ? TWELVE : FORTEEN} weight={INTER_BOLD}>
                                            {item.numberText}
                                        </AppText>
                                        <AppText type={TEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                            {item.title}
                                        </AppText>
                                        <View style={styles.getMoreContainer}>
                                            <AppText style={{ marginTop: -metrics.hp0_1 }} weight={INTER_MEDIUM} color={WHITE} type={TEN}>
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
                        <View style={{ flex:1 }}>
                            <Carousel
                                width={width}
                                height={metrics.hp80}
                                autoPlay={false}
                                autoPlayInterval={4000}
                                defaultIndex={0}
                                loop={false}
                                mode="parallax"
                                data={PurchaseCards || []}
                                scrollAnimationDuration={300}
                                modeConfig={{
                                    parallaxScrollingScale: 0.9,
                                    parallaxAdjacentItemScale: 0.8,  // REQUIRED
                                    parallaxScrollingOffset: Math.round(width / 10) + metrics.hp1,
                                }}
                                style={{ height: metrics.hp40, marginTop: -metrics.hp2, }}
                                renderItem={({ item, index }: any) => (
                                    <TouchableOpacityView key={index} activeOpacity={1} onPress={() => NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN, { comming: item })} >
                                        <ImageBackground
                                            source={item.icon}
                                            resizeMode="cover"
                                            style={styles.purchaesCardContainer}
                                            imageStyle={{ borderRadius: metrics.hp1_5 }}>
                                        </ImageBackground>
                                    </TouchableOpacityView>
                                )}
                            />
                        </View>
                        {/* <FlatList
                            data={PurchaseCards}
                            renderItem={renderPurchaesCards}
                            keyExtractor={(item) => item.id}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ marginLeft: metrics.hp2, marginTop: metrics.hp3 }}
                            horizontal={true} /> */}
                    </View>
                }
                {tabSelect == "Safety" &&
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: metrics.hp5 }} style={[styles.bottomContainer, { paddingHorizontal: metrics.hp2, }]}>
                        <View style={styles.safetyComesContainer}>
                            <FastImage source={checkSafety} resizeMode="contain" style={styles.checkSafetyIcon} />
                            <AppText weight={SCHEHERAZADE_BOLD} type={EIGHTEEN} color={BLACK}>
                                Your Safety Comes First
                            </AppText>
                            <AppText style={{ textAlign: "center", marginTop: -metrics.hp1 }} weight={INTER_SEMI_BOLD} color={OPECITY_DARK}>
                                We’re committed to keeping you safe — from your first swipe to your first date.
                            </AppText>
                            <View style={styles.flexContainer}>
                                <TouchableOpacityView onPress={() => Linking.openURL("https://parpple.com/safety")} style={styles.learnContainer}>
                                    <AppText weight={INTER_SEMI_BOLD} color={WHITE}>
                                        Learn Safety Tips
                                    </AppText>
                                </TouchableOpacityView>
                                <TouchableOpacityView onPress={() => Linking.openURL("https://parpple.com/contact-us")} style={styles.reportContainer}>
                                    <AppText weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                                        Report a Concern
                                    </AppText>
                                </TouchableOpacityView>
                            </View>
                        </View>
                        <AppText style={{ marginTop: metrics.hp2 }} type={TWELVE} weight={INTER_SEMI_BOLD} color={BLACK}>
                            Safety Tools
                        </AppText>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: metrics.hp1 }}>
                            <TouchableOpacityView onPress={() => Linking.openURL("https://parpple.com/safety")} style={styles.boxes}>
                                <FastImage source={blockPurppleIcon} resizeMode="contain" style={{ height: metrics.hp2, width: metrics.hp2 }} />
                                <AppText style={{ marginTop: metrics.hp1 }} color={LIGHT_BLACK} type={TWELVE} weight={INTER_SEMI_BOLD}>
                                    Block user{`\n`}
                                    Instantly
                                </AppText>
                                <AppText style={{ marginTop: metrics.hp0_1 }} color={OPECITY_DARK} type={TEN} weight={INTER_MEDIUM}>
                                    Stop unwanted chats with{`\n`}
                                    one tap.
                                </AppText>
                                <AppText style={{ marginTop: metrics.hp0_5 }} color={PURPLE} type={TEN} weight={INTER_SEMI_BOLD}>
                                    Learn How
                                </AppText>
                            </TouchableOpacityView>
                            <TouchableOpacityView onPress={() => NavigationService.navigate(NAVIGATION_SETTING_SCREEN)} style={styles.boxes}>
                                <FastImage source={locationPurppleIcon} resizeMode="contain" style={{ height: metrics.hp2, width: metrics.hp2 }} />
                                <AppText style={{ marginTop: metrics.hp1 }} color={LIGHT_BLACK} type={TWELVE} weight={INTER_SEMI_BOLD}>
                                    Profile{`\n`}
                                    Discovery
                                </AppText>
                                <AppText style={{ marginTop: metrics.hp0_1 }} color={OPECITY_DARK} type={TEN} weight={INTER_MEDIUM}>
                                    Choose whether you want to{`\n`}
                                    show profile to other.
                                </AppText>
                                <AppText style={{ marginTop: metrics.hp0_5 }} color={PURPLE} type={TEN} weight={INTER_SEMI_BOLD}>
                                    Change
                                </AppText>
                            </TouchableOpacityView>
                        </View>
                        <AppText style={{ marginTop: metrics.hp3 }} type={TWELVE} weight={INTER_SEMI_BOLD} color={BLACK}>
                            Safety Tips
                        </AppText>
                        <TouchableOpacityView onPress={() => Linking.openURL("https://parpple.com/safety")} style={styles.sefetyContainer}>
                            {SafetyTips?.map((item) => {
                                return (
                                    <View style={styles.innerLines}>
                                        <FastImage source={stylesRightArrow} resizeMode="contain" style={{ height: metrics.hp2, width: metrics.hp2 }} />
                                        <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                            {"  "}{item.line}
                                        </AppText>
                                    </View>
                                )
                            })}
                            <View style={{ flexDirection: "row", alignItems: "center", marginTop: metrics.hp1 }}>
                                <AppText type={TWELVE} weight={INTER_SEMI_BOLD} color={PURPLE}>
                                    Real All Tips{" "}
                                </AppText>
                                <FastImage source={arrowBackForSafety} resizeMode="contain" style={{ height: metrics.hp2, width: metrics.hp2_5, marginTop: metrics.hp0_5 }} />
                            </View>
                        </TouchableOpacityView>
                        <AppText style={{ marginTop: metrics.hp2 }} type={TEN} weight={INTER_SEMI_BOLD} color={BLACK}>
                            Reporting & Support
                        </AppText>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: metrics.hp1 }}>
                            <TouchableOpacityView onPress={() => Linking.openURL("https://parpple.com/contact-us")} style={[styles.boxes, { height: metrics.hp13 }]}>
                                <FastImage source={blockPurppleIcon} resizeMode="contain" style={{ height: metrics.hp2, width: metrics.hp2 }} />
                                <AppText style={{ marginTop: metrics.hp1 }} color={LIGHT_BLACK} type={TWELVE} weight={INTER_SEMI_BOLD}>
                                    Report a User
                                </AppText>
                                <AppText style={{ marginTop: metrics.hp0_1 }} color={OPECITY_DARK} type={TEN} weight={INTER_MEDIUM}>
                                    Harassment / Fake Profile /{`\n`}
                                    Scams
                                </AppText>
                                <AppText style={{ marginTop: metrics.hp0_5 }} color={PURPLE} type={TEN} weight={INTER_SEMI_BOLD}>
                                    Report Now
                                </AppText>
                            </TouchableOpacityView>
                            <TouchableOpacityView onPress={() => Linking.openURL("https://parpple.com/contact-us")} style={[styles.boxes, { height: metrics.hp13 }]}>
                                <FastImage source={locationPurppleIcon} resizeMode="contain" style={{ height: metrics.hp2, width: metrics.hp2 }} />
                                <AppText style={{ marginTop: metrics.hp1 }} color={LIGHT_BLACK} type={TWELVE} weight={INTER_SEMI_BOLD}>
                                    Contact Support
                                </AppText>
                                <AppText style={{ marginTop: metrics.hp0_1 }} color={OPECITY_DARK} type={TEN} weight={INTER_MEDIUM}>
                                    Write an email to our safety{`\n`}
                                    team.
                                </AppText>
                                <AppText style={{ marginTop: metrics.hp0_5 }} color={PURPLE} type={TEN} weight={INTER_SEMI_BOLD}>
                                    Write now
                                </AppText>
                            </TouchableOpacityView>
                        </View>
                        <AppText style={{ marginTop: metrics.hp3 }} type={TWELVE} weight={INTER_SEMI_BOLD} color={BLACK}>
                            Trust & Transparency
                        </AppText>
                        <TouchableOpacityView onPress={() => Linking.openURL("https://parpple.com/safety")} style={[styles.sefetyContainer, { height: metrics.hp15 }]}>
                            {TrustTransparency?.map((item) => {
                                return (
                                    <View style={styles.innerLines}>
                                        <FastImage source={stylesRightArrow} resizeMode="contain" style={{ height: metrics.hp2, width: metrics.hp2 }} />
                                        <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                            {"  "}{item.line}
                                        </AppText>
                                    </View>
                                )
                            })}
                            <View style={{ flexDirection: "row", alignItems: "center", marginTop: metrics.hp1 }}>
                                <AppText type={TEN} weight={INTER_SEMI_BOLD} color={PURPLE}>
                                    Read Our Safety Policy
                                </AppText>
                            </View>
                        </TouchableOpacityView>
                        <AppText style={{ marginTop: metrics.hp2 }} type={TEN} weight={INTER_SEMI_BOLD} color={BLACK}>
                            Resources & Partnerships
                        </AppText>
                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: metrics.hp2 }}>
                            <FastImage source={callIcon} resizeMode="contain" style={{ height: metrics.hp1_5, width: metrics.hp1_5 }} />
                            <AppText>
                                {"  "}National Cyber Crime Helpline
                            </AppText>
                        </View>
                        <TouchableOpacityView onPress={() => Linking.openURL("https://cybercrime.gov.in/Webform/Crime_NodalGrivanceList.aspx")} style={styles.visitBox}>
                            <AppText type={ELEVEN} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                                Visit Website
                            </AppText>
                        </TouchableOpacityView>
                        {/* <View style={{ height: metrics.hp0_1, backgroundColor: colors.persentageBorder, marginTop: metrics.hp2, }} />
                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: metrics.hp2 }}>
                            <FastImage source={callIcon} resizeMode="contain" style={{ height: metrics.hp1_5, width: metrics.hp1_5 }} />
                            <AppText>
                                {"  "}Relationship Safety Support NGO
                            </AppText>
                        </View>
                        <TouchableOpacityView onPress={() => Linking.openURL("https://parpple.com/")} style={styles.visitBox}>
                            <AppText type={ELEVEN} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                                Visit Website
                            </AppText>
                        </TouchableOpacityView> */}
                    </ScrollView>
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
        backgroundColor: colors.black,
        borderRadius: metrics.hp1,
        width: metrics.hp7,
        alignSelf: "center",
        position: "absolute",
        bottom: -metrics.hp1
    },
    purchaesCardContainer: {
        height: metrics.hp30,
        width: Screen.Width / 1,
        marginRight: metrics.hp1,
        borderRadius: metrics.hp1_5, // ✅ container radius
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: metrics.hp0_5 },
        shadowOpacity: 1,
        shadowRadius: metrics.hp1,
        elevation: 9,
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
        borderWidth: metrics.hp0_1,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: metrics.hp1 },
        shadowOpacity: 0.18,
        shadowRadius: metrics.hp1,
        elevation: 6,
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
    },
    boxes: {
        width: "48%",
        height: metrics.hp15,
        borderWidth: metrics.hp0_1,
        borderColor: "#E2E2E2",
        paddingHorizontal: metrics.hp1,
        paddingVertical: metrics.hp1,
        borderRadius: metrics.hp1_5,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: metrics.hp1 },
        shadowOpacity: 0.18,
        shadowRadius: metrics.hp1,
        elevation: 3,
        backgroundColor: colors.white
    },
    sefetyContainer: {
        paddingVertical: metrics.hp1,
        paddingHorizontal: metrics.hp1,
        height: metrics.hp19,
        borderColor: "#E2E2E2",
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: metrics.hp1 },
        shadowOpacity: 0.18,
        shadowRadius: metrics.hp1,
        elevation: 3,
        backgroundColor: colors.white,
        borderRadius: metrics.hp1_5,
        marginTop: metrics.hp1
    },
    innerLines: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: metrics.hp0_6
    },
    visitBox: {
        height: metrics.hp2_7, width: metrics.hp13, backgroundColor: colors.white, alignItems: "center", justifyContent: "center", borderRadius: metrics.hp1_5, borderColor: colors.black, borderWidth: metrics.hp0_1, marginTop: metrics.hp1
    }

});

import React, { useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { FlatList, ImageBackground, StyleSheet, View } from "react-native";
import { goldHeader, infinityICon, platinumHeader, premiumIcon, silverHeader, stylesRightArrow } from "../../helper/ImageAssets";
import metrics from "../../assets/Metrics";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import NavigationService from "../../navigation/NavigationService";
import FastImage from "react-native-fast-image";
import { AppText, EIGHT, ELEVEN, FORTEEN, INTER_EXTRA_BOLD, INTER_MEDIUM, INTER_REGULAR, INTER_SEMI_BOLD, LIGHT_BLACK, NINE, OPECITY_DARK, TEN, TWELVE, WHITE } from "../../common/AppText";
import { SilverPurchase, SilverPurchasedis } from "../../common/UiltData";
import { colors } from "../../theme/colors";
import PurpuleButton from "../../common/PurpuleButton";

const SubscriptionScreen = ({ route }: any) => {
    let title = route?.params?.comming?.title ?? "";
    const [plan, setPlan] = useState(0)
    const commingHeader = () => {
        if (title == "Silver") return silverHeader;
        if (title == "Gold") return goldHeader;
        if (title == "Platinum") return platinumHeader;
    };
    const purChaesDetails = ({ item, index }: any) => {
        return (
            <TouchableOpacityView activeOpacity={1} onPress={() => setPlan(index)} style={[styles.container, {
                marginLeft:
                    SilverPurchase?.length + 1 == index
                        ? 0
                        : metrics.hp2,
                marginRight:
                    SilverPurchase?.length - 1 == index
                        ? metrics.hp2
                        : 0,
                backgroundColor: plan === index ? colors.purple : colors.white
            }]}>
                {item.discount &&
                    <View style={styles.discountContainer}>
                        <AppText type={EIGHT} weight={INTER_SEMI_BOLD} color={WHITE}>
                            {item.discount}
                        </AppText>
                    </View>
                }
                <AppText type={TWELVE} weight={INTER_MEDIUM} color={plan === index ? WHITE : LIGHT_BLACK}>
                    {item.planOf}
                </AppText>
                <AppText style={{ marginTop: metrics.hp1 }} type={FORTEEN} weight={INTER_EXTRA_BOLD} color={plan === index ? WHITE : LIGHT_BLACK}>
                    {item.amount}
                </AppText>
                <AppText type={TWELVE} weight={INTER_MEDIUM} color={plan === index ? WHITE : LIGHT_BLACK}>
                    {item.ofPu}
                </AppText>
                <View style={[styles.dotContainer, {
                    borderWidth: plan === index ? metrics.hp0_6 : metrics.hp0_2,
                    borderColor: plan === index ? colors.white : colors.lightBlack,
                }]} />
            </TouchableOpacityView>
        )
    };
    const disRender = ({ item, index }: any) => {
        return (
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: metrics.hp2 }}>
                <FastImage source={stylesRightArrow} resizeMode="contain" style={styles.pencilIcon} />
                <AppText type={ELEVEN} weight={INTER_SEMI_BOLD} color={OPECITY_DARK}>
                    {"   "}{item.title}
                </AppText>
            </View>
        )
    }
    return (
        <AppSafeAreaView>
            <ImageBackground source={commingHeader()} resizeMode="cover" style={styles.headerContainer}>
                <TouchableOpacityView onPress={() => NavigationService.goBack()} style={styles.closeButton} />
            </ImageBackground>
            <View style={{ flex: 1, backgroundColor: "#F5F7FA" }}>
                <View style={styles.PremiumText}>
                    <FastImage source={premiumIcon} resizeMode="contain" style={styles.pencilIcon} />
                    <AppText type={TWELVE} weight={INTER_SEMI_BOLD}>
                        {"  "}Choose Plan
                    </AppText>
                </View>
                <View>
                    <FlatList
                        data={SilverPurchase}
                        renderItem={purChaesDetails}
                        keyExtractor={(item) => item.id}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ marginTop: metrics.hp2 }}
                        horizontal={true} />
                </View>
                <View style={styles.PremiumText}>
                    <FastImage source={infinityICon} resizeMode="contain" style={styles.pencilIcon} />
                    <AppText type={TWELVE} weight={INTER_SEMI_BOLD}>
                        {"  "}Included with plan
                    </AppText>
                </View>
                <FlatList
                    data={SilverPurchasedis}
                    renderItem={disRender}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ marginTop: metrics.hp2, paddingHorizontal: metrics.hp2, paddingBottom: metrics.hp10 }} />
            </View>
            <View style={styles.bottomcontainer}>
                <AppText weight={INTER_REGULAR} type={TEN}>
                    By tapping Upgrade, your payment will be charged, your subscriptions auto-renew unless canceled at least 24 hours before the current period ends. Manage your subscription anytime in settings and you agree to our
                    <AppText style={{
                        textDecorationLine: "underline"
                    }} weight={INTER_SEMI_BOLD} type={TEN}>Terms</AppText>
                </AppText>
                <TouchableOpacityView style={styles.buttonContiner}>
                    <AppText color={WHITE} weight={INTER_SEMI_BOLD} type={FORTEEN}>
                        Get 1 week for ₹549
                    </AppText>
                </TouchableOpacityView>
            </View>
        </AppSafeAreaView>
    )
};
export default SubscriptionScreen;
const styles = StyleSheet.create({
    headerContainer: {
        height: metrics.hp28,
        width: "100%",
        marginTop: metrics.hp5,

    },
    closeButton: {
        height: metrics.hp5,
        width: metrics.hp8,
    },
    pencilIcon: {
        height: metrics.hp2,
        width: metrics.hp2,
    },
    PremiumText: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: metrics.hp2,
        paddingHorizontal: metrics.hp2
    },
    container: {
        height: metrics.hp16,
        width: metrics.hp12,
        backgroundColor: colors.white,
        borderRadius: metrics.hp1_5,
        alignItems: "center",
        justifyContent: "center",
    },
    dotContainer: {
        height: metrics.hp2_5,
        width: metrics.hp2_5,
        marginTop: metrics.hp1_5,
        borderRadius: metrics.hp50
    },
    bottomcontainer: {
        paddingHorizontal: metrics.hp2,
        paddingVertical: metrics.hp1,
        backgroundColor: colors.white
    },
    buttonContiner: {
        height: metrics.hp5,
        borderRadius: metrics.hp4,
        backgroundColor: colors.purple,
        alignItems: "center",
        justifyContent: "center",
        marginTop: metrics.hp2,
        marginBottom: metrics.hp1
    },
    discountContainer: {
        width: metrics.hp6_5,
        height: metrics.hp2,
        backgroundColor: colors.lightBlack,
        borderRadius: metrics.hp1,
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        top: -metrics.hp0_6
    }
})
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Dimensions,
    ImageBackground,
    ScrollView,
    StyleSheet,
    View,
    Platform,
    ActivityIndicator,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import FastImage from "react-native-fast-image";
import * as RNIap from 'react-native-iap';

import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { AppText, BLACK, ELEVEN, FORTEEN, INTER_BOLD, INTER_MEDIUM, INTER_REGULAR, INTER_SEMI_BOLD, OPECITY_DARK, SCHEHERAZADE_SEMI_BOLD, TEN, TWELVE, TWENTY_TWO, WHITE } from "../../common/AppText";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import NavigationService from "../../navigation/NavigationService";
import metrics from "../../assets/Metrics";
import { colors } from "../../theme/colors";
import { SilverPurchasedis, GoldPurchasedis, PlatinumPurchasedis } from "../../common/UiltData";
import { NAVIGATION_SUBSCRIPTION_SCREEN } from "../../navigation/routes";

import {
    closeIcon,
    GoldPurchesSlide,
    goldenPurchesBack,
    infinityICon,
    lockIcon,
    platinumPurchesSlide,
    platinumPurcheseBack,
    rightSuccesIcon,
    SliverPurchesSlide,
    sliverParchuesBack,
    stylesRightArrow,
    rightArrow,
    rightBlack,
} from "../../helper/ImageAssets";


const data = [
    { id: 1, title: "Silver", image: SliverPurchesSlide },
    { id: 2, title: "Gold", image: GoldPurchesSlide },
    { id: 3, title: "Platinum", image: platinumPurchesSlide },
];

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.80;
const CARD_SPACING = metrics.hp9;
const CARD_HEIGHT = metrics.hp10;

const FEATURE_CATEGORIES = [
    {
        id: 1,
        title: "Get more Likes",
        features: ["Unlimited Likes", "See Who Likes You", "Priority Likes"]
    },
    {
        id: 2,
        title: "Premium Mode",
        features: ["Unlimited Re-Swipe", "1 Free Boost per Month", "2 Super Likes per Week", "3 Super Likes per Week", "3 Free Crush Notes per Week"]
    },
    {
        id: 3,
        title: "Get Better Experience",
        features: ["Top Picks", "Hide Ads", "Advanced Filters"]
    },
    {
        id: 4,
        title: "Get Control",
        features: ["Control Your Profile", "Control Who You Viewed", "Who Viewed You"]
    }
];

const FEATURE_NAME_MAP: { [key: string]: string } = {
    "See Who Likes You": "See Who Likes You",
    "See who liked you": "See Who Likes You",
    "1 Free Boost per Month": "1 Free Boost per Month",
    "1 Boost / month": "1 Free Boost per Month",
    "2 Super Likes per Week": "2 Super Likes per Week",
    "3 Super Likes per Week": "3 Super Likes per Week",
    "3 Free Crush Notes per Week": "3 Free Crush Notes per Week",
    "3 Free Crush Note per Week": "3 Free Crush Notes per Week",
    "Advanced Filters": "Advanced Filters",
    "Advance Filters": "Advanced Filters",
};

const getAllFeatures = () => {
    const allFeatures = new Map<string, { title: string; subTitle: string }>();

    [...SilverPurchasedis, ...GoldPurchasedis, ...PlatinumPurchasedis].forEach(feature => {
        if (!allFeatures.has(feature.title)) {
            allFeatures.set(feature.title, { title: feature.title, subTitle: feature.subTitle });
        }
    });

    return Array.from(allFeatures.values());
};

const getFeaturesByCategory = (tier: string) => {
    const allFeatures = getAllFeatures();
    const categorizedFeatures: Array<{
        category: typeof FEATURE_CATEGORIES[0];
        included: Array<{ title: string; subTitle: string }>;
        locked: Array<{ title: string; subTitle: string }>;
    }> = [];

    FEATURE_CATEGORIES.forEach(category => {
        const included: Array<{ title: string; subTitle: string }> = [];
        const locked: Array<{ title: string; subTitle: string }> = [];

        // Filter features based on tier for Super Likes
        const filteredFeatures = category.features.filter(featureTitle => {
            // For Super Likes, show based on tier
            if (featureTitle === "2 Super Likes per Week") {
                // Show for Silver (locked) and Gold (included)
                return tier === "Silver" || tier === "Gold";
            }
            if (featureTitle === "3 Super Likes per Week") {
                // Show only for Platinum
                return tier === "Platinum";
            }
            // For all other features, show them
            return true;
        });

        filteredFeatures.forEach(featureTitle => {
            const normalizedTitle = FEATURE_NAME_MAP[featureTitle] || featureTitle;
            let feature = allFeatures.find(f => f.title === featureTitle);

            if (!feature) {
                feature = allFeatures.find(f => {
                    const normalizedFeatureTitle = FEATURE_NAME_MAP[f.title] || f.title;
                    return normalizedFeatureTitle === normalizedTitle;
                });
            }

            if (!feature) {
                feature = allFeatures.find(f => {
                    const fTitle = f.title.toLowerCase();
                    const searchTitle = featureTitle.toLowerCase();
                    return fTitle.includes(searchTitle) || searchTitle.includes(fTitle);
                });
            }

            if (feature) {
                if (isFeatureIncluded(feature.title, tier)) {
                    included.push(feature);
                } else {
                    locked.push(feature);
                }
            }
        });

        categorizedFeatures.push({
            category,
            included,
            locked
        });
    });

    return categorizedFeatures;
};

const isFeatureIncluded = (featureTitle: string, tier: string): boolean => {
    if (tier === "Silver") {
        return SilverPurchasedis.some(f => f.title === featureTitle);
    } else if (tier === "Gold") {
        return GoldPurchasedis.some(f => f.title === featureTitle);
    } else if (tier === "Platinum") {
        return true;
    }
    return false;
};

// All Subscription SKUs
const ALL_SUBSCRIPTION_SKUS = Platform.select({
    android: [
        'silver_weekly', 'silver_month', 'silver_6month',
        'gold_week', 'gold_month', 'gold_6month',
        'platinum_week', 'platinum_month', 'platinum_6month'
    ],
    ios: [
        'silver_week', 'silver_month', 'silver_6month',
        'gold_week', 'gold_month', 'gold_6month',
        'platinum_week', 'platinum_month', 'platinum_6month'
    ],
}) || [];

// Helper to extract tier from productId
const getTierFromProductId = (productId: string) => {
    if (productId.toLowerCase().includes('silver')) return 'Silver';
    if (productId.toLowerCase().includes('gold')) return 'Gold';
    if (productId.toLowerCase().includes('platinum')) return 'Platinum';
    return 'Silver';
};

// Helper to extract subscription period
const extractSubscriptionPeriod = (subscription: any): { planOf: string; ofPu: string; periodOrder: number; weeksCount: number } => {
    const productId = (subscription.id || subscription.productId || subscription.productIdentifier || '').toString();

    if (subscription.subscriptionOfferDetails && subscription.subscriptionOfferDetails.length > 0) {
        const offerDetails = subscription.subscriptionOfferDetails[0];
        if (offerDetails.pricingPhases && offerDetails.pricingPhases.pricingPhaseList) {
            const phase = offerDetails.pricingPhases.pricingPhaseList[0];
            const billingPeriod = phase.billingPeriod || '';
            if (billingPeriod.includes('W')) {
                const weeks = parseInt(billingPeriod.match(/\d+/)?.[0] || '1');
                return { planOf: `${weeks} Week`, ofPu: 'Week', periodOrder: 1, weeksCount: weeks };
            } else if (billingPeriod.includes('M')) {
                const months = parseInt(billingPeriod.match(/\d+/)?.[0] || '1');
                const weeksCount = months === 6 ? 24 : months * 4;
                return {
                    planOf: months === 1 ? '1 Month' : `${months} Months`,
                    ofPu: 'Month',
                    periodOrder: months === 1 ? 2 : (months === 6 ? 3 : 4),
                    weeksCount: weeksCount
                };
            }
        }
    }

    if (subscription.subscriptionPeriodNumberIOS && subscription.subscriptionPeriodUnitIOS) {
        const number = parseInt(subscription.subscriptionPeriodNumberIOS);
        const unit = subscription.subscriptionPeriodUnitIOS;
        if (unit === 'WEEK') {
            return { planOf: `${number} Week`, ofPu: 'Week', periodOrder: 1, weeksCount: number };
        } else if (unit === 'MONTH') {
            const weeksCount = number === 6 ? 24 : number * 4;
            return {
                planOf: number === 1 ? '1 Month' : `${number} Months`,
                ofPu: 'Month',
                periodOrder: number === 1 ? 2 : (number === 6 ? 3 : 4),
                weeksCount: weeksCount
            };
        }
    }

    if (productId.includes('6month')) return { planOf: '6 Months', ofPu: 'Month', periodOrder: 3, weeksCount: 24 };
    if (productId.includes('month')) return { planOf: '1 Month', ofPu: 'Month', periodOrder: 2, weeksCount: 4 };
    if (productId.includes('week')) return { planOf: '1 Week', ofPu: 'Week', periodOrder: 1, weeksCount: 1 };

    return { planOf: 'Plan', ofPu: '', periodOrder: 0, weeksCount: 1 };
};

// Helper to extract price
const extractPrice = (subscription: any): string => {
    if (subscription.displayPrice) return subscription.displayPrice;
    if (subscription.localizedPrice) return subscription.localizedPrice;

    if (subscription.subscriptionOfferDetails && subscription.subscriptionOfferDetails.length > 0) {
        const offerDetails = subscription.subscriptionOfferDetails[0];
        if (offerDetails.pricingPhases && offerDetails.pricingPhases.pricingPhaseList) {
            const phase = offerDetails.pricingPhases.pricingPhaseList[0];
            if (phase.formattedPrice) return phase.formattedPrice;
            if (phase.priceAmountMicros) {
                const amount = parseInt(phase.priceAmountMicros) / 1000000;
                const currency = phase.priceCurrencyCode || '₹';
                return `${currency}${amount.toFixed(0)}`;
            }
        }
    }

    if (subscription.price) {
        const currency = subscription.currency || '₹';
        return `${currency}${subscription.price}`;
    }
    return 'N/A';
};

// Helper to extract numeric price
const extractPriceNumber = (priceStr: string): { amount: number; currency: string } => {
    const amountMatch = priceStr.match(/[\d,.]+/);
    const amount = amountMatch ? parseFloat(amountMatch[0].replace(/,/g, '')) : 0;
    const currency = priceStr.replace(/[\d,.\s]+/g, '') || '₹';
    return { amount, currency };
};


const SubscriptionAllScreen = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [selectedTier, setSelectedTier] = useState("Silver");
    const carouselRef = useRef<any>(null);
    const [weeklyPrice, setWeeklyPrice] = useState<string>("");
    const [loadingPrice, setLoadingPrice] = useState(true);

    useEffect(() => {
        if (data.length > 0 && activeIndex >= 0 && activeIndex < data.length) {
            const newTier = data[activeIndex].title;
            setSelectedTier(newTier);
        }
    }, [activeIndex]);

    // Fetch weekly price for selected tier
    useEffect(() => {
        const fetchWeeklyPrice = async () => {
            try {
                setLoadingPrice(true);
                await RNIap.initConnection();
                const availableProducts = await RNIap.getSubscriptions({
                    skus: ALL_SUBSCRIPTION_SKUS
                });

                if (availableProducts && availableProducts.length > 0) {
                    // Find the 1-week plan for the selected tier
                    const tierWeekProduct = availableProducts.find((prod: any) => {
                        const productId = (prod.id || prod.productId || prod.productIdentifier || '').toString();
                        const tier = getTierFromProductId(productId);
                        const periodInfo = extractSubscriptionPeriod(prod);
                        return tier === selectedTier && periodInfo.weeksCount === 1;
                    });

                    if (tierWeekProduct) {
                        const priceStr = extractPrice(tierWeekProduct);
                        setWeeklyPrice(priceStr);
                    } else {
                        setWeeklyPrice("");
                    }
                } else {
                    setWeeklyPrice("");
                }
            } catch (err) {
                console.warn('IAP Price Fetch Error:', err);
                setWeeklyPrice("");
            } finally {
                setLoadingPrice(false);
            }
        };

        fetchWeeklyPrice();
    }, [selectedTier]);

    const getBackgroundImage = () => {
        if (selectedTier === "Gold") return goldenPurchesBack;
        if (selectedTier === "Platinum") return platinumPurcheseBack;
        return sliverParchuesBack;
    };

    const categorizedFeatures = useMemo(() => getFeaturesByCategory(selectedTier), [selectedTier]);

    const handlePurchasePress = () => {
        NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN, {
            comming: { title: selectedTier }
        });
    };

    const getButtonColor = () => {
        if (selectedTier === "Gold") return "#CCA200";
        if (selectedTier === "Platinum") return "#0F0F0F";
        return "#6F13F2"; // Silver
    };

    return (
        <AppSafeAreaView>
            <ImageBackground source={getBackgroundImage()} style={styles.imageBackground}>
                <View style={styles.headerContainer}>
                    <TouchableOpacityView onPress={() => NavigationService.goBack()}>
                        <FastImage source={closeIcon} style={styles.closeIcon} />
                    </TouchableOpacityView>
                    <AppText type={FORTEEN} weight={INTER_BOLD}>
                        My Subscriptions
                    </AppText>
                    <View style={styles.closeIcon} />
                </View>
                <Carousel
                    ref={carouselRef}
                    width={CARD_WIDTH + CARD_SPACING}
                    height={metrics.hp16}
                    data={data}
                    pagingEnabled
                    snapEnabled
                    loop={false}
                    style={{ paddingLeft: metrics.hp2 }}
                    mode="parallax"
                    modeConfig={{
                        parallaxScrollingScale: 0.95,
                        parallaxAdjacentItemScale: 0.85,
                        parallaxScrollingOffset: CARD_WIDTH * 0.32,
                    }}
                    onProgressChange={(_, p) => setActiveIndex(Math.round(p))}
                    renderItem={({ item, index }) => (
                        <TouchableOpacityView
                            activeOpacity={1}
                            onPress={() => {
                                setActiveIndex(index);
                                carouselRef.current?.scrollTo?.({ index, animated: true });
                            }}>
                            <View style={styles.cardWrapper}>
                                <FastImage
                                    source={item.image}
                                    style={styles.cardImage}
                                    resizeMode="stretch"
                                />
                            </View>
                        </TouchableOpacityView>
                    )}
                />
                <View style={styles.dotContainer}>
                    {data.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                index === activeIndex && styles.activeDot,
                            ]}
                        />
                    ))}
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContentContainer}
                >
                    <View style={styles.benefitsSection}>
                        <View style={styles.benefitsHeader}>
                            <FastImage source={infinityICon} resizeMode="contain" style={styles.icon} />
                            <AppText type={TWELVE} weight={INTER_SEMI_BOLD} color={OPECITY_DARK}>
                                {"  "}Included with plan
                            </AppText>
                            <View style={styles.comparisonHeader}>
                              
                                <View style={styles.tierColumn}>
                                    <AppText type={ELEVEN} weight={INTER_BOLD} color={BLACK}>
                                        {selectedTier}
                                    </AppText>
                                </View>
                            </View>
                        </View>
                        {categorizedFeatures.map((categoryData, categoryIndex) => {
                            return (
                                <View key={categoryData.category.id}>
                                    {categoryIndex === 0 &&
                                        <View style={styles.breakpointContainer}>
                                            <View style={styles.breakpointLine} />
                                            <View style={styles.breakpointContent}>
                                                <AppText type={TEN} weight={INTER_BOLD} color={BLACK} style={styles.breakpointText}>
                                                    {categoryData.category.title}
                                                </AppText>
                                            </View>
                                            <View style={styles.breakpointLine} />
                                        </View>

                                    }
                                    {categoryData.included.map((feature, index) => (
                                        <View key={feature.title || `included-${categoryIndex}-${index}`} style={styles.benefitRow}>
                                            <FastImage source={stylesRightArrow} resizeMode="contain" style={styles.arrowIcon} />
                                            <View style={styles.benefitContent}>
                                                <AppText type={TWELVE} weight={INTER_BOLD} color={BLACK}>
                                                    {feature.title}
                                                </AppText>
                                            </View>
                                            <View style={styles.availabilityRow}>
                                                <View style={styles.availabilityColumn}>
                                                    <FastImage
                                                        source={rightBlack}
                                                        resizeMode="contain"
                                                        tintColor={colors.purple}
                                                        style={styles.statusIcon}
                                                    />
                                                </View>
                                            </View>
                                        </View>
                                    ))}

                                    {categoryData.locked.map((feature, index) => (
                                        <View key={feature.title || `locked-${categoryIndex}-${index}`} style={styles.benefitRow}>
                                            <FastImage source={stylesRightArrow} resizeMode="contain" style={styles.arrowIcon} />
                                            <View style={styles.benefitContent}>
                                                <AppText type={TWELVE} weight={INTER_BOLD} color={BLACK}>
                                                    {feature.title}
                                                </AppText>
                                            </View>
                                            <View style={styles.availabilityRow}>
                                             
                                                <View style={styles.availabilityColumn}>
                                                    <FastImage
                                                        source={lockIcon}
                                                        tintColor={colors.black}
                                                        resizeMode="contain"
                                                        style={styles.statusIcon}
                                                    />
                                                </View>
                                            </View>
                                        </View>
                                    ))}

                                    {categoryIndex < categorizedFeatures.length - 1 && (
                                        <View style={styles.breakpointContainer}>
                                            <View style={styles.breakpointLine} />
                                            <View style={styles.breakpointContent}>
                                                <AppText type={TEN} weight={INTER_BOLD} color={BLACK} style={styles.breakpointText}>
                                                    {categorizedFeatures[categoryIndex + 1].category.title}
                                                </AppText>
                                            </View>
                                            <View style={styles.breakpointLine} />
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>

                {/* Purchase Button */}
                <View style={styles.purchaseButtonContainer}>
                    <AppText weight={INTER_REGULAR} type={TEN} style={styles.disclaimerText}>
                        By tapping Upgrade, your payment will be charged, your subscriptions auto-renew unless canceled at least 24 hours before the current period ends. Manage your subscription anytime in settings and you agree to our
                        <AppText style={{ textDecorationLine: "underline" }} weight={INTER_SEMI_BOLD} type={TEN}> Terms</AppText>
                    </AppText>
                    <TouchableOpacityView
                        onPress={handlePurchasePress}
                        style={[styles.purchaseButton, { backgroundColor: getButtonColor() }]}
                        activeOpacity={0.8}
                    >

                        <AppText type={FORTEEN} weight={INTER_SEMI_BOLD} color={WHITE}>
                            {weeklyPrice ? `STARTING AT - ${weeklyPrice}/week` : "STARTING AT"}
                        </AppText>
                    </TouchableOpacityView>
                </View>
            </ImageBackground>
        </AppSafeAreaView>
    );
};

export default SubscriptionAllScreen;


const styles = StyleSheet.create({
    imageBackground: { flex: 1 },

    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: metrics.hp5,
        paddingHorizontal: metrics.hp2,
    },

    closeIcon: {
        width: metrics.hp4,
        height: metrics.hp4,
    },

    textContainer: {
        alignItems: "center",
        marginTop: metrics.hp2,
    },

    cardWrapper: {
        width: CARD_WIDTH,
        marginRight: CARD_SPACING,
        justifyContent: "center",
        marginTop: metrics.hp2
    },

    cardImage: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: metrics.hp2,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: metrics.hp1 },
        shadowOpacity: 0.18,
        shadowRadius: metrics.hp1,
        elevation: 6,
    },

    dotContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: -metrics.hp2,
    },

    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#00000059",
        marginHorizontal: 4,
    },

    activeDot: {
        width: 20,
        backgroundColor: colors.purple,
        borderRadius: 6,
    },

    scrollView: {
        flex: 1,
    },

    scrollContentContainer: {
        paddingBottom: metrics.hp10,
    },

    benefitsSection: {
        paddingHorizontal: metrics.hp2,
        paddingTop: metrics.hp2,
    },

    benefitsHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: metrics.hp2,
    },

    icon: {
        height: metrics.hp2,
        width: metrics.hp2,
    },

    comparisonHeader: {
        flexDirection: "row",
        marginLeft: "auto",
        gap: metrics.hp3,
    },

    tierColumn: {
        minWidth: metrics.hp6,
        alignItems: "center",
    },

    benefitRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: metrics.hp2,
    },

    arrowIcon: {
        height: metrics.hp2,
        width: metrics.hp2,
        marginTop: metrics.hp0_5,
    },

    benefitContent: {
        flex: 1,
        marginLeft: metrics.hp1,
    },

    availabilityRow: {
        flexDirection: "row",
        gap: metrics.hp3,
        alignItems: "center",
    },

    availabilityColumn: {
        minWidth: metrics.hp6,
        alignItems: "center",
    },

    statusIcon: {
        height: metrics.hp2,
        width: metrics.hp2,
    },

    categoryTitleContainer: {
        marginTop: metrics.hp2,
        marginBottom: metrics.hp1,
        paddingHorizontal: metrics.hp2,
    },

    breakpointContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: metrics.hp2,
        marginBottom: metrics.hp2,
    },

    breakpointLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.nanoOpecity || "#E0E0E0",
    },

    breakpointContent: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: metrics.hp1,
        borderWidth: metrics.hp0_1,
        borderColor: colors.nanoOpecity,
        borderRadius: metrics.hp3,
        paddingHorizontal: metrics.hp1,
        paddingVertical: metrics.hp0_5,
    },

    breakpointCircle: {
        width: metrics.hp1,
        height: metrics.hp1,
        borderRadius: metrics.hp0_5,
        backgroundColor: colors.nanoOpecity || "#E0E0E0",
        marginHorizontal: metrics.hp1,
    },

    breakpointText: {
        marginHorizontal: metrics.hp1,
    },

    purchaseButtonContainer: {
        paddingHorizontal: metrics.hp2,
        paddingVertical: metrics.hp1,
        backgroundColor: colors.white,
    },

    disclaimerText: {
        marginBottom: metrics.hp1,
    },

    purchaseButton: {
        height: metrics.hp5,
        borderRadius: metrics.hp4,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: metrics.hp2,
    },
});

import React, { useEffect, useRef, useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { ActivityIndicator, Alert, Animated, ImageBackground, Modal, Platform, ScrollView, StyleSheet, View } from "react-native";
import { goldHeader, infinityICon, logoBlue, platinumHeader, premiumIcon, silverHeader, stylesRightArrow } from "../../helper/ImageAssets";
import metrics from "../../assets/Metrics";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import NavigationService from "../../navigation/NavigationService";
import FastImage from "react-native-fast-image";
import { AppText, BLACK, EIGHT, ELEVEN, FORTEEN, INTER_BOLD, INTER_EXTRA_BOLD, INTER_MEDIUM, INTER_REGULAR, INTER_SEMI_BOLD, LIGHT_BLACK, OPECITY_DARK, TEN, TWELVE, WHITE } from "../../common/AppText";
import { SilverPurchasedis, GoldPurchasedis, PlatinumPurchasedis } from "../../common/UiltData";
import { colors } from "../../theme/colors";
import * as RNIap from 'react-native-iap';
import { useDispatch, useSelector } from "react-redux";
import { subscriptionVerifyAPI } from "../../actions/authActions";
import LinearGradient from "react-native-linear-gradient";

// All Subscription SKUs
const ALL_SUBSCRIPTION_SKUS = Platform.select({
    android: [
        'testing_key',
        'silver_week', 'silver_month', 'silver_6month',
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

// Helper to extract subscription period and order
const extractSubscriptionPeriod = (subscription: any): { planOf: string; ofPu: string; periodOrder: number; weeksCount: number } => {
    const productId = (subscription.id || subscription.productId || subscription.productIdentifier || '').toString();

    // Try to get period from subscription offer details (Android)
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
                // Rule: 1 Month = 4 weeks, 6 Months = 24 weeks
                const weeksCount = months === 6 ? 24 : months * 4;
                return {
                    planOf: months === 1 ? '1 Month' : `${months} Months`,
                    ofPu: 'Month',
                    periodOrder: months === 1 ? 2 : (months === 6 ? 3 : 4),
                    weeksCount: weeksCount
                };
            } else if (billingPeriod.includes('Y')) {
                const years = parseInt(billingPeriod.match(/\d+/)?.[0] || '1');
                return { planOf: `${years} Year`, ofPu: 'Year', periodOrder: 5, weeksCount: years * 52 };
            }
        }
    }

    // Try iOS subscription period
    if (subscription.subscriptionPeriodNumberIOS && subscription.subscriptionPeriodUnitIOS) {
        const number = parseInt(subscription.subscriptionPeriodNumberIOS);
        const unit = subscription.subscriptionPeriodUnitIOS;
        if (unit === 'WEEK') {
            return { planOf: `${number} Week`, ofPu: 'Week', periodOrder: 1, weeksCount: number };
        } else if (unit === 'MONTH') {
            // Rule: 1 Month = 4 weeks, 6 Months = 24 weeks
            const weeksCount = number === 6 ? 24 : number * 4;
            return {
                planOf: number === 1 ? '1 Month' : `${number} Months`,
                ofPu: 'Month',
                periodOrder: number === 1 ? 2 : (number === 6 ? 3 : 4),
                weeksCount: weeksCount
            };
        } else if (unit === 'YEAR') {
            return { planOf: `${number} Year`, ofPu: 'Year', periodOrder: 5, weeksCount: number * 52 };
        }
    }

    // Fallback: Extract from productId
    if (productId.includes('6month')) return { planOf: '6 Months', ofPu: 'Month', periodOrder: 3, weeksCount: 24 };
    if (productId.includes('month')) return { planOf: '1 Month', ofPu: 'Month', periodOrder: 2, weeksCount: 4 };
    if (productId.includes('week')) return { planOf: '1 Week', ofPu: 'Week', periodOrder: 1, weeksCount: 1 };
    if (productId.includes('year')) return { planOf: '1 Year', ofPu: 'Year', periodOrder: 5, weeksCount: 52 };

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

// Helper to extract numeric price for calculations
const extractPriceNumber = (priceStr: string): { amount: number; currency: string } => {
    const amountMatch = priceStr.match(/[\d,.]+/);
    const amount = amountMatch ? parseFloat(amountMatch[0].replace(/,/g, '')) : 0;
    const currency = priceStr.replace(/[\d,.\s]+/g, '') || '₹';
    return { amount, currency };
};

const SubscriptionScreen = ({ route }: any) => {
    const initialTier = route?.params?.comming?.title ?? "Silver";
    const [selectedTier] = useState(initialTier);
    const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const userData = useSelector((state: any) => state.auth.userData);
    const dispatch = useDispatch();

    const [verifyModalVisible, setVerifyModalVisible] = useState(false);
    const [verifyStage, setVerifyStage] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [verifyError, setVerifyError] = useState<string>('');
    const [verifyResponse, setVerifyResponse] = useState<any>(null);
    const lastVerifiedKeyRef = useRef<string | null>(null);
    const isVerifyingRef = useRef(false);
    const payModalScale = useRef(new Animated.Value(0.96)).current;
    const payModalOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!verifyModalVisible) return;
        payModalOpacity.setValue(0);
        payModalScale.setValue(0.96);
        Animated.parallel([
            Animated.timing(payModalOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
            Animated.timing(payModalScale, { toValue: 1, duration: 180, useNativeDriver: true }),
        ]).start();
    }, [payModalOpacity, payModalScale, verifyModalVisible]);

    const getHeaderImage = () => {
        if (selectedTier === "Silver") return silverHeader;
        if (selectedTier === "Gold") return goldHeader;
        if (selectedTier === "Platinum") return platinumHeader;
        return silverHeader;
    };

    useEffect(() => {
        let purchaseUpdateSubscription: any;
        let purchaseErrorSubscription: any;

        const initializeIAP = async () => {
            try {
                setLoading(true);
                await RNIap.initConnection();

                // Fetch ALL products at once
                const availableProducts = await RNIap.fetchProducts({
                    skus: ALL_SUBSCRIPTION_SKUS,
                    type: 'subs'
                });

                if (availableProducts && availableProducts.length > 0) {
                    // First pass: calculate all products with weekly pricing
                    const productsWithPricing = availableProducts.map(prod => {
                        const periodInfo = extractSubscriptionPeriod(prod);
                        const fullPriceStr = extractPrice(prod);
                        const priceInfo = extractPriceNumber(fullPriceStr);

                        const n = periodInfo.weeksCount;
                        const total = priceInfo.amount;

                        // Rule: Calculate exact weekly value, then floor to 2 decimal places for weeks 1 to (n-1)
                        const weeklyFixed = Math.floor((total / n) * 100) / 100;

                        // Rule: Assign any remaining amount to the final week
                        const lastWeekAmount = Number((total - (weeklyFixed * (n - 1))).toFixed(2));

                        const weeklyPriceStr = `${priceInfo.currency}${weeklyFixed.toFixed(2)}`;

                        const productId = (prod as any).id || (prod as any).productId || '';
                        const tier = getTierFromProductId(productId);

                        return {
                            id: productId,
                            tier,
                            planOf: periodInfo.planOf,
                            amount: `${weeklyPriceStr} /`,
                            ofPu: "wk",
                            periodOrder: periodInfo.periodOrder,
                            displayPrice: fullPriceStr,
                            weeklyPriceAmount: weeklyFixed,
                            weeksCount: n,
                            totalAmount: total,
                            currency: priceInfo.currency,
                            storeTitle: (prod as any).title || (prod as any).localizedTitle || (prod as any).name || '',
                            storeDescription: (prod as any).description || (prod as any).localizedDescription || '',
                            rawSubscription: prod,
                        };
                    });
                    console.log(productsWithPricing, "productsWithPricing");

                    // Second pass: calculate discounts for each tier
                    const formattedProducts = productsWithPricing.map(prod => {
                        // Find base weekly price (1 Week plan) for this tier
                        const oneWeekPlan = productsWithPricing.find(
                            (p: any) => p.tier === prod.tier && p.weeksCount === 1
                        );
                        const baseWeeklyPrice = oneWeekPlan?.weeklyPriceAmount || 0;

                        let discount = "";
                        let discountPercent = 0;
                        let label = "";

                        // Only calculate discount for plans longer than 1 week
                        if (prod.weeksCount > 1 && baseWeeklyPrice > 0) {
                            // Calculate discount: (baseWeeklyPrice - planWeeklyPrice) / baseWeeklyPrice * 100
                            const weeklySavings = baseWeeklyPrice - prod.weeklyPriceAmount;
                            discountPercent = Number(((weeklySavings / baseWeeklyPrice) * 100).toFixed(2));
                            const roundedDiscount = Math.round(discountPercent);

                            // UI Rules: Show discount badge if ≥ 10%, add "Best Value" if ≥ 25%
                            if (roundedDiscount >= 10) {
                                discount = `Save ${roundedDiscount}%`;
                            }
                            if (roundedDiscount >= 25) {
                                label = 'Best Value';
                            }
                        }

                        return {
                            ...prod,
                            discount,
                            discountPercent,
                            label,
                        };
                    });

                    setAllProducts(formattedProducts);
                }
            } catch (err) {
                console.warn('IAP Initialization Error:', err);
            } finally {
                setLoading(false);
            }
        };

        purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async (purchase: any) => {
            try {
                const key = (purchase?.transactionId || purchase?.orderId || purchase?.purchaseToken || purchase?.productId || '').toString();
                if (isVerifyingRef.current) return;
                if (key && lastVerifiedKeyRef.current === key) return;

                isVerifyingRef.current = true;
                lastVerifiedKeyRef.current = key || null;

                setVerifyModalVisible(true);
                setVerifyStage('verifying');
                setVerifyError('');
                setVerifyResponse(null);

                setProcessing(purchase?.productId || 'verifying');

                // Required payload
                const data = {
                    productId: purchase.productId,
                    purchaseToken: purchase.purchaseToken,
                    platform: Platform.OS === 'ios' ? 'ios' : 'android',
                };

                const response: any = await dispatch(subscriptionVerifyAPI(data));
                const isOk =
                    response?.statusCode === 200 &&
                    response?.success === true &&
                    response?.data?.success === true;

                if (!isOk) {
                    throw new Error(response?.message || response?.data?.message || 'Subscription verification failed');
                }

                setVerifyResponse(response);
                setVerifyStage('success');

                // Finish/acknowledge the transaction once verification is successful
                await RNIap.finishTransaction({ purchase, isConsumable: false });
            } catch (err) {
                console.error('[Subscription] Purchase handler error:', err);
                setVerifyStage('error');
                setVerifyError((err as any)?.message || 'Something went wrong while verifying your subscription.');
            } finally {
                setProcessing(null);
                isVerifyingRef.current = false;
            }
        });

        purchaseErrorSubscription = RNIap.purchaseErrorListener((error: any) => {
            setProcessing(null);
            if (!error.message?.toLowerCase().includes('cancel')) {
                Alert.alert('Error', error.message || 'An error occurred during purchase.');
            }
        });

        initializeIAP();

        return () => {
            if (purchaseUpdateSubscription) purchaseUpdateSubscription.remove();
            if (purchaseErrorSubscription) purchaseErrorSubscription.remove();
            RNIap.endConnection();
        };
    }, []);

    // Filter products based on selected Tier
    const currentTierPlans = allProducts
        .filter(p => p.tier === selectedTier)
        .sort((a, b) => a.periodOrder - b.periodOrder);

    const handlePurchase = async () => {
        if (processing) return;
        const selectedPlan = currentTierPlans[selectedPlanIndex];
        if (!selectedPlan?.rawSubscription) return;

        try {
            setProcessing(selectedPlan.id);
            const platformRequest: any = Platform.OS === 'android'
                ? { android: { skus: [selectedPlan.id] } }
                : { ios: { sku: selectedPlan.id } };

            await RNIap.requestPurchase({ request: platformRequest, type: 'subs' });
        } catch (err: any) {
            setProcessing(null);
        }
    };

    if (loading) {
        return (
            <AppSafeAreaView>
                <ImageBackground source={getHeaderImage()} resizeMode="cover" style={styles.headerContainer}>
                    <TouchableOpacityView onPress={() => NavigationService.goBack()} style={styles.closeButton} />
                </ImageBackground>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.purple} />
                    <AppText style={{ marginTop: metrics.hp2 }} type={TWELVE} weight={INTER_MEDIUM}>Loading Plans...</AppText>
                </View>
            </AppSafeAreaView>
        );
    }

    return (
        <AppSafeAreaView>
            <ImageBackground source={getHeaderImage()} resizeMode="cover" style={styles.headerContainer}>
                <TouchableOpacityView onPress={() => NavigationService.goBack()} style={styles.closeButton} />
            </ImageBackground>

            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, backgroundColor: "#F5F7FA" }}>
                <View style={styles.PremiumText}>
                    <FastImage source={premiumIcon} resizeMode="contain" style={styles.pencilIcon} />
                    <AppText type={TWELVE} weight={INTER_SEMI_BOLD}>{"  "}Choose {selectedTier} Plan</AppText>
                </View>

                {currentTierPlans.length > 0 ? (
                    <>
                        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: metrics.hp2 }}>
                            {currentTierPlans.map((item, index) => (
                                <TouchableOpacityView
                                    activeOpacity={0.8}
                                    key={item.id}
                                    onPress={() => setSelectedPlanIndex(index)}
                                    style={[styles.planCard, {
                                        marginLeft: index === 0 ? metrics.hp2 : metrics.hp1,
                                        marginRight: index === currentTierPlans.length - 1 ? metrics.hp2 : 0,
                                        backgroundColor: selectedPlanIndex === index ? colors.purple : colors.white
                                    }]}
                                >
                                    {item.discount ? (
                                        <View style={styles.discountContainer}>
                                            <AppText type={EIGHT} weight={INTER_SEMI_BOLD} color={WHITE}>
                                                {item.discount}
                                            </AppText>
                                        </View>
                                    ) : null}

                                    <AppText type={TWELVE} weight={INTER_MEDIUM} color={selectedPlanIndex === index ? WHITE : LIGHT_BLACK}>
                                        {item.planOf}
                                    </AppText>
                                    <AppText style={{ marginTop: metrics.hp1 }} type={FORTEEN} weight={INTER_EXTRA_BOLD} color={selectedPlanIndex === index ? WHITE : LIGHT_BLACK}>
                                        {item.amount}
                                    </AppText>
                                    <AppText type={TWELVE} weight={INTER_MEDIUM} color={selectedPlanIndex === index ? WHITE : LIGHT_BLACK}>
                                        {item.ofPu}
                                    </AppText>
                                    <View style={[styles.dotContainer, {
                                        borderWidth: selectedPlanIndex === index ? metrics.hp0_6 : metrics.hp0_2,
                                        borderColor: selectedPlanIndex === index ? colors.white : colors.lightBlack,
                                    }]} />
                                </TouchableOpacityView>
                            ))}
                        </View>

                        <View style={styles.PremiumText}>
                            <FastImage source={infinityICon} resizeMode="contain" style={styles.pencilIcon} />
                            <AppText type={TWELVE} weight={INTER_SEMI_BOLD}>{"  "}Included with {selectedTier}</AppText>
                        </View>
                        <View style={{ marginTop: metrics.hp2, paddingHorizontal: metrics.hp2, paddingBottom: metrics.hp10 }}>
                            {(() => {
                                // Get benefits based on selected tier
                                let benefits = SilverPurchasedis;
                                if (selectedTier === "Gold") {
                                    benefits = GoldPurchasedis;
                                } else if (selectedTier === "Platinum") {
                                    benefits = PlatinumPurchasedis;
                                }

                                return benefits?.map((item, index) => {
                                    return (
                                        <View key={item.id || index.toString()} style={styles.benefitRow}>
                                            <FastImage source={stylesRightArrow} resizeMode="contain" style={styles.pencilIcon} />
                                            <View style={{ marginLeft: metrics.hp1 }}>
                                                <AppText type={TWELVE} weight={INTER_BOLD} color={BLACK}>{item.title}</AppText>
                                                <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>{item.subTitle}</AppText>
                                            </View>
                                        </View>
                                    )
                                })
                            })()}
                        </View>
                    </>
                ) : (
                    <View style={styles.loadingContainer}>
                        <AppText type={FORTEEN} weight={INTER_SEMI_BOLD}>No plans found for {selectedTier}</AppText>
                    </View>
                )}
            </ScrollView>

            <Modal
                visible={verifyModalVisible}
                transparent
                animationType="fade"
                statusBarTranslucent
                hardwareAccelerated
                // Dismissible only via button
                onRequestClose={() => { }}
            >
                <View style={styles.payBackdrop}>
                    <Animated.View style={[styles.payCard, { opacity: payModalOpacity, transform: [{ scale: payModalScale }] }]}>
                        <View style={styles.payContent}>
                            <View style={styles.payIconRing}>
                                <FastImage source={logoBlue} resizeMode="contain" style={styles.payIcon} />
                            </View>

                            <AppText
                                type={FORTEEN}
                                weight={INTER_EXTRA_BOLD}
                                color={LIGHT_BLACK}
                                style={{ textAlign: "center", marginTop: metrics.hp1 }}
                            >
                                {verifyStage === "success"
                                    ? "Payment Successful"
                                    : verifyStage === "error"
                                        ? "Payment Verification Failed"
                                        : "Verifying Payment"}
                            </AppText>

                            {verifyStage === "success" ? (
                                <>
                                    <AppText
                                        type={ELEVEN}
                                        weight={INTER_REGULAR}
                                        color={OPECITY_DARK}
                                        style={{ textAlign: "center", marginTop: metrics.hp1 }}
                                    >
                                        Your payment has been completed successfully. Enjoy all the premium features without any interruption.
                                    </AppText>
                                    <AppText
                                        type={ELEVEN}
                                        weight={INTER_MEDIUM}
                                        color={OPECITY_DARK}
                                        style={{ textAlign: "center", marginTop: metrics.hp1 }}
                                    >
                                        Enjoy unlimited access and exclusive benefits!
                                    </AppText>

                                    {verifyResponse?.data?.transactionId ? (
                                        <View style={styles.payMetaBox}>
                                            <AppText type={TEN} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                                                Transaction ID
                                            </AppText>
                                            <AppText type={TEN} weight={INTER_MEDIUM} color={OPECITY_DARK} style={{ marginTop: metrics.hp0_5 }}>
                                                {verifyResponse?.data?.transactionId}
                                            </AppText>
                                        </View>
                                    ) : null}
                                </>
                            ) : verifyStage === "error" ? (
                                <AppText
                                    type={ELEVEN}
                                    weight={INTER_REGULAR}
                                    color={OPECITY_DARK}
                                    style={{ textAlign: "center", marginTop: metrics.hp1 }}
                                >
                                    {verifyError || "We couldn’t verify your subscription right now. Please try again."}
                                </AppText>
                            ) : (
                                <View style={styles.payVerifyingRow}>
                                    <ActivityIndicator size="small" color={colors.purple} />
                                    <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK} style={{ marginLeft: metrics.hp1 }}>
                                        Please wait…
                                    </AppText>
                                </View>
                            )}

                            <TouchableOpacityView
                                activeOpacity={0.9}
                                disabled={verifyStage === "verifying"}
                                onPress={() => {
                                    if (verifyStage === "verifying") return;
                                    setVerifyModalVisible(false);
                                    if (verifyStage === "success") {
                                        NavigationService.goBack();
                                    }
                                }}
                                style={[styles.payBtnWrap, verifyStage === "verifying" && { opacity: 0.6 }]}
                            >
                                <LinearGradient
                                    colors={verifyStage === "error" ? [colors.red, "#FF5B6B"] : ["#6F13F2", "#2B7CFF"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.payBtn}
                                >
                                    <AppText color={WHITE} weight={INTER_SEMI_BOLD} type={FORTEEN}>
                                        {verifyStage === "success" ? "Done" : verifyStage === "error" ? "OK" : "Verifying…"}
                                    </AppText>
                                </LinearGradient>
                            </TouchableOpacityView>
                        </View>
                    </Animated.View>
                </View>
            </Modal>

            <View style={styles.bottomcontainer}>
                {/* <AppText weight={INTER_REGULAR} type={TEN}>
                    By tapping Upgrade, your payment will be charged, your subscriptions auto-renew unless canceled at least 24 hours before the current period ends. Manage your subscription anytime in settings and you agree to our
                    <AppText style={{ textDecorationLine: "underline" }} weight={INTER_SEMI_BOLD} type={TEN}> Terms</AppText>
                </AppText> */}
                <TouchableOpacityView
                    onPress={handlePurchase}
                    disabled={!!processing || currentTierPlans.length === 0}
                    style={[styles.buttonContiner, (processing || currentTierPlans.length === 0) && styles.buttonDisabled]}
                >
                    {processing ? (
                        <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                        <AppText color={WHITE} weight={INTER_SEMI_BOLD} type={FORTEEN}>
                            Get {currentTierPlans[selectedPlanIndex]?.planOf || 'Plan'} for {currentTierPlans[selectedPlanIndex]?.displayPrice || ''}
                        </AppText>
                    )}
                </TouchableOpacityView>
            </View>
        </AppSafeAreaView>
    );
};

export default SubscriptionScreen;

const styles = StyleSheet.create({
    headerContainer: { height: metrics.hp28, width: "100%", marginTop: metrics.hp5 },
    closeButton: { height: metrics.hp5, width: metrics.hp8 },
    pencilIcon: { height: metrics.hp2, width: metrics.hp2, marginTop: metrics.hp0_5 },
    PremiumText: { flexDirection: "row", alignItems: "center", marginTop: metrics.hp2, paddingHorizontal: metrics.hp2 },
    planCard: { height: metrics.hp16, width: metrics.hp12, backgroundColor: colors.white, borderRadius: metrics.hp1_5, alignItems: "center", justifyContent: "center" },
    dotContainer: { height: metrics.hp2_5, width: metrics.hp2_5, marginTop: metrics.hp1_5, borderRadius: metrics.hp50 },
    benefitRow: { flexDirection: "row", marginBottom: metrics.hp2 },
    bottomcontainer: { paddingHorizontal: metrics.hp2, paddingVertical: metrics.hp1, backgroundColor: colors.white },
    buttonContiner: { height: metrics.hp5, borderRadius: metrics.hp4, backgroundColor: colors.purple, alignItems: "center", justifyContent: "center", marginTop: metrics.hp2, marginBottom: metrics.hp1 },
    buttonDisabled: { opacity: 0.5 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    discountContainer: {
        width: metrics.hp6_5,
        height: metrics.hp2,
        backgroundColor: colors.lightBlack,
        borderRadius: metrics.hp1,
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        top: -metrics.hp0_6
    },
    payBackdrop: {
        flex: 1,
        backgroundColor: "#00000066",
        justifyContent: "center",
        paddingHorizontal: metrics.hp2,
    },
    payCard: {
        borderRadius: metrics.hp2,
        backgroundColor: colors.white,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 18,
        elevation: 12,
    },
    payAccent: {
        height: metrics.hp1,
        width: "100%",
    },
    payContent: {
        paddingHorizontal: metrics.hp2_5,
        paddingTop: metrics.hp2_5,
        paddingBottom: metrics.hp2,
        alignItems: "center",
    },
    payIconRing: {
        height: metrics.hp10,
        width: metrics.hp10,
        borderRadius: metrics.hp50,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: metrics.hp0_1,
        borderColor: "#6F13F233",
        shadowColor: "#6F13F2",
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 14,
        elevation: 6,
    },
    payIcon: {
        height: metrics.hp7,
        width: metrics.hp7,
    },
    payVerifyingRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: metrics.hp2,
    },
    payMetaBox: {
        marginTop: metrics.hp2,
        width: "100%",
        borderRadius: metrics.hp1_5,
        borderWidth: metrics.hp0_1,
        borderColor: colors.nanoOpecity,
        backgroundColor: "#FFFFFF",
        paddingVertical: metrics.hp1,
        paddingHorizontal: metrics.hp1_5,
        alignItems: "center",
    },
    payBtnWrap: {
        width: "100%",
        marginTop: metrics.hp2_5,
        borderRadius: metrics.hp4,
        overflow: "hidden",
    },
    payBtn: {
        height: metrics.hp5_5,
        width: "100%",
        borderRadius: metrics.hp4,
        alignItems: "center",
        justifyContent: "center",
    },
});

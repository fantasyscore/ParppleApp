import React, { useEffect, useRef, useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { ActivityIndicator, Alert, Animated, Dimensions, ImageBackground, Modal, NativeModules, Platform, ScrollView, StyleSheet, View, Linking } from "react-native";
import { benifitsIconNew, BottomLayer, closeNewWhiteIcon, goldHeader, GoldSubscriptionImage, infinityICon, legalBackgroundSettin, logoBlue, platinumHeader, PlatiumSubscriptionImage, premiumIcon, purchaseImageNew, silverHeader, stylesRightArrow, subScriptionBackgroundNew, subscriptionSelectedNew, timeShowNewBackground } from "../../helper/ImageAssets";
import metrics from "../../assets/Metrics";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import NavigationService from "../../navigation/NavigationService";
import FastImage from "react-native-fast-image";
import { AppText, BLACK, EIGHT, EIGHTEEN, ELEVEN, FORTEEN, INTER_BOLD, INTER_EXTRA_BOLD, INTER_MEDIUM, INTER_REGULAR, INTER_SEMI_BOLD, LIGHT_BLACK, OPECITY, OPECITY_DARK, SCHEHERAZADE_BOLD, SIXTEEN, TEN, THIRTEEN, TWELVE, TWENTY, TWENTY_FOUR, TWENTY_TWO, WHITE } from "../../common/AppText";
import { SilverPurchasedis, GoldPurchasedis, PlatinumPurchasedis } from "../../common/UiltData";
import { colors, newColor } from "../../theme/colors";
import * as RNIap from '../../utils/iapWrapper';
import { trackSuccessfulPurchase, getPurchaseTransactionId } from '../../services/analyticsService';
import { getAlreadyRecoveredTransactionIds, addRecoveredTransactionIds } from '../../services/purchaseRecoveryService';
import { useDispatch, useSelector } from "react-redux";
import { getProfile, subscriptionVerifyAPI } from "../../actions/authActions";
import LinearGradient from "react-native-linear-gradient";
import { appOperation } from "../../appOperation";
import { useCallback } from "react";
import { useMemo } from "react";
import analytics from '@react-native-firebase/analytics';
import { check, openSettings, PERMISSIONS, request, RESULTS } from "react-native-permissions";
// '20_fortesting silver_week', 'silver_month', 'silver_6month',

// All Subscription SKUs
// silver_weekly', 'silver_month', 'silver_6month',
const ALL_SUBSCRIPTION_SKUS = Platform.select({
    android: [
        'publish_one_week', 'publish_one_month', 'publish_six_months',
        'gold_week', 'gold_month', 'gold_6month',
        'platinum_week', 'platinum_month', 'platinum_6month'
    ],
    ios: [
        'silver_week', 'silver_month', 'silver_6month',
        'gold_week', 'gold_month', 'gold_6month',
        'platinum_week', 'platinum_month', 'platinum_6month'
    ],
}) ?? [
        'publish_one_week', 'publish_one_month', 'publish_six_months',
        'gold_week', 'gold_month', 'gold_6month',
        'platinum_week', 'platinum_month', 'platinum_6month'
    ];

// Helper to extract tier from productId
const getTierFromProductId = (productId: string) => {
    if (productId.toLowerCase().includes('silver')) return 'Silver';
    if (productId.toLowerCase().includes('gold')) return 'Gold';
    if (productId.toLowerCase().includes('platinum')) return 'Platinum';
    return 'Silver';
};
type FaceLivenessResult =
    | { status?: string; message?: string }
    | string
    | null
    | undefined;
const { width, height } = Dimensions.get('window');
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
    const [faceVerificationPromptVisible, setFaceVerificationPromptVisible] = useState(false);
    const userData = useSelector((state: any) => state.auth.userData);
    const dispatch = useDispatch();

    const [verifyModalVisible, setVerifyModalVisible] = useState(false);
    const [verifyStage, setVerifyStage] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [verifyError, setVerifyError] = useState<string>('');
    const [verifyResponse, setVerifyResponse] = useState<any>(null);
    const lastVerifiedKeyRef = useRef<string | null>(null);
    const isVerifyingRef = useRef(false);
    const purchaseInitiatedRef = useRef(false);
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
        if (selectedTier === "Gold") return Platform.OS === "ios" ? goldHeader : GoldSubscriptionImage;
        if (selectedTier === "Platinum") return Platform.OS === "ios" ? platinumHeader : PlatiumSubscriptionImage;
        return silverHeader;
    };

    useEffect(() => {
        let purchaseUpdateSubscription: any;
        let purchaseErrorSubscription: any;

        const initializeIAP = async () => {
            try {
                setLoading(true);
                await RNIap.initConnection();

                // Fetch subscriptions using getSubscriptions for v12.3.0
                const rawProducts = await RNIap.getSubscriptions({ skus: ALL_SUBSCRIPTION_SKUS });
                const availableProducts = Array.isArray(rawProducts) ? rawProducts : [];
                console.log(availableProducts, "availableProducts");

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
            let isInitiated = false;
            try {
                const key = getPurchaseTransactionId(purchase);

                // Duplicate protection check
                const alreadyVerified = await getAlreadyRecoveredTransactionIds();
                if (key && alreadyVerified.has(key)) {
                    console.log(`[Subscription] Transaction ${key} already verified. Skipping duplicate.`);
                    try {
                        await RNIap.finishTransaction({ purchase, isConsumable: false });
                    } catch (e) {
                        console.warn('[Subscription] Duplicate finishTransaction skipped/failed:', e);
                    }
                    return;
                }

                if (isVerifyingRef.current) return;
                if (key && lastVerifiedKeyRef.current === key) return;

                isVerifyingRef.current = true;
                lastVerifiedKeyRef.current = key || null;

                isInitiated = purchaseInitiatedRef.current;
                purchaseInitiatedRef.current = false;

                if (isInitiated) {
                    setVerifyModalVisible(true);
                    setVerifyStage('verifying');
                    setVerifyError('');
                    setVerifyResponse(null);
                    setProcessing(purchase?.productId || 'verifying');
                }

                // Required payload
                const data = {
                    productId: purchase.productId,
                    purchaseToken: purchase.purchaseToken,
                    platform: Platform.OS === 'ios' ? 'ios' : 'android',
                    transactionReceipt: purchase?.transactionReceipt,
                };
                const newdata = {
                    productId: purchase.productId,
                    purchaseToken: purchase.transactionReceipt,
                    platform: Platform.OS === 'ios' ? 'ios' : 'android',
                    transactionReceipt: purchase?.transactionReceipt
                }
                const response: any = Platform.OS === "ios" ? await dispatch(subscriptionVerifyAPI(newdata)) : await dispatch(subscriptionVerifyAPI(data));
                const isOk = response?.statusCode === 200

                if (!isOk) {
                    throw new Error(response?.message || response?.data?.message || 'Subscription verification failed');
                }

                // await analytics().logPurchase({
                //     transaction_id: purchase.transactionId,
                //     currency: 'INR',
                //     value: 4,
                //     items: [
                //       {
                //         item_id: purchase.productId,
                //         item_name: purchase.productId,
                //         price: 4,
                //         quantity: 1,
                //       },
                //     ],
                //   });
                // Track successful purchase in Firebase Analytics (after verification, before persisting recovery id)
                await trackSuccessfulPurchase(purchase, 'subs');

                if (key) {
                    await addRecoveredTransactionIds([key]);
                }

                if (isInitiated) {
                    setVerifyResponse(response);
                    setVerifyStage('success');
                }
                try {
                    await RNIap.finishTransaction({ purchase, isConsumable: false });
                } catch (finishErr) {
                    console.warn('[Subscription] Client finishTransaction failed:', finishErr);
                }
                dispatch(getProfile(true))
            } catch (err) {
                console.error('[Subscription] Purchase handler error:', err);
                if (isInitiated) {
                    setVerifyStage('error');
                    setVerifyError((err as any)?.message || 'Something went wrong while verifying your subscription.');
                }
            } finally {
                setProcessing(null);
                isVerifyingRef.current = false;
            }
        });

        purchaseErrorSubscription = RNIap.purchaseErrorListener((error: any) => {
            setProcessing(null);
            purchaseInitiatedRef.current = false;
            if (!error.message?.toLowerCase().includes('cancel')) {
                Alert.alert('Errors', error.message || 'An error occurred during purchase.');
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

    const FaceLiveness = (NativeModules as any)?.FaceLiveness as
        | { startLiveness?: (sessionId: string) => Promise<FaceLivenessResult> }
        | undefined;

    const moduleAvailable = useMemo(() => {
        return Boolean(FaceLiveness && typeof FaceLiveness.startLiveness === 'function');
    }, [FaceLiveness]);

    const [resultText, setResultText] = useState<string>('');
    const [faceVerificationPromptFailedVisible, setFaceVerificationPromptFailedVisible] = useState(false);
    const [faceVerificationPromptSuccessVisible, setFaceVerificationPromptSuccessVisible] = useState(false);
    const handleCloseFaceVerificationSuccessPrompt = useCallback(() => {
        setFaceVerificationPromptSuccessVisible(false);
    }, []);
    const handleCloseFaceVerificationFailedPrompt = useCallback(() => {
        setFaceVerificationPromptFailedVisible(false);
    }, []);

    const getCameraPermissionType = useCallback(() => {
        return Platform.OS === "ios" ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
    }, []);

    const ensureCameraPermission = useCallback(async (): Promise<boolean> => {
        try {
            const permissionType = getCameraPermissionType();
            const currentStatus = await check(permissionType);

            if (currentStatus === RESULTS.GRANTED) return true;

            if (currentStatus === RESULTS.BLOCKED) {
                Alert.alert(
                    "Camera permission required",
                    "Camera permission is disabled. Please enable it from Settings to continue face verification.",
                    [
                        { text: "Open Settings", onPress: () => openSettings().catch(() => null) },
                        { text: "Cancel", style: "cancel" },
                    ]
                );
                return false;
            }

            const requestedStatus = await request(permissionType);
            if (requestedStatus === RESULTS.GRANTED) return true;

            Alert.alert(
                "Camera permission denied",
                "Face verification requires camera access. You can enable it from Settings.",
                [
                    { text: "Open Settings", onPress: () => openSettings().catch(() => null) },
                    { text: "Cancel", style: "cancel" },
                ]
            );
            return false;
        } catch (error) {
            console.warn("Camera permission check failed:", error);
            Alert.alert("Permission error", "Unable to check camera permission. Please try again.");
            return false;
        }
    }, [getCameraPermissionType]);

    const start = async () => {
        if (!moduleAvailable) {
            const msg =
                'FaceLiveness native module not found. Make sure you rebuilt the app (not just Metro reload).';
            console.warn('[FaceLivenessTest] ' + msg);
            setResultText(msg);
            return;
        }

        // setLoading(true);
        setResultText('');

        try {
            const isCameraAllowed = await ensureCameraPermission();
            if (!isCameraAllowed) {
                return;
            }

            console.log('[FaceLivenessTest] Requesting session from /faceId/liveliness');
            const sessionResp = await (appOperation.customer as any).createFaceLivenessSessionAPI();
            const sessionId = sessionResp?.data
            console.log(sessionId, "sessionResp");

            if (!sessionId) {
                throw new Error('Session API did not return a valid sessionId');
            }

            console.log('[FaceLivenessTest] Starting native liveness with sessionId:', sessionId);
            if (!FaceLiveness || typeof FaceLiveness.startLiveness !== 'function') {
                throw new Error('FaceLiveness native module is not available on this device.');
            }
            const res = await FaceLiveness.startLiveness(sessionId);
            console.log('[FaceLivenessTest] Native result:', res);

            // Normalize a few common shapes.
            if (res && typeof res === 'object') {
                const status = (res as any).status;
                if (status === 'success') {
                    setFaceVerificationPromptVisible(false);
                    console.log('[FaceLivenessTest] Verifying session via faceId/verifySessionResult');
                    const verifyResp = await (appOperation.customer as any).verifyFaceLivenessSessionAPI({
                        sessionId,
                    });
                    if (verifyResp?.success) {
                        if (verifyResp?.data?.confidence >= 90) {
                            dispatch(getProfile(true))
                            setFaceVerificationPromptSuccessVisible(true)
                        } else if (verifyResp?.data?.confidence >= 80) {
                            dispatch(getProfile(true))
                            setFaceVerificationPromptSuccessVisible(true)
                        } else {
                            setFaceVerificationPromptFailedVisible(true);
                        }
                    }
                } else if (status === 'cancelled') {
                    Alert.alert((res as any).message ? `Cancelled: ${(res as any).message}` : 'Cancelled')
                } else {
                    Alert.alert(`Result: ${JSON.stringify(res)}`)
                }
            } else {
                Alert.alert(res ? `Result: ${String(res)}` : 'Liveness Success')
            }
        } catch (e: any) {
            const msg = e?.message ?? String(e);
            console.error('[FaceLivenessTest] Error:', e);
            setFaceVerificationPromptVisible(false);
            setFaceVerificationPromptFailedVisible(true);
        } finally {
            // setLoading(false);
        }
    };

    const handleRestorePurchases = async () => {
        try {
            setProcessing("restore");
            const purchases = await RNIap.getAvailablePurchases();
            if (purchases && purchases.length > 0) {
                Alert.alert("Restored", "Your active purchases have been restored successfully.");
            } else {
                Alert.alert("Restore", "No active subscriptions were found to restore.");
            }
        } catch (err: any) {
            console.warn("Restore error:", err);
            Alert.alert("Error", "Failed to restore purchases. Please try again.");
        } finally {
            setProcessing(null);
        }
    };

    const handlePurchase = async () => {
        if (Platform.OS === "ios" && userData?.faceVerified === false) {
            setFaceVerificationPromptVisible(true)
        } else {
            if (processing) return;
            const selectedPlan = currentTierPlans[selectedPlanIndex];
            if (!selectedPlan?.rawSubscription) return;

            const productId = selectedPlan.id;
            if (!productId) return;

            try {
                setProcessing(productId);
                purchaseInitiatedRef.current = true;

                if (Platform.OS === 'ios') {
                    await RNIap.requestSubscription({
                        sku: productId,
                        andDangerouslyFinishTransactionAutomaticallyIOS: false,
                    });
                } else {
                    const offerToken = selectedPlan.rawSubscription?.subscriptionOfferDetails?.[0]?.offerToken;
                    if (!offerToken) {
                        throw new Error('No subscription offer token found for this product');
                    }
                    await RNIap.requestSubscription({
                        subscriptionOffers: [
                            {
                                sku: productId,
                                offerToken: offerToken,
                            }
                        ]
                    });
                }
            } catch (err: any) {
                setProcessing(null);
                purchaseInitiatedRef.current = false;
                if (!err?.message?.toLowerCase?.().includes('cancel')) {
                    console.log("Error object:", err);
                    console.log("Stack:", err?.stack);
                    console.log("JSON:", JSON.stringify(err, null, 2));
                }
            }
        }
    };

    const handleCloseFaceVerificationPrompt = useCallback(() => {
        setFaceVerificationPromptVisible(false);
    }, []);

    if (loading) {
        return (
            <AppSafeAreaView color={newColor.blackNew}>
                <ImageBackground source={purchaseImageNew} resizeMode="stretch" style={{ height: metrics.hp30, width: "100%" }}>
                    <TouchableOpacityView onPress={() => NavigationService.goBack()} style={{ width: "100%", paddingVertical: metrics.hp3, marginTop: metrics.hp2, alignItems: "flex-end", paddingHorizontal: metrics.hp2 }}>
                        <FastImage source={closeNewWhiteIcon} resizeMode="contain" style={{ height: metrics.hp4, width: metrics.hp4 }} />
                    </TouchableOpacityView>
                </ImageBackground>
            </AppSafeAreaView>
        );
    };


    return (
        <AppSafeAreaView color={newColor.blackNew}>
            <ImageBackground source={purchaseImageNew} resizeMode="stretch" style={{ height: metrics.hp30, width: "100%" }}>
                <TouchableOpacityView onPress={() => NavigationService.goBack()} style={{ width: "100%", paddingVertical: metrics.hp3, marginTop: metrics.hp2, alignItems: "flex-end", paddingHorizontal: metrics.hp2 }}>
                    <FastImage source={closeNewWhiteIcon} resizeMode="contain" style={{ height: metrics.hp4, width: metrics.hp4 }} />
                </TouchableOpacityView>
            </ImageBackground>
            <LinearGradient colors={["#21212350", "#212123"]} style={{ paddingHorizontal: metrics.hp2, marginTop: -metrics.hp5 }}>
                <AppText style={{ textAlign: "center" }} weight={SCHEHERAZADE_BOLD} type={TWENTY_FOUR} color={WHITE}>
                    Unlock the World Behind
                </AppText>
                <AppText style={{ marginTop: -metrics.hp3, textAlign: "center" }} weight={SCHEHERAZADE_BOLD} type={TWENTY_FOUR} color={WHITE}>
                    the Mask.
                </AppText>
                <AppText style={{ textAlign: "center", marginTop: -metrics.hp1_5 }} type={FORTEEN} weight={INTER_MEDIUM} color={OPECITY}>
                    Your VIP Pass to Anonymous Attraction.
                </AppText>
            </LinearGradient>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: metrics.hp10 }} style={{ paddingHorizontal: metrics.hp2, marginTop: metrics.hp3, }}>
                {currentTierPlans?.map((item, index) => {
                    return (
                        <TouchableOpacityView activeOpacity={1} onPress={() => setSelectedPlanIndex(index)}>
                            <ImageBackground source={selectedPlanIndex === index ? subscriptionSelectedNew : subScriptionBackgroundNew} resizeMode="stretch" style={{ height: metrics.hp10, marginBottom: metrics.hp2, justifyContent: "space-between", paddingHorizontal: metrics.hp2, flexDirection: "row", alignItems: "center" }} >
                                <View>
                                    <AppText style={{ marginTop: metrics.hp1 }} type={FORTEEN} weight={INTER_MEDIUM} color={selectedPlanIndex === index ? BLACK : WHITE}>
                                        {item.planOf}
                                    </AppText>
                                    <AppText style={{ marginTop: -metrics.hp1 }} type={TWENTY} weight={SCHEHERAZADE_BOLD} color={selectedPlanIndex === index ? BLACK : WHITE}>
                                        {item.displayPrice}
                                    </AppText>
                                </View>
                                <AppText style={{ marginTop: metrics.hp3 }} type={THIRTEEN} weight={INTER_MEDIUM} color={selectedPlanIndex === index ? BLACK : WHITE}>
                                    {item.amount} {item.ofPu}{"  "}
                                </AppText>
                                {index == 1 ?
                                    <ImageBackground source={timeShowNewBackground} tintColor={selectedPlanIndex === index ? colors.black : "#E6B7A8"} resizeMode="contain" style={{ height: metrics.hp4_6, width: metrics.hp15, position: "absolute", right: metrics.hp0_5, top: -metrics.hp2 }}>
                                        <AppText style={{ textAlign: "center", marginTop: metrics.hp1 }} type={THIRTEEN} weight={INTER_MEDIUM} color={selectedPlanIndex === index ? WHITE : BLACK}>
                                            Most Popular
                                        </AppText>
                                    </ImageBackground> : <></>}
                            </ImageBackground>
                        </TouchableOpacityView>
                    )
                })}
                <View style={{ height: metrics.hp0_1, backgroundColor: "#524440", marginTop: metrics.hp3, justifyContent: "center", alignItems: "center" }}>
                    <ImageBackground source={timeShowNewBackground} resizeMode="contain" style={{ height: metrics.hp4_6, width: metrics.hp15, alignItems: "center", justifyContent: "center" }}>
                        <AppText type={THIRTEEN} weight={INTER_MEDIUM} color={WHITE}>
                            Benefits
                        </AppText>
                    </ImageBackground>
                </View>
                <View style={{ marginTop: metrics.hp2, flexDirection: "row", alignItems: "center" }}>
                    <FastImage source={benifitsIconNew} resizeMode="contain" style={{ height: metrics.hp3, width: metrics.hp3, marginTop: -metrics.hp1 }} />
                    <View style={{ marginHorizontal: metrics.hp2 }}>
                        <AppText type={SIXTEEN} weight={SCHEHERAZADE_BOLD} color={WHITE}>
                            Unlimites Likes
                        </AppText>
                        <AppText style={{ marginTop: -metrics.hp1 }} color={OPECITY_DARK} type={TWELVE} >
                            Unlimited freedom to like and connect
                        </AppText>
                    </View>
                </View>
                <View style={{ marginTop: metrics.hp2, flexDirection: "row", alignItems: "center" }}>
                    <FastImage source={benifitsIconNew} resizeMode="contain" style={{ height: metrics.hp3, width: metrics.hp3, marginTop: -metrics.hp1 }} />
                    <View style={{ marginHorizontal: metrics.hp2 }}>
                        <AppText type={SIXTEEN} weight={SCHEHERAZADE_BOLD} color={WHITE}>
                            Priority Likes
                        </AppText>
                        <AppText style={{ marginTop: -metrics.hp1 }} color={OPECITY_DARK} type={TWELVE} >
                            Your likes are shown first to increase match chances.
                        </AppText>
                    </View>
                </View>
                <View style={{ marginTop: metrics.hp2, flexDirection: "row", alignItems: "center" }}>
                    <FastImage source={benifitsIconNew} resizeMode="contain" style={{ height: metrics.hp3, width: metrics.hp3, marginTop: -metrics.hp1 }} />
                    <View style={{ marginHorizontal: metrics.hp2 }}>
                        <AppText type={SIXTEEN} weight={SCHEHERAZADE_BOLD} color={WHITE}>
                            Verified Profiles
                        </AppText>
                        <AppText style={{ marginTop: -metrics.hp1 }} color={OPECITY_DARK} type={TWELVE} >
                            Get instantly match with the verified profiles with real connections.
                        </AppText>
                    </View>
                </View>
                <View style={{ marginTop: metrics.hp2, flexDirection: "row", alignItems: "center" }}>
                    <FastImage source={benifitsIconNew} resizeMode="contain" style={{ height: metrics.hp3, width: metrics.hp3, marginTop: -metrics.hp1 }} />
                    <View style={{ marginHorizontal: metrics.hp2 }}>
                        <AppText type={SIXTEEN} weight={SCHEHERAZADE_BOLD} color={WHITE}>
                            See Who Likes You
                        </AppText>
                        <AppText style={{ marginTop: -metrics.hp1 }} color={OPECITY_DARK} type={TWELVE} >
                            Instantly view and match with interested
                            profiles.
                        </AppText>
                    </View>
                </View>
                <View style={{ marginTop: metrics.hp2, flexDirection: "row", alignItems: "center" }}>
                    <FastImage source={benifitsIconNew} resizeMode="contain" style={{ height: metrics.hp3, width: metrics.hp3, marginTop: -metrics.hp1 }} />
                    <View style={{ marginHorizontal: metrics.hp2 }}>
                        <AppText type={SIXTEEN} weight={SCHEHERAZADE_BOLD} color={WHITE}>
                            Who Viewed You
                        </AppText>
                        <AppText style={{ marginTop: -metrics.hp1 }} color={OPECITY_DARK} type={TWELVE} >
                            See who’s interested in you.
                        </AppText>
                    </View>
                </View>
                <ImageBackground source={legalBackgroundSettin} resizeMode="stretch" tintColor={colors.black} style={{ height: metrics.hp13, paddingHorizontal: metrics.hp2, alignItems: "center", justifyContent: "center", marginTop: metrics.hp2 }}>
                    <AppText style={{ textAlign: "center" }} color={WHITE} type={THIRTEEN} weight={INTER_REGULAR}>
                        Your membership renews automatically for uninterrupted access. Cancel at least 24 hours before renewal. Manage your membership anytime in Account Settings.
                    </AppText>
                </ImageBackground>
            </ScrollView>
            <ImageBackground source={BottomLayer} resizeMode="stretch" style={styles.bottomLayer}>
                <TouchableOpacityView style={{width:"100%", paddingHorizontal:metrics.hp2}} onPress={handlePurchase}
                    disabled={!!processing || currentTierPlans.length === 0}>
                    <LinearGradient colors={["#D08FA9", "#FDD2C1"]} style={{ height: metrics.hp7, width: "100%", alignItems: "center", justifyContent: "center" }}>
                        <AppText type={EIGHTEEN} weight={SCHEHERAZADE_BOLD} color={BLACK}>
                            Get {currentTierPlans[selectedPlanIndex]?.planOf || 'Plan'} for {currentTierPlans[selectedPlanIndex]?.displayPrice || ''}
                        </AppText>
                    </LinearGradient>
                </TouchableOpacityView>
            </ImageBackground>
            {/* <ImageBackground source={getHeaderImage()} resizeMode="cover" style={styles.headerContainer}>
                <TouchableOpacityView onPress={() => NavigationService.goBack()} style={styles.closeButton} />
            </ImageBackground> */}

            {/* <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, backgroundColor: "#F5F7FA" }}>
                <View style={styles.PremiumText}>
                    <FastImage source={premiumIcon} resizeMode="contain" style={styles.pencilIcon} />
                    <AppText type={TWELVE} weight={INTER_SEMI_BOLD}>{"  "}Choose {selectedTier === "Platinum" ? "Flame" : selectedTier === "Gold" ? "Spark" : selectedTier} Plans</AppText>
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
                            <AppText type={TWELVE} weight={INTER_SEMI_BOLD}>{"  "}Included with {selectedTier === "Platinum" ? "Flame" : selectedTier === "Gold" ? "Spark" : selectedTier}</AppText>
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
            </ScrollView> */}

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

            {/* <View style={styles.bottomcontainer}>
               
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
                {Platform.OS === 'ios' && (
                    <View style={styles.iosLegalContainer}>
                        <AppText style={styles.iosDisclaimerText} type={TEN}>
                            A subscription will auto-renew unless auto-renew is turned off at least 24 hours before the end of the current period. Your account will be charged for renewal within 24 hours prior to the end of the current period. Subscriptions may be managed and auto-renewal may be turned off in your iTunes Account Settings after purchase.
                        </AppText>
                        <View style={styles.iosLegalLinksRow}>
                            <TouchableOpacityView onPress={() => Linking.openURL("https://www.purpple.com/terms")}>
                                <AppText style={styles.iosLegalLink} type={TEN}>Terms of Use (EULA)</AppText>
                            </TouchableOpacityView>
                            <AppText style={styles.iosLegalDivider} type={TEN}>|</AppText>
                            <TouchableOpacityView onPress={() => Linking.openURL("https://www.purpple.com/privacy")}>
                                <AppText style={styles.iosLegalLink} type={TEN}>Privacy Policy</AppText>
                            </TouchableOpacityView>
                            <AppText style={styles.iosLegalDivider} type={TEN}>|</AppText>
                            <TouchableOpacityView onPress={handleRestorePurchases}>
                                <AppText style={styles.iosLegalLink} type={TEN}>Restore Purchases</AppText>
                            </TouchableOpacityView>
                        </View>
                    </View>
                )}
            </View> */}

            <Modal
                animationType="fade"
                transparent
                visible={faceVerificationPromptVisible}
                onRequestClose={handleCloseFaceVerificationPrompt}
            >
                <View style={styles.centeredView}>
                    <View style={styles.locationPromptContainer}>
                        <AppText type={TWENTY_TWO} weight={SCHEHERAZADE_BOLD} color={LIGHT_BLACK} style={{ textAlign: "center" }}>
                            Verify Your Identity
                        </AppText>
                        <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK} style={{ textAlign: "center", marginTop: metrics.hp0 }}>
                            Complete a quick face verification to secure your account. This process takes only a few seconds.
                        </AppText>
                        <TouchableOpacityView
                            onPress={start}
                            style={[styles.locationPromptButton, { backgroundColor: colors.purple, borderColor: colors.purple, marginTop: metrics.hp3 }]}
                        >
                            <AppText color={WHITE} weight={INTER_SEMI_BOLD} type={TWELVE}>
                                Start Verification
                            </AppText>
                        </TouchableOpacityView>
                        <TouchableOpacityView
                            onPress={handleCloseFaceVerificationPrompt}
                            style={[styles.locationPromptButton, { backgroundColor: colors.transparent, borderColor: colors.transparent, marginTop: metrics.hp1 }]}
                        >
                            <AppText color={LIGHT_BLACK} weight={INTER_BOLD} type={FORTEEN}>
                                Skip for Now
                            </AppText>
                        </TouchableOpacityView>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="fade"
                transparent
                visible={faceVerificationPromptSuccessVisible}
                onRequestClose={handleCloseFaceVerificationSuccessPrompt}
            >
                <View style={styles.centeredView}>
                    <View style={styles.locationPromptContainer}>
                        <AppText type={TWENTY_TWO} weight={SCHEHERAZADE_BOLD} color={LIGHT_BLACK} style={{ textAlign: "center" }}>
                            Verification Successful
                        </AppText>
                        <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK} style={{ textAlign: "center", marginTop: metrics.hp0_5 }}>
                            Your face verification has been completed successfully. Your account is now fully verified.
                        </AppText>
                        <TouchableOpacityView
                            onPress={handleCloseFaceVerificationSuccessPrompt}
                            style={[styles.locationPromptButton, { backgroundColor: colors.purple, borderColor: colors.purple, marginTop: metrics.hp3 }]}
                        >
                            <AppText color={WHITE} weight={INTER_SEMI_BOLD} type={TWELVE}>
                                Continue
                            </AppText>
                        </TouchableOpacityView>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="fade"
                transparent
                visible={faceVerificationPromptFailedVisible}
                onRequestClose={handleCloseFaceVerificationFailedPrompt}
            >
                <View style={styles.centeredView}>
                    <View style={styles.locationPromptContainer}>
                        <AppText type={TWENTY_TWO} weight={SCHEHERAZADE_BOLD} color={LIGHT_BLACK} style={{ textAlign: "center" }}>
                            Verification Failed
                        </AppText>
                        <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK} style={{ textAlign: "center", marginTop: metrics.hp0_5 }}>
                            We were unable to verify your identity. Please try again in a well-lit environment and ensure your face is clearly visible.
                        </AppText>
                        <TouchableOpacityView
                            onPress={start}
                            style={[styles.locationPromptButton, { backgroundColor: colors.purple, borderColor: colors.purple, marginTop: metrics.hp3 }]}
                        >
                            <AppText color={WHITE} weight={INTER_SEMI_BOLD} type={TWELVE}>
                                Try Again
                            </AppText>
                        </TouchableOpacityView>
                        <TouchableOpacityView
                            onPress={handleCloseFaceVerificationFailedPrompt}
                            style={[styles.locationPromptButton, { backgroundColor: colors.transparent, borderColor: colors.transparent, marginTop: metrics.hp15_5 }]}
                        >
                            <AppText color={LIGHT_BLACK} weight={INTER_BOLD} type={FORTEEN}>
                                Cancel
                            </AppText>
                        </TouchableOpacityView>
                    </View>
                </View>
            </Modal>



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
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', },
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
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.transparentBlack,
        paddingHorizontal: metrics.hp2
    },
    locationPromptContainer: {
        backgroundColor: colors.white,
        width: width / 1.15,
        borderRadius: metrics.hp2,
        paddingHorizontal: metrics.hp2,
        paddingVertical: metrics.hp3,
    },
    locationPromptButton: {
        height: metrics.hp5,
        borderWidth: 1,
        borderColor: colors.darkBorder,
        borderRadius: metrics.hp4,
        alignItems: "center",
        justifyContent: "center",
        marginTop: metrics.hp1_5,
    },
    iosLegalContainer: {
        marginTop: metrics.hp1_5,
        alignItems: 'center',
    },
    iosDisclaimerText: {
        textAlign: 'center',
        color: '#7C7C7C',
        fontSize: 8,
        lineHeight: 12,
        paddingHorizontal: metrics.hp1,
    },
    iosLegalLinksRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: metrics.hp1,
        flexWrap: 'wrap',
    },
    iosLegalLink: {
        color: colors.purple,
        textDecorationLine: 'underline',
        fontSize: 10,
    },
    iosLegalDivider: {
        marginHorizontal: metrics.hp0_8,
        color: '#7C7C7C',
        fontSize: 10,
    },
    bottomLayer: {
        width: "100%",
        paddingVertical: metrics.hp2,
        alignItems: "center",
        backgroundColor: newColor.blackNew,
    },
});

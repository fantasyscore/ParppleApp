import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { ActivityIndicator, Alert, Animated, Dimensions, ImageBackground, Linking, Modal, NativeModules, Platform, StyleSheet, View } from "react-native";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import NavigationService from "../../navigation/NavigationService";
import { goldCard, goldForSuperLIke, logoBlue, orBottomIcon, premiumIcon, superLikeHeader } from "../../helper/ImageAssets";
import LinearGradient from "react-native-linear-gradient";
import metrics from "../../assets/Metrics";
import FastImage from "react-native-fast-image";
import { AppText, EIGHT, ELEVEN, FORTEEN, INTER_BOLD, INTER_EXTRA_BOLD, INTER_MEDIUM, INTER_REGULAR, INTER_SEMI_BOLD, LIGHT_BLACK, OPECITY_DARK, SCHEHERAZADE_BOLD, TEN, TWELVE, TWENTY_TWO, WHITE } from "../../common/AppText";
import { colors } from "../../theme/colors";
import * as RNIap from 'react-native-iap';
import { NAVIGATION_SUBSCRIPTION_SCREEN } from "../../navigation/routes";
import { useDispatch, useSelector } from "react-redux";
import { deleteAccountAPI, getProfile, iosPucrchesAPIIs, verifyconsumableitemsAPI } from "../../actions/authActions";
import { appOperation } from "../../appOperation";
import { check, openSettings, PERMISSIONS, request, RESULTS } from "react-native-permissions";

// Product IDs must match exactly what you created in App Store Connect (iOS) / Play Console (Android).
// react-native-iap v12 (iOS branch): use getProducts({ skus }). v14 (Android) uses fetchProducts.
const PRODUCT_SKUS = Platform.select({
    android: ['10_super_likes', '3_super_likes', '1_super_like'],
    ios: ['10_super_likes', '3_super_likes', '1_super_like'],
}) ?? ['10_super_likes', '3_super_likes', '1_super_like'];
// Helper to extract numeric price for calculations
const extractPriceNumber = (priceStr: string): { amount: number; currency: string } => {
    const amountMatch = priceStr.match(/[\d,.]+/);
    const amount = amountMatch ? parseFloat(amountMatch[0].replace(/,/g, '')) : 0;
    const currency = priceStr.replace(/[\d,.\s]+/g, '') || '₹';
    return { amount, currency };
};
const { width, height } = Dimensions.get('window');

type FaceLivenessResult =
    | { status?: string; message?: string }
    | string
    | null
    | undefined;

const SuperLikePurchese = () => {
    const dispatch = useDispatch();
    const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [retryCount, setRetryCount] = useState(0);
    const [processing, setProcessing] = useState<string | null>(null);
    const lastVerifiedKeyRef = useRef<string | null>(null);
    const isVerifyingRef = useRef(false);
    const purchaseInitiatedRef = useRef(false);
    const [verifyModalVisible, setVerifyModalVisible] = useState(false);
    const [verifyStage, setVerifyStage] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [verifyError, setVerifyError] = useState<string>('');
    const [verifyResponse, setVerifyResponse] = useState<any>(null);
    const userData = useSelector((state: any) => state.auth.userData);
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

    useEffect(() => {
        let purchaseUpdateSubscription: any;
        let purchaseErrorSubscription: any;

        const initializeIAP = async () => {
            try {
                setLoading(true);
                await RNIap.initConnection();

                const rawProducts = await RNIap.getProducts({ skus: PRODUCT_SKUS });
                const availableProducts = Array.isArray(rawProducts) ? rawProducts : [];

                if (__DEV__ && availableProducts.length === 0) {
                    console.warn('[Super Like IAP] No products returned. Check: 1) Product IDs in app match App Store Connect exactly, 2) Paid Apps agreement signed, 3) Bank/tax set up, 4) Products Ready to Submit, 5) Same Apple ID sandbox, 6) Bundle ID matches.');
                }

                if (availableProducts.length > 0) {
                    const productsWithPricing = availableProducts.map((prod: any) => {
                        const productId = (prod.productId ?? prod.id ?? '').toString();
                        const likeCountStr = productId.match(/\d+/)?.[0] ?? '1';
                        const n = parseInt(likeCountStr, 10);
                        const fullPriceStr = prod.localizedPrice ?? prod.displayPrice ?? prod.price ?? '₹0';
                        const priceInfo = extractPriceNumber(String(fullPriceStr));
                        const total = priceInfo.amount;
                        const perItemFixed = Math.floor((total / n) * 100) / 100;
                        const perItemPriceStr = `${priceInfo.currency}${perItemFixed.toFixed(2)}`;
                        return {
                            ...prod,
                            productId: prod.productId ?? prod.id,
                            likeCount: n,
                            displayPrice: fullPriceStr,
                            perItemPrice: perItemPriceStr,
                            perItemPriceAmount: perItemFixed,
                            totalAmount: total,
                            currency: priceInfo.currency,
                        };
                    });

                    const singleUnitPack = productsWithPricing.find((p: any) => p.likeCount === 1);
                    const baseUnitPrice = singleUnitPack?.perItemPriceAmount ?? 0;

                    const formattedProducts = productsWithPricing.map((prod: any) => {
                        const n = prod.likeCount;
                        let discount = '';
                        let discountPercent = 0;
                        if (n > 1 && baseUnitPrice > 0) {
                            const perUnitSavings = baseUnitPrice - prod.perItemPriceAmount;
                            discountPercent = Number(((perUnitSavings / baseUnitPrice) * 100).toFixed(2));
                            const roundedDiscount = Math.round(discountPercent);
                            if (roundedDiscount >= 10) discount = `Save ${roundedDiscount}%`;
                        }
                        return { ...prod, discount, discountPercent };
                    });

                    formattedProducts.sort((a: any, b: any) => b.likeCount - a.likeCount);
                    setProducts(formattedProducts);
                }
            } catch (err) {
                console.warn('IAP Initialization Error:', err);
                if (__DEV__ && Platform.OS === 'ios') {
                    console.warn('[Super Like IAP] iOS: ensure you use getProducts (v12). Product IDs must match App Store Connect exactly.');
                }
            } finally {
                setLoading(false);
            }
        };

        purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async (purchase: any) => {
            let isInitiated = false;
            try {
                const key = (purchase?.transactionId || purchase?.orderId || purchase?.purchaseToken || purchase?.productId || '').toString();
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

                // Same verification API pattern as subscriptions
                const data = {
                    productId: purchase.productId,
                    purchaseToken: purchase.purchaseToken,
                    platform: Platform.OS === 'ios' ? 'ios' : 'android',
                    orderId: purchase.id,
                    transactionReceipt: purchase?.transactionReceipt,
                    transactionId: purchase?.transactionId
                };
                const newdata = {
                    productId: purchase?.productId,
                    transactionReceipt: purchase?.transactionReceipt,
                    transactionId: purchase?.transactionId
                }

                const response: any = Platform.OS === "ios" ? await dispatch(iosPucrchesAPIIs(newdata)) : await dispatch(verifyconsumableitemsAPI(data));
                const isOk = response?.statusCode === 200
                if (!isOk) {
                    throw new Error(response?.message || response?.data?.message || 'Super Like verification failed');
                }

                if (isInitiated) {
                    setVerifyResponse(response);
                    setVerifyStage('success');
                }
                dispatch(getProfile(true))
                try {
                    await RNIap.finishTransaction({ purchase, isConsumable: true });
                } catch (finishErr) {
                    console.warn('[Super Like] Client finishTransaction failed (possibly already consumed by server):', finishErr);
                }
            } catch (err) {
                console.error('[Super Like] Purchase handler error:', err);
                if (isInitiated) {
                    setVerifyStage('error');
                    setVerifyError((err as any)?.message || 'Something went wrong while verifying your purchase.');
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
                Alert.alert('Error', error.message || 'An error occurred during purchase.');
            }
        });

        initializeIAP();

        return () => {
            if (purchaseUpdateSubscription) purchaseUpdateSubscription.remove();
            if (purchaseErrorSubscription) purchaseErrorSubscription.remove();
            RNIap.endConnection();
        };
    }, [retryCount]);
    const FaceLiveness = (NativeModules as any)?.FaceLiveness as
        | { startLiveness?: (sessionId: string) => Promise<FaceLivenessResult> }
        | undefined;

    const moduleAvailable = useMemo(() => {
        return Boolean(FaceLiveness && typeof FaceLiveness.startLiveness === 'function');
    }, [FaceLiveness]);

    const [resultText, setResultText] = useState<string>('');
    const [faceVerificationPromptFailedVisible, setFaceVerificationPromptFailedVisible] = useState(false);
    const [faceVerificationPromptSuccessVisible, setFaceVerificationPromptSuccessVisible] = useState(false);
    const [faceVerificationPromptVisible, setFaceVerificationPromptVisible] = useState(false);
    const handleCloseFaceVerificationSuccessPrompt = useCallback(() => {
        setFaceVerificationPromptSuccessVisible(false);
    }, []);
    const handleCloseFaceVerificationFailedPrompt = useCallback(() => {
        setFaceVerificationPromptFailedVisible(false);
    }, []);
    const handleCloseFaceVerificationPrompt = useCallback(() => {
        setFaceVerificationPromptVisible(false);
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

    // iOS (v12): requestPurchase({ sku }). Android (v14): requestPurchase({ request: { android: { skus } }, type: 'in-app' }).
    const handlePurchase = async () => {
        if (Platform.OS === "ios" && userData?.faceVerified === false) {
            setFaceVerificationPromptVisible(true)
        } else {
            if (processing) return;
            const selectedProduct = products[selectedPlanIndex];
            if (!selectedProduct) return;

            const productId = (selectedProduct as any).productId ?? (selectedProduct as any).id;
            if (!productId) return;

            try {
                setProcessing(String(productId));
                purchaseInitiatedRef.current = true;
                if (Platform.OS === 'ios') {
                    await RNIap.requestPurchase({
                        sku: productId,
                        andDangerouslyFinishTransactionAutomaticallyIOS: false,
                    });
                } else {
                    await RNIap.requestPurchase({ skus: [productId] });
                }
            } catch (err: any) {
                setProcessing(null);
                purchaseInitiatedRef.current = false;
                if (!err?.message?.toLowerCase?.().includes('cancel')) {
                    console.warn('Purchase Error:', err);
                }
            }
        }
    };

    const retryLoadProducts = () => {
        setLoading(true);
        setRetryCount((c) => c + 1);
    };

    if (loading) {
        return (
            <AppSafeAreaView style={{ backgroundColor: "#F5F7FA" }}>
                <ImageBackground source={superLikeHeader} resizeMode="cover" style={styles.headerContainer}>
                    <TouchableOpacityView onPress={() => NavigationService.goBack()} style={styles.closeButton} />
                </ImageBackground>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.purple} />
                    <AppText style={{ marginTop: metrics.hp2 }} type={TWELVE} weight={INTER_MEDIUM}>Loading Super Likes...</AppText>
                </View>
            </AppSafeAreaView>
        );
    }

    const subscriptionItem = { id: '1', icon: goldCard, title: 'Gold' };

    // No products loaded — common on iOS if App Store Connect not fully set up. Show retry and hint.
    if (products.length === 0) {
        return (
            <AppSafeAreaView style={{ backgroundColor: "#F5F7FA" }}>
                <ImageBackground source={superLikeHeader} resizeMode="cover" style={styles.headerContainer}>
                    <TouchableOpacityView onPress={() => NavigationService.goBack()} style={styles.closeButton} />
                </ImageBackground>
                <View style={styles.PremiumText}>
                    <FastImage source={premiumIcon} resizeMode="contain" style={styles.pencilIcon} />
                    <AppText type={TWELVE} weight={INTER_SEMI_BOLD}>{"  "}Choose your Super Like</AppText>
                </View>
                <View style={[styles.loadingContainer, { paddingHorizontal: metrics.hp2 }]}>
                    <AppText type={TWELVE} weight={INTER_MEDIUM} color={LIGHT_BLACK} style={{ textAlign: 'center' }}>
                        Products could not be loaded. Check App Store Connect: Product IDs must match exactly (10_super_likes, 3_super_likes, 1_super_like), Paid Apps agreement signed, and products Ready to Submit.
                    </AppText>
                    <TouchableOpacityView onPress={retryLoadProducts} style={[styles.buttonContiner, { marginTop: metrics.hp2 }]}>
                        <AppText color={WHITE} weight={INTER_SEMI_BOLD} type={FORTEEN}>Retry</AppText>
                    </TouchableOpacityView>
                </View>
            </AppSafeAreaView>
        );
    }

    return (
        <AppSafeAreaView style={{ backgroundColor: "#F5F7FA" }}>
            <ImageBackground source={superLikeHeader} resizeMode="cover" style={styles.headerContainer}>
                <TouchableOpacityView onPress={() => NavigationService.goBack()} style={styles.closeButton} />
            </ImageBackground>
            <View style={styles.PremiumText}>
                <FastImage source={premiumIcon} resizeMode="contain" style={styles.pencilIcon} />
                <AppText type={TWELVE} weight={INTER_SEMI_BOLD}>{"  "}Choose your Super Like</AppText>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: metrics.hp2 }}>
                {products.map((item, index) => (
                    <TouchableOpacityView
                        key={item.productId || item.id}
                        onPress={() => setSelectedPlanIndex(index)}
                        activeOpacity={0.8}
                        style={[styles.planCard, {
                            marginLeft: index === 0 ? metrics.hp2 : metrics.hp1,
                            marginRight: index === products.length - 1 ? metrics.hp2 : 0,
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
                        <AppText type={FORTEEN} weight={INTER_EXTRA_BOLD} color={selectedPlanIndex === index ? WHITE : LIGHT_BLACK}>
                            {item.likeCount}
                        </AppText>
                        <AppText type={TEN} weight={INTER_MEDIUM} color={selectedPlanIndex === index ? WHITE : LIGHT_BLACK}>
                            Super Likes
                        </AppText>
                        <AppText style={{ marginTop: metrics.hp1_5 }} type={TWELVE} weight={INTER_MEDIUM} color={selectedPlanIndex === index ? WHITE : LIGHT_BLACK}>
                            {item.perItemPrice} / ea
                        </AppText>
                        <View style={[styles.dotContainer, {
                            borderWidth: selectedPlanIndex === index ? metrics.hp0_6 : metrics.hp0_2,
                            borderColor: selectedPlanIndex === index ? colors.white : colors.lightBlack,
                        }]} />
                    </TouchableOpacityView>
                ))}
            </View>
            <FastImage source={orBottomIcon} resizeMode="contain" style={{ height: metrics.hp2_4, width: "100%", marginTop: metrics.hp4 }} />
            <TouchableOpacityView onPress={() => NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN, { comming: subscriptionItem })}>
                <FastImage source={goldForSuperLIke} resizeMode="contain" style={styles.imageiContainer} />
            </TouchableOpacityView>
            <View style={styles.bottomcontainer}>
                <AppText weight={INTER_REGULAR} type={TEN}>
                    By tapping Upgrade, your payment will be charged... Manage your subscription anytime in settings and you agree to our
                    <AppText onPress={() => Linking.openURL("https://parpple.com/terms_conditions")} style={{ textDecorationLine: "underline" }} weight={INTER_SEMI_BOLD} type={TEN}> Terms & Conditions</AppText>
                    <AppText onPress={() => Linking.openURL("https://parpple.com/privacy_policy")} style={{ textDecorationLine: "underline" }} weight={INTER_SEMI_BOLD} type={TEN}> Privacy Policy</AppText>
                </AppText>
                <TouchableOpacityView
                    onPress={handlePurchase}
                    disabled={!!processing || products.length === 0}
                    style={[styles.buttonContiner, (processing || products.length === 0) && styles.buttonDisabled]}
                >
                    {processing ? (
                        <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                        <AppText color={WHITE} weight={INTER_SEMI_BOLD} type={FORTEEN}>
                            Get {products[selectedPlanIndex]?.likeCount || ''} Super Likes for {products[selectedPlanIndex]?.displayPrice || ''}
                        </AppText>
                    )}
                </TouchableOpacityView>
            </View>

            <Modal
                visible={verifyModalVisible}
                transparent
                animationType="fade"
                statusBarTranslucent
                hardwareAccelerated
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
                                        Your payment has been completed successfully. Super Likes have been added to your account.
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
                                    {verifyError || "We couldn't verify your purchase right now. Please try again."}
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
    )
};

export default SuperLikePurchese;

const styles = StyleSheet.create({
    headerContainer: { height: metrics.hp28, width: "100%", marginTop: metrics.hp5 },
    closeButton: { height: metrics.hp5, width: metrics.hp8 },
    PremiumText: { flexDirection: "row", alignItems: "center", marginTop: metrics.hp2, paddingHorizontal: metrics.hp2 },
    pencilIcon: { height: metrics.hp2, width: metrics.hp2 },
    planCard: { height: metrics.hp16, width: metrics.hp12, backgroundColor: colors.white, borderRadius: metrics.hp1_5, alignItems: "center", justifyContent: "center" },
    dotContainer: { height: metrics.hp2_5, width: metrics.hp2_5, marginTop: metrics.hp1_5, borderRadius: metrics.hp50 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    bottomcontainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        paddingHorizontal: metrics.hp2,
        paddingVertical: metrics.hp2,
        backgroundColor: colors.white,
        borderTopLeftRadius: metrics.hp2,
        borderTopRightRadius: metrics.hp2,
    },
    buttonContiner: {
        height: metrics.hp6,
        borderRadius: metrics.hp4,
        backgroundColor: colors.purple,
        alignItems: "center",
        justifyContent: "center",
        marginTop: metrics.hp2,
    },
    buttonDisabled: {
        opacity: 0.5,
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
    },
    imageiContainer: {
        // shadowColor: colors.black,
        // shadowOffset: { width: 0, height: metrics.hp1_2 },
        // shadowOpacity: 0.22,
        // shadowRadius: metrics.hp1,
        elevation: 8,
        height: metrics.hp10, width: "100%", marginTop: metrics.hp3, marginBottom: metrics.hp4,
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
});

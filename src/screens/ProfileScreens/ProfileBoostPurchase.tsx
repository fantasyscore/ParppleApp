import React, { useEffect, useRef, useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { ActivityIndicator, Alert, Animated, FlatList, ImageBackground, Modal, Platform, StyleSheet, View } from "react-native";
import OneTimeProductHeader from "../../common/OneTimeProductHeader";
import { flasIcon, goldCard, logoBlue, orBottomIcon, premiumIcon, superlIkeBackGround, upgradPlan } from "../../helper/ImageAssets";
import LinearGradient from "react-native-linear-gradient";
import { AppText, BLACK, EIGHT, ELEVEN, FORTEEN, INTER_BOLD, INTER_EXTRA_BOLD, INTER_MEDIUM, INTER_REGULAR, INTER_SEMI_BOLD, LIGHT_BLACK, OPECITY_DARK, SCHEHERAZADE_BOLD, SIXTEEN, TEN, THIRTEEN, TWELVE, TWENTY_TWO, WHITE } from "../../common/AppText";
import metrics from "../../assets/Metrics";
import FastImage from "react-native-fast-image";
import { colors } from "../../theme/colors";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import * as RNIap from 'react-native-iap';
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_SUBSCRIPTION_SCREEN } from "../../navigation/routes";
import { useDispatch } from "react-redux";
import { getProfile, iosPucrchesAPIIs, subscriptionVerifyAPI, verifyconsumableitemsAPI } from "../../actions/authActions";

// One-time Product SKUs
const PRODUCT_SKUS = Platform.select({
    android: ['10_boost', '3_boost', '1_boost'],
    ios: ['10_boost', '3_boost', '1_boost'],
}) ?? ['10_boost', '3_boost', '1_boost'];

// Helper to extract numeric price for calculations
const extractPriceNumber = (priceStr: string): { amount: number; currency: string } => {
    const amountMatch = priceStr.match(/[\d,.]+/);
    const amount = amountMatch ? parseFloat(amountMatch[0].replace(/,/g, '')) : 0;
    const currency = priceStr.replace(/[\d,.\s]+/g, '') || '₹';
    return { amount, currency };
};

const ProfileBoostPurchase = () => {
    const dispatch = useDispatch();
    const [select, setSelect] = useState(0);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const lastVerifiedKeyRef = useRef<string | null>(null);
    const isVerifyingRef = useRef(false);
    const [verifyModalVisible, setVerifyModalVisible] = useState(false);
    const [verifyStage, setVerifyStage] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [verifyError, setVerifyError] = useState<string>('');
    const [verifyResponse, setVerifyResponse] = useState<any>(null);
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

                // iOS (v12): getProducts({ skus }) for in-app consumables. v14 has fetchProducts({ skus, type: 'in-app' }).
                let rawProducts: any[] = [];
                if (Platform.OS === 'ios') {
                    rawProducts = await RNIap.getProducts({ skus: PRODUCT_SKUS });
                } else if (typeof (RNIap as any).fetchProducts === 'function') {
                    rawProducts = await (RNIap as any).fetchProducts({ skus: PRODUCT_SKUS, type: 'in-app' });
                } else {
                    rawProducts = await RNIap.getProducts({ skus: PRODUCT_SKUS });
                }
                const availableProducts = Array.isArray(rawProducts) ? rawProducts : [];

                if (availableProducts.length > 0) {
                    // First pass: calculate all products with per-boost pricing
                    const productsWithPricing = availableProducts.map((prod: any) => {
                        const productId = (prod.productId || prod.id || '').toString();
                        const boostCountStr = productId.match(/\d+/)?.[0] || '1';
                        const n = parseInt(boostCountStr);
                        
                        const fullPriceStr = prod.localizedPrice || prod.displayPrice || '₹0';
                        const priceInfo = extractPriceNumber(fullPriceStr);
                        const total = priceInfo.amount;

                        // Rule: Calculate exact per-boost value, then floor to 2 decimal places for boosts 1 to (n-1)
                        const perBoostFixed = Math.floor((total / n) * 100) / 100;
                        
                        // Rule: Assign any remaining amount to the final boost
                        const lastBoostAmount = Number((total - (perBoostFixed * (n - 1))).toFixed(2));
                        
                        // Proof check
                        const proofSum = Number(((perBoostFixed * (n - 1)) + lastBoostAmount).toFixed(2));
                        
                        // Debug log for Proof
                        console.log(`[Boost IAP Proof Check]`);
                        console.log(`- Selected pack: ${n} Boosts`);
                        console.log(`- Total price: ${total}`);
                        console.log(`- Breakdown: ${n > 1 ? `${perBoostFixed} x ${n - 1} + ${lastBoostAmount} (final boost)` : `${total} x 1`}`);
                        console.log(`- Proof sum: ${proofSum} (Matches: ${proofSum === total})`);

                        const perBoostPriceStr = `${priceInfo.currency}${perBoostFixed.toFixed(2)}`;

                        return {
                            ...prod,
                            boostCount: n,
                            displayPrice: fullPriceStr,
                            perBoostPrice: perBoostPriceStr,
                            perBoostPriceAmount: perBoostFixed,
                            totalAmount: total,
                            currency: priceInfo.currency,
                        };
                    });

                    // Find base price (single unit pack)
                    const singleUnitPack = productsWithPricing.find((p: any) => p.boostCount === 1);
                    const baseUnitPrice = singleUnitPack?.perBoostPriceAmount || 0;

                    // Second pass: calculate discounts and labels
                    const formattedProducts = productsWithPricing.map((prod: any) => {
                        const n = prod.boostCount;
                        let discount = "";
                        let discountPercent = 0;
                        let label = "";

                        if (n > 1 && baseUnitPrice > 0) {
                            // Calculate discount: (baseUnitPrice - perUnitPackPrice) / baseUnitPrice * 100
                            const perUnitSavings = baseUnitPrice - prod.perBoostPriceAmount;
                            discountPercent = Number(((perUnitSavings / baseUnitPrice) * 100).toFixed(2));
                            const roundedDiscount = Math.round(discountPercent);

                            // UI Rules: Show discount badge if ≥ 10%, add "Best Value" if ≥ 25%
                            if (roundedDiscount >= 10) {
                                discount = `Save ${roundedDiscount}%`;
                            }
                            if (roundedDiscount >= 25) {
                                label = 'Best Value';
                            } else if (n === 3) {
                                label = 'Most Popular';
                            }
                        }

                        return {
                            ...prod,
                            discount,
                            discountPercent,
                            label,
                        };
                    });

                    // Sort descending by boost count
                    formattedProducts.sort((a: any, b: any) => b.boostCount - a.boostCount);

                    setProducts(formattedProducts);
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

                const data = {
                    productId: purchase.productId,
                    purchaseToken: purchase.purchaseToken,
                    platform: Platform.OS === 'ios' ? 'ios' : 'android',
                    orderId: purchase.id,
                };
                const newdata = {
                    productId :purchase?.productId,
                    transactionReceipt:purchase?.transactionReceipt,
                    transactionId:purchase?.transactionId
                }
                const response: any = await dispatch(iosPucrchesAPIIs(newdata))
                // const response: any = await dispatch(verifyconsumableitemsAPI(data));
                const isOk = response?.statusCode === 200
                if (!isOk) {
                    throw new Error(response?.message || response?.data?.message || 'Boost verification failed');
                }

                setVerifyResponse(response);
                setVerifyStage('success');
                await RNIap.finishTransaction({ purchase, isConsumable: true });
                dispatch(getProfile(true))
            } catch (err) {
                console.error('[Boost] Purchase handler error:', err);
                setVerifyStage('error');
                setVerifyError((err as any)?.message || 'Something went wrong while verifying your purchase.');
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

    const handlePurchase = async () => {
        if (processing) return;
        const selectedProduct = products[select];
        if (!selectedProduct) return;

        const productId = (selectedProduct as any).productId || (selectedProduct as any).id;
        if (!productId) return;

        try {
            setProcessing(String(productId));

            // iOS (v12): requestPurchase({ sku }). Android (v14): requestPurchase({ request: { android: { skus } }, type: 'in-app' }).
            if (Platform.OS === 'ios') {
                await RNIap.requestPurchase({
                    sku: productId,
                    andDangerouslyFinishTransactionAutomaticallyIOS: false,
                });
            } else if (typeof (RNIap as any).fetchProducts === 'function') {
                await (RNIap as any).requestPurchase({
                    request: { android: { skus: [productId] } },
                    type: 'in-app',
                });
            } else {
                await RNIap.requestPurchase({ skus: [productId] });
            }
        } catch (err: any) {
            setProcessing(null);
            if (!err?.message?.toLowerCase?.().includes('cancel')) {
                console.warn('Purchase Error:', err);
            }
        }
    };

    const renderItem = ({ item, index }: { item: any, index: number }) => {
        const isSelected = select === index;
        return (
            <TouchableOpacityView activeOpacity={0.8} onPress={() => setSelect(index)} style={[styles.conatiner, { backgroundColor: isSelected ? colors.purple : colors.white }]}>
             
                <View>
                    {item.label ? (
                        <View style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: metrics.hp0_1, borderColor: isSelected ? colors.white : colors.black, paddingBottom: metrics.hp0_2, marginBottom: metrics.hp0_5 }}>
                            <FastImage source={flasIcon} resizeMode="contain" tintColor={isSelected ? colors.white : colors.black} style={{ height: metrics.hp1_5, width: metrics.hp1_5 }} />
                            <AppText type={TWELVE} color={isSelected ? WHITE : BLACK} weight={INTER_MEDIUM}>
                                {"  "}{item.label}
                            </AppText>
                        </View>
                    ) : null}
                    <AppText color={isSelected ? WHITE : BLACK} type={SIXTEEN} weight={INTER_EXTRA_BOLD}>
                        {item.boostCount}<AppText color={isSelected ? WHITE : BLACK} type={FORTEEN} weight={INTER_BOLD}>
                            {"  "}{item.boostCount>1?  "Spotlights" : "Spotlight"}
                        </AppText>
                    </AppText>
                </View>
                <View style={{alignItems:"flex-end", marginTop:-metrics.hp0_1}}>
                {item.discount ? (
                    <View style={styles.discountContainer}>
                        <AppText type={EIGHT} weight={INTER_SEMI_BOLD} color={WHITE}>
                            {item.discount}
                        </AppText>
                    </View>
                ) : null}
                <AppText style={{marginTop:metrics.hp1}} type={THIRTEEN} color={isSelected ? WHITE : BLACK} weight={INTER_MEDIUM}>
                    {item.perBoostPrice}/ea
                </AppText>
                </View>
            </TouchableOpacityView>
        )
    }

    if (loading) {
        return (
            <AppSafeAreaView>
                <ImageBackground source={superlIkeBackGround} resizeMode="cover" style={{ flex: 1 }}>
                    <OneTimeProductHeader />
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.purple} />
                        <AppText style={{ marginTop: metrics.hp2 }} type={TWELVE} weight={INTER_MEDIUM}>Loading Boosts...</AppText>
                    </View>
                </ImageBackground>
            </AppSafeAreaView>
        );
    }
    const subscriptionItem = { id: '1', icon: goldCard, title: 'Gold' }

    return (
        <AppSafeAreaView>
            <ImageBackground source={superlIkeBackGround} resizeMode="cover" style={{ flex: 1 }}>
                <OneTimeProductHeader />
                <View style={{ alignItems: "center", justifyContent: "center", marginTop: metrics.hp7 }}>
                    <AppText weight={SCHEHERAZADE_BOLD} type={TWENTY_TWO} color={BLACK}>
                        From Seen to Swiped Right
                    </AppText>
                    <AppText style={{ marginTop: -metrics.hp3 }} weight={SCHEHERAZADE_BOLD} type={TWENTY_TWO} color={BLACK}>
                        Maximize Your Match Potential!
                    </AppText>
                </View>
                <View style={styles.PremiumText}>
                    <FastImage source={premiumIcon} resizeMode="contain" style={styles.pencilIcon} />
                    <AppText type={TWELVE} weight={INTER_SEMI_BOLD}>{"  "}Choose your spotlight</AppText>
                </View>
                <FlatList 
                    data={products}
                    keyExtractor={(item: any) => (item.productId || item.id).toString()}
                    showsVerticalScrollIndicator={false}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingHorizontal: metrics.hp2, marginTop: metrics.hp2 }} 
                />
                   {/* <FastImage source={orBottomIcon} resizeMode="contain" style={{ height: metrics.hp2_4, width: "100%", marginTop: metrics.hp4 }} />
            <TouchableOpacityView  onPress={() => NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN, { comming: subscriptionItem })}>
                <FastImage source={upgradPlan} resizeMode="contain" style={styles.imageiContainer} />
            </TouchableOpacityView> */}
                <View style={styles.bottomcontainer}>
                    <AppText weight={INTER_REGULAR} type={TEN}>
                        By tapping Upgrade, your payment will be charged... Manage your subscription anytime in settings and you agree to our
                        <AppText style={{ textDecorationLine: "underline" }} weight={INTER_SEMI_BOLD} type={TEN}> Terms</AppText>
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
                                Get {products[select]?.boostCount || ''} {products[select]?.boostCount>1?  "Spotlights" : "Spotlight"} for {products[select]?.displayPrice || ''}
                            </AppText>
                        )}
                    </TouchableOpacityView>
                </View>
            </ImageBackground>

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
                                        Your payment has been completed successfully. Boosts have been added to your account.
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
        </AppSafeAreaView>
    )
};

export default ProfileBoostPurchase;

const styles = StyleSheet.create({
    PremiumText: { flexDirection: "row", alignItems: "center", marginTop: metrics.hp4, paddingHorizontal: metrics.hp2,  },
    pencilIcon: { height: metrics.hp2, width: metrics.hp2 },
    conatiner: {
        height: metrics.hp8,
        borderRadius: metrics.hp1_5,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: metrics.hp1,
        paddingHorizontal: metrics.hp2,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    bottomcontainer: {
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    discountContainer: {
        width: metrics.hp6_5,
        height: metrics.hp2,
        backgroundColor: colors.lightBlack,
        borderRadius: metrics.hp1,
        alignItems: "center",
        justifyContent: "center",
        // position: "absolute",
        // top: metrics.hp1,
        // right: metrics.hp2,
    },
    imageiContainer: {
        // shadowColor: colors.black,
        // shadowOffset: { width: 0, height: metrics.hp1_2 },
        // shadowOpacity: 0.22,
        // shadowRadius: metrics.hp1,
        // elevation: 8,
        height: metrics.hp10, width: "100%",
         marginTop: metrics.hp3, marginBottom:metrics.hp4,
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
});

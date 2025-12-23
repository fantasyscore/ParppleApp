import React, { useEffect, useMemo, useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { ActivityIndicator, Alert, ImageBackground, Platform, StyleSheet, View } from "react-native";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import NavigationService from "../../navigation/NavigationService";
import { goldCard, goldForSuperLIke, orBottomIcon, premiumIcon, superLikeHeader, upgradPlan } from "../../helper/ImageAssets";
import metrics from "../../assets/Metrics";
import FastImage from "react-native-fast-image";
import { AppText, EIGHT, FORTEEN, INTER_EXTRA_BOLD, INTER_MEDIUM, INTER_REGULAR, INTER_SEMI_BOLD, LIGHT_BLACK, OPECITY_DARK, TEN, TWELVE, WHITE } from "../../common/AppText";
import { colors } from "../../theme/colors";
import * as RNIap from 'react-native-iap';
import { NAVIGATION_SUBSCRIPTION_SCREEN } from "../../navigation/routes";
import { usePurchaseVerification } from "../../hooks/usePurchaseVerification";

// One-time Product SKUs
const PRODUCT_SKUS = Platform.select({
    android: ['10_super_likes', '3_super_likes', '1_super_like'],
    ios: ['10_super_likes', '3_super_likes', '1_super_like'],
}) || [];

// Helper to extract numeric price for calculations
const extractPriceNumber = (priceStr: string): { amount: number; currency: string } => {
    const amountMatch = priceStr.match(/[\d,.]+/);
    const amount = amountMatch ? parseFloat(amountMatch[0].replace(/,/g, '')) : 0;
    const currency = priceStr.replace(/[\d,.\s]+/g, '') || '₹';
    return { amount, currency };
};

const SuperLikePurchese = () => {
    const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const { handlePurchaseSuccess } = usePurchaseVerification();

    useEffect(() => {
        let purchaseUpdateSubscription: any;
        let purchaseErrorSubscription: any;

        const initializeIAP = async () => {
            try {
                setLoading(true);
                await RNIap.initConnection();

                // Fetch ONE-TIME products (consumables)
                const availableProducts = await RNIap.fetchProducts({
                    skus: PRODUCT_SKUS,
                    type: 'in-app'
                });

                if (availableProducts && availableProducts.length > 0) {
                    // First pass: calculate all products with per-item pricing
                    const productsWithPricing = availableProducts.map((prod: any) => {
                        const productId = (prod.productId || prod.id || '').toString();
                        const likeCountStr = productId.match(/\d+/)?.[0] || '1';
                        const n = parseInt(likeCountStr);

                        const fullPriceStr = prod.localizedPrice || prod.displayPrice || '₹0';
                        const priceInfo = extractPriceNumber(fullPriceStr);
                        const total = priceInfo.amount;

                        // Rule: Compute exact per-item value, then floor to 2 decimal places for items 1 to (n-1)
                        const perItemFixed = Math.floor((total / n) * 100) / 100;

                        // Rule: Assign any remaining amount to the final item
                        const lastItemAmount = Number((total - (perItemFixed * (n - 1))).toFixed(2));

                        // Proof check
                        const proofSum = Number(((perItemFixed * (n - 1)) + lastItemAmount).toFixed(2));

                        console.log(`[Super Like IAP Proof Check]`);
                        console.log(`- Selected pack: ${n} Super Likes`);
                        console.log(`- Total price: ${total}`);
                        console.log(`- Breakdown: ${n > 1 ? `${perItemFixed} x ${n - 1} + ${lastItemAmount} (final)` : `${total} x 1`}`);
                        console.log(`- Proof sum: ${proofSum} (Matches: ${proofSum === total})`);

                        const perItemPriceStr = `${priceInfo.currency}${perItemFixed.toFixed(2)}`;

                        return {
                            ...prod,
                            likeCount: n,
                            displayPrice: fullPriceStr,
                            perItemPrice: perItemPriceStr,
                            perItemPriceAmount: perItemFixed,
                            totalAmount: total,
                            currency: priceInfo.currency,
                        };
                    });

                    // Find base price (single unit pack)
                    const singleUnitPack = productsWithPricing.find((p: any) => p.likeCount === 1);
                    const baseUnitPrice = singleUnitPack?.perItemPriceAmount || 0;

                    // Second pass: calculate discounts
                    const formattedProducts = productsWithPricing.map((prod: any) => {
                        const n = prod.likeCount;
                        let discount = "";
                        let discountPercent = 0;

                        if (n > 1 && baseUnitPrice > 0) {
                            // Calculate discount: (baseUnitPrice - perUnitPackPrice) / baseUnitPrice * 100
                            const perUnitSavings = baseUnitPrice - prod.perItemPriceAmount;
                            discountPercent = Number(((perUnitSavings / baseUnitPrice) * 100).toFixed(2));
                            const roundedDiscount = Math.round(discountPercent);

                            // UI Rules: Show discount badge if ≥ 10%
                            if (roundedDiscount >= 10) {
                                discount = `Save ${roundedDiscount}%`;
                            }
                        }

                        return {
                            ...prod,
                            discount,
                            discountPercent,
                        };
                    });

                    // Sort descending by like count
                    formattedProducts.sort((a: any, b: any) => b.likeCount - a.likeCount);

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
                setProcessing(null);
                
                // Handle purchase verification workflow
                await handlePurchaseSuccess(
                    purchase,
                    'one-time',
                    () => {
                        // Success callback
                        Alert.alert(
                            'Success',
                            'Super Likes added successfully!',
                            [{ text: 'OK', onPress: () => NavigationService.goBack() }]
                        );
                    },
                    (error) => {
                        // Error callback
                        console.error('[Super Like] Verification error:', error);
                        Alert.alert(
                            'Purchase Recorded',
                            'Your purchase was successful, but verification is pending. You will receive your Super Likes once verification completes.',
                            [{ text: 'OK', onPress: () => NavigationService.goBack() }]
                        );
                    }
                );
            } catch (err) {
                setProcessing(null);
                console.error('[Super Like] Purchase handler error:', err);
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
        const selectedProduct = products[selectedPlanIndex];
        if (!selectedProduct) return;

        const productId = (selectedProduct as any).productId || (selectedProduct as any).id;

        try {
            setProcessing(productId);
            const platformRequest: any = Platform.OS === 'android'
                ? { android: { skus: [productId] } }
                : { ios: { sku: productId } };

            await RNIap.requestPurchase({
                request: platformRequest,
                type: 'in-app',
            });
        } catch (err: any) {
            setProcessing(null);
            console.warn('Purchase Error:', err);
        }
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
    const subscriptionItem = { id: '1', icon: goldCard, title: 'Gold' }

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
                            Get {products[selectedPlanIndex]?.likeCount || ''} Super Likes for {products[selectedPlanIndex]?.displayPrice || ''}
                        </AppText>
                    )}
                </TouchableOpacityView>
            </View>
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
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: metrics.hp1_2 },
        shadowOpacity: 0.22,
        shadowRadius: metrics.hp1,
        elevation: 8,
        height: metrics.hp10, width: "100%", marginTop: metrics.hp3, marginBottom:metrics.hp4,
    }
});

import React, { useEffect, useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { ActivityIndicator, Alert, FlatList, ImageBackground, Platform, StyleSheet, View } from "react-native";
import OneTimeProductHeader from "../../common/OneTimeProductHeader";
import { crushParBack, flasIcon, goldCard, orBottomIcon, Platinum, platnumPurches, premiumIcon, superlIkeBackGround, upgradPlan } from "../../helper/ImageAssets";
import { AppText, BLACK, EIGHT, FORTEEN, INTER_BOLD, INTER_EXTRA_BOLD, INTER_MEDIUM, INTER_REGULAR, INTER_SEMI_BOLD, SCHEHERAZADE_BOLD, SIXTEEN, TEN, THIRTEEN, TWELVE, TWENTY_TWO, WHITE } from "../../common/AppText";
import metrics from "../../assets/Metrics";
import FastImage from "react-native-fast-image";
import { colors } from "../../theme/colors";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import * as RNIap from 'react-native-iap';
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_SUBSCRIPTION_SCREEN } from "../../navigation/routes";
import { usePurchaseVerification } from "../../hooks/usePurchaseVerification";

// One-time Product SKUs
const PRODUCT_SKUS = Platform.select({
    android: ['10_crush_notes', '3_crush_notes', '1_crush_note'],
    ios: ['10_crush_notes', '3_crush_notes', '1_crush_note'],
}) || [];

// Helper to extract numeric price for calculations
const extractPriceNumber = (priceStr: string): { amount: number; currency: string } => {
    const amountMatch = priceStr.match(/[\d,.]+/);
    const amount = amountMatch ? parseFloat(amountMatch[0].replace(/,/g, '')) : 0;
    const currency = priceStr.replace(/[\d,.\s]+/g, '') || '₹';
    return { amount, currency };
};

const CrushNotePurchase = () => {
    const [select, setSelect] = useState(0);
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
                        const countStr = productId.match(/\d+/)?.[0] || '1';
                        const n = parseInt(countStr);

                        const fullPriceStr = prod.localizedPrice || prod.displayPrice || '₹0';
                        const priceInfo = extractPriceNumber(fullPriceStr);
                        const total = priceInfo.amount;

                        // Rule: Compute exact per-item value, then floor to 2 decimal places for items 1 to (n-1)
                        const perItemFixed = Math.floor((total / n) * 100) / 100;
                        const lastItemAmount = Number((total - (perItemFixed * (n - 1))).toFixed(2));
                        
                        // Proof check
                        const proofSum = Number(((perItemFixed * (n - 1)) + lastItemAmount).toFixed(2));
                        console.log(`[Crush Note IAP Proof Check] - Pack: ${n}, Total: ${total}, Breakdown: ${perItemFixed}x${n-1} + ${lastItemAmount} = ${proofSum}`);

                        const perItemPriceStr = `${priceInfo.currency}${perItemFixed.toFixed(2)}`;

                        return {
                            ...prod,
                            count: n,
                            displayPrice: fullPriceStr,
                            perItemPrice: perItemPriceStr,
                            perItemPriceAmount: perItemFixed,
                            totalAmount: total,
                            currency: priceInfo.currency,
                        };
                    });

                    // Find base price (single unit pack)
                    const singleUnitPack = productsWithPricing.find((p: any) => p.count === 1);
                    const baseUnitPrice = singleUnitPack?.perItemPriceAmount || 0;

                    // Second pass: calculate discounts and labels
                    const formattedProducts = productsWithPricing.map((prod: any) => {
                        const n = prod.count;
                        let discount = "";
                        let discountPercent = 0;
                        let label = "";

                        if (n > 1 && baseUnitPrice > 0) {
                            // Calculate discount: (baseUnitPrice - perUnitPackPrice) / baseUnitPrice * 100
                            const perUnitSavings = baseUnitPrice - prod.perItemPriceAmount;
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

                    // Sort descending by count
                    formattedProducts.sort((a: any, b: any) => b.count - a.count);
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
                            'Crush Notes added successfully!',
                            [{ text: 'OK', onPress: () => NavigationService.goBack() }]
                        );
                    },
                    (error) => {
                        // Error callback
                        console.error('[Crush Note] Verification error:', error);
                        Alert.alert(
                            'Purchase Recorded',
                            'Your purchase was successful, but verification is pending. You will receive your Crush Notes once verification completes.',
                            [{ text: 'OK', onPress: () => NavigationService.goBack() }]
                        );
                    }
                );
            } catch (err) {
                setProcessing(null);
                console.error('[Crush Note] Purchase handler error:', err);
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
                        {item.count}<AppText color={isSelected ? WHITE : BLACK} type={FORTEEN} weight={INTER_BOLD}>
                            {"  "}Crush Note
                        </AppText>
                    </AppText>
                </View>
                <View style={{ alignItems: "flex-end", marginTop: -metrics.hp0_1 }}>
                    {item.discount ? (
                        <View style={styles.discountContainer}>
                            <AppText type={EIGHT} weight={INTER_SEMI_BOLD} color={WHITE}>
                                {item.discount}
                            </AppText>
                        </View>
                    ) : null}
                    <AppText style={{ marginTop: metrics.hp1 }} type={THIRTEEN} color={isSelected ? WHITE : BLACK} weight={INTER_MEDIUM}>
                        {item.perItemPrice}/ea
                    </AppText>
                </View>
            </TouchableOpacityView>
        )
    }

    if (loading) {
        return (
            <AppSafeAreaView>
                <ImageBackground source={superlIkeBackGround} resizeMode="cover" style={{ flex: 1 }}>
                    <OneTimeProductHeader title={"Get Crush Note"} />
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.purple} />
                        <AppText style={{ marginTop: metrics.hp2 }} type={TWELVE} weight={INTER_MEDIUM}>Loading Crush Notes...</AppText>
                    </View>
                </ImageBackground>
            </AppSafeAreaView>
        );
    }
    const subscriptionItem = { id: '3', icon: Platinum, title: 'Platinum' }

    return (
        <AppSafeAreaView>
            <ImageBackground source={crushParBack} resizeMode="cover" style={{ flex: 1 }}>
                <OneTimeProductHeader title={"Get Crush Note"} />
                <View style={{ alignItems: "center", justifyContent: "center", marginTop: metrics.hp7 }}>
                    <AppText weight={SCHEHERAZADE_BOLD} type={TWENTY_TWO} color={BLACK}>
                        “Turn Every Crush into a Real
                    </AppText>
                    <AppText style={{ marginTop: -metrics.hp3 }} weight={SCHEHERAZADE_BOLD} type={TWENTY_TWO} color={BLACK}>
                        Chance — 4x More Connections!
                    </AppText>
                </View>
                <View style={styles.PremiumText}>
                    <FastImage source={premiumIcon} resizeMode="contain" style={styles.pencilIcon} />
                    <AppText type={TWELVE} weight={INTER_SEMI_BOLD}>{"  "}Choose your crush note</AppText>
                </View>
                <FlatList
                    data={products}
                    keyExtractor={(item: any) => (item.productId || item.id).toString()}
                    showsVerticalScrollIndicator={false}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingHorizontal: metrics.hp2, marginTop: metrics.hp2 }}
                />
                <FastImage source={orBottomIcon} resizeMode="contain" style={{ height: metrics.hp2_4, width: "100%", marginTop: metrics.hp4 }} />
                <TouchableOpacityView onPress={() => NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN, { comming: subscriptionItem })}>
                    <FastImage source={platnumPurches} resizeMode="contain" style={{ height: metrics.hp10, width: "100%", marginTop: metrics.hp3, marginBottom: metrics.hp4 }} />
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
                                Get {products[select]?.count || ''} Crush Notes for {products[select]?.displayPrice || ''}
                            </AppText>
                        )}
                    </TouchableOpacityView>
                </View>
            </ImageBackground>
        </AppSafeAreaView>
    )
};

export default CrushNotePurchase;

const styles = StyleSheet.create({
    PremiumText: { flexDirection: "row", alignItems: "center", marginTop: metrics.hp4, paddingHorizontal: metrics.hp2, },
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
    },
});

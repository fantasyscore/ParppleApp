import React, { useEffect, useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { ActivityIndicator, Alert, FlatList, ImageBackground, Platform, StyleSheet, View } from "react-native";
import { goldHeader, infinityICon, platinumHeader, premiumIcon, silverHeader, stylesRightArrow } from "../../helper/ImageAssets";
import metrics from "../../assets/Metrics";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import NavigationService from "../../navigation/NavigationService";
import FastImage from "react-native-fast-image";
import { AppText, EIGHT, ELEVEN, FORTEEN, INTER_EXTRA_BOLD, INTER_MEDIUM, INTER_REGULAR, INTER_SEMI_BOLD, LIGHT_BLACK, OPECITY_DARK, TEN, TWELVE, WHITE } from "../../common/AppText";
import { SilverPurchasedis } from "../../common/UiltData";
import { colors } from "../../theme/colors";
import * as RNIap from 'react-native-iap';

// Subscription SKUs based on tier
const getSubscriptionSkus = (tier: string) => {
    switch (tier) {
        case 'Silver':
            return Platform.select({
                android: ['silver_week', 'silver_month', 'silver_6month'],
                ios: ['silver_week', 'silver_month', 'silver_6month'],
            }) || [];
        case 'Gold':
            return Platform.select({
                android: ['gold_week', 'gold_month', 'gold_6month'],
                ios: ['gold_week', 'gold_month', 'gold_6month'],
            }) || [];
        case 'Platinum':
            return Platform.select({
                android: ['platinum_week', 'platinum_month', 'platinum_6month'],
                ios: ['platinum_week', 'platinum_month', 'platinum_6month'],
            }) || [];
        default:
            return [];
    }
};

// Helper to extract subscription period from store data
const extractSubscriptionPeriod = (subscription: any): { planOf: string; ofPu: string; periodOrder: number } => {
    const productId = subscription.id || subscription.productId || subscription.productIdentifier || '';
    
    // Try to get period from subscription offer details (Android)
    if (subscription.subscriptionOfferDetails && subscription.subscriptionOfferDetails.length > 0) {
        const offerDetails = subscription.subscriptionOfferDetails[0];
        if (offerDetails.pricingPhases && offerDetails.pricingPhases.pricingPhaseList) {
            const phase = offerDetails.pricingPhases.pricingPhaseList[0];
            const billingPeriod = phase.billingPeriod || '';
            // Format: P1W (1 week), P1M (1 month), P6M (6 months), P1Y (1 year)
            if (billingPeriod.includes('W')) {
                const weeks = billingPeriod.match(/\d+/)?.[0] || '1';
                return { planOf: `${weeks} Week`, ofPu: 'Week', periodOrder: 1 };
            } else if (billingPeriod.includes('M')) {
                const months = billingPeriod.match(/\d+/)?.[0] || '1';
                return { 
                    planOf: months === '1' ? '1 Month' : `${months} Months`, 
                    ofPu: 'Month', 
                    periodOrder: parseInt(months) === 1 ? 2 : 3 
                };
            } else if (billingPeriod.includes('Y')) {
                const years = billingPeriod.match(/\d+/)?.[0] || '1';
                return { planOf: `${years} Year`, ofPu: 'Year', periodOrder: 4 };
            }
        }
    }
    
    // Try iOS subscription period
    if (subscription.subscriptionPeriodNumberIOS && subscription.subscriptionPeriodUnitIOS) {
        const number = subscription.subscriptionPeriodNumberIOS;
        const unit = subscription.subscriptionPeriodUnitIOS;
        if (unit === 'WEEK') {
            return { planOf: `${number} Week`, ofPu: 'Week', periodOrder: 1 };
        } else if (unit === 'MONTH') {
            return { 
                planOf: number === '1' ? '1 Month' : `${number} Months`, 
                ofPu: 'Month', 
                periodOrder: number === '1' ? 2 : 3 
            };
        } else if (unit === 'YEAR') {
            return { planOf: `${number} Year`, ofPu: 'Year', periodOrder: 4 };
        }
    }
    
    // Fallback: Extract from productId
    if (productId.includes('week')) {
        return { planOf: '1 Week', ofPu: 'Week', periodOrder: 1 };
    } else if (productId.includes('6month')) {
        return { planOf: '6 Months', ofPu: 'Month', periodOrder: 3 };
    } else if (productId.includes('month')) {
        return { planOf: '1 Month', ofPu: 'Month', periodOrder: 2 };
    } else if (productId.includes('year')) {
        return { planOf: '1 Year', ofPu: 'Year', periodOrder: 4 };
    }
    
    return { planOf: 'Plan', ofPu: '', periodOrder: 0 };
};

// Helper to extract price from store data
const extractPrice = (subscription: any): string => {
    // Direct price fields
    if (subscription.displayPrice) return subscription.displayPrice;
    if (subscription.localizedPrice) return subscription.localizedPrice;
    
    // Android subscription offer details
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
    
    // iOS price
    if (subscription.price) {
        const currency = subscription.currency || '₹';
        return `${currency}${subscription.price}`;
    }
    
    return 'N/A';
};

// Helper to calculate discount percentage
const calculateDiscount = (subscription: any, allSubscriptions: any[]): string => {
    const period = extractSubscriptionPeriod(subscription);
    
    // Only show discount for non-weekly plans
    if (period.periodOrder <= 1) return '';
    
    // Find weekly plan to compare
    const weeklyPlan = allSubscriptions.find(sub => {
        const subPeriod = extractSubscriptionPeriod(sub);
        return subPeriod.periodOrder === 1;
    });
    
    if (!weeklyPlan) {
        // Fallback discounts based on period
        if (period.periodOrder === 2) return 'Save 10%';
        if (period.periodOrder === 3) return 'Save 25%';
        if (period.periodOrder === 4) return 'Save 30%';
        return '';
    }
    
    // Calculate actual discount if we have price data
    try {
        const weeklyPrice = extractPriceNumber(weeklyPlan);
        const currentPrice = extractPriceNumber(subscription);
        
        if (weeklyPrice > 0 && currentPrice > 0) {
            // Calculate equivalent weekly cost
            let weeksInPeriod = 1;
            if (period.periodOrder === 2) weeksInPeriod = 4; // 1 month = ~4 weeks
            if (period.periodOrder === 3) weeksInPeriod = 24; // 6 months = ~24 weeks
            if (period.periodOrder === 4) weeksInPeriod = 52; // 1 year = 52 weeks
            
            const equivalentWeeklyPrice = currentPrice / weeksInPeriod;
            const discount = ((weeklyPrice - equivalentWeeklyPrice) / weeklyPrice) * 100;
            
            if (discount > 5) {
                return `Save ${Math.round(discount)}%`;
            }
        }
    } catch (e) {
        // Fallback discounts
        if (period.periodOrder === 2) return 'Save 10%';
        if (period.periodOrder === 3) return 'Save 25%';
        if (period.periodOrder === 4) return 'Save 30%';
    }
    
    return '';
};

// Helper to extract numeric price
const extractPriceNumber = (subscription: any): number => {
    const priceStr = extractPrice(subscription);
    const match = priceStr.match(/[\d,]+\.?\d*/);
    if (match) {
        return parseFloat(match[0].replace(/,/g, ''));
    }
    return 0;
};

// Helper to format plan display from actual store data
const formatPlanDisplay = (subscription: any, allSubscriptions: any[]) => {
    const productId = subscription.id || subscription.productId || subscription.productIdentifier || '';
    const price = extractPrice(subscription);
    const period = extractSubscriptionPeriod(subscription);
    const discount = calculateDiscount(subscription, allSubscriptions);
    
    // Get title and description from store
    const title = subscription.title || subscription.localizedTitle || subscription.name || '';
    const description = subscription.description || subscription.localizedDescription || '';
    
    return {
        id: productId,
        planOf: period.planOf,
        amount: `${price} /`,
        ofPu: period.ofPu,
        discount,
        periodOrder: period.periodOrder,
        // Store original data for display
        storeTitle: title,
        storeDescription: description,
        displayPrice: price,
        rawSubscription: subscription,
    };
};

const SubscriptionScreen = ({ route }: any) => {
    let title = route?.params?.comming?.title ?? "Silver";
    const [plan, setPlan] = useState(0);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    const commingHeader = () => {
        if (title == "Silver") return silverHeader;
        if (title == "Gold") return goldHeader;
        if (title == "Platinum") return platinumHeader;
        return silverHeader;
    };

    useEffect(() => {
        let purchaseUpdateSubscription: any;
        let purchaseErrorSubscription: any;

        const initializeIAP = async () => {
            try {
                setLoading(true);
                
                // Initialize connection with retry logic
                let retries = 3;
                let connected = false;
                while (retries > 0 && !connected) {
                    try {
                        await RNIap.initConnection();
                        connected = true;
                        console.log('IAP connection initialized successfully');
                    } catch (initError: any) {
                        retries--;
                        console.warn(`IAP connection attempt failed. Retries left: ${retries}`, initError);
                        if (retries > 0) {
                            await new Promise(resolve => setTimeout(resolve, 1500));
                        } else {
                            throw initError;
                        }
                    }
                }

                // Fetch subscriptions from the store
                const subscriptionSkus = getSubscriptionSkus(title);
                if (subscriptionSkus && subscriptionSkus.length > 0) {
                    try {
                        const availableSubscriptions = await RNIap.fetchProducts({ 
                            skus: subscriptionSkus,
                            type: 'subs'
                        });
                        
                        console.log('=== RAW SUBSCRIPTION DATA FROM STORE ===');
                        console.log(JSON.stringify(availableSubscriptions, null, 2));
                        
                        if (availableSubscriptions && Array.isArray(availableSubscriptions) && availableSubscriptions.length > 0) {
                            // Format subscriptions for display using actual store data
                            const formattedSubs = availableSubscriptions.map(sub => 
                                formatPlanDisplay(sub, availableSubscriptions)
                            );
                            
                            // Sort by plan duration
                            formattedSubs.sort((a, b) => a.periodOrder - b.periodOrder);
                            
                            console.log('=== FORMATTED SUBSCRIPTION DATA ===');
                            console.log(JSON.stringify(formattedSubs, null, 2));
                            
                            setSubscriptions(formattedSubs);
                        } else {
                            console.log('No subscriptions returned from store');
                            setSubscriptions([]);
                        }
                    } catch (subErr) {
                        console.warn('Error fetching subscriptions:', subErr);
                        setSubscriptions([]);
                    }
                } else {
                    setSubscriptions([]);
                }

            } catch (err: any) {
                console.warn('IAP Initialization Error:', err);
                setSubscriptions([]);
            } finally {
                setLoading(false);
            }
        };

        // Listen for purchase updates (Success)
        purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async (purchase: any) => {
            try {
                console.log('Purchase successful:', purchase);

                // Finish the transaction
                await RNIap.finishTransaction({
                    purchase,
                    isConsumable: false
                });

                setProcessing(null);

                Alert.alert(
                    'Success',
                    `Your ${title} subscription has been activated successfully!`,
                    [{ text: 'OK', onPress: () => NavigationService.goBack() }]
                );

            } catch (ackErr) {
                console.warn('Error finishing transaction:', ackErr);
                setProcessing(null);
                Alert.alert('Error', 'Failed to complete purchase. Please contact support.');
            }
        });

        // Listen for purchase errors
        purchaseErrorSubscription = RNIap.purchaseErrorListener((error: any) => {
            console.warn('Purchase error:', error);
            setProcessing(null);

            const isUserCanceled = error.code === 'E_USER_CANCELLED' ||
                error.responseCode === 'USER_CANCELED' ||
                (error.message && error.message.toLowerCase().includes('cancel'));

            if (!isUserCanceled) {
                Alert.alert('Purchase Error', error.message || 'An error occurred during purchase.');
            }
        });

        initializeIAP();

        // Clean up
        return () => {
            if (purchaseUpdateSubscription) purchaseUpdateSubscription.remove();
            if (purchaseErrorSubscription) purchaseErrorSubscription.remove();
            RNIap.endConnection();
        };
    }, [title]);

    const handlePurchase = async () => {
        if (processing) return;

        const selectedPlan = subscriptions[plan];
        if (!selectedPlan) {
            Alert.alert('Error', 'Please select a plan first.');
            return;
        }

        const subscriptionId = selectedPlan.id;

        if (!selectedPlan.rawSubscription) {
            Alert.alert(
                'Subscription Unavailable',
                'This subscription is currently unavailable. Please try again later.',
                [{ text: 'OK' }]
            );
            return;
        }

        try {
            setProcessing(subscriptionId);
            
            console.log('Purchasing subscription ID:', subscriptionId);
            
            const platformRequest: any = Platform.OS === 'android' 
                ? { android: { skus: [subscriptionId] } }
                : { ios: { sku: subscriptionId } };
            
            console.log('Platform request:', JSON.stringify(platformRequest, null, 2));
            
            await RNIap.requestPurchase({
                request: platformRequest,
                type: 'subs',
            });
        } catch (err: any) {
            console.warn('Request Subscription Error:', err);
            setProcessing(null);
            const errorMsg = err?.message || err?.toString() || 'Failed to start subscription purchase.';
            
            if (errorMsg.includes('configuration') || errorMsg.includes('missing')) {
                Alert.alert(
                    'Configuration Error',
                    'Please ensure the subscription is correctly configured and try again.',
                );
            } else if (!errorMsg.toLowerCase().includes('cancel')) {
                Alert.alert('Error', errorMsg);
            }
        }
    };

    const getButtonText = () => {
        if (processing) return 'Processing...';
        const selectedPlan = subscriptions[plan];
        if (!selectedPlan) return 'Select a Plan';
        return `Get ${selectedPlan.planOf} for ${selectedPlan.displayPrice}`;
    };

    const purChaesDetails = ({ item, index }: any) => {
        return (
            <TouchableOpacityView 
                activeOpacity={1} 
                onPress={() => setPlan(index)} 
                style={[styles.container, {
                    marginLeft: subscriptions?.length + 1 == index ? 0 : metrics.hp2,
                    marginRight: subscriptions?.length - 1 == index ? metrics.hp2 : 0,
                    backgroundColor: plan === index ? colors.purple : colors.white
                }]}
            >
                {item.discount ? (
                    <View style={styles.discountContainer}>
                        <AppText type={EIGHT} weight={INTER_SEMI_BOLD} color={WHITE}>
                            {item.discount}
                        </AppText>
                    </View>
                ) : null}
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
        );
    };

    const disRender = ({ item }: any) => {
        return (
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: metrics.hp2 }}>
                <FastImage source={stylesRightArrow} resizeMode="contain" style={styles.pencilIcon} />
                <AppText type={ELEVEN} weight={INTER_SEMI_BOLD} color={OPECITY_DARK}>
                    {"   "}{item.title}
                </AppText>
            </View>
        );
    };

    // Render selected plan details
    const renderSelectedPlanInfo = () => {
        const selectedPlan = subscriptions[plan];
        if (!selectedPlan) return null;
        
        return (
            <View style={styles.selectedPlanContainer}>
                {selectedPlan.storeTitle ? (
                    <AppText type={FORTEEN} weight={INTER_SEMI_BOLD} style={styles.planTitle}>
                        {selectedPlan.storeTitle.replace(/\(.*\)/, '').trim()}
                    </AppText>
                ) : null}
                {selectedPlan.storeDescription ? (
                    <AppText type={ELEVEN} weight={INTER_REGULAR} color={OPECITY_DARK} style={styles.planDescription}>
                        {selectedPlan.storeDescription}
                    </AppText>
                ) : null}
                <View style={styles.priceRow}>
                    <AppText type={TWELVE} weight={INTER_MEDIUM} color={LIGHT_BLACK}>
                        Price: 
                    </AppText>
                    <AppText type={FORTEEN} weight={INTER_EXTRA_BOLD} style={styles.priceText}>
                        {selectedPlan.displayPrice}
                    </AppText>
                    <AppText type={TWELVE} weight={INTER_MEDIUM} color={LIGHT_BLACK}>
                        {" / "}{selectedPlan.ofPu}
                    </AppText>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <AppSafeAreaView>
                <ImageBackground source={commingHeader()} resizeMode="cover" style={styles.headerContainer}>
                    <TouchableOpacityView onPress={() => NavigationService.goBack()} style={styles.closeButton} />
                </ImageBackground>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.purple} />
                    <AppText style={{ marginTop: metrics.hp2 }} type={TWELVE} weight={INTER_MEDIUM}>
                        Loading plans...
                    </AppText>
                </View>
            </AppSafeAreaView>
        );
    }

    // No subscriptions available
    if (subscriptions.length === 0) {
        return (
            <AppSafeAreaView>
                <ImageBackground source={commingHeader()} resizeMode="cover" style={styles.headerContainer}>
                    <TouchableOpacityView onPress={() => NavigationService.goBack()} style={styles.closeButton} />
                </ImageBackground>
                <View style={styles.loadingContainer}>
                    <AppText type={FORTEEN} weight={INTER_SEMI_BOLD}>
                        No subscription plans available
                    </AppText>
                    <AppText style={{ marginTop: metrics.hp1, textAlign: 'center', paddingHorizontal: metrics.hp4 }} type={ELEVEN} weight={INTER_REGULAR} color={OPECITY_DARK}>
                        Please check your internet connection or try again later.
                    </AppText>
                    <TouchableOpacityView 
                        onPress={() => NavigationService.goBack()} 
                        style={[styles.buttonContiner, { marginTop: metrics.hp4, width: '60%' }]}
                    >
                        <AppText color={WHITE} weight={INTER_SEMI_BOLD} type={FORTEEN}>
                            Go Back
                        </AppText>
                    </TouchableOpacityView>
                </View>
            </AppSafeAreaView>
        );
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
                        data={subscriptions}
                        renderItem={purChaesDetails}
                        keyExtractor={(item) => item.id}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ marginTop: metrics.hp2 }}
                        horizontal={true}
                    />
                </View>
                
                {/* Display selected plan details from store */}
                {renderSelectedPlanInfo()}
                
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
                    contentContainerStyle={{ marginTop: metrics.hp2, paddingHorizontal: metrics.hp2, paddingBottom: metrics.hp10 }}
                />
            </View>
            <View style={styles.bottomcontainer}>
                <AppText weight={INTER_REGULAR} type={TEN}>
                    By tapping Upgrade, your payment will be charged, your subscriptions auto-renew unless canceled at least 24 hours before the current period ends. Manage your subscription anytime in settings and you agree to our
                    <AppText style={{
                        textDecorationLine: "underline"
                    }} weight={INTER_SEMI_BOLD} type={TEN}> Terms</AppText>
                </AppText>
                <TouchableOpacityView 
                    onPress={handlePurchase} 
                    disabled={!!processing}
                    style={[styles.buttonContiner, processing && styles.buttonDisabled]}
                >
                    {processing ? (
                        <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                        <AppText color={WHITE} weight={INTER_SEMI_BOLD} type={FORTEEN}>
                            {getButtonText()}
                        </AppText>
                    )}
                </TouchableOpacityView>
            </View>
        </AppSafeAreaView>
    );
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
    buttonDisabled: {
        opacity: 0.7,
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#F5F7FA",
    },
    selectedPlanContainer: {
        backgroundColor: colors.white,
        marginHorizontal: metrics.hp2,
        marginTop: metrics.hp2,
        padding: metrics.hp2,
        borderRadius: metrics.hp1_5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    planTitle: {
        marginBottom: metrics.hp0_5,
    },
    planDescription: {
        marginBottom: metrics.hp1,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priceText: {
        color: colors.purple,
    },
});

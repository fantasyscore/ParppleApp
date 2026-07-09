import React, { useEffect, useState } from 'react';
import { View, Text, Button, Platform, Alert, ActivityIndicator } from 'react-native';
import * as RNIap from 'react-native-iap';

// Subscription IDs from Google Play Console / App Store Connect
// Subscription product ID: coin_100
// Base plan ID: 100-weekly-payment
const subscriptionSkus = Platform.select({
  android: [
    'coin_100', // Subscription product ID
  ],
  ios: [
    'coin_100', // Subscription product ID (usually same as Android)
  ],
});

// For consumable/non-consumable products (one-time purchases)
const productSkus = Platform.select({
  android: ['200_coin'], // One-time product ID
  ios: ['200_coin'], // One-time product ID (usually same as Android)
});

const InAppPurchaseScreen = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    let purchaseUpdateSubscription: any;
    let purchaseErrorSubscription: any;

    const initializeIAP = async () => {
      try {
        setLoading(true);
        
        // Check if running on Android and ensure we're on a physical device
        if (Platform.OS === 'android') {
          // Check if Google Play Services is available (required for IAP)
          try {
            const playServices = require('react-native').NativeModules.PlayServices;
            if (playServices && playServices.isAvailable) {
              const isAvailable = await playServices.isAvailable();
              if (!isAvailable) {
                throw new Error('Google Play Services not available');
              }
            }
          } catch (e) {
            console.warn('Could not check Play Services:', e);
          }
        }
        
        // 1. Initialize connection with retry logic
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
              // Wait before retrying
              await new Promise(resolve => setTimeout(resolve, 1500));
            } else {
              throw initError;
            }
          }
        }

        // 2. Fetch subscriptions from the store
        if (subscriptionSkus && subscriptionSkus.length > 0) {
          try {
            const availableSubscriptions = await RNIap.getSubscriptions({ 
              skus: subscriptionSkus
            });
            console.log(availableSubscriptions,"availableSubscriptions");
            
            if (availableSubscriptions) {
              setSubscriptions(Array.isArray(availableSubscriptions) ? availableSubscriptions : []);
              console.log('Available subscriptions:', availableSubscriptions);
            }
          } catch (subErr) {
            console.warn('Error fetching subscriptions:', subErr);
          }
        }

        // 3. Fetch products (consumables/non-consumables) from the store
        if (productSkus && productSkus.length > 0) {
          try {
            const availableProducts = await RNIap.getProducts({ 
              skus: productSkus
            });
            if (availableProducts) {
              setProducts(Array.isArray(availableProducts) ? availableProducts : []);
              console.log('Available products:', availableProducts);
            }
          } catch (prodErr) {
            console.warn('Error fetching products:', prodErr);
          }
        }

      } catch (err: any) {
        console.warn('IAP Initialization Error:', err);
        const errorMessage = err?.message || err?.toString() || 'Unknown error';
        
        // Check if it's a JNI error
        if (errorMessage.includes('JniException') || errorMessage.includes('JNI')) {
          Alert.alert(
            'Initialization Error',
            'Please rebuild the app and ensure you are testing on a physical device with Google Play Services installed.',
            [
              { text: 'OK', style: 'default' },
              { 
                text: 'Retry', 
                onPress: () => {
                  // Retry initialization after a delay
                  setTimeout(() => initializeIAP(), 2000);
                }
              }
            ]
          );
        } else {
          Alert.alert('Error', `Failed to initialize in-app purchases: ${errorMessage}`);
        }
      } finally {
        setLoading(false);
      }
    };

    // 4. Listen for purchase updates (Success)
    purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async (purchase: any) => {
      try {
        console.log('Purchase successful:', purchase);

        // Check if it's a subscription or a product
        const productId = purchase.productId || purchase.productIdentifier || purchase.id;
        const isSubscription = productId &&
          subscriptionSkus &&
          Array.isArray(subscriptionSkus) &&
          (subscriptionSkus as string[]).includes(productId);

        // IMPORTANT: You must "finish" (acknowledge) the transaction.
        // For subscriptions, use isConsumable: false
        // For consumable products, use isConsumable: true
        await RNIap.finishTransaction({
          purchase,
          isConsumable: !isSubscription
        });

        setProcessing(null);

        Alert.alert(
          'Success',
          isSubscription
            ? 'Your subscription has been activated successfully!'
            : 'You have successfully purchased the item!'
        );

        // TODO: Add your logic here to:
        // - Update user's subscription status in your backend
        // - Unlock premium features
        // - Give coins/credits
        // - Refresh user data

        // Example: You might want to call an API to verify the purchase
        // await verifyPurchaseWithBackend(purchase);

      } catch (ackErr) {
        console.warn('Error finishing transaction:', ackErr);
        setProcessing(null);
        Alert.alert('Error', 'Failed to complete purchase. Please contact support.');
      }
    });

    // 5. Listen for purchase errors (User cancelled, network error, etc.)
    purchaseErrorSubscription = RNIap.purchaseErrorListener((error: any) => {
      console.warn('Purchase error:', error);
      setProcessing(null);

      // Check if user cancelled
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
  }, []);

  const handleBuySubscription = async (subscriptionId: string) => {
    if (processing) return;

    try {
      // Validate that subscription is available - check id, productId, and productIdentifier
      const subscription = subscriptions.find(
        (sub: any) => (sub.id || sub.productId || sub.productIdentifier) === subscriptionId
      );
      
      if (!subscription) {
        Alert.alert('Error', 'Subscription not available. Please wait for products to load.');
        return;
      }

      setProcessing(subscriptionId);
      
      // Get the actual subscription ID from the subscription object - prioritize 'id' field
      const actualSubscriptionId = subscription.id || subscription.productId || subscription.productIdentifier || subscriptionId;
      console.log('Purchasing subscription ID:', actualSubscriptionId);
      
      if (!actualSubscriptionId || actualSubscriptionId.trim() === '') {
        throw new Error('Subscription ID is missing or invalid');
      }
      
      if (Platform.OS === 'ios') {
        await RNIap.requestSubscription({
          sku: actualSubscriptionId,
          andDangerouslyFinishTransactionAutomaticallyIOS: false,
        });
      } else {
        const offerToken = subscription.subscriptionOfferDetails?.[0]?.offerToken;
        if (!offerToken) {
          throw new Error('No subscription offer token found for this product');
        }
        await RNIap.requestSubscription({
          subscriptionOffers: [
            {
              sku: actualSubscriptionId,
              offerToken: offerToken,
            }
          ]
        });
      }
    } catch (err: any) {
      console.warn('Request Subscription Error:', err);
      setProcessing(null);
      const errorMsg = err?.message || err?.toString() || 'Failed to start subscription purchase.';
      
      if (errorMsg.includes('configuration') || errorMsg.includes('missing')) {
        Alert.alert(
          'Configuration Error',
          'Please ensure the subscription is correctly configured in Google Play Console and try again.',
        );
      } else {
        Alert.alert('Error', errorMsg);
      }
    }
  };

  const handleBuyProduct = async (productId: string) => {
    if (processing) return;

    try {
      // Validate that product is available - check id, productId, and productIdentifier
      const product = products.find(
        (prod: any) => (prod.id || prod.productId || prod.productIdentifier) === productId
      );
      
      if (!product) {
        Alert.alert('Error', 'Product not available. Please wait for products to load.');
        return;
      }

      setProcessing(productId);
      console.log('Purchasing product:', product);
      console.log('Product ID passed to function:', productId);
      
      // Get the actual product ID from the product object - prioritize 'id' field
      const actualProductId = product.id || product.productId || product.productIdentifier || productId;
      console.log('Actual product ID to use:', actualProductId);
      
      if (!actualProductId || actualProductId.trim() === '') {
        throw new Error('Product ID is missing or invalid');
      }
      
      if (Platform.OS === 'ios') {
        await RNIap.requestPurchase({
          sku: actualProductId,
          andDangerouslyFinishTransactionAutomaticallyIOS: false,
        });
      } else {
        await RNIap.requestPurchase({ skus: [actualProductId] });
      }
    } catch (err: any) {
      console.warn('Request Purchase Error:', err);
      setProcessing(null);
      const errorMsg = err?.message || err?.toString() || 'Failed to start purchase.';
      
      if (errorMsg.includes('configuration') || errorMsg.includes('missing')) {
        Alert.alert(
          'Configuration Error',
          'Please ensure the product ID is correctly configured in Google Play Console and try again.',
        );
      } else {
        Alert.alert('Error', errorMsg);
      }
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading products...</Text>
      </View>
    );
  }

  const allItems = [...subscriptions, ...products];

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20, fontWeight: 'bold' }}>In-App Store</Text>

      {allItems.length === 0 ? (
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 16, marginBottom: 10, textAlign: 'center' }}>
            No products available
          </Text>
          <Text style={{ fontSize: 12, color: '#666', textAlign: 'center' }}>
            Make sure you've added subscription/product IDs in the code
          </Text>
        </View>
      ) : (
        <>
          {subscriptions.length > 0 && (
            <View style={{ width: '100%', marginBottom: 30 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 15 }}>
                Subscriptions
              </Text>
              {subscriptions.map((subscription: any) => {
                const subId = subscription.id || subscription.productId || subscription.productIdentifier;
                return (
                  <View
                    key={subId}
                    style={{
                      marginBottom: 15,
                      padding: 15,
                      backgroundColor: '#f5f5f5',
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: '#ddd'
                    }}
                  >
                    <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 5 }}>
                      {subscription.title || subscription.localizedTitle || subscription.displayName || 'Subscription'}
                    </Text>
                    <Text style={{ fontSize: 14, color: '#666', marginBottom: 10 }}>
                      {subscription.description || subscription.localizedDescription || ''}
                    </Text>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
                      {subscription.displayPrice || subscription.localizedPrice || subscription.price || 'N/A'}
                    </Text>
                    <Button
                      title={processing === subId ? 'Processing...' : `Subscribe`}
                      onPress={() => handleBuySubscription(subId)}
                      disabled={!!processing}
                    />
                  </View>
                );
              })}
            </View>
          )}

          {products.length > 0 && (
            <View style={{ width: '100%' }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 15 }}>
                Products
              </Text>
              {products.map((product: any) => {
                const prodId = product.id || product.productId || product.productIdentifier;
                return (
                  <View
                    key={prodId}
                    style={{
                      marginBottom: 15,
                      padding: 15,
                      backgroundColor: '#f5f5f5',
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: '#ddd'
                    }}
                  >
                    <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 5 }}>
                      {product.title || product.localizedTitle || product.displayName || 'Product'}
                    </Text>
                    <Text style={{ fontSize: 14, color: '#666', marginBottom: 10 }}>
                      {product.description || product.localizedDescription || ''}
                    </Text>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
                      {product.displayPrice || product.localizedPrice || product.price || 'N/A'}
                    </Text>
                    <Button
                      title={processing === prodId ? 'Processing...' : `Buy`}
                      onPress={() => handleBuyProduct(prodId)}
                      disabled={!!processing}
                    />
                  </View>
                );
              })}
            </View>
          )}
        </>
      )}
    </View>
  );
};

export default InAppPurchaseScreen;
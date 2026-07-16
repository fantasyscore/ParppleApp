import * as RNIap from 'react-native-iap';
import { Platform } from 'react-native';

// Re-export everything from react-native-iap
export * from 'react-native-iap';

// Compatibility shim for getProducts
export const getProducts = async (req: { skus: string[] }): Promise<any[]> => {
  try {
    const products = await RNIap.fetchProducts({
      skus: req.skus,
      type: 'in-app',
    });
    return Array.isArray(products) ? products.map(prod => {
      const mapped = { ...prod } as any;
      if (mapped.subscriptionOfferDetailsAndroid && !mapped.subscriptionOfferDetails) {
        mapped.subscriptionOfferDetails = mapped.subscriptionOfferDetailsAndroid;
      }
      return mapped;
    }) : [];
  } catch (error) {
    console.warn('[iapWrapper] getProducts failed:', error);
    throw error;
  }
};

// Compatibility shim for getSubscriptions
export const getSubscriptions = async (req: { skus: string[] }): Promise<any[]> => {
  try {
    const subscriptions = await RNIap.fetchProducts({
      skus: req.skus,
      type: 'subs',
    });
    return Array.isArray(subscriptions) ? subscriptions.map(sub => {
      const mapped = { ...sub } as any;
      if (mapped.subscriptionOfferDetailsAndroid && !mapped.subscriptionOfferDetails) {
        mapped.subscriptionOfferDetails = mapped.subscriptionOfferDetailsAndroid;
      }
      return mapped;
    }) : [];
  } catch (error) {
    console.warn('[iapWrapper] getSubscriptions failed:', error);
    throw error;
  }
};

// Compatibility shim for requestPurchase
export const requestPurchase = async (args: {
  sku?: string;
  skus?: string[];
  andDangerouslyFinishTransactionAutomaticallyIOS?: boolean;
}): Promise<any> => {
  try {
    if (Platform.OS === 'ios') {
      const sku = args.sku || (args.skus && args.skus[0]);
      if (!sku) {
        throw new Error('No product ID (sku) provided for purchase');
      }
      return await RNIap.requestPurchase({
        type: 'in-app',
        request: {
          apple: {
            sku,
            andDangerouslyFinishTransactionAutomatically:
              args.andDangerouslyFinishTransactionAutomaticallyIOS ?? false,
          },
        },
      });
    } else {
      const skus = args.skus || (args.sku ? [args.sku] : []);
      if (!skus || skus.length === 0) {
        throw new Error('No product ID (skus) provided for purchase');
      }
      return await RNIap.requestPurchase({
        type: 'in-app',
        request: {
          google: {
            skus,
          },
        },
      });
    }
  } catch (error) {
    console.warn('[iapWrapper] requestPurchase failed:', error);
    throw error;
  }
};

// Compatibility shim for requestSubscription
export const requestSubscription = async (args: {
  sku?: string;
  andDangerouslyFinishTransactionAutomaticallyIOS?: boolean;
  subscriptionOffers?: Array<{ sku: string; offerToken: string }>;
}): Promise<any> => {
  try {
    if (Platform.OS === 'ios') {
      const sku = args.sku || (args.subscriptionOffers && args.subscriptionOffers[0]?.sku);
      if (!sku) {
        throw new Error('No subscription ID (sku) provided');
      }
      return await RNIap.requestPurchase({
        type: 'subs',
        request: {
          apple: {
            sku,
            andDangerouslyFinishTransactionAutomatically:
              args.andDangerouslyFinishTransactionAutomaticallyIOS ?? false,
          },
        },
      });
    } else {
      const offers = args.subscriptionOffers;
      if (!offers || offers.length === 0) {
        const sku = args.sku;
        if (!sku) {
          throw new Error('No subscription offers or sku provided');
        }
        // Fallback if subscriptionOffers wasn't passed directly
        return await RNIap.requestPurchase({
          type: 'subs',
          request: {
            google: {
              skus: [sku],
              subscriptionOffers: [{ sku, offerToken: '' }],
            },
          },
        });
      }
      return await RNIap.requestPurchase({
        type: 'subs',
        request: {
          google: {
            skus: offers.map((o) => o.sku),
            subscriptionOffers: offers.map((o) => ({
              sku: o.sku,
              offerToken: o.offerToken,
            })),
          },
        },
      });
    }
  } catch (error) {
    console.warn('[iapWrapper] requestSubscription failed:', error);
    throw error;
  }
};

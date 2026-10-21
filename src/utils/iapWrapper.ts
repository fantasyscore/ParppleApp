import * as RNIap from 'react-native-iap';
import { Platform } from 'react-native';
import { logMetaEvent } from './MetaEvents';

// Re-export everything from react-native-iap
export * from 'react-native-iap';

/**
 * App Store receipt for a purchase (base64). react-native-iap v15 uses StoreKit 2 and no longer puts
 * `transactionReceipt` on the purchase object, so on iOS it is read from the app receipt instead.
 * Always undefined on Android.
 */
export const getIosReceipt = async (purchase: any): Promise<string | undefined> => {
  if (Platform.OS !== 'ios') return undefined;
  // Apple rejects a receipt with whitespace/newlines in it as malformed (status 21002)
  const clean = (receipt?: string | null) => (receipt ? receipt.replace(/\s+/g, '') : undefined);

  const fromPurchase = clean(purchase?.transactionReceipt);
  if (fromPurchase) return fromPurchase;

  try {
    const receipt = clean(await RNIap.getReceiptDataIOS());
    if (receipt) return receipt;
  } catch (error) {
    // StoreKit 2 purchases do not always leave a receipt file on the device yet; refresh it below
    console.warn('[iapWrapper] getReceiptDataIOS failed, refreshing the receipt:', error);
  }

  try {
    const receipt = clean(await RNIap.requestReceiptRefreshIOS());
    if (receipt) return receipt;
  } catch (error) {
    console.warn('[iapWrapper] requestReceiptRefreshIOS failed:', error);
  }
  console.warn('[iapWrapper] No App Store receipt available for', purchase?.productId);
  return undefined;
};

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
      logMetaEvent('InitiateCheckout', undefined, { content_id: sku, content_type: 'in-app' });
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
      logMetaEvent('InitiateCheckout', undefined, { content_id: skus[0], content_type: 'in-app' });
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
      logMetaEvent('InitiateCheckout', undefined, { content_id: sku, content_type: 'subs' });
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
        logMetaEvent('InitiateCheckout', undefined, { content_id: sku, content_type: 'subs' });
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
      logMetaEvent('InitiateCheckout', undefined, { content_id: offers[0].sku, content_type: 'subs' });
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

import analytics from '@react-native-firebase/analytics';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNIap from '../utils/iapWrapper';

const TRACKED_ANALYTICS_IDS_KEY = '@parpple_tracked_analytics_transaction_ids';
const PENDING_ANALYTICS_PURCHASES_KEY = '@parpple_pending_analytics_purchases';
const MAX_TRACKED_IDS = 200;
const MAX_PENDING_PURCHASES = 50;

/** In-memory guard against concurrent duplicate logging for the same transaction */
const inFlightTransactionIds = new Set<string>();

export type PurchaseAnalyticsType = 'in-app' | 'subs';

export interface PendingAnalyticsPurchase {
  transactionId: string;
  productId: string;
  type: PurchaseAnalyticsType;
  savedAt: number;
}

/**
 * Returns a stable transaction identifier for deduplication and GA4 transaction_id.
 * Never falls back to productId — that would collapse distinct purchases.
 */
export const getPurchaseTransactionId = (purchase: any): string => {
  const id =
    purchase?.transactionId ||
    purchase?.orderId ||
    purchase?.transactionIdentifier ||
    purchase?.purchaseToken ||
    '';
  return id ? String(id) : '';
};

/**
 * Checks if a transaction has already been logged to Firebase Analytics.
 */
export const hasBeenTracked = async (transactionId: string): Promise<boolean> => {
  if (!transactionId) return false;
  try {
    const raw = await AsyncStorage.getItem(TRACKED_ANALYTICS_IDS_KEY);
    if (!raw) return false;
    const list = JSON.parse(raw);
    return Array.isArray(list) && list.includes(transactionId);
  } catch {
    return false;
  }
};

/**
 * Marks a transaction as successfully tracked in persistent storage.
 */
export const markAsTracked = async (transactionId: string): Promise<void> => {
  if (!transactionId) return;
  try {
    const raw = await AsyncStorage.getItem(TRACKED_ANALYTICS_IDS_KEY);
    let list: string[] = [];
    if (raw) {
      list = JSON.parse(raw);
      if (!Array.isArray(list)) list = [];
    }
    if (!list.includes(transactionId)) {
      list.push(transactionId);
      if (list.length > MAX_TRACKED_IDS) {
        list = list.slice(-MAX_TRACKED_IDS);
      }
      await AsyncStorage.setItem(TRACKED_ANALYTICS_IDS_KEY, JSON.stringify(list));
    }
  } catch (error) {
    console.warn('[AnalyticsService] Failed to mark transaction as tracked:', error);
  }
};

async function savePendingAnalyticsPurchase(entry: PendingAnalyticsPurchase): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(PENDING_ANALYTICS_PURCHASES_KEY);
    let list: PendingAnalyticsPurchase[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) list = [];
    const exists = list.some((p) => p.transactionId === entry.transactionId);
    if (!exists) {
      list.push(entry);
      if (list.length > MAX_PENDING_PURCHASES) {
        list = list.slice(-MAX_PENDING_PURCHASES);
      }
      await AsyncStorage.setItem(PENDING_ANALYTICS_PURCHASES_KEY, JSON.stringify(list));
    }
  } catch (error) {
    console.warn('[AnalyticsService] Failed to persist pending analytics purchase:', error);
  }
}

async function removePendingAnalyticsPurchase(transactionId: string): Promise<void> {
  if (!transactionId) return;
  try {
    const raw = await AsyncStorage.getItem(PENDING_ANALYTICS_PURCHASES_KEY);
    if (!raw) return;
    const list: PendingAnalyticsPurchase[] = JSON.parse(raw);
    if (!Array.isArray(list)) return;
    const next = list.filter((p) => p.transactionId !== transactionId);
    await AsyncStorage.setItem(PENDING_ANALYTICS_PURCHASES_KEY, JSON.stringify(next));
  } catch {
    // non-fatal
  }
}

function parsePriceFromProduct(product: any, type: PurchaseAnalyticsType): { price: number; currency: string } {
  let price = 0;
  let currency = 'USD';

  if (Platform.OS === 'ios') {
    const rawPrice = product?.price ?? product?.localizedPrice ?? product?.displayPrice;
    if (typeof rawPrice === 'number') {
      price = rawPrice;
    } else if (typeof rawPrice === 'string') {
      price = parseFloat(rawPrice.replace(/[^0-9.]/g, '')) || 0;
    }
    currency = product?.currency || product?.currencyCode || 'USD';
  } else {
    const androidProduct = product as any;
    if (type === 'subs') {
      const offerDetails =
        androidProduct.subscriptionOfferDetailsAndroid || androidProduct.subscriptionOfferDetails;
      const phase = offerDetails?.[0]?.pricingPhases?.pricingPhaseList?.[0];
      if (phase) {
        price = parseFloat(phase.priceAmountMicros) / 1_000_000 || 0;
        currency = phase.priceCurrencyCode || 'USD';
      }
    } else {
      const phase = androidProduct.oneTimePurchaseOfferDetails;
      if (phase) {
        price = parseFloat(phase.priceAmountMicros) / 1_000_000 || 0;
        currency = phase.priceCurrencyCode || 'USD';
      }
    }
  }

  return { price, currency };
}

/**
 * Initialize Firebase Analytics (call once on app startup).
 */
export const initializeAnalytics = async (): Promise<void> => {
  try {
    await analytics().setAnalyticsCollectionEnabled(true);
    console.log('[AnalyticsService] Analytics collection enabled');
  } catch (error) {
    console.warn('[AnalyticsService] Failed to initialize analytics:', error);
  }
};

/**
 * Log a screen view (GA4 recommended screen_view event).
 */
export const logScreenView = async (screenName: string, screenClass?: string): Promise<void> => {
  if (!screenName) return;
  try {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
  } catch (error) {
    console.warn('[AnalyticsService] logScreenView failed:', error);
  }
};

/**
 * Log a login event (GA4 recommended login event).
 */
export const logLogin = async (method: string): Promise<void> => {
  try {
    await analytics().logLogin({ method });
  } catch (error) {
    console.warn('[AnalyticsService] logLogin failed:', error);
  }
};

/**
 * Log a sign-up event (GA4 recommended sign_up event).
 */
export const logSignUp = async (method: string): Promise<void> => {
  try {
    await analytics().logSignUp({ method });
  } catch (error) {
    console.warn('[AnalyticsService] logSignUp failed:', error);
  }
};

/**
 * Associate analytics events with the authenticated user.
 */
export const setAnalyticsUserId = async (userId: string | null | undefined): Promise<void> => {
  try {
    await analytics().setUserId(userId ? String(userId) : null);
  } catch (error) {
    console.warn('[AnalyticsService] setUserId failed:', error);
  }
};

/**
 * Set a user property on the analytics user.
 */
export const setAnalyticsUserProperty = async (name: string, value: string | null): Promise<void> => {
  try {
    await analytics().setUserProperty(name, value);
  } catch (error) {
    console.warn('[AnalyticsService] setUserProperty failed:', error);
  }
};

/**
 * Re-process purchases that were verified but whose analytics event was not yet sent
 * (e.g. app killed mid-flight). Called on app startup.
 */
export const flushPendingPurchaseAnalytics = async (): Promise<void> => {
  try {
    const raw = await AsyncStorage.getItem(PENDING_ANALYTICS_PURCHASES_KEY);
    if (!raw) return;
    const list: PendingAnalyticsPurchase[] = JSON.parse(raw);
    if (!Array.isArray(list) || list.length === 0) return;

    for (const pending of list) {
      if (!pending?.transactionId || !pending?.productId) continue;
      const alreadyTracked = await hasBeenTracked(pending.transactionId);
      if (alreadyTracked) {
        await removePendingAnalyticsPurchase(pending.transactionId);
        continue;
      }

      await trackSuccessfulPurchase(
        {
          productId: pending.productId,
          transactionId: pending.transactionId,
          orderId: pending.transactionId,
        },
        pending.type
      );
    }
  } catch (error) {
    console.warn('[AnalyticsService] flushPendingPurchaseAnalytics failed:', error);
  }
};

/**
 * Tracks a verified successful purchase in Firebase Analytics (GA4 `purchase` event).
 * Must only be called AFTER backend verification succeeds.
 *
 * @param purchase - The native purchase object from react-native-iap
 * @param type - Product type: 'in-app' (one-time purchase) or 'subs' (subscription)
 */
export const trackSuccessfulPurchase = async (
  purchase: any,
  type: PurchaseAnalyticsType
): Promise<void> => {
  const productId = purchase?.productId || purchase?.productIdentifier || purchase?.id || '';
  const transactionId = getPurchaseTransactionId(purchase);

  if (!productId || !transactionId) {
    console.warn('[AnalyticsService] Missing productId or transactionId, cannot track purchase.');
    return;
  }

  if (inFlightTransactionIds.has(transactionId)) {
    console.log(`[AnalyticsService] Purchase tracking already in-flight for: ${transactionId}`);
    return;
  }

  const alreadyTracked = await hasBeenTracked(transactionId);
  if (alreadyTracked) {
    console.log(`[AnalyticsService] Purchase already tracked for transaction: ${transactionId}`);
    await removePendingAnalyticsPurchase(transactionId);
    return;
  }

  inFlightTransactionIds.add(transactionId);
  await savePendingAnalyticsPurchase({
    transactionId,
    productId,
    type,
    savedAt: Date.now(),
  });

  try {
    let price = 0;
    let currency = 'USD';
    let itemName = productId;

    try {
      const storeProducts = await RNIap.fetchProducts({
        skus: [productId],
        type,
      });

      if (storeProducts && storeProducts.length > 0) {
        const product = storeProducts[0];
        itemName = product.title || product.displayName || productId;
        const parsed = parsePriceFromProduct(product, type);
        price = parsed.price;
        currency = parsed.currency;
      }
    } catch (fetchErr) {
      console.warn(
        `[AnalyticsService] Failed to fetch product details for ${productId}, using defaults:`,
        fetchErr
      );
    }

    // GA4 recommended ecommerce event (maps to `purchase` in Firebase/GA4)
    await analytics().logPurchase({
      transaction_id: transactionId,
      value: price,
      currency,
      items: [
        {
          item_id: productId,
          item_name: itemName,
          price,
          quantity: 1,
        },
      ],
    });

    console.log('[AnalyticsService] Logged purchase event:', {
      transaction_id: transactionId,
      product_id: productId,
      value: price,
      currency,
    });

    await markAsTracked(transactionId);
    await removePendingAnalyticsPurchase(transactionId);
  } catch (err) {
    console.error('[AnalyticsService] Error logging purchase to Firebase:', err);
  } finally {
    inFlightTransactionIds.delete(transactionId);
  }
};

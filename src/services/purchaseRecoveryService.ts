import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as RNIap from "../utils/iapWrapper";
import { appOperation } from "../appOperation";
import {
  trackSuccessfulPurchase,
  getPurchaseTransactionId,
  hasBeenTracked,
  flushPendingPurchaseAnalytics,
} from "./analyticsService";

const RECOVERED_TRANSACTION_IDS_KEY = "@parpple_recovered_transaction_ids";
const MAX_STORED_TRANSACTION_IDS = 200;

/**
 * Purchase Recovery Service
 *
 * Recovers completed, canceled, and pending in-app purchases on app launch
 * and sends them to the backend recovery API. Works for both Google Play (Android)
 * and App Store (iOS). Ensures every successful purchase is eventually verified
 * even if the app was closed immediately after payment.
 */

export interface RecoveredPurchase {
  orderId?: string;
  productId: string;
  purchaseToken?: string;
  purchaseTime?: number;
  transactionDate?: number;
  transactionId?: string;
  originalTransactionIdentifierIOS?: string;
  transactionReceipt?: string;
  purchaseState?: number;
  isAcknowledged?: boolean;
  platform: "android" | "ios";
}

/**
 * Format purchase data from react-native-iap for recovery API
 */
function formatPurchaseForRecovery(purchase: any): RecoveredPurchase {
  const basePurchase: RecoveredPurchase = {
    productId: purchase.productId || purchase.productIdentifier || purchase.id || "",
    platform: Platform.OS === "android" ? "android" : "ios",
  };

  // Android (Google Play) format
  if (Platform.OS === "android") {
    return {
      ...basePurchase,
      orderId: purchase.orderId || purchase.transactionId || "",
      purchaseToken: purchase.purchaseToken || purchase.token || "",
      purchaseTime: purchase.purchaseTime || purchase.transactionDate || Date.now(),
      transactionDate: purchase.transactionDate || purchase.purchaseTime || Date.now(),
      transactionReceipt: purchase.transactionReceipt || "",
      purchaseState: purchase.purchaseState ?? 0, // 0 = purchased, 1 = canceled, etc.
      isAcknowledged: purchase.isAcknowledged || false,
    };
  }

  // iOS (App Store) format
  return {
    ...basePurchase,
    orderId: purchase.transactionId || purchase.originalTransactionIdentifierIOS || "",
    transactionId: purchase.transactionId || "",
    originalTransactionIdentifierIOS: purchase.originalTransactionIdentifierIOS || "",
    transactionReceipt: purchase.transactionReceipt || "",
    purchaseTime: purchase.transactionDate || Date.now(),
    transactionDate: purchase.transactionDate || Date.now(),
    purchaseState: 0, // iOS doesn't have purchaseState, default to 0 (purchased)
    isAcknowledged: purchase.isAcknowledged || false,
  };
}

/**
 * Get unique transaction key for deduplication (transactionId on iOS, orderId/purchaseToken on Android).
 */
function getTransactionKey(purchase: any): string | null {
  const id = getPurchaseTransactionId(purchase);
  return id || null;
}

let recoveryInProgress: Promise<boolean> | null = null;

/**
 * Load set of transaction IDs we have already sent to the backend (avoid duplicate receipts).
 */
export async function getAlreadyRecoveredTransactionIds(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(RECOVERED_TRANSACTION_IDS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

/**
 * Persist transaction IDs after successful recovery (trim to max size).
 */
export async function addRecoveredTransactionIds(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  try {
    const existing = await getAlreadyRecoveredTransactionIds();
    ids.forEach((id) => existing.add(id));
    const arr = Array.from(existing).slice(-MAX_STORED_TRANSACTION_IDS);
    await AsyncStorage.setItem(RECOVERED_TRANSACTION_IDS_KEY, JSON.stringify(arr));
  } catch (e) {
    console.warn("[Purchase Recovery] Failed to persist recovered transaction IDs:", e);
  }
}

/**
 * Check if a productId is a consumable (chat packs, super likes, boosts, crush notes).
 * Chat packs ("5_chats", "10_chats", "20_chats") must be here: otherwise recovery logs them as a subscription and
 * finishes them without consuming, so the same pack can't be bought again.
 */
function isConsumableProduct(productId: string): boolean {
  const id = (productId || "").toLowerCase();
  return (
    /\d+_chats?$/.test(id) ||
    id.includes("super_like") ||
    id.includes("boost") ||
    id.includes("crush_note") ||
    id.includes("crush note")
  );
}

/**
 * Whether a purchase found by recovery is a new sale to report to analytics. The purchase screens report every
 * sale they complete, and they finish (acknowledge / consume) it right after. So a purchase the store still lists
 * as acknowledged was already handled earlier, typically an active subscription restored after a reinstall:
 * reporting it again counted the same order 2-4 times. Only an Android purchase that was paid but never finished
 * (app closed mid-purchase) is reported here. iOS has no such flag, so recovery doesn't report there.
 */
function isUnreportedNewPurchase(purchase: any): boolean {
  if (Platform.OS !== "android") return false;
  // Not paid yet (react-native-iap 15: "pending"; older versions: purchaseStateAndroid 2)
  if (purchase?.purchaseState === "pending" || purchase?.purchaseStateAndroid === 2) return false;
  const acknowledged = purchase?.isAcknowledgedAndroid ?? purchase?.isAcknowledged;
  return acknowledged === false;
}

/**
 * Get all available purchases from the store (App Store on iOS, Play Store on Android).
 * Includes non-consumed purchases and active subscriptions.
 */
async function getAvailablePurchasesFromStore(): Promise<{
  formatted: RecoveredPurchase[];
  raw: any[];
}> {
  try {
    console.log("[Purchase Recovery] Fetching available purchases from store...", { platform: Platform.OS });

    try {
      await RNIap.initConnection();
    } catch (error) {
      console.log("[Purchase Recovery] IAP connection already initialized or error:", error);
    }

    const purchases = await RNIap.getAvailablePurchases();

    if (!purchases || purchases.length === 0) {
      console.log("[Purchase Recovery] No available purchases found in store");
      return { formatted: [], raw: [] };
    }

    console.log(`[Purchase Recovery] Found ${purchases.length} available purchase(s)`);

    const valid = (purchases as any[]).filter(
      (p) => p?.productId || p?.productIdentifier || p?.id
    );
    const formatted = valid.map(formatPurchaseForRecovery);

    return { formatted, raw: valid };
  } catch (error: any) {
    console.error("[Purchase Recovery] Error fetching purchases from store:", error?.message || error);
    return { formatted: [], raw: [] };
  }
}

/**
 * Send recovered purchases to backend recovery API (recoverPurchaseAPI).
 */
async function sendRecoveredPurchasesToBackend(purchases: RecoveredPurchase[]): Promise<boolean> {
  if (purchases.length === 0) {
    console.log("[Purchase Recovery] No purchases to send to backend");
    return true;
  }

  try {
    console.log("[Purchase Recovery] Sending purchases to backend recovery API:", {
      count: purchases.length,
      productIds: purchases.map((p) => p.productId),
    });

    const payload = { purchases };
    const response: any = await appOperation.customer.recoverPurchaseAPI(payload);

    if (response?.statusCode === 200) {
      console.log("[Purchase Recovery] Successfully recovered purchases:", {
        count: purchases.length,
        message: response?.message,
      });
      return true;
    }
    console.warn("[Purchase Recovery] Backend returned non-200 status:", response?.statusCode);
    return false;
  } catch (error: any) {
    console.error("[Purchase Recovery] Error sending purchases to backend:", error?.message || error);
    return false;
  }
}

/**
 * On iOS, finish each transaction after successful backend recovery so it is removed
 * from the queue and not re-sent on next launch. Consumables: finish with isConsumable true;
 * subscriptions: finish with isConsumable false.
 */
/**
 * Finish recovered transactions on both iOS and Android after successful backend recovery
 * so they are removed from the queue and correctly settled with the store.
 */
async function finishRecoveredTransactions(rawPurchases: any[]): Promise<void> {
  if (rawPurchases.length === 0) return;
  for (const purchase of rawPurchases) {
    try {
      const productId = purchase?.productId || purchase?.productIdentifier || purchase?.id || "";
      const isConsumable = isConsumableProduct(productId);
      await RNIap.finishTransaction({ purchase, isConsumable });
      console.log(`[Purchase Recovery] Finished ${Platform.OS} transaction:`, { productId, isConsumable });
    } catch (e) {
      console.warn(`[Purchase Recovery] Failed to finish ${Platform.OS} transaction:`, e);
    }
  }
}

/**
 * Attempt analytics for store purchases that were already sent to the backend but never logged.
 */
async function reconcileMissedAnalytics(rawPurchases: any[]): Promise<void> {
  for (const purchase of rawPurchases) {
    const transactionKey = getTransactionKey(purchase);
    if (!transactionKey) continue;

    const alreadyRecovered = (await getAlreadyRecoveredTransactionIds()).has(transactionKey);
    if (!alreadyRecovered) continue;

    const alreadyTracked = await hasBeenTracked(transactionKey);
    if (alreadyTracked) continue;
    // Same rule as for new recoveries: a purchase the store lists as finished was reported when it was bought
    if (!isUnreportedNewPurchase(purchase)) continue;

    const productId = purchase?.productId || purchase?.productIdentifier || purchase?.id || "";
    const isConsumable = isConsumableProduct(productId);
    const type = isConsumable ? "in-app" : "subs";
    try {
      await trackSuccessfulPurchase(purchase, type);
    } catch (analyticsErr) {
      console.warn("[Purchase Recovery] Missed analytics reconciliation failed:", analyticsErr);
    }
  }
}

async function runPurchaseRecovery(): Promise<boolean> {
  try {
    console.log("[Purchase Recovery] Starting purchase recovery...", {
      platform: Platform.OS,
    });

    await flushPendingPurchaseAnalytics();

    const { formatted, raw } = await getAvailablePurchasesFromStore();

    if (formatted.length > 0) {
      await reconcileMissedAnalytics(raw);
    }

    if (formatted.length === 0) {
      console.log("[Purchase Recovery] No purchases to recover");
      return true;
    }

    const alreadySent = await getAlreadyRecoveredTransactionIds();
    const newIndices: number[] = [];
    const newTransactionKeys: string[] = [];

    const stuckConsumables: any[] = [];

    formatted.forEach((p, i) => {
      const key =
        p.transactionId ||
        p.orderId ||
        getTransactionKey(raw[i]) ||
        "";
      if (key && !alreadySent.has(key)) {
        newIndices.push(i);
        newTransactionKeys.push(key);
      } else if (key && isConsumableProduct(p.productId)) {
        // Already sent to the backend but still owned: an older version finished chat packs without consuming
        // them, which blocks buying the same pack again. Consuming releases it (the chats were credited already).
        stuckConsumables.push(raw[i]);
      }
    });

    if (stuckConsumables.length > 0) {
      await finishRecoveredTransactions(stuckConsumables);
    }

    if (newIndices.length === 0) {
      console.log("[Purchase Recovery] All purchases already sent to backend (deduplicated)");
      return true;
    }

    const toSend = newIndices.map((i) => formatted[i]);
    const rawToFinish = newIndices.map((i) => raw[i]);

    const success = await sendRecoveredPurchasesToBackend(toSend);

    if (success) {
      for (const rawPurchase of rawToFinish) {
        // Already reported when it was bought (e.g. a subscription restored after a reinstall)
        if (!isUnreportedNewPurchase(rawPurchase)) continue;
        try {
          const productId = rawPurchase?.productId || rawPurchase?.productIdentifier || rawPurchase?.id || "";
          const isConsumable = isConsumableProduct(productId);
          const type = isConsumable ? "in-app" : "subs";
          await trackSuccessfulPurchase(rawPurchase, type);
        } catch (analyticsErr) {
          console.warn("[Purchase Recovery] Analytics tracking failed for recovered purchase:", analyticsErr);
        }
      }

      await addRecoveredTransactionIds(newTransactionKeys);
      await finishRecoveredTransactions(rawToFinish);
      console.log("[Purchase Recovery] Purchase recovery completed successfully");
    } else {
      console.warn("[Purchase Recovery] Purchase recovery completed with errors");
    }

    return true;
  } catch (error: any) {
    console.error("[Purchase Recovery] Fatal error during purchase recovery:", error?.message || error);
    return true;
  }
}

export async function recoverPurchasesOnStartup(): Promise<boolean> {
  if (recoveryInProgress) {
    return recoveryInProgress;
  }

  recoveryInProgress = runPurchaseRecovery().finally(() => {
    recoveryInProgress = null;
  });

  return recoveryInProgress;
}

/**
 * Cleanup function to close IAP connection if needed
 * Call this if you want to explicitly close the connection after recovery
 */
export async function cleanupPurchaseRecovery(): Promise<void> {
  try {
    await RNIap.endConnection();
  } catch (error) {
    // Ignore errors - connection might not be open
  }
}


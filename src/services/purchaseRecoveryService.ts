import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as RNIap from "react-native-iap";
import { appOperation } from "../appOperation";

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
 * Get unique transaction key for deduplication (transactionId on iOS, orderId on Android).
 */
function getTransactionKey(purchase: any): string | null {
  const id = purchase?.transactionId || purchase?.orderId || purchase?.transactionIdentifier;
  return id ? String(id) : null;
}

/**
 * Load set of transaction IDs we have already sent to the backend (avoid duplicate receipts).
 */
async function getAlreadyRecoveredTransactionIds(): Promise<Set<string>> {
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
async function addRecoveredTransactionIds(ids: string[]): Promise<void> {
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
 * Check if a productId is a consumable (super likes, boosts, crush notes).
 */
function isConsumableProduct(productId: string): boolean {
  const id = (productId || "").toLowerCase();
  return (
    id.includes("super_like") ||
    id.includes("boost") ||
    id.includes("crush_note") ||
    id.includes("crush note")
  );
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
async function finishRecoveredTransactionsOnIos(rawPurchases: any[]): Promise<void> {
  if (Platform.OS !== "ios" || rawPurchases.length === 0) return;
  for (const purchase of rawPurchases) {
    try {
      const productId = purchase?.productId || purchase?.productIdentifier || purchase?.id || "";
      const isConsumable = isConsumableProduct(productId);
      await RNIap.finishTransaction({ purchase, isConsumable });
      console.log("[Purchase Recovery] Finished iOS transaction:", { productId, isConsumable });
    } catch (e) {
      console.warn("[Purchase Recovery] Failed to finish iOS transaction:", e);
    }
  }
}

/**
 * Main recovery function. Called on app startup (see App.tsx).
 * Fetches all previous purchases from the store (getAvailablePurchases), deduplicates
 * by transactionId, sends only new ones to recoverPurchaseAPI, then on iOS finishes
 * transactions so they are not re-sent. Guarantees every successful App Store / Play
 * Store purchase is eventually verified even if the app was closed right after payment.
 *
 * @returns Promise<boolean> - true if recovery was attempted (regardless of success)
 */
export async function recoverPurchasesOnStartup(): Promise<boolean> {
  try {
    console.log("[Purchase Recovery] Starting purchase recovery on app startup...", {
      platform: Platform.OS,
    });

    const { formatted, raw } = await getAvailablePurchasesFromStore();

    if (formatted.length === 0) {
      console.log("[Purchase Recovery] No purchases to recover");
      return true;
    }

    const alreadySent = await getAlreadyRecoveredTransactionIds();
    const newIndices: number[] = [];
    const newTransactionKeys: string[] = [];

    formatted.forEach((p, i) => {
      const key =
        p.transactionId ||
        p.orderId ||
        getTransactionKey(raw[i]) ||
        "";
      if (key && !alreadySent.has(key)) {
        newIndices.push(i);
        newTransactionKeys.push(key);
      }
    });

    if (newIndices.length === 0) {
      console.log("[Purchase Recovery] All purchases already sent to backend (deduplicated)");
      return true;
    }

    const toSend = newIndices.map((i) => formatted[i]);
    const rawToFinish = newIndices.map((i) => raw[i]);

    const success = await sendRecoveredPurchasesToBackend(toSend);

    if (success) {
      await addRecoveredTransactionIds(newTransactionKeys);
      await finishRecoveredTransactionsOnIos(rawToFinish);
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


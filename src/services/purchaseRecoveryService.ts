import { Platform } from "react-native";
import * as RNIap from "react-native-iap";
import { appOperation } from "../appOperation";

/**
 * Purchase Recovery Service
 * 
 * Recovers completed, canceled, and pending in-app purchases on app launch
 * and sends them to the backend recovery API.
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
 * Get all available purchases from the store
 * This includes:
 * - Completed purchases that haven't been consumed/finished
 * - Active subscriptions
 * - Pending purchases (in some cases)
 */
async function getAvailablePurchasesFromStore(): Promise<RecoveredPurchase[]> {
  try {
    console.log("[Purchase Recovery] Fetching available purchases from store...");
    
    // Initialize connection if not already initialized
    try {
      await RNIap.initConnection();
    } catch (error) {
      // Connection might already be initialized, that's okay
      console.log("[Purchase Recovery] IAP connection already initialized or error:", error);
    }

    // Get available purchases (non-consumed and active subscriptions)
    const purchases = await RNIap.getAvailablePurchases();
    
    if (!purchases || purchases.length === 0) {
      console.log("[Purchase Recovery] No available purchases found in store");
      return [];
    }

    console.log(`[Purchase Recovery] Found ${purchases.length} available purchase(s)`);
    
    // Format purchases for recovery API
    const formattedPurchases = purchases
      .filter((purchase:any) => purchase?.productId || purchase?.productIdentifier || purchase?.id)
      .map(formatPurchaseForRecovery);

    return formattedPurchases;
  } catch (error: any) {
    console.error("[Purchase Recovery] Error fetching purchases from store:", error?.message || error);
    // Don't throw - recovery should fail silently to not block app startup
    return [];
  }
}

/**
 * Send recovered purchases to backend recovery API
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

    const payload = {
      purchases: purchases,
    };

    const response:any = await appOperation.customer.recoverPurchaseAPI(payload);

    if (response?.statusCode === 200) {
      console.log("[Purchase Recovery] Successfully recovered purchases:", {
        count: purchases.length,
        message: response?.message,
      });
      return true;
    } else {
      console.warn("[Purchase Recovery] Backend returned non-200 status:", response?.statusCode);
      return false;
    }
  } catch (error: any) {
    console.error("[Purchase Recovery] Error sending purchases to backend:", error?.message || error);
    // Don't throw - recovery should fail silently
    return false;
  }
}

/**
 * Main recovery function
 * 
 * This should be called on app startup to recover any purchases that might have
 * been missed due to app closure, payment cancellation, or pending states.
 * 
 * @returns Promise<boolean> - true if recovery was attempted (regardless of success)
 */
export async function recoverPurchasesOnStartup(): Promise<boolean> {
  try {
    console.log("[Purchase Recovery] Starting purchase recovery on app startup...");

    // Get available purchases from store
    const purchases = await getAvailablePurchasesFromStore();

    if (purchases.length === 0) {
      console.log("[Purchase Recovery] No purchases to recover");
      return true;
    }

    // Send to backend
    const success = await sendRecoveredPurchasesToBackend(purchases);

    if (success) {
      console.log("[Purchase Recovery] Purchase recovery completed successfully");
    } else {
      console.warn("[Purchase Recovery] Purchase recovery completed with errors");
    }

    return true;
  } catch (error: any) {
    console.error("[Purchase Recovery] Fatal error during purchase recovery:", error?.message || error);
    // Return true to indicate we attempted recovery (even if it failed)
    // This prevents blocking app startup
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


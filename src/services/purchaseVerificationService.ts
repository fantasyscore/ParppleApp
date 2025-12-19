import { Platform } from "react-native";
import { PurchaseData, PendingPurchase } from "../slices/purchase/purchaseSlice";

/**
 * Extract purchase data from react-native-iap purchase response
 * Handles both Android (Google Play) and iOS (App Store) formats
 */
export const extractPurchaseData = (purchase: any, userId: string, purchaseType: 'subscription' | 'one-time'): Omit<PendingPurchase, 'retryCount' | 'lastRetryTime'> => {
  // Android (Google Play) format
  if (Platform.OS === 'android') {
    return {
      orderId: purchase.orderId || purchase.transactionId || '',
      productId: purchase.productId || purchase.productIds?.[0] || '',
      purchaseToken: purchase.purchaseToken || purchase.token || '',
      purchaseTime: purchase.purchaseTime || purchase.transactionDate || Date.now(),
      purchaseState: purchase.purchaseState ?? 0,
      transactionDate: purchase.transactionDate || purchase.purchaseTime || Date.now(),
      transactionReceipt: purchase.transactionReceipt || purchase.originalTransactionIdentifierIOS || '',
      isAcknowledged: purchase.isAcknowledged || false,
      userId,
      purchaseType,
    };
  }

  // iOS (App Store) format
  return {
    orderId: purchase.transactionId || purchase.originalTransactionIdentifierIOS || '',
    productId: purchase.productId || purchase.productIdentifier || '',
    purchaseToken: purchase.transactionReceipt || purchase.originalTransactionIdentifierIOS || '',
    purchaseTime: purchase.transactionDate || Date.now(),
    purchaseState: 0, // iOS doesn't have purchaseState, default to 0 (purchased)
    transactionDate: purchase.transactionDate || Date.now(),
    transactionReceipt: purchase.transactionReceipt || '',
    originalTransactionIdentifierIOS: purchase.originalTransactionIdentifierIOS || '',
    isAcknowledged: purchase.isAcknowledged || false,
    userId,
    purchaseType,
  };
};

/**
 * Prepare payload for backend verification API
 * Only includes required fields for Google Play verification
 */
export const prepareVerificationPayload = (purchase: PendingPurchase) => {
  return {
    userId: purchase.userId,
    orderId: purchase.orderId,
    productId: purchase.productId,
    purchaseToken: purchase.purchaseToken,
    purchaseTime: purchase.purchaseTime,
    // Optional: Include platform for backend routing
    platform: Platform.OS,
    purchaseType: purchase.purchaseType,
  };
};

/**
 * API Configuration
 * Set your backend API base URL here or in environment variables
 */
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' // Development
  : 'https://your-api-domain.com/api'; // Production

/**
 * Get authentication token
 * TODO: Implement your token retrieval logic
 */
const getAuthToken = async (): Promise<string | null> => {
  // TODO: Get token from your auth storage (AsyncStorage, SecureStore, etc.)
  // Example:
  // import AsyncStorage from '@react-native-async-storage/async-storage';
  // return await AsyncStorage.getItem('authToken');
  return null;
};

/**
 * Verify purchase with backend API
 * 
 * @param purchase - Pending purchase to verify
 * @returns Promise<boolean> - true if verification succeeds
 */
export const verifyPurchaseWithBackend = async (purchase: PendingPurchase): Promise<boolean> => {
  try {
    const payload = prepareVerificationPayload(purchase);
    
    console.log('[Purchase Verification] Sending to backend:', {
      userId: payload.userId,
      orderId: payload.orderId,
      productId: payload.productId,
      purchaseType: payload.purchaseType,
    });

    // Get authentication token
    const token = await getAuthToken();
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Make API call to backend
    const response = await fetch(`${API_BASE_URL}/verify-purchase`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Verification failed: ${response.statusText} (${response.status})`
      );
    }

    // Parse response
    const result = await response.json();
    
    // Check if verification was successful
    if (result.success === true) {
      console.log('[Purchase Verification] Backend verification successful:', {
        orderId: payload.orderId,
        entitlements: result.entitlements,
      });
      return true;
    } else {
      throw new Error(result.error || 'Verification returned false');
    }
  } catch (error: any) {
    console.error('[Purchase Verification] Backend verification failed:', {
      error: error.message,
      orderId: purchase.orderId,
      productId: purchase.productId,
    });
    
    // Re-throw with more context
    throw new Error(
      error.message || 'Network error during purchase verification'
    );
  }
};

/**
 * Retry configuration
 */
export const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelayMs: 5000, // 5 seconds
  exponentialBackoff: true, // Double delay on each retry
};

/**
 * Check if purchase should be retried
 */
export const shouldRetryVerification = (purchase: PendingPurchase): boolean => {
  if (purchase.retryCount >= RETRY_CONFIG.maxRetries) {
    return false;
  }

  // If no last retry time, allow immediate retry
  if (!purchase.lastRetryTime) {
    return true;
  }

  // Calculate delay with exponential backoff
  const delay = RETRY_CONFIG.exponentialBackoff
    ? RETRY_CONFIG.retryDelayMs * Math.pow(2, purchase.retryCount)
    : RETRY_CONFIG.retryDelayMs;

  const timeSinceLastRetry = Date.now() - purchase.lastRetryTime;
  return timeSinceLastRetry >= delay;
};


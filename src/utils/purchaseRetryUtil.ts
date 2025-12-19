import { store } from '../store/store';
import { verifyPurchaseWithBackend, shouldRetryVerification } from '../services/purchaseVerificationService';
import {
  clearPendingPurchase,
  incrementRetryCount,
  setVerifying,
  PendingPurchase,
} from '../slices/purchase/purchaseSlice';

/**
 * Retry verification for all pending purchases
 * Call this on app startup or when network connectivity is restored
 */
export const retryAllPendingPurchases = async () => {
  const state = store.getState();
  const pendingPurchases: PendingPurchase[] = (state as any).purchase?.pendingPurchases || [];

  if (pendingPurchases.length === 0) {
    console.log('[Purchase Retry] No pending purchases to verify');
    return;
  }

  console.log(`[Purchase Retry] Found ${pendingPurchases.length} pending purchase(s) to verify`);

  for (const purchase of pendingPurchases) {
    if (shouldRetryVerification(purchase)) {
      try {
        store.dispatch(setVerifying(true));
        
        const success = await verifyPurchaseWithBackend(purchase);

        if (success) {
          // Clear from pending purchases
          store.dispatch(
            clearPendingPurchase({
              orderId: purchase.orderId,
              productId: purchase.productId,
            })
          );
          console.log(`[Purchase Retry] Successfully verified purchase: ${purchase.orderId}`);
        } else {
          throw new Error('Backend verification returned false');
        }
      } catch (error) {
        console.error(`[Purchase Retry] Failed to verify purchase ${purchase.orderId}:`, error);
        
        // Increment retry count
        store.dispatch(
          incrementRetryCount({
            orderId: purchase.orderId,
            productId: purchase.productId,
          })
        );
      } finally {
        store.dispatch(setVerifying(false));
      }
    } else {
      console.log(
        `[Purchase Retry] Skipping purchase ${purchase.orderId} - max retries reached or not ready for retry`
      );
    }
  }
};


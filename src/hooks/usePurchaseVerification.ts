import { useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from 'react-native';
import * as RNIap from 'react-native-iap';
import {
  savePendingPurchase,
  clearPendingPurchase,
  incrementRetryCount,
  setVerifying,
} from '../slices/purchase/purchaseSlice';
import {
  extractPurchaseData,
  verifyPurchaseWithBackend,
  shouldRetryVerification,
} from '../services/purchaseVerificationService';
import { subscriptionVerifyAPI } from '../actions/authActions';

/**
 * Hook to handle purchase verification workflow
 * Saves purchase to state, verifies with backend, and cleans up
 */
export const usePurchaseVerification = () => {
  const dispatch = useDispatch();
  const userData = useSelector((state: any) => state.auth.userData);
  const pendingPurchases = useSelector((state: any) => state.purchase.pendingPurchases);
  const isVerifying = useSelector((state: any) => state.purchase.isVerifying);
  const pendingPurchasesRef = useRef(pendingPurchases);

  // Keep ref in sync with state
  pendingPurchasesRef.current = pendingPurchases;

  /**
   * Handle successful purchase from Google Play / App Store
   * Saves purchase data to state and triggers verification
   */
  const handlePurchaseSuccess = useCallback(
    async (
      purchase: any,
      purchaseType: 'subscription' | 'one-time',
      onSuccess?: () => void,
      onError?: (error: Error) => void
    ) => {
      try {
        const userId = userData?.id || userData?.userId || '';
        if (!userId) {
          throw new Error('User ID not found. Please login again.');
        }

        // Extract purchase data
        const purchaseData = extractPurchaseData(purchase, userId, purchaseType);
        const data = {
          productId: purchaseData.productId,
          purchaseType: purchaseData.purchaseToken,
          platform:"android"
        }
        dispatch(subscriptionVerifyAPI(data))
        // Validate required fields
        if (!purchaseData.orderId || !purchaseData.productId || !purchaseData.purchaseToken) {
          throw new Error('Invalid purchase data received from store');
        }

        // Save to Redux state
        dispatch(savePendingPurchase(purchaseData));

        // Finish transaction with store (acknowledge purchase)
        const isConsumable = purchaseType === 'one-time';
        await RNIap.finishTransaction({ purchase, isConsumable });

        // Trigger verification (async, non-blocking)
        verifyPurchaseInBackground(purchaseData, onSuccess, onError);
      } catch (error: any) {
        console.error('[Purchase Verification] Error handling purchase:', error);
        onError?.(error);
      }
    },
    [userData, dispatch]
  );

  /**
   * Verify purchase with backend in background
   * Handles retries automatically
   */
  const verifyPurchaseInBackground = useCallback(
    async (
      purchaseData: any,
      onSuccess?: () => void,
      onError?: (error: Error) => void
    ) => {
      try {
        dispatch(setVerifying(true));
        const data = {
          productId: purchaseData.productId,
          purchaseType: purchaseData.purchaseToken,
          platform:"android"
        }
        dispatch(subscriptionVerifyAPI(data))
        const success = await verifyPurchaseWithBackend(purchaseData);

        if (success) {
          // Clear from pending purchases
          dispatch(
            clearPendingPurchase({
              orderId: purchaseData.orderId,
              productId: purchaseData.productId,
            })
          );

          dispatch(setVerifying(false));
          onSuccess?.();
        } else {
          throw new Error('Backend verification returned false');
        }
      } catch (error: any) {
        console.error('[Purchase Verification] Verification failed:', error);

        // Check if we should retry (before incrementing)
        const shouldRetry = shouldRetryVerification(purchaseData);

        if (shouldRetry) {
          // Increment retry count
          dispatch(
            incrementRetryCount({
              orderId: purchaseData.orderId,
              productId: purchaseData.productId,
            })
          );

          // Retry after delay - get fresh purchase data from ref
          setTimeout(() => {
            const freshPurchases = pendingPurchasesRef.current;
            const freshPurchase = freshPurchases.find(
              (p: any) => p.orderId === purchaseData.orderId && p.productId === purchaseData.productId
            );

            if (freshPurchase && shouldRetryVerification(freshPurchase)) {
              verifyPurchaseInBackground(freshPurchase, onSuccess, onError);
            } else {
              // Max retries reached
              dispatch(setVerifying(false));
              const errorMsg = new Error(
                `Purchase verification failed after ${freshPurchase?.retryCount || purchaseData.retryCount + 1} attempts. Please contact support.`
              );
              onError?.(errorMsg);
            }
          }, 5000);
        } else {
          // Max retries reached
          dispatch(setVerifying(false));
          const errorMsg = new Error(
            `Purchase verification failed after ${purchaseData.retryCount + 1} attempts. Please contact support.`
          );
          onError?.(errorMsg);
        }
      }
    },
    [dispatch, pendingPurchases]
  );

  /**
   * Retry verification for all pending purchases
   * Useful on app startup or when network is restored
   */
  const retryPendingPurchases = useCallback(() => {
    pendingPurchases.forEach((purchase: any) => {
      if (shouldRetryVerification(purchase)) {
        verifyPurchaseInBackground(purchase);
      }
    });
  }, [pendingPurchases, verifyPurchaseInBackground]);

  return {
    handlePurchaseSuccess,
    retryPendingPurchases,
    pendingPurchases,
    isVerifying,
  };
};


import { useEffect, useRef, useState } from "react";
import { Alert, Platform } from "react-native";
import { useDispatch } from "react-redux";
import * as RNIap from "../../../utils/iapWrapper";
import { getPurchaseTransactionId, trackSuccessfulPurchase } from "../../../services/analyticsService";
import { addRecoveredTransactionIds, getAlreadyRecoveredTransactionIds } from "../../../services/purchaseRecoveryService";
import { getProfile, subscriptionVerifyAPI } from "../../../actions/authActions";
import { PaymentStage } from "../../../components/Payment/PaymentStatusModal";
import { ALL_SUBSCRIPTION_SKUS, buildSubscriptionPlans, selectBaseOffer } from "./pricing";

/**
 * The subscription purchase flow: loads the plans, starts the store purchase and verifies every
 * purchase update with the backend before acknowledging it.
 */
export function useSubscriptionPurchase() {
  const dispatch = useDispatch();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [verifyVisible, setVerifyVisible] = useState(false);
  const [verifyStage, setVerifyStage] = useState<PaymentStage>("verifying");
  const [verifyError, setVerifyError] = useState("");
  const [verifyResponse, setVerifyResponse] = useState<any>(null);
  const lastVerifiedKeyRef = useRef<string | null>(null);
  const isVerifyingRef = useRef(false);
  const purchaseInitiatedRef = useRef(false);

  useEffect(() => {
    let purchaseUpdateSubscription: any;
    let purchaseErrorSubscription: any;

    const initializeIAP = async () => {
      try {
        setLoading(true);
        await RNIap.initConnection();
        const rawProducts = await RNIap.getSubscriptions({ skus: ALL_SUBSCRIPTION_SKUS });
        const availableProducts = Array.isArray(rawProducts) ? rawProducts : [];
        if (availableProducts.length > 0) {
          setPlans(buildSubscriptionPlans(availableProducts));
        }
      } catch (err) {
        console.warn("IAP Initialization Error:", err);
      } finally {
        setLoading(false);
      }
    };

    purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async (purchase: any) => {
      let isInitiated = false;
      try {
        // Pending (e.g. slow payment method): not paid yet. Don't verify or acknowledge, and keep
        // purchaseInitiatedRef so the later 'purchased' update still shows the verify modal.
        if (purchase?.purchaseState === "pending") {
          console.log("[Subscription] Purchase pending, waiting for completion");
          return;
        }
        const key = getPurchaseTransactionId(purchase);

        // Duplicate protection check
        const alreadyVerified = await getAlreadyRecoveredTransactionIds();
        if (key && alreadyVerified.has(key)) {
          console.log(`[Subscription] Transaction ${key} already verified. Skipping duplicate.`);
          try {
            await RNIap.finishTransaction({ purchase, isConsumable: false });
          } catch (e) {
            console.warn("[Subscription] Duplicate finishTransaction skipped/failed:", e);
          }
          return;
        }

        if (isVerifyingRef.current) return;
        if (key && lastVerifiedKeyRef.current === key) return;

        isVerifyingRef.current = true;
        lastVerifiedKeyRef.current = key || null;

        isInitiated = purchaseInitiatedRef.current;
        purchaseInitiatedRef.current = false;

        if (isInitiated) {
          setVerifyVisible(true);
          setVerifyStage("verifying");
          setVerifyError("");
          setVerifyResponse(null);
          setProcessing(purchase?.productId || "verifying");
        }

        // iOS verifies with the receipt; Android with the purchase token
        const payload = {
          productId: purchase.productId,
          purchaseToken: Platform.OS === "ios" ? purchase.transactionReceipt : purchase.purchaseToken,
          platform: Platform.OS === "ios" ? "ios" : "android",
          transactionReceipt: purchase?.transactionReceipt,
        };
        const response: any = await dispatch(subscriptionVerifyAPI(payload));

        if (response?.statusCode !== 200) {
          throw new Error(response?.message || response?.data?.message || "Subscription verification failed");
        }

        // Track the purchase after verification, before persisting the recovery id
        await trackSuccessfulPurchase(purchase, "subs");

        if (key) {
          await addRecoveredTransactionIds([key]);
        }

        if (isInitiated) {
          setVerifyResponse(response);
          setVerifyStage("success");
        }
        try {
          await RNIap.finishTransaction({ purchase, isConsumable: false });
        } catch (finishErr) {
          console.warn("[Subscription] Client finishTransaction failed:", finishErr);
        }
        dispatch(getProfile(true));
      } catch (err) {
        console.error("[Subscription] Purchase handler error:", err);
        if (isInitiated) {
          setVerifyStage("error");
          setVerifyError((err as any)?.message || "Something went wrong while verifying your subscription.");
        }
      } finally {
        setProcessing(null);
        isVerifyingRef.current = false;
      }
    });

    purchaseErrorSubscription = RNIap.purchaseErrorListener((error: any) => {
      setProcessing(null);
      purchaseInitiatedRef.current = false;
      if (!error.message?.toLowerCase().includes("cancel")) {
        Alert.alert("Errors", error.message || "An error occurred during purchase.");
      }
    });

    initializeIAP();

    return () => {
      if (purchaseUpdateSubscription) purchaseUpdateSubscription.remove();
      if (purchaseErrorSubscription) purchaseErrorSubscription.remove();
      RNIap.endConnection();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Starts the store checkout for a plan from `plans`. */
  const startPurchase = async (plan: any) => {
    if (processing) return;
    if (!plan?.rawSubscription) return;

    const productId = plan.id;
    if (!productId) return;

    try {
      setProcessing(productId);
      purchaseInitiatedRef.current = true;

      if (Platform.OS === "ios") {
        await RNIap.requestSubscription({ sku: productId, andDangerouslyFinishTransactionAutomaticallyIOS: false });
      } else {
        const offer = selectBaseOffer(plan.rawSubscription);
        if (!offer?.offerToken) {
          throw new Error("No subscription offer token found for this product");
        }
        console.log("[Subscription] Purchasing", { productId, basePlanId: offer.basePlanId, offerId: offer.offerId, phases: offer.pricingPhases?.pricingPhaseList });
        await RNIap.requestSubscription({ subscriptionOffers: [{ sku: productId, offerToken: offer.offerToken }] });
      }
    } catch (err: any) {
      setProcessing(null);
      purchaseInitiatedRef.current = false;
      if (!err?.message?.toLowerCase?.().includes("cancel")) {
        console.log("[Subscription] Purchase error:", err);
      }
    }
  };

  return {
    plans,
    loading,
    processing,
    startPurchase,
    verify: {
      visible: verifyVisible,
      stage: verifyStage,
      error: verifyError,
      transactionId: verifyResponse?.data?.transactionId as string | undefined,
      close: () => setVerifyVisible(false),
    },
  };
}

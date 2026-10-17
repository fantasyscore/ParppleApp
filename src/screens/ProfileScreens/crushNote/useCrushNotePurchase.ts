import { useEffect, useRef, useState } from "react";
import { Alert, Platform } from "react-native";
import { useDispatch } from "react-redux";
import * as RNIap from "../../../utils/iapWrapper";
import { getPurchaseTransactionId, trackSuccessfulPurchase } from "../../../services/analyticsService";
import { addRecoveredTransactionIds, getAlreadyRecoveredTransactionIds } from "../../../services/purchaseRecoveryService";
import { getProfile, iosPucrchesAPIIs, verifyconsumableitemsAPI } from "../../../actions/authActions";
import { PaymentStage } from "../../../components/Payment/PaymentStatusModal";
import { buildChatPacks } from "./chatPacks";

// One-time Product SKUs
const PRODUCT_SKUS = Platform.select({
  android: ["20_chats", "10_chats", "5_chats"],
  ios: ["10_crush_notes", "3_crush_notes", "1_crush_note"],
}) ?? ["20_chats", "10_chats", "5_chats"];

/**
 * The chat-pack (consumable) purchase flow: loads the products, starts the store purchase,
 * and verifies every purchase update with the backend before consuming it.
 */
export function useCrushNotePurchase() {
  const dispatch = useDispatch();
  const [select, setSelect] = useState(0);
  const [products, setProducts] = useState<any[]>([]);
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
        await RNIap.initConnection();
        const rawProducts = await RNIap.getProducts({ skus: PRODUCT_SKUS });
        const availableProducts = Array.isArray(rawProducts) ? rawProducts : [];
        if (availableProducts.length > 0) {
          setProducts(buildChatPacks(availableProducts));
        }
      } catch (err) {
        console.warn("IAP Initialization Error:", err);
      }
    };

    purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async (purchase: any) => {
      let isInitiated = false;
      try {
        // Pending (e.g. slow payment method): not paid yet. Don't verify or consume it, and keep
        // purchaseInitiatedRef so the later 'purchased' update still shows the verify modal.
        if (purchase?.purchaseState === "pending") {
          console.log("[Crush Note] Purchase pending, waiting for completion");
          return;
        }
        const key = getPurchaseTransactionId(purchase);

        // Duplicate protection check
        const alreadyVerified = await getAlreadyRecoveredTransactionIds();
        if (key && alreadyVerified.has(key)) {
          console.log(`[Crush Note] Transaction ${key} already verified. Skipping duplicate.`);
          try {
            await RNIap.finishTransaction({ purchase, isConsumable: true });
          } catch (e) {
            console.warn("[Crush Note] Duplicate finishTransaction skipped/failed:", e);
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

        const data = {
          productId: purchase.productId,
          purchaseToken: purchase.purchaseToken,
          platform: Platform.OS === "ios" ? "ios" : "android",
          orderId: purchase.id,
          transactionReceipt: purchase?.transactionReceipt,
          transactionId: purchase?.transactionId,
        };
        const iosData = {
          productId: purchase?.productId,
          transactionReceipt: purchase?.transactionReceipt,
          transactionId: purchase?.transactionId,
        };
        const response: any =
          Platform.OS === "ios" ? await dispatch(iosPucrchesAPIIs(iosData)) : await dispatch(verifyconsumableitemsAPI(data));

        if (response?.statusCode !== 200) {
          throw new Error(response?.message || response?.data?.message || "Crush Note verification failed");
        }

        await trackSuccessfulPurchase(purchase, "in-app");

        if (key) {
          await addRecoveredTransactionIds([key]);
        }

        if (isInitiated) {
          setVerifyResponse(response);
          setVerifyStage("success");
        }
        dispatch(getProfile(true));
        try {
          await RNIap.finishTransaction({ purchase, isConsumable: true });
        } catch (finishErr) {
          console.warn("[Crush Note] Client finishTransaction failed (possibly already consumed by server):", finishErr);
        }
      } catch (err) {
        console.error("[Crush Note] Purchase handler error:", err);
        if (isInitiated) {
          setVerifyStage("error");
          setVerifyError((err as any)?.message || "Something went wrong while verifying your purchase.");
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
        Alert.alert("Error", error.message || "An error occurred during purchase.");
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

  const startPurchase = async () => {
    if (processing) return;
    const selectedProduct = products[select];
    if (!selectedProduct) return;

    const productId = selectedProduct.productId || selectedProduct.id;
    if (!productId) return;

    try {
      setProcessing(String(productId));
      purchaseInitiatedRef.current = true;

      if (Platform.OS === "ios") {
        await RNIap.requestPurchase({ sku: productId, andDangerouslyFinishTransactionAutomaticallyIOS: false });
      } else {
        await RNIap.requestPurchase({ skus: [productId] });
      }
    } catch (err: any) {
      setProcessing(null);
      purchaseInitiatedRef.current = false;
      if (!err?.message?.toLowerCase?.().includes("cancel")) {
        console.warn("Purchase Error:", err);
      }
    }
  };

  return {
    products,
    select,
    setSelect,
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

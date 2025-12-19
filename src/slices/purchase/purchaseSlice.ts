import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Purchase data structure matching Google Play purchase response
export interface PurchaseData {
  orderId: string;
  productId: string;
  purchaseToken: string;
  purchaseTime: number;
  purchaseState: number;
  // Additional fields that might be useful
  transactionDate?: number;
  transactionReceipt?: string;
  originalTransactionIdentifierIOS?: string;
  isAcknowledged?: boolean;
}

export interface PendingPurchase extends PurchaseData {
  userId: string;
  purchaseType: 'subscription' | 'one-time';
  retryCount: number;
  lastRetryTime?: number;
}

interface PurchaseState {
  pendingPurchases: PendingPurchase[];
  isVerifying: boolean;
}

const initialState: PurchaseState = {
  pendingPurchases: [],
  isVerifying: false,
};

export const purchaseSlice = createSlice({
  name: "purchase",
  initialState,
  reducers: {
    // Save purchase data to state after successful Google Play purchase
    savePendingPurchase: (state, { payload }: PayloadAction<Omit<PendingPurchase, 'retryCount' | 'lastRetryTime'>>) => {
      const pendingPurchase: PendingPurchase = {
        ...payload,
        retryCount: 0,
        lastRetryTime: undefined,
      };
      // Check if purchase already exists (prevent duplicates)
      const existingIndex = state.pendingPurchases.findIndex(
        (p) => p.orderId === payload.orderId && p.productId === payload.productId
      );
      if (existingIndex === -1) {
        state.pendingPurchases.push(pendingPurchase);
      } else {
        // Update existing purchase
        state.pendingPurchases[existingIndex] = pendingPurchase;
      }
    },

    // Remove purchase from pending list after successful backend verification
    clearPendingPurchase: (state, { payload }: PayloadAction<{ orderId: string; productId: string }>) => {
      state.pendingPurchases = state.pendingPurchases.filter(
        (p) => !(p.orderId === payload.orderId && p.productId === payload.productId)
      );
    },

    // Increment retry count for failed verification
    incrementRetryCount: (state, { payload }: PayloadAction<{ orderId: string; productId: string }>) => {
      const purchase = state.pendingPurchases.find(
        (p) => p.orderId === payload.orderId && p.productId === payload.productId
      );
      if (purchase) {
        purchase.retryCount += 1;
        purchase.lastRetryTime = Date.now();
      }
    },

    // Set verification status
    setVerifying: (state, { payload }: PayloadAction<boolean>) => {
      state.isVerifying = payload;
    },

    // Clear all pending purchases (e.g., on logout)
    clearAllPendingPurchases: (state) => {
      state.pendingPurchases = [];
    },
  },
});

export const {
  savePendingPurchase,
  clearPendingPurchase,
  incrementRetryCount,
  setVerifying,
  clearAllPendingPurchases,
} = purchaseSlice.actions;

export default purchaseSlice.reducer;


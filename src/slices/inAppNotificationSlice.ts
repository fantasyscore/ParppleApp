import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type SeenMap = Record<string, true>;

interface InAppNotificationState {
  /** matchId of the currently open chat (TakingScreen). Used for suppression. */
  activeChatMatchId: string | null;
  /** keys that have already been processed (dedupe across navigation/rerenders) */
  processed: SeenMap;
  /** insertion order to allow pruning */
  processedOrder: string[];
}

const MAX_PROCESSED = 1000;

const initialState: InAppNotificationState = {
  activeChatMatchId: null,
  processed: {},
  processedOrder: [],
};

export const inAppNotificationSlice = createSlice({
  name: "inAppNotification",
  initialState,
  reducers: {
    setActiveChatMatchId: (state, action: PayloadAction<string | null>) => {
      state.activeChatMatchId = action.payload;
    },
    clearActiveChat: (state) => {
      state.activeChatMatchId = null;
    },
    markProcessed: (state, action: PayloadAction<string>) => {
      const key = action.payload;
      if (!key) return;
      if (state.processed[key]) return;
      state.processed[key] = true;
      state.processedOrder.push(key);

      if (state.processedOrder.length > MAX_PROCESSED) {
        const overflow = state.processedOrder.length - MAX_PROCESSED;
        const toRemove = state.processedOrder.splice(0, overflow);
        for (const k of toRemove) {
          delete state.processed[k];
        }
      }
    },
  },
});

export const { setActiveChatMatchId, clearActiveChat, markProcessed } =
  inAppNotificationSlice.actions;

export default inAppNotificationSlice.reducer;



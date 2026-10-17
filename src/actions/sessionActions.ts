import AsyncStorage from "@react-native-async-storage/async-storage";
import { appOperation } from "../appOperation";
import { disconnectAllSockets } from "../common/Socket";
import {
  SUPER_LIKES_REMAINING_KEY,
  SWIPES_PER_DAY_KEY,
  SWIPES_REMAINING_KEY,
  USER_TOKEN_KEY,
} from "../helper/Constants";
import NavigationService from "../navigation/NavigationService";
import { NAVIGATION_WELCOME_SCREEN } from "../navigation/routes";
import { setAnalyticsUserId } from "../services/analyticsService";
import { clearChatHistoryCache } from "./authActions";
import { logout } from "../slices/loginServices/authSlice";

/**
 * Ends the signed-in session. The single place that knows everything a logout
 * (and the tail of "delete account") has to tear down; screens only dispatch it.
 *
 * Order matters: sockets first so nothing reacts to the cleared state, then the
 * store reset, then credentials, and finally back to the Welcome screen — which
 * happens even if clearing storage fails, so the user is never left signed in
 * on a half-cleared session.
 */
export const endSession: any = () => async (dispatch: any) => {
  disconnectAllSockets();
  clearChatHistoryCache();
  dispatch(logout());
  try {
    appOperation.setCustomerToken("");
    await AsyncStorage.multiRemove([
      USER_TOKEN_KEY,
      SWIPES_REMAINING_KEY,
      SUPER_LIKES_REMAINING_KEY,
      SWIPES_PER_DAY_KEY,
    ]);
    await setAnalyticsUserId(null);
  } catch (error) {
    console.warn("[Session] Cleanup after logout failed:", error);
  } finally {
    NavigationService.reset(NAVIGATION_WELCOME_SCREEN);
  }
};

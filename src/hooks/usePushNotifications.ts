import { useEffect } from "react";
import { AppState } from "react-native";
import notifee from "@notifee/react-native";
import messaging from "@react-native-firebase/messaging";
import store from "../store/store";
import { getInitialNotification, setupPushListeners } from "../notifications/pushNotifications";

/** Clears stale notifications, handles the notification that launched the app, and listens for new ones. */
export function usePushNotifications() {
  // The backend keeps the push token it received at login (profile field fcmTokens). If this device's token is a
  // different one, pushes are sent to another device or to a dead token and never arrive here.
  // (This hook runs above the Redux Provider, so it reads the store directly instead of using useSelector.)
  useEffect(() => {
    let checkedFor: any;
    const check = async () => {
      const savedToken = (store.getState() as any)?.auth?.userData?.fcmTokens;
      if (!savedToken || savedToken === checkedFor) return;
      checkedFor = savedToken;
      try {
        const deviceToken = await messaging().getToken();
        const saved = Array.isArray(savedToken) ? savedToken : [savedToken];
        if (deviceToken && !saved.includes(deviceToken)) {
          console.warn(
            "[Notification] This device's push token is NOT the one saved on your account, so pushes will not reach it.",
            { deviceToken, savedOnAccount: savedToken }
          );
        }
      } catch {
        // no token yet
      }
    };
    check();
    return store.subscribe(check);
  }, []);

  // The app icon's count (Android: notifications left in the tray, iOS: the badge number) never went away once the app was
  // opened. Every time the app comes to the front, clear the tray and reset the badge.
  useEffect(() => {
    const clearBadge = async () => {
      try {
        // iOS only shows / clears the badge number when the badge permission was granted. Done first so a failure
        // in clearing the tray can never stop the badge reset.
        await notifee.setBadgeCount(0);
        await notifee.cancelDisplayedNotifications();
        console.log("[Notification] Badge reset, count now:", await notifee.getBadgeCount());
      } catch (error) {
        console.warn("[Notification] Could not reset the badge:", error);
      }
    };
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") clearBadge();
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        notifee.setBadgeCount(0).catch((error) => console.warn("[Notification] Could not reset the badge:", error));
        await notifee.cancelDisplayedNotifications();
        await getInitialNotification(store);
      } catch (e) {
        console.log("[Notification] Init error:", e);
      }
    })();

    return setupPushListeners({ store });
  }, []);
}

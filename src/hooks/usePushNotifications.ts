import { useEffect } from "react";
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

  useEffect(() => {
    (async () => {
      try {
        await notifee.cancelDisplayedNotifications();
        await getInitialNotification(store);
      } catch (e) {
        console.log("[Notification] Init error:", e);
      }
    })();

    return setupPushListeners({ store });
  }, []);
}

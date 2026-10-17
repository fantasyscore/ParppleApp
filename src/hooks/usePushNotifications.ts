import { useEffect } from "react";
import notifee from "@notifee/react-native";
import store from "../store/store";
import { getInitialNotification, setupPushListeners } from "../notifications/pushNotifications";

/** Clears stale notifications, handles the notification that launched the app, and listens for new ones. */
export function usePushNotifications() {
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

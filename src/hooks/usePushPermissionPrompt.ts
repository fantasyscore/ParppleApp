import { useEffect } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import messaging from "@react-native-firebase/messaging";
import { runAfterInitialInteractions } from "../utils/interactions";

/** Asks for notification permission a few seconds after the screen settles so it never blocks startup. */
export function usePushPermissionPrompt(delayMs = 3000) {
  useEffect(() => {
    return runAfterInitialInteractions(async () => {
      try {
        await messaging().registerDeviceForRemoteMessages();
        if (Platform.OS === "android" && Platform.Version >= 33) {
          await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        }
        await messaging().requestPermission();
      } catch (e) {
        console.warn("Notification permission request failed:", e);
      }
    }, delayMs);
  }, [delayMs]);
}

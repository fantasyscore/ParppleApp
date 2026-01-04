import { Platform } from "react-native";
import messaging, {
  FirebaseMessagingTypes,
} from "@react-native-firebase/messaging";

// Notifee is optional in code (recommended for foreground + data-only notifications).
// If it's not installed, we gracefully no-op for local display.
function getNotifee(): any | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("@notifee/react-native");
  } catch {
    return null;
  }
}

let androidChannelId: string | null = null;
async function ensureAndroidChannel(): Promise<string | null> {
  if (Platform.OS !== "android") return null;
  if (androidChannelId) return androidChannelId;

  const notifee = getNotifee();
  if (!notifee) return null;

  try {
    androidChannelId = await notifee.createChannel({
      id: "parpple-default",
      name: "Parpple",
      importance: notifee.AndroidImportance.HIGH,
      sound: "default",
    });
  } catch {
    // Never crash app startup / headless handler due to notification channel creation failure
    androidChannelId = null;
  }
  return androidChannelId;
}

export async function requestPushPermission() {
  await messaging().registerDeviceForRemoteMessages();
  await messaging().requestPermission();
}

export async function getFcmToken() {
  await messaging().registerDeviceForRemoteMessages();
  return await messaging().getToken();
}

export async function displayRemoteMessage(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage
) {
  try {
    const notifee = getNotifee();
    if (!notifee) {
      // If notifee isn't installed, the OS will still show notifications for "notification" payloads
      // when app is backgrounded. Foreground/data-only won't show.
      return;
    }

    const title =
      remoteMessage?.notification?.title ||
      remoteMessage?.data?.title ||
      "Parpple";
    const body =
      remoteMessage?.notification?.body ||
      remoteMessage?.data?.body ||
      remoteMessage?.data?.messagePreview ||
      "";

    const channelId = await ensureAndroidChannel();

    await notifee.displayNotification({
      title,
      body,
      data: remoteMessage?.data || {},
      android: Platform.OS === "android" ? { channelId: channelId || "default" } : undefined,
      ios: Platform.OS === "ios" ? { sound: "default" } : undefined,
    });
  } catch {
    // Never allow local notification display failures to crash the app (especially on cold start).
  }
}

export function setupPushListeners() {
  try {
    // Foreground messages
    const unsubOnMessage = messaging().onMessage(async (remoteMessage) => {
      await displayRemoteMessage(remoteMessage);
    });

    // Notification tapped while app in background
    const unsubOpened = messaging().onNotificationOpenedApp(async () => {
      // Keep behavior unchanged: app will open; navigation can be handled later if needed
    });

    return () => {
      try {
        unsubOnMessage();
      } catch {}
      try {
        unsubOpened();
      } catch {}
    };
  } catch {
    // If Firebase messaging isn't ready yet on cold start, do not crash.
    return () => {};
  }
}



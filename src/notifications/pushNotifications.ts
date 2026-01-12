import { Platform } from 'react-native';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import notifee, {
  AndroidImportance,
  AndroidVisibility,
} from '@notifee/react-native';

const ANDROID_CHANNEL_ID = 'parpple-high-priority';

// --------------------
// ANDROID CHANNEL
// --------------------
let channelReady = false;

async function ensureAndroidChannel(): Promise<string | null> {
  if (Platform.OS !== 'android') return null;
  if (channelReady) return ANDROID_CHANNEL_ID;

  await notifee.createChannel({
    id: ANDROID_CHANNEL_ID,
    name: 'Parpple Notifications',
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PUBLIC,
    sound: 'default',
    vibration: true,
    badge: false,
  });

  channelReady = true;
  return ANDROID_CHANNEL_ID;
}

// --------------------
// PERMISSION & TOKEN
// --------------------
export async function requestPushPermission() {
  await messaging().registerDeviceForRemoteMessages();
  await messaging().requestPermission();
}

export async function getFcmToken() {
  await messaging().registerDeviceForRemoteMessages();
  return messaging().getToken();
}

// --------------------
// DISPLAY NOTIFICATION
// --------------------
export async function displayRemoteMessage(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage
) {
  try {
    const data = remoteMessage?.data || {};

    const title =
      data.title ||
      remoteMessage.notification?.title ||
      'Parpple';

    const body =
      data.body ||
      remoteMessage.notification?.body ||
      '';

    if (!title && !body) return;

    const channelId = await ensureAndroidChannel();
    if (!channelId) return;

    await notifee.displayNotification({
      title,
      body,
      data,
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PUBLIC,
        pressAction: { id: 'default' },
        sound: 'default',
        smallIcon: 'ic_notification', // MUST exist
      },
      ios: {
        sound: 'default',
        badgeCount: 0,
        foregroundPresentationOptions: {
          alert: true,
          sound: true,
          badge: false,
        },
      },
    });
  } catch (e) {
    console.warn('[PushNotifications] Display failed', e);
  }
}

// --------------------
// BACKGROUND / KILLED
// --------------------
let bgRegistered = false;

export function registerBackgroundPushHandler() {
  if (bgRegistered) return;
  bgRegistered = true;

  messaging().setBackgroundMessageHandler(async remoteMessage => {
    await displayRemoteMessage(remoteMessage);
  });
}

// --------------------
// FOREGROUND LISTENERS
// --------------------
export function setupPushListeners() {
  const unsubMessage = messaging().onMessage(async remoteMessage => {
    await displayRemoteMessage(remoteMessage);
  });

  return () => {
    try {
      unsubMessage();
    } catch {}
  };
}

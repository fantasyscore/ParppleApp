import { AppState, Platform } from 'react-native';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import notifee, {
  AndroidImportance,
  AndroidVisibility,
  EventType,
} from '@notifee/react-native';
import NavigationService from '../navigation/NavigationService';
import {
  NAVIGATION_ADD_PHOTOS_SCREEN,
  NAVIGATION_AUTH_LOADING_STACK,
  NAVIGATION_DOB_SCREEN,
  NAVIGATION_GANDER_SCREEN,
  NAVIGATION_HEIGHT_SCREEN,
  NAVIGATION_LOCATION_SCREEN,
  NAVIGATION_OTP_SCREEN,
  NAVIGATION_PROCCED_SCREEN,
  NAVIGATION_TRUN_ON_SCREEN,
  NAVIGATION_WELCOME_SCREEN,
} from '../navigation/routes';
import { appOperation } from '../appOperation';
import { chatHistoryAPI, getNewMatches, openMatchChat } from '../actions/authActions';

const ANDROID_CHANNEL_ID = 'parpple-popup-v2';

// --------------------
// DEDUPLICATION
// --------------------
// Track displayed notifications to prevent duplicates
const displayedNotificationIds = new Set<string>();

function getNotificationId(data: any): string {
  // Use matchId + messageId or timestamp to create unique ID
  const matchId = String(data?.matchId || '');
  const messageId = String(data?.messageId || data?._id || '');
  const timestamp = String(data?.timestamp || Date.now());
  return `notif_${matchId}_${messageId || timestamp}`;
}

function isNotificationDuplicate(notificationId: string): boolean {
  if (displayedNotificationIds.has(notificationId)) {
    return true;
  }
  // Add to set and clean up old entries (keep last 100)
  displayedNotificationIds.add(notificationId);
  if (displayedNotificationIds.size > 100) {
    const firstEntry = displayedNotificationIds.values().next().value;
    if (firstEntry) {
      displayedNotificationIds.delete(firstEntry);
    }
  }
  return false;
}

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
// DISPLAY SYSTEM NOTIFICATION
// --------------------
export async function displayRemoteMessage(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage
) {
  try {
    const data = remoteMessage?.data || {};

    // iOS shows a push that has an alert (a `notification` part) by itself, also in the background. Showing it again
    // here would make every message appear twice; only data-only pushes need to be displayed by the app.
    if (Platform.OS === 'ios' && remoteMessage?.notification && AppState.currentState !== 'active') {
      return;
    }

    // Check for duplicate notification
    const notificationId = getNotificationId(data);
    if (isNotificationDuplicate(notificationId)) {
      console.log('[PushNotifications] Duplicate notification skipped:', notificationId);
      return;
    }

    const title =
      data.title ||
      remoteMessage.notification?.title ||
      'Parpple';

    const body =
      data.body ||
      remoteMessage.notification?.body ||
      '';

    // Validate that we have meaningful content (not just empty strings or whitespace)
    const hasValidTitle = title && String(title).trim().length > 0;
    const hasValidBody = body && String(body).trim().length > 0;

    if (!hasValidTitle && !hasValidBody) {
      console.log('[PushNotifications] Skipping notification - no valid title or body');
      return;
    }

    // Ensure we have at least senderId or matchId to make this notification meaningful
    if (!data.senderId && !data.matchId) {
      console.log('[PushNotifications] Skipping notification - no senderId or matchId');
      return;
    }

    const channelId = await ensureAndroidChannel();
    if (!channelId) return;

    await notifee.displayNotification({
      id: notificationId, // Use unique ID to prevent duplicates at OS level
      title: String(hasValidTitle ? title : 'Parpple'),
      body: String(hasValidBody ? body : 'New message'),
      data,
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PUBLIC,
        pressAction: { id: 'default' },
        sound: 'default',
        smallIcon: 'ic_notification',
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
// CLEAR NOTIFICATIONS BY MATCH ID
// --------------------
export async function clearNotificationsByMatchId(matchId: string | undefined): Promise<void> {
  if (!matchId || String(matchId).trim() === '') {
    console.log('[PushNotifications] No matchId provided for clearing notifications');
    return;
  }

  try {
    const matchIdStr = String(matchId);
    console.log('[PushNotifications] Clearing notifications for matchId:', matchIdStr);

    // Get all displayed notifications
    const displayedNotifications = await notifee.getDisplayedNotifications();
    
    if (!displayedNotifications || displayedNotifications.length === 0) {
      console.log('[PushNotifications] No displayed notifications found');
      return;
    }

    // Find and cancel all notifications that match this matchId
    const notificationsToCancel: string[] = [];
    
    displayedNotifications.forEach((notification: any) => {
      const notifId = notification?.id || notification?.notification?.id;
      const notificationData = notification?.notification?.data || notification?.data || {};
      const notifMatchId = String(notificationData?.matchId || '');
      
      // Check if notification ID matches our pattern: notif_${matchId}_*
      if (notifId && typeof notifId === 'string' && notifId.startsWith(`notif_${matchIdStr}_`)) {
        notificationsToCancel.push(notifId);
      }
      // Also check if matchId in notification data matches
      else if (notifMatchId === matchIdStr && notifId) {
        notificationsToCancel.push(notifId);
      }
    });

    if (notificationsToCancel.length === 0) {
      console.log('[PushNotifications] No matching notifications found for matchId:', matchIdStr);
      return;
    }

    // Cancel all matching notifications
    await Promise.all(
      notificationsToCancel.map(async (id) => {
        try {
          await notifee.cancelNotification(id);
          console.log('[PushNotifications] Cancelled notification:', id);
        } catch (error) {
          console.warn(`[PushNotifications] Failed to cancel notification ${id}:`, error);
        }
      })
    );

    console.log(`[PushNotifications] Cleared ${notificationsToCancel.length} notification(s) for matchId: ${matchIdStr}`);
  } catch (error: any) {
    console.error('[PushNotifications] Error clearing notifications by matchId:', error?.message || error);
  }
}

// --------------------
// BACKGROUND / KILLED
// --------------------
let bgRegistered = false;

// Sockets are closed while the app is in the background, so a message that arrives meanwhile only comes as a push.
// When the app is still in memory (in recents, Android) its JS keeps running, so the push is used to load the new data
// right away: by the time the user switches back, the chat and the chats list already show the message instead of
// loading it then. Several pushes in a row are coalesced into one refresh.
const PUSH_REFRESH_DELAY_MS = 600;
let pushRefreshTimer: ReturnType<typeof setTimeout> | null = null;
const pushRefreshChats = new Map<string, string>(); // matchId -> senderId of chats to reload

function refreshFromPush(remoteMessage: FirebaseMessagingTypes.RemoteMessage) {
  // A push that launched a killed app has no signed-in session in memory: nothing to refresh
  if (!appOperation.customerToken) return;
  const matchId = String(remoteMessage?.data?.matchId || '');
  const senderId = String(remoteMessage?.data?.senderId || '');
  if (!matchId) return;
  const store = resolveStore();
  if (!store) return;
  // Only the chat that is open (left on screen when the app went to the background) needs its messages reloaded
  if (senderId && store.getState()?.inAppNotification?.activeChatMatchId === matchId) {
    pushRefreshChats.set(matchId, senderId);
  }
  if (pushRefreshTimer) clearTimeout(pushRefreshTimer);
  pushRefreshTimer = setTimeout(() => {
    pushRefreshTimer = null;
    try {
      store.dispatch(getNewMatches());
      pushRefreshChats.forEach((otherUserId, chatMatchId) =>
        store.dispatch(chatHistoryAPI({ otherUserId, matchId: chatMatchId }, { page: 1, limit: 50 }, false))
      );
    } catch (error) {
      console.warn('[PushNotifications] Background refresh failed:', error);
    }
    pushRefreshChats.clear();
  }, PUSH_REFRESH_DELAY_MS);
}

export function registerBackgroundPushHandler() {
  if (bgRegistered) return;
  bgRegistered = true;

  messaging().setBackgroundMessageHandler(async remoteMessage => {
    // CRITICAL: Display notification via Notifee only
    // This prevents Firebase from auto-displaying and creating duplicates
    await displayRemoteMessage(remoteMessage);
    refreshFromPush(remoteMessage);

    // Return a promise to indicate we handled the message
    // This prevents Firebase from auto-displaying the notification
    return Promise.resolve();
  });
}

// --------------------
// NOTIFICATION NAVIGATION HANDLER
// --------------------
// A tapped notification opens that chat. When the tap also launched the app, the chat must wait until the app has
// signed the user in and shown the main tabs: opening it earlier was undone by the reset to the tabs that follows
// loading the feed, and the chat lacked the match's name, photo and messages because nothing was loaded yet.
interface ChatTarget {
  senderId: string;
  matchId: string;
}

// Screens where the user is not (yet) in the signed-in app: a chat can't be opened on top of them
const NOT_READY_ROUTES = new Set<string | undefined>([
  undefined,
  NAVIGATION_AUTH_LOADING_STACK,
  NAVIGATION_WELCOME_SCREEN,
  NAVIGATION_OTP_SCREEN,
  NAVIGATION_PROCCED_SCREEN,
  NAVIGATION_GANDER_SCREEN,
  NAVIGATION_DOB_SCREEN,
  NAVIGATION_HEIGHT_SCREEN,
  NAVIGATION_TRUN_ON_SCREEN,
  NAVIGATION_ADD_PHOTOS_SCREEN,
  NAVIGATION_LOCATION_SCREEN,
]);
const READY_POLL_MS = 400;
// Signing in and loading the feed on a slow network can take a while; after this the tap is dropped
const READY_TIMEOUT_MS = 30000;
const NAVIGATION_COOLDOWN = 2000;

let pendingTarget: ChatTarget | null = null;
let readyTimer: ReturnType<typeof setInterval> | null = null;
let lastNavigatedMatchId: string | null = null;
let lastNavigationTime = 0;

const resolveStore = (store?: any) => {
  if (store && typeof store.getState === 'function') return store;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('../store/store').default;
  } catch {
    return null;
  }
};

const isAppReadyForChat = () =>
  NavigationService.isNavigationReady() &&
  !!appOperation.customerToken &&
  !NOT_READY_ROUTES.has(NavigationService.getCurrentRouteName());

const findMatch = (store: any, matchId: string) => {
  const auth = store.getState()?.auth ?? {};
  const inList = (list: any) => (Array.isArray(list) ? list.find((m: any) => m?.matchId === matchId) : undefined);
  return inList(auth.newMatches) || inList(auth.recentMatches);
};

/** Opens the chat the same way the chats list does, with the match's full details whenever they can be loaded */
async function openChat(target: ChatTarget, store: any) {
  const now = Date.now();
  if (lastNavigatedMatchId === target.matchId && now - lastNavigationTime < NAVIGATION_COOLDOWN) return;
  lastNavigatedMatchId = target.matchId;
  lastNavigationTime = now;

  let match = findMatch(store, target.matchId);
  if (!match) {
    // On a cold start the chats list may not be loaded yet: load it so the chat has the name, photo and gender
    try {
      await store.dispatch(getNewMatches());
    } catch {
      // fall through to the minimal entry
    }
    match = findMatch(store, target.matchId);
  }
  if (!match) console.log('[PushNotifications] Match not in the chats list, opening with the ids only');
  store.dispatch(openMatchChat(match ?? { userId: target.senderId, matchId: target.matchId }));
  console.log('[PushNotifications] Opened chat from notification', target);
}

/** Opens the chat as soon as the signed-in app is on screen (at once when it already is) */
function openWhenReady(target: ChatTarget, store: any) {
  pendingTarget = target;
  if (readyTimer) return;
  const startedAt = Date.now();
  const check = () => {
    if (!pendingTarget) return stopWaiting();
    if (isAppReadyForChat()) {
      const next = pendingTarget;
      stopWaiting();
      openChat(next, store);
    } else if (Date.now() - startedAt > READY_TIMEOUT_MS) {
      console.warn('[PushNotifications] App never reached the signed-in screens, notification tap dropped');
      stopWaiting();
    }
  };
  const stopWaiting = () => {
    if (readyTimer) clearInterval(readyTimer);
    readyTimer = null;
    pendingTarget = null;
  };
  readyTimer = setInterval(check, READY_POLL_MS);
  check();
}

export function handleNotificationNavigation(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  store?: any
) {
  try {
    const data = remoteMessage?.data;
    const senderId = String(data?.senderId || '');
    const matchId = String(data?.matchId || '');
    if (!senderId || !matchId) {
      console.warn('[PushNotifications] Missing senderId or matchId in notification data', { senderId, matchId });
      return;
    }
    const resolvedStore = resolveStore(store);
    if (!resolvedStore) {
      console.error('[PushNotifications] Cannot access Redux store for navigation');
      return;
    }
    openWhenReady({ senderId, matchId }, resolvedStore);
  } catch (error: any) {
    console.error('[PushNotifications] Error handling notification navigation:', error?.message || error);
  }
}

// --------------------
// INITIAL NOTIFICATION (KILLED STATE)
// --------------------
// The app was launched by tapping a notification. A notification shown by the system comes from Firebase; one shown
// by this app (data-only pushes, displayed with Notifee in the background handler) only from Notifee.
export async function getInitialNotification(store?: any) {
  try {
    const fromFirebase = await messaging().getInitialNotification();
    let fromNotifee: any = null;
    try {
      fromNotifee = (await notifee.getInitialNotification())?.notification ?? null;
    } catch {
      // not launched by a Notifee notification
    }
    const initial: any = fromFirebase?.data?.matchId ? fromFirebase : fromNotifee?.data?.matchId ? fromNotifee : null;
    console.log('[PushNotifications] Initial notification', {
      fromFirebase: !!fromFirebase,
      fromNotifee: !!fromNotifee,
      matchId: initial?.data?.matchId,
    });
    if (initial) handleNotificationNavigation(initial, store);
    return initial;
  } catch (error) {
    console.error('[PushNotifications] Error getting initial notification:', error);
    return null;
  }
}


// --------------------
// NOTIFEE EVENT HANDLERS (for notification taps)
// --------------------
let notifeeEventHandlersRegistered = false;

function setupNotifeeEventHandlers(store?: any) {
  if (notifeeEventHandlersRegistered) return;
  notifeeEventHandlersRegistered = true;

  // Handle notification taps when app is in foreground
  notifee.onForegroundEvent(async ({ type, detail }) => {
    if (type === EventType.PRESS) {
      console.log('[PushNotifications] Notifee notification tapped (foreground)');
      const notification = detail.notification;
      const data = notification?.data || {};
      if (data.senderId && data.matchId) {
        // Create a mock remoteMessage object for navigation handler
        const mockRemoteMessage: any = {
          data: {
            senderId: String(data.senderId),
            matchId: String(data.matchId),
          },
        };
        handleNotificationNavigation(mockRemoteMessage, store);
      }
    }
  });

  // Handle notification taps when app is in background/killed
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    if (type === EventType.PRESS) {
      console.log('[PushNotifications] Notifee notification tapped (background/killed)');
      const notification = detail.notification;
      const data = notification?.data || {};
      if (data.senderId && data.matchId) {
        // Get store in background handler
        let backgroundStore: any;
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          backgroundStore = require('../store/store').default;
        } catch {
          console.warn('[PushNotifications] Store not available in background handler');
          return;
        }

        // Create a mock remoteMessage object for navigation handler
        const mockRemoteMessage: any = {
          data: {
            senderId: String(data.senderId),
            matchId: String(data.matchId),
          },
        };
        handleNotificationNavigation(mockRemoteMessage, backgroundStore);
      }
    }
  });
}

// --------------------
// FOREGROUND (IN-APP) LISTENER
// --------------------
export function setupPushListeners(opts?: {
  onInAppNotification?: (data: any) => void;
  store?: any;
}) {
  try {
    // Get store reference for navigation handling
    let store = opts?.store;
    if (!store) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        store = require('../store/store').default;
      } catch {
        console.warn('[PushNotifications] Store not available, navigation may not work');
      }
    }

    // Setup Notifee event handlers for notification taps
    setupNotifeeEventHandlers(store);

    // Foreground messages - Firebase will NOT auto-display notifications
    // because we're handling them manually with Notifee
    const unsubMessage = messaging().onMessage(async remoteMessage => {
      // CRITICAL: Prevent Firebase from auto-displaying notification
      // We handle display manually via Notifee to avoid duplicates
      
      // 1️⃣ Show system notification (banner) via Notifee only
      await displayRemoteMessage(remoteMessage);

      // 2️⃣ Notify app UI (IN-APP)
      if (opts?.onInAppNotification) {
        opts.onInAppNotification(remoteMessage.data || {});
      }
    });

    // Notification tapped while app in background (Firebase notifications)
    // Note: This handles Firebase notifications, Notifee taps are handled above
    const unsubOpened = messaging().onNotificationOpenedApp(async remoteMessage => {
      if (remoteMessage) {
        console.log('[PushNotifications] Firebase notification tapped while app in background');
        handleNotificationNavigation(remoteMessage, store);
      }
    });

    return () => {
      try {
        unsubMessage();
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
import { Platform, InteractionManager } from 'react-native';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import notifee, {
  AndroidImportance,
  AndroidVisibility,
  EventType,
} from '@notifee/react-native';
import NavigationService from '../navigation/NavigationService';
import { NAVIGATION_TAKING_SCREEN } from '../navigation/routes';
import { chatHistoryDetails, matchChatDetails } from '../slices/loginServices/authSlice';
import { chatHistoryAPI } from '../actions/authActions';

const ANDROID_CHANNEL_ID = 'parpple-high-priority';

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

export function registerBackgroundPushHandler() {
  if (bgRegistered) return;
  bgRegistered = true;

  messaging().setBackgroundMessageHandler(async remoteMessage => {
    // CRITICAL: Display notification via Notifee only
    // This prevents Firebase from auto-displaying and creating duplicates
    await displayRemoteMessage(remoteMessage);
    
    // Return a promise to indicate we handled the message
    // This prevents Firebase from auto-displaying the notification
    return Promise.resolve();
  });
}

// --------------------
// NOTIFICATION NAVIGATION HANDLER
// --------------------
// Track navigation attempts to prevent duplicates
let navigationInProgress = false;
let lastNavigationTime = 0;
let lastNavigatedMatchId: string | null = null;
const NAVIGATION_COOLDOWN = 2000; // 2 seconds cooldown between navigations

export function handleNotificationNavigation(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  store?: any
) {
  try {
    const data = remoteMessage?.data;
    if (!data) {
      console.warn('[PushNotifications] No data in notification');
      return;
    }

    const senderId = String(data.senderId || '');
    const matchId = String(data.matchId || '');

    if (!senderId || !matchId || senderId === '' || matchId === '') {
      console.warn(
        '[PushNotifications] Missing senderId or matchId in notification data',
        { senderId, matchId }
      );
      return;
    }

    // Prevent duplicate navigation attempts
    if (navigationInProgress) {
      console.log('[PushNotifications] Navigation already in progress, skipping');
      return;
    }

    // Check cooldown to prevent rapid duplicate navigations
    const now = Date.now();
    if (lastNavigatedMatchId === matchId && (now - lastNavigationTime) < NAVIGATION_COOLDOWN) {
      console.log('[PushNotifications] Navigation cooldown active for matchId:', matchId);
      return;
    }

    // Get Redux store - we need to dispatch actions
    if (!store) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        store = require('../store/store').default;
      } catch {
        console.error(
          '[PushNotifications] Cannot access Redux store for navigation'
        );
        return;
      }
    }

    // Safety check: ensure store is valid and has getState method
    if (!store || typeof store.getState !== 'function') {
      console.error('[PushNotifications] Store is invalid or getState is not available');
      return;
    }

    // Try to find the match in newMatches or recentMatches to get full profile data
    let state: any;
    try {
      state = store.getState();
      if (!state) {
        console.warn('[PushNotifications] Store state is null/undefined');
        // Continue with empty state - will create minimal match object
        state = {};
      }
    } catch (stateError) {
      console.error('[PushNotifications] Error getting store state:', stateError);
      // Continue with empty state - will create minimal match object
      state = {};
    }
    const newMatches = state?.auth?.newMatches || [];
    const recentMatches = state?.auth?.recentMatches || [];
    
    let matchItem = newMatches.find((m: any) => m.matchId === matchId) ||
                    recentMatches.find((m: any) => m.matchId === matchId);

    // If match not found in Redux, create a minimal match object
    // TakingScreen will fetch the profile via getOtherProfile when userId is set
    if (!matchItem) {
      matchItem = {
        userId: senderId,
        matchId: matchId,
      };
      console.log('[PushNotifications] Match not found in Redux, using minimal match object');
    } else {
      console.log('[PushNotifications] Found match in Redux with profile data');
    }

    // Prepare data for navigation (same flow as ChatsScreen.onSubmit)
    const chatData = {
      otherUserId: senderId,
      matchId: matchId,
    };

    const params = {
      page: 1,
      limit: 50,
    };

    // Mark navigation as in progress
    navigationInProgress = true;
    lastNavigatedMatchId = matchId;
    lastNavigationTime = Date.now();

    // Dispatch Redux actions in the correct order
    store.dispatch(chatHistoryDetails([]));
    store.dispatch(matchChatDetails(matchItem)); // Use full matchItem if available
    
    // Navigate - NavigationService will queue if not ready
    try {
      NavigationService.navigate(NAVIGATION_TAKING_SCREEN);
    } catch (navError: any) {
      console.warn('[PushNotifications] Navigation error (will be queued):', navError?.message || navError);
      // NavigationService should have queued it, but try again after a short delay
      setTimeout(() => {
        try {
          NavigationService.navigate(NAVIGATION_TAKING_SCREEN);
        } catch (retryError) {
          console.error('[PushNotifications] Navigation retry failed:', retryError);
        }
      }, 300);
    }
    
    store.dispatch(chatHistoryAPI(chatData, params, false));

    console.log('[PushNotifications] Navigated to Taking Screen from notification', {
      senderId,
      matchId,
    });

    // Reset navigation flag after a delay
    setTimeout(() => {
      navigationInProgress = false;
    }, NAVIGATION_COOLDOWN);
  } catch (error: any) {
    console.error(
      '[PushNotifications] Error handling notification navigation:',
      error?.message || error
    );
    // Reset flag on error
    navigationInProgress = false;
  }
}

// --------------------
// INITIAL NOTIFICATION (KILLED STATE)
// --------------------
export async function getInitialNotification(store?: any) {
  try {
    const initialNotification = await messaging().getInitialNotification();
    console.log(initialNotification,"initialNotification");
    
    if (initialNotification) {
      console.log('[PushNotifications] App opened from notification (killed state)', {
        hasData: !!initialNotification.data,
        senderId: initialNotification.data?.senderId,
        matchId: initialNotification.data?.matchId,
      });
      
      // Get store if not provided
      if (!store) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          store = require('../store/store').default;
        } catch {
          console.error('[PushNotifications] Cannot access Redux store for initial notification');
          return initialNotification;
        }
      }

      // Wait for all interactions to complete and app to be fully initialized
      // Use InteractionManager to ensure navigation is ready
      InteractionManager.runAfterInteractions(() => {
        // Additional delay to ensure NavigationContainer is mounted and ready
        setTimeout(() => {
          try {
            console.log('[PushNotifications] Handling initial notification navigation');
            handleNotificationNavigation(initialNotification, store);
          } catch (error) {
            console.error('[PushNotifications] Error in handleNotificationNavigation:', error);
            // Retry once after a longer delay
            setTimeout(() => {
              try {
                console.log('[PushNotifications] Retrying navigation after error');
                handleNotificationNavigation(initialNotification, store);
              } catch (retryError) {
                console.error('[PushNotifications] Navigation retry also failed:', retryError);
              }
            }, 2000);
          }
        }, 1000); // Additional delay after interactions complete
      });
    }
    return initialNotification;
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
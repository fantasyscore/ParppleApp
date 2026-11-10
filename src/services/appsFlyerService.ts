import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '../config/config';

/**
 * AppsFlyer attribution (Android only for now: the iOS app has no App Store ID yet, and the native module is not
 * linked on iOS, see react-native.config.js). Every function is fire-and-forget and never throws, so tracking can't
 * break a login, a purchase or a chat.
 */
const IS_ENABLED = Platform.OS === 'android';

// Required lazily: the package's entry point looks up its native module as soon as it is evaluated
const getSdk = (): typeof import('react-native-appsflyer').default | null =>
  IS_ENABLED ? require('react-native-appsflyer').default : null;

let started: Promise<boolean> | null = null;

/** Initialises and starts the SDK once per process. Resolves false when it could not start. */
export const initAppsFlyer = (): Promise<boolean> => {
  if (started) return started;
  started = new Promise<boolean>((resolve) => {
    const sdk = getSdk();
    if (!sdk || !config.APPSFLYER_DEV_KEY) return resolve(false);
    try {
      sdk.init({ devKey: config.APPSFLYER_DEV_KEY }).catch((error) => {
        console.warn('[AppsFlyer] init failed:', error);
        resolve(false);
      });
      if (__DEV__) sdk.enableDebug({ enabled: true }).catch(() => {});
      // Native never starts on its own: start() belongs inside the session-ready callback
      sdk.registerSessionReadyListener(() => {
        sdk.start().then(
          () => resolve(true),
          (error) => {
            console.warn('[AppsFlyer] start failed:', error);
            resolve(false);
          }
        );
      });
    } catch (error) {
      console.warn('[AppsFlyer] setup failed:', error);
      resolve(false);
    }
  });
  return started;
};

/** Links AppsFlyer's data to our user id (the same id the backend and Firebase use). */
export const setAppsFlyerCustomerUserId = async (userId: string | null | undefined) => {
  const sdk = getSdk();
  if (!sdk || !userId) return;
  try {
    await sdk.setCustomerUserId({ customerId: String(userId) });
  } catch (error) {
    console.warn('[AppsFlyer] setCustomerUserId failed:', error);
  }
};

const logAppsFlyerEvent = async (eventName: string, eventValues?: Record<string, unknown>) => {
  const sdk = getSdk();
  if (!sdk) return;
  try {
    // Events wait for the session start, so the first ones of a launch aren't lost
    if (!(await initAppsFlyer())) return;
    await sdk.logEvent({ eventName, eventValues: eventValues ?? {} });
  } catch (error) {
    console.warn(`[AppsFlyer] logEvent ${eventName} failed:`, error);
  }
};

// How the user signed in during this launch ("google" / "apple" / "phone"), reported with the registration
let loginMethod: string | null = null;
export const rememberAppsFlyerLoginMethod = (method: string) => {
  loginMethod = method;
};

/** Profile finished: the user is registered. `fallback` is used when the sign-in happened in an earlier launch. */
export const trackAppsFlyerRegistration = (fallback: string) =>
  logAppsFlyerEvent('af_complete_registration', { af_registration_method: loginMethod ?? fallback });

/**
 * A purchase the backend has verified. Subscriptions are logged as af_subscribe, chat packs as af_purchase;
 * both carry the revenue so AppsFlyer can report it per campaign.
 */
export const trackAppsFlyerPurchase = (params: {
  productId: string;
  orderId: string;
  revenue: number;
  currency: string;
  type: 'in-app' | 'subs';
}) => {
  const { productId, orderId, revenue, currency, type } = params;
  // Chat-pack SKUs carry their size ("10_chats")
  const quantity = type === 'subs' ? 1 : parseInt(productId.match(/\d+/)?.[0] ?? '1', 10) || 1;
  return logAppsFlyerEvent(type === 'subs' ? 'af_subscribe' : 'af_purchase', {
    af_revenue: revenue,
    af_currency: currency,
    af_content_id: productId,
    af_content_type: type === 'subs' ? 'subscription' : 'chat_pack',
    af_quantity: quantity,
    af_order_id: orderId,
  });
};

// Custom milestones, logged once per user on this device
const MILESTONE_KEY_PREFIX = '@appsflyer_milestone_';

const trackMilestoneOnce = async (eventName: string, userId: string | null | undefined) => {
  if (!IS_ENABLED || !userId) return;
  const key = `${MILESTONE_KEY_PREFIX}${eventName}_${userId}`;
  try {
    if (await AsyncStorage.getItem(key)) return;
    await AsyncStorage.setItem(key, '1');
  } catch {
    return;
  }
  await logAppsFlyerEvent(eventName);
};

/** The user's first match */
export const trackAppsFlyerFirstMatch = (userId: string | null | undefined) => trackMilestoneOnce('first_match', userId);

/** The first message (or paid chat) the user sends */
export const trackAppsFlyerFirstChat = (userId: string | null | undefined) => trackMilestoneOnce('first_chat', userId);

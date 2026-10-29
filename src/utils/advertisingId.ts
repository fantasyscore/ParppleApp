import { NativeModules, Platform } from 'react-native';

export interface AdvertisingInfo {
  /** GAID, lowercase. null when unavailable or the user reset/deleted it (all-zero ID). */
  madid: string | null;
  /** Snap `advertiser_tracking_enabled`: 1 = allowed, 0 = user opted out of ad personalization */
  advertiserTrackingEnabled: 0 | 1;
}

const { AdvertisingId } = NativeModules;

let cached: AdvertisingInfo | null = null;

/** Android only. Returns null on iOS or when Play Services can't provide the ID. */
export const getAdvertisingInfo = async (): Promise<AdvertisingInfo | null> => {
  if (Platform.OS !== 'android' || !AdvertisingId) return null;
  if (cached) return cached;
  try {
    const info = await AdvertisingId.getAdvertisingInfo();
    const limited = !!info?.isLimitAdTrackingEnabled;
    cached = {
      // Snap must not receive the ID once the user has opted out
      madid: limited ? null : info?.id ?? null,
      advertiserTrackingEnabled: limited ? 0 : 1,
    };
    return cached;
  } catch (error) {
    console.log('[AdvertisingId] Failed to read GAID:', error);
    return null;
  }
};

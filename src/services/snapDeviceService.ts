import { Dimensions, I18nManager, NativeModules, PixelRatio, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { getAdvertisingInfo } from '../utils/advertisingId';

/**
 * Device data the backend forwards to the Snap Conversions API (sign-up and purchase APIs).
 * Every field is optional for the backend, so a value that can't be read is left out (or sent as "" in extinfo).
 */
export interface SnapDevice {
  gaid?: string;
  adTrackingEnabled?: boolean;
  /** 16 strings in Snap's fixed order, see buildExtinfo */
  extinfo?: string[];
  userAgent?: string;
}

const BYTES_PER_GB = 1024 ** 3;

const safe = <T,>(read: () => T, fallback: T): T => {
  try {
    return read() ?? fallback;
  } catch {
    return fallback;
  }
};

const safeAsync = async <T,>(read: () => Promise<T>, fallback: T): Promise<T> => {
  try {
    return (await read()) ?? fallback;
  } catch {
    return fallback;
  }
};

/** "en_IN" style locale */
const getLocale = () =>
  safe(() => {
    const fromAndroid = (I18nManager as any).getConstants?.()?.localeIdentifier;
    const locale = fromAndroid || Intl.DateTimeFormat().resolvedOptions().locale;
    return String(locale || '').replace('-', '_');
  }, '');

/** Short timezone name like "IST"; empty when the JS engine can't produce one */
const getTimezoneAbbreviation = () =>
  safe(() => {
    const part = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' })
      .formatToParts(new Date())
      .find((p) => p.type === 'timeZoneName');
    return part?.value ?? '';
  }, '');

const getTimezoneName = () => safe(() => Intl.DateTimeFormat().resolvedOptions().timeZone ?? '', '');

const toGb = (bytes: number) => (bytes > 0 ? String(Math.round(bytes / BYTES_PER_GB)) : '');

/**
 * Snap extinfo order (Android): version "a2", package name, short app version, long app version, OS version,
 * device model, locale, timezone abbreviation, carrier, screen width, screen height, screen density, CPU cores,
 * storage GB, free storage GB, device timezone.
 */
const buildExtinfo = async (): Promise<string[]> => {
  const screen = Dimensions.get('screen');
  const density = PixelRatio.get();
  const [carrier, totalBytes, freeBytes] = await Promise.all([
    safeAsync(() => DeviceInfo.getCarrier(), ''),
    safeAsync(() => DeviceInfo.getTotalDiskCapacity(), 0),
    safeAsync(() => DeviceInfo.getFreeDiskStorage(), 0),
  ]);
  const cpuCores = NativeModules.AdvertisingId?.getConstants?.()?.cpuCores ?? NativeModules.AdvertisingId?.cpuCores;

  return [
    'a2',
    safe(() => DeviceInfo.getBundleId(), ''),
    safe(() => DeviceInfo.getBuildNumber(), ''),
    safe(() => DeviceInfo.getVersion(), ''),
    safe(() => DeviceInfo.getSystemVersion(), ''),
    safe(() => DeviceInfo.getModel(), ''),
    getLocale(),
    getTimezoneAbbreviation(),
    carrier === 'unknown' ? '' : carrier,
    String(Math.round(screen.width * density)),
    String(Math.round(screen.height * density)),
    String(density),
    cpuCores ? String(cpuCores) : '',
    toGb(totalBytes),
    toGb(freeBytes),
    getTimezoneName(),
  ].map((value) => String(value ?? ''));
};

/**
 * Builds the `snapDevice` object for the request body. Android only (Snap's spec is for the Android app); returns
 * undefined on iOS or if anything unexpected fails, so the API call itself is never affected.
 */
export const getSnapDevice = async (): Promise<SnapDevice | undefined> => {
  if (Platform.OS !== 'android') return undefined;
  try {
    const [adInfo, extinfo] = await Promise.all([getAdvertisingInfo(), buildExtinfo()]);
    const device: SnapDevice = {
      extinfo,
      userAgent: `Parpple/${safe(() => DeviceInfo.getVersion(), '')} (Android ${safe(() => DeviceInfo.getSystemVersion(), '')}; ${safe(() => DeviceInfo.getModel(), '')})`,
    };
    if (adInfo) {
      device.adTrackingEnabled = adInfo.advertiserTrackingEnabled === 1;
      if (adInfo.madid) device.gaid = adInfo.madid;
    }
    return device;
  } catch (error) {
    console.log('[SnapDevice] Failed to build device info:', error);
    return undefined;
  }
};

/** Adds `snapDevice` to a JSON request body (left unchanged when there is nothing to add) */
export const withSnapDevice = async <T extends object>(body: T): Promise<T & { snapDevice?: SnapDevice }> => {
  const snapDevice = await getSnapDevice();
  return snapDevice ? { ...body, snapDevice } : body;
};

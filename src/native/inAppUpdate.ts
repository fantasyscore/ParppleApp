import { NativeModules, Platform } from 'react-native';

export type InAppUpdateResult = {
  status:
    | 'SUCCESS'
    | 'CANCELED'
    | 'FAILED'
    | 'UPDATE_NOT_AVAILABLE'
    | 'UNKNOWN'
    | 'NO_ACTIVITY'
    | 'ERROR';
  message?: string;
  resultCode?: number;
};

type InAppUpdateModuleType = {
  checkForUpdate(): Promise<InAppUpdateResult>;
};

const { InAppUpdate: NativeInAppUpdate } = NativeModules as {
  InAppUpdate?: InAppUpdateModuleType;
};

export const InAppUpdate = {
  checkForUpdate: async (): Promise<InAppUpdateResult> => {
    if (Platform.OS !== 'android') {
      return {
        status: 'UNKNOWN',
        message: 'Google Play Core In-App Updates are only supported on Android.',
      };
    }

    if (!NativeInAppUpdate?.checkForUpdate) {
      console.warn('InAppUpdate native module is not available. Please rebuild the app.');
      return {
        status: 'ERROR',
        message: 'InAppUpdate native module is not registered or loaded.',
      };
    }

    try {
      return await NativeInAppUpdate.checkForUpdate();
    } catch (error: any) {
      console.error('[InAppUpdate] Error during update check:', error);
      return {
        status: 'ERROR',
        message: error?.message || String(error),
      };
    }
  },
};

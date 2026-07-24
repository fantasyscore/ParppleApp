import { Platform, AppState, AppStateStatus } from 'react-native';
import SpInAppUpdates, {
  IAUUpdateKind,
  StartUpdateOptions,
} from 'sp-react-native-in-app-updates';

const inAppUpdates = new SpInAppUpdates(false);
let isChecking = false;

export const ForceUpdateService = {
  checkAndEnforceUpdate: async () => {
    if (Platform.OS !== 'android') return;
    if (isChecking) return;

    isChecking = true;
    try {
      console.log('[ForceUpdateService] Checking for updates...');
      const result = await inAppUpdates.checkNeedsUpdate();

      if (result.shouldUpdate) {
        console.log('[ForceUpdateService] Update required. Triggering IMMEDIATE update.');
        const updateOptions: StartUpdateOptions = {
          updateType: IAUUpdateKind.IMMEDIATE,
        };

        try {
          await inAppUpdates.startUpdate(updateOptions);
        } catch (updateError) {
          console.error('[ForceUpdateService] Update failed or was canceled:', updateError);
          // If the user cancelled or an error occurred, we immediately trigger it again
          // to ensure they cannot bypass the update.
          setTimeout(() => {
            isChecking = false;
            ForceUpdateService.checkAndEnforceUpdate();
          }, 500);
          return;
        }
      } else {
        console.log('[ForceUpdateService] No update needed.');
      }
    } catch (error) {
      console.error('[ForceUpdateService] Error checking for update:', error);
    } finally {
      isChecking = false;
    }
  }
};

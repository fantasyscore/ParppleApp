import ScreenGuardModule from 'react-native-screenguard';
import { Platform } from 'react-native';

/**
 * Enables screen security globally.
 * Android: Uses FLAG_SECURE to prevent screenshots and screen recording.
 * iOS: Uses UITextField secure layer trick to make screenshots/recordings black,
 * and handles blurring on App Switcher.
 */
export const enableScreenSecurity = () => {
    try {
        ScreenGuardModule.register({
            backgroundColor: '#000000', // Blur color for App Switcher
        });
        console.log('[ScreenSecurity] Security enabled');
    } catch (error) {
        console.warn('[ScreenSecurity] Failed to enable screen security:', error);
    }
};

/**
 * Disables screen security.
 */
export const disableScreenSecurity = () => {
    try {
        ScreenGuardModule.unregister();
        console.log('[ScreenSecurity] Security disabled');
    } catch (error) {
        console.warn('[ScreenSecurity] Failed to disable screen security:', error);
    }
};

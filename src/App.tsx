import React, { useEffect, useRef, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { onAppStart } from "./helper/app";
import Navigator from "./navigation/Navigator";
import store from "./store/store";
import { StatusBar, Text, View, AppState, AppStateStatus, StyleSheet, Platform, TouchableOpacity, Modal } from "react-native";
import SplashScreen from "react-native-splash-screen";
import { ForceUpdateService } from "./services/ForceUpdateService";
import ToastMessage from "./common/ToastMessage";
import codePush from "@revopush/react-native-code-push";
import { recoverPurchasesOnStartup } from "./services/purchaseRecoveryService";
import { initializeAnalytics } from "./services/analyticsService";
import notifee, { AndroidImportance } from "@notifee/react-native"
import { setupPushListeners, getInitialNotification, registerBackgroundPushHandler } from "./notifications/pushNotifications";
import NavigationService from "./navigation/NavigationService";
import { CaptureEventType, CaptureProtection } from "react-native-capture-protection";
import FastImage from "react-native-fast-image";
import { enableScreenSecurity } from "./utils/ScreenSecurity";
import { AppIcon } from "./helper/ImageAssets";
import metrics from "./assets/Metrics";
import { AppText, INTER_MEDIUM, OPECITY_DARK, THIRTEEN } from "./common/AppText";
import { Screen } from "./theme/dimens";
async function setupChannels() {
  await notifee.createChannel({
    id: 'parpple-popup-v2',
    name: 'Parpple',
    importance: AndroidImportance.HIGH,
    sound: "default",
    vibration: true
  })
}

const App = () => {
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const isInitialMountRef = useRef(true);
  useEffect(() => {
    console.log('[App] Initializing app...');
    onAppStart(store);
    initializeAnalytics().catch(() => { });
    enableScreenSecurity();

    if (Platform.OS === 'android') {
      ForceUpdateService.checkAndEnforceUpdate();
    }

    setTimeout(() => {
      try {
        (SplashScreen as any)?.hide?.();
      } catch {
        // no-op
      }
    }, 3000);
  }, []);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const previousAppState = appStateRef.current;
      appStateRef.current = nextAppState;

      console.log('[App] AppState changed:', {
        previous: previousAppState,
        next: nextAppState,
        isInitialMount: isInitialMountRef.current,
      });
      if (
        previousAppState &&
        (previousAppState === 'background' || previousAppState === 'inactive') &&
        nextAppState === 'active'
      ) {
        console.log('[App] App resuming from background/killed state');
        isInitialMountRef.current = false;
        ForceUpdateService.checkAndEnforceUpdate();
        recoverPurchasesOnStartup().catch(() => { });
        setTimeout(() => {
          try {
            if (!NavigationService.isNavigationReady()) {
              console.warn('[App] Navigation not ready yet, will retry operations when ready');
            } else {
              console.log('[App] Navigation is ready, app resumed successfully');
            }
          } catch (error) {
            console.error('[App] Error checking navigation state on resume:', error);
          }
        }, 100);
      }

      if (isInitialMountRef.current && nextAppState === 'active') {
        isInitialMountRef.current = false;
        console.log('[App] App mounted and active');
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    recoverPurchasesOnStartup().catch(() => { });
  }, []);
  useEffect(() => {
    const initNotifications = async () => {
      try {
        await notifee.cancelDisplayedNotifications();
        await getInitialNotification(store);
      } catch (e) {
        console.log('[Notification] Init error:', e);
      }
    };
    initNotifications();
    const unsubscribe = setupPushListeners({
      onInAppNotification: data => {
        console.log('IN-APP NOTIFICATION:', data);
      },
      store,
    });

    return unsubscribe;
  }, []);

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <StatusBar hidden={false} translucent backgroundColor={'transparent'} barStyle="light-content" />
        <Navigator />
      </Provider>
    </SafeAreaProvider>
  );
};
export default codePush(App);

import React, { useEffect, useRef } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { onAppStart } from "./helper/app";
import Navigator from "./navigation/Navigator";
import store from "./store/store";
import { StatusBar, Text, View, AppState, AppStateStatus } from "react-native";
import SplashScreen from "react-native-splash-screen";
import ToastMessage from "./common/ToastMessage";
import codePush from "@revopush/react-native-code-push";
import { recoverPurchasesOnStartup } from "./services/purchaseRecoveryService";
import notifee, { AndroidImportance } from "@notifee/react-native"
import { setupPushListeners, getInitialNotification, registerBackgroundPushHandler } from "./notifications/pushNotifications";
import NavigationService from "./navigation/NavigationService";
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
    setTimeout(() => {
      try {
        // Avoid rare cold-start crashes if the native module isn't ready
        // (keeps behavior identical: hide after ~3s).
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (SplashScreen as any)?.hide?.();
      } catch {
        // no-op
      }
    }, 3000);
  }, []);

  // Handle app lifecycle: resume from background/killed state
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const previousAppState = appStateRef.current;
      appStateRef.current = nextAppState;

      console.log('[App] AppState changed:', {
        previous: previousAppState,
        next: nextAppState,
        isInitialMount: isInitialMountRef.current,
      });

      // App is resuming from background/killed state
      if (
        previousAppState &&
        (previousAppState === 'background' || previousAppState === 'inactive') &&
        nextAppState === 'active'
      ) {
        console.log('[App] App resuming from background/killed state');
        isInitialMountRef.current = false;

        // Ensure navigation is ready before any operations
        // Add a small delay to ensure NavigationContainer is mounted
        setTimeout(() => {
          try {
            // Verify navigation is ready
            if (!NavigationService.isNavigationReady()) {
              console.warn('[App] Navigation not ready yet, will retry operations when ready');
              // NavigationService will queue actions, so this is safe
            } else {
              console.log('[App] Navigation is ready, app resumed successfully');
            }
          } catch (error) {
            console.error('[App] Error checking navigation state on resume:', error);
            // Don't crash - navigation will be ready eventually
          }
        }, 100);
      }

      // First mount
      if (isInitialMountRef.current && nextAppState === 'active') {
        isInitialMountRef.current = false;
        console.log('[App] App mounted and active');
      }
    };

    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  // useEffect(() => {
  //   // Push notification setup (foreground + permissions)
  //   requestPushPermission().catch(() => { });
  //   // Killed-state tap: app opened from a notification.
  //   // Pass store so notification handler can dispatch Redux actions and navigate
  //   getInitialNotification(store).catch(() => { });

  //   const cleanup = setupPushListeners({ store });
  //   return () => cleanup();
  // }, []);

  useEffect(() => {
    // Purchase recovery on app startup
    // This silently recovers completed, pending, and canceled purchases
    // and sends them to the backend recovery API
    recoverPurchasesOnStartup().catch(() => {
      // Silently handle errors - recovery should not block app startup
    });
  }, []);

  // useEffect(() => {
  //   setupChannels()
  // }, []);

  useEffect(() => {
    // Handle notification tap when app is opened from killed state
    getInitialNotification(store).catch(() => { });

    // Setup push listeners for foreground and background notification taps
    const unsubscribe = setupPushListeners({
      onInAppNotification: data => {
        console.log('IN-APP NOTIFICATION:', data);
      },
      store: store,
    });
  
    return unsubscribe;
  }, []);

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <StatusBar hidden={false} backgroundColor={'red'} />
        <Navigator />
      </Provider>
    </SafeAreaProvider>
  );
};

export default codePush(App);

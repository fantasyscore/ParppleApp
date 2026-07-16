import React, { useEffect, useRef, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { onAppStart } from "./helper/app";
import Navigator from "./navigation/Navigator";
import store from "./store/store";
import { StatusBar, Text, View, AppState, AppStateStatus, StyleSheet, Platform } from "react-native";
import SplashScreen from "react-native-splash-screen";
import { InAppUpdate } from "./native/inAppUpdate";
import ToastMessage from "./common/ToastMessage";
import codePush from "@revopush/react-native-code-push";
import { recoverPurchasesOnStartup } from "./services/purchaseRecoveryService";
import { initializeAnalytics } from "./services/analyticsService";
import notifee, { AndroidImportance } from "@notifee/react-native"
import { setupPushListeners, getInitialNotification, registerBackgroundPushHandler } from "./notifications/pushNotifications";
import NavigationService from "./navigation/NavigationService";
import { CaptureEventType, CaptureProtection } from "react-native-capture-protection";
import FastImage from "react-native-fast-image";
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
  const [isScreenRecordingBlocked, setIsScreenRecordingBlocked] = useState(false);

  useEffect(() => {
    console.log('[App] Initializing app...');
    onAppStart(store);
    initializeAnalytics().catch(() => {});

    if (Platform.OS === 'android') {
      InAppUpdate.checkForUpdate()
        .then((result) => {
          console.log('[InAppUpdate] Startup update check complete. Status:', result.status);
        })
        .catch((error) => {
          console.error('[InAppUpdate] Startup update check failed:', error);
        });
    }

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

        // Recover any pending/unfinished purchases on app resume
        recoverPurchasesOnStartup().catch(() => {});

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
    const initNotifications = async () => {
      try {
        // Clear all previously displayed notifications
        await notifee.cancelDisplayedNotifications();
  
        // Handle notification tap when app is opened from killed state
        await getInitialNotification(store);
      } catch (e) {
        console.log('[Notification] Init error:', e);
      }
    };
  
    initNotifications();
  
    // Setup push listeners
    const unsubscribe = setupPushListeners({
      onInAppNotification: data => {
        console.log('IN-APP NOTIFICATION:', data);
      },
      store,
    });
  
    return unsubscribe;
  }, []);

  // useEffect(() => {
  //   const applyCaptureProtection = async () => {
  //     try {
  //       await CaptureProtection.prevent({
  //         screenshot: true,
  //         record: false,
  //         appSwitcher: true,
  //       });
  //     } catch (error) {
  //       console.warn("[App] Failed to apply capture protection:", error);
  //     }
  //   };

  //   void applyCaptureProtection();

  //   const subscription = AppState.addEventListener("change", (nextState) => {
  //     if (nextState === "active") {
  //       void applyCaptureProtection();
  //     }
  //   });

  //   return () => {
  //     subscription.remove();
  //     // Restore defaults for development reload/unmount.
  //     CaptureProtection.allow().catch(() => null);
  //   };
  // }, []);

  // useEffect(() => {
  //   let isMounted = true;

  //   const syncRecordingState = async () => {
  //     try {
  //       const isRecording = await CaptureProtection.isScreenRecording();
  //       if (isMounted) {
  //         setIsScreenRecordingBlocked(Boolean(isRecording));
  //       }
  //     } catch (error) {
  //       console.warn("[App] Failed to check recording state:", error);
  //     }
  //   };

  //   void syncRecordingState();

  //   const eventSubscription = CaptureProtection.addListener((eventType) => {
  //     if (!isMounted) return;
  //     if (eventType === CaptureEventType.RECORDING) {
  //       setIsScreenRecordingBlocked(true);
  //       return;
  //     }
  //     if (eventType === CaptureEventType.END_RECORDING) {
  //       setIsScreenRecordingBlocked(false);
  //     }
  //   });

  //   const appStateSubscription = AppState.addEventListener("change", (nextState) => {
  //     if (nextState === "active") {
  //       void syncRecordingState();
  //     }
  //   });

  //   return () => {
  //     isMounted = false;
  //     appStateSubscription.remove();
  //     if (eventSubscription) {
  //       CaptureProtection.removeListener(eventSubscription);
  //     }
  //   };
  // }, []);

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <StatusBar hidden={false} backgroundColor={'red'} />
          <Navigator />
      </Provider>
    </SafeAreaProvider>
  );
};
const codePushOptions = {
  checkFrequency: codePush.CheckFrequency.ON_APP_START,
  installMode: codePush.InstallMode.IMMEDIATE,
};
export default codePush(codePushOptions)(App);
// export default codePush(App);
// export default App;

const styles = StyleSheet.create({
  secureContainer: {
    // flex: 1,
    height:Screen.Height,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    position:"absolute"
  },
  secureIconOuter: {
    height: 92,
    width: 92,
    borderRadius: 46,
    backgroundColor: "#6F13F21A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  secureIconInner: {
    height: 64,
    width: 64,
    borderRadius: 32,
    backgroundColor: "#6F13F2",
    alignItems: "center",
    justifyContent: "center",
  },
  secureIconText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
  },
  secureTitle: {
    // color: "#1A1A1A",
    textAlign: "center",
    // fontSize: 17,
    // fontWeight: "600",
    // lineHeight: 26,
    // maxWidth: 340,
  },
});


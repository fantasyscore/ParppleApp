import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { onAppStart } from "./helper/app";
import Navigator from "./navigation/Navigator";
import store from "./store/store";
import { StatusBar, Text, View } from "react-native";
import SplashScreen from "react-native-splash-screen";
import ToastMessage from "./common/ToastMessage";
import codePush from "@revopush/react-native-code-push";
import { getInitialNotification, requestPushPermission, setupPushListeners } from "./notifications/pushNotifications";
const App = () => {
  useEffect(() => {
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

  useEffect(() => {
    // Push notification setup (foreground + permissions)
    requestPushPermission().catch(() => {});
    // Killed-state tap: app opened from a notification.
    // (No navigation is performed here; hook in if/when you want deep links.)
    getInitialNotification().catch(() => {});

    const cleanup = setupPushListeners();
    return () => cleanup();
  }, []);

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <StatusBar hidden={false} backgroundColor={'red'}/>
        <Navigator />
      </Provider>
    </SafeAreaProvider>
  );
};

export default codePush(App);

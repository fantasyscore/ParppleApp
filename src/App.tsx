import React from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { Provider } from "react-redux";
import codePush from "@revopush/react-native-code-push";
import Navigator from "./navigation/Navigator";
import store from "./store/store";
import { ForceUpdateService } from "./services/ForceUpdateService";
import { recoverPurchasesOnStartup } from "./services/purchaseRecoveryService";
import { useAppStartup } from "./hooks/useAppStartup";
import { useOnAppForeground } from "./hooks/useOnAppForeground";
import { usePushNotifications } from "./hooks/usePushNotifications";

const onAppForeground = () => {
  ForceUpdateService.checkAndEnforceUpdate();
  recoverPurchasesOnStartup().catch(() => {});
};

const App = () => {
  useAppStartup();
  useOnAppForeground(onAppForeground);
  usePushNotifications();

  return (
    <SafeAreaProvider>
      <KeyboardProvider statusBarTranslucent={true} navigationBarTranslucent={true}>
        <Provider store={store}>
          <StatusBar hidden={false} translucent backgroundColor="transparent" barStyle="light-content" />
          <Navigator />
        </Provider>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
};

export default codePush(App);
// export default App;

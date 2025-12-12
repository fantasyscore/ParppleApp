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
const App = () => {
  useEffect(() => {
    onAppStart(store);
    setTimeout(() => {
      SplashScreen.hide();
    }, 3000);
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

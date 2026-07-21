/**
 * @format
 */
import 'react-native-gesture-handler'; 
import {AppRegistry, LogBox, Platform} from 'react-native';
import { enableScreens, enableFreeze } from 'react-native-screens';
enableScreens(true);
enableFreeze(true);
import {name as appName} from './app.json';
import App from './src/App';
import FastImage from 'react-native-fast-image';

// 🚀 Globally neutralize preload to prevent background decodes from crashing/SIGABRT in SDWebImage
FastImage.preload = (sources) => {
  console.log('[FastImage.preload] Global preloading disabled safely to prevent memory/thread crashes.');
};
import { registerBackgroundPushHandler } from './src/notifications/pushNotifications';
// import { getApps } from '@react-native-firebase/app';
// console.log('Firebase apps:', getApps());
AppRegistry.registerComponent(appName, () => App);
LogBox.ignoreAllLogs();

// Background / quit-state handler (required by @react-native-firebase/messaging)
Platform.OS === "android" && registerBackgroundPushHandler();
/**
 * @format
 */
import 'react-native-gesture-handler'; 
import {AppRegistry, LogBox, Platform} from 'react-native';
import {name as appName} from './app.json';
import App from './src/App';
import { registerBackgroundPushHandler } from './src/notifications/pushNotifications';
import { getApps } from '@react-native-firebase/app';
console.log('Firebase apps:', getApps());
AppRegistry.registerComponent(appName, () => App);
LogBox.ignoreAllLogs();

// Background / quit-state handler (required by @react-native-firebase/messaging)
Platform.OS === "android" && registerBackgroundPushHandler();
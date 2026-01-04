/**
 * @format
 */

import {AppRegistry, LogBox} from 'react-native';
import {name as appName} from './app.json';
import App from './src/App';
import messaging from '@react-native-firebase/messaging';
import { displayRemoteMessage } from './src/notifications/pushNotifications';

AppRegistry.registerComponent(appName, () => App);
LogBox.ignoreAllLogs();

// Background / quit-state handler (required by @react-native-firebase/messaging)
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  await displayRemoteMessage(remoteMessage);
});
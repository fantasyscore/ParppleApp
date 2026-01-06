/**
 * @format
 */
import 'react-native-gesture-handler'; 
import {AppRegistry, LogBox} from 'react-native';
import {name as appName} from './app.json';
import App from './src/App';
import { registerBackgroundPushHandler } from './src/notifications/pushNotifications';

AppRegistry.registerComponent(appName, () => App);
LogBox.ignoreAllLogs();

// Background / quit-state handler (required by @react-native-firebase/messaging)
registerBackgroundPushHandler();
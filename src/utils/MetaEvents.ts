import { AppEventsLogger } from 'react-native-fbsdk-next';

export const logMetaEvent = async (eventName:any, valueToSum:any, params = {}) => {
  try {
    if (valueToSum !== undefined && valueToSum !== null) {
      await AppEventsLogger.logEvent(
        eventName,
        valueToSum,
        params
      );
    } else {
      await AppEventsLogger.logEvent(
        eventName,
        params
      );
    }
  } catch (error) {
    console.log('Meta Event Error:', error);
  }
};
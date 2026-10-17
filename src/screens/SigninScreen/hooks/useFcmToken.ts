import { useEffect, useState } from "react";
import { Platform } from "react-native";
import messaging from "@react-native-firebase/messaging";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FCM_TOKEN_KEY } from "../../../helper/Constants";

/**
 * Fetches this device's push token, keeps it in AsyncStorage (other flows read it from there)
 * and follows token refreshes. Returns the current token ("" until it is known).
 */
export function useFcmToken() {
  const [token, setToken] = useState("");

  useEffect(() => {
    let unsubscribeTokenRefresh: (() => void) | undefined;

    (async () => {
      try {
        if (Platform.OS === "ios") {
          await messaging().registerDeviceForRemoteMessages();
        }
        const currentToken = await messaging().getToken();
        if (currentToken) {
          setToken(currentToken);
          await AsyncStorage.setItem(FCM_TOKEN_KEY, currentToken);
        }
        unsubscribeTokenRefresh = messaging().onTokenRefresh(async (newToken) => {
          if (newToken) {
            await AsyncStorage.setItem(FCM_TOKEN_KEY, newToken);
          }
        });
      } catch (error) {
        console.log("[FCM] init error:", error);
      }
    })();

    return () => unsubscribeTokenRefresh?.();
  }, []);

  return token;
}

import { appOperation } from "../appOperation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { USER_TOKEN_KEY } from "./Constants";

export const onAppStart = async (store:any) => {
  try {
    console.log('[onAppStart] Initializing app...');
    const customerToken:any = await AsyncStorage.getItem(USER_TOKEN_KEY);
    if (customerToken) {
      try {
        appOperation.setCustomerToken(customerToken);
        console.log('[onAppStart] Token loaded and set successfully');
      } catch (tokenError) {
        console.error('[onAppStart] Error setting customer token:', tokenError);
        // Don't crash - app can continue without token (user will need to login)
      }
    } else {
      console.log('[onAppStart] No token found in storage');
    }
  } catch (error) {
    console.error('[onAppStart] Error during app initialization:', error);
    // Don't crash - app can continue and user can login
  }
};

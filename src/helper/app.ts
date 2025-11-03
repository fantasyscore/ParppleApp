import { appOperation } from "../appOperation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { USER_TOKEN_KEY } from "./Constants";

export const onAppStart = async (store:any) => {
  try {
    const customerToken:any = await AsyncStorage.getItem(USER_TOKEN_KEY);
    appOperation.setCustomerToken(customerToken);
  } catch (error) {
    // showError("error")
  }
};

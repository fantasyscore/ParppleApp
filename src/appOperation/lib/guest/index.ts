import { AppOperation } from "../..";
import { GUEST_TYPE } from "../../types";
import { withSnapDevice } from "../../../services/snapDeviceService";

export default (appOperation: AppOperation) => ({
  // snapDevice: device data the backend forwards to Snap as the SIGN_UP event
  login: async (data: any) => {
    const body = await withSnapDevice(data);
    // Debug builds only: the body carries the login token and GAID
    if (__DEV__) console.log("[Login API] auth/registerUser body:", JSON.stringify(body, null, 2));
    return appOperation.post("auth/registerUser", body, GUEST_TYPE);
  },
  sendOtp: (data: FormData) =>
    appOperation.post("api/v1/auth/send-otp", data, GUEST_TYPE),
  otpVerifyAPI: (data: FormData) =>
    appOperation.post("api/v1/auth/verify-otp", data, GUEST_TYPE),
});

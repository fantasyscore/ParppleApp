import { AppOperation } from "../..";
import { GUEST_TYPE } from "../../types";

export default (appOperation: AppOperation) => ({
  login: (data: FormData) =>
    appOperation.post("auth/registerUser", data, GUEST_TYPE),
  sendOtp: (data: FormData) =>
    appOperation.post("api/v1/auth/send-otp", data, GUEST_TYPE),
  otpVerifyAPI: (data: FormData) =>
    appOperation.post("api/v1/auth/verify-otp", data, GUEST_TYPE),
});

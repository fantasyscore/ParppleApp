import { AppOperation } from "../..";
import { GUEST_TYPE } from "../../types";

export default (appOperation: AppOperation) => ({
  login: (data: FormData) =>
    appOperation.post("auth/registerUser", data, GUEST_TYPE),
});

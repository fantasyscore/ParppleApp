import { AppOperation } from "./../../index";
import { ADMIN_TYPE } from "../../types";

export default (appOperation: AppOperation) => ({
  getStoreConfig: () =>
    appOperation.get(
      "/V1/store/storeConfigs",
      undefined,
      undefined,
      ADMIN_TYPE,
    ),
});

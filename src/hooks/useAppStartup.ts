import { useEffect } from "react";
import { InteractionManager } from "react-native";
import { onAppStart } from "../helper/app";
import { ForceUpdateService } from "../services/ForceUpdateService";
import { initializeAnalytics } from "../services/analyticsService";
import { recoverPurchasesOnStartup } from "../services/purchaseRecoveryService";
import { enableScreenSecurity } from "../utils/ScreenSecurity";
import { getSnapDevice } from "../services/snapDeviceService";
import { initAppsFlyer } from "../services/appsFlyerService";

/** One-time work when the app process starts. Each step is independent and must never block the UI. */
export function useAppStartup() {
  useEffect(() => {
    // Needed before the first API call, so it runs immediately
    onAppStart();
    enableScreenSecurity();
    // Install attribution: started right away so the first session is reported as early as possible
    initAppsFlyer();
    // Not needed to draw the first screen: let the launch render and navigation finish first
    const handle = InteractionManager.runAfterInteractions(() => {
      initializeAnalytics().catch(() => {});
      ForceUpdateService.checkAndEnforceUpdate();
      recoverPurchasesOnStartup().catch(() => {});
      // Debug builds only: shows the snapDevice object sent with sign-up and purchase APIs
      if (__DEV__) getSnapDevice().then(device => console.log("[SnapDevice]", JSON.stringify(device)));
    });
    return () => handle.cancel();
  }, []);
}

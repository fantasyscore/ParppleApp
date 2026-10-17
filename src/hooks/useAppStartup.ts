import { useEffect } from "react";
import { InteractionManager } from "react-native";
import { onAppStart } from "../helper/app";
import { ForceUpdateService } from "../services/ForceUpdateService";
import { initializeAnalytics } from "../services/analyticsService";
import { recoverPurchasesOnStartup } from "../services/purchaseRecoveryService";
import { enableScreenSecurity } from "../utils/ScreenSecurity";

/** One-time work when the app process starts. Each step is independent and must never block the UI. */
export function useAppStartup() {
  useEffect(() => {
    // Needed before the first API call, so it runs immediately
    onAppStart();
    enableScreenSecurity();
    // Not needed to draw the first screen: let the launch render and navigation finish first
    const handle = InteractionManager.runAfterInteractions(() => {
      initializeAnalytics().catch(() => {});
      ForceUpdateService.checkAndEnforceUpdate();
      recoverPurchasesOnStartup().catch(() => {});
    });
    return () => handle.cancel();
  }, []);
}

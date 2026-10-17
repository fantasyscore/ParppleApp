import { useCallback, useState } from "react";
import { Alert, NativeModules, Platform } from "react-native";
import { check, openSettings, PERMISSIONS, request, RESULTS } from "react-native-permissions";
import { useDispatch } from "react-redux";
import { appOperation } from "../appOperation";
import { getProfile } from "../actions/authActions";

export type FaceVerificationStage = "prompt" | "verifying" | "success" | "error";

type FaceLivenessModule = {
  startLiveness?: (sessionId: string) => Promise<{ status?: string; message?: string } | string | null | undefined>;
};

export const getFaceLivenessModule = () => (NativeModules as any)?.FaceLiveness as FaceLivenessModule | undefined;

const openSettingsAlert = (title: string, message: string) =>
  Alert.alert(title, message, [
    { text: "Open Settings", onPress: () => openSettings().catch(() => null) },
    { text: "Cancel", style: "cancel" },
  ]);

export async function ensureCameraPermission(): Promise<boolean> {
  try {
    const permission = Platform.OS === "ios" ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
    const currentStatus = await check(permission);
    if (currentStatus === RESULTS.GRANTED) return true;

    if (currentStatus === RESULTS.BLOCKED) {
      openSettingsAlert(
        "Camera permission required",
        "Camera permission is disabled. Please enable it from Settings to continue face verification."
      );
      return false;
    }

    const requestedStatus = await request(permission);
    if (requestedStatus === RESULTS.GRANTED) return true;

    openSettingsAlert(
      "Camera permission denied",
      "Face verification requires camera access. You can enable it from Settings."
    );
    return false;
  } catch (error) {
    console.warn("Camera permission check failed:", error);
    Alert.alert("Permission error", "Unable to check camera permission. Please try again.");
    return false;
  }
}

/**
 * Face-liveness verification flow: camera permission -> backend session ->
 * native liveness check -> backend verification -> profile refresh.
 * Screens only render `stage` / `error` and call `start()`.
 */
export function useFaceVerification() {
  const dispatch = useDispatch();
  const [stage, setStage] = useState<FaceVerificationStage>("prompt");
  const [error, setError] = useState("");

  const reset = useCallback(() => {
    setStage("prompt");
    setError("");
  }, []);

  const fail = useCallback((message: string) => {
    setError(message);
    setStage("error");
  }, []);

  const start = useCallback(async () => {
    const faceLiveness = getFaceLivenessModule();
    if (!faceLiveness || typeof faceLiveness.startLiveness !== "function") {
      console.warn("[FaceVerification] FaceLiveness native module not found. Rebuild the app (not just a Metro reload).");
      return;
    }

    try {
      if (!(await ensureCameraPermission())) return;

      const sessionResp = await (appOperation.customer as any).createFaceLivenessSessionAPI();
      const sessionId = sessionResp?.data;
      if (!sessionId) throw new Error("Session API did not return a valid sessionId");

      const result = await faceLiveness.startLiveness(sessionId);

      if (!result || typeof result !== "object") {
        fail("Liveness Success");
        return;
      }
      if (result.status === "cancelled") {
        fail("Verification cancelled.");
        return;
      }
      if (result.status !== "success") {
        fail(`Result: ${JSON.stringify(result)}`);
        return;
      }

      const verifyResp = await (appOperation.customer as any).verifyFaceLivenessSessionAPI({ sessionId });
      if (verifyResp?.data?.success) {
        dispatch(getProfile(true));
        setStage("success");
      } else {
        fail(verifyResp?.data?.message);
      }
    } catch (e: any) {
      console.error("[FaceVerification] Error:", e);
      fail(e?.message ?? String(e));
    }
  }, [dispatch, fail]);

  return { stage, error, start, reset };
}

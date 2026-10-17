import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useDispatch } from "react-redux";
import { appOperation } from "../../../appOperation";
import { getProfile } from "../../../actions/authActions";
import { ensureCameraPermission, getFaceLivenessModule } from "../../../hooks/useFaceVerification";

export type GateDialog = "none" | "prompt" | "success" | "failed";

// A liveness match at or above this confidence counts as verified
const MIN_CONFIDENCE = 80;

/**
 * iOS requires an unverified user to pass a face check before buying. This runs it and tells the
 * screen which dialog to show: the prompt, the success message, or the failure message.
 */
export function useFaceVerificationGate() {
  const dispatch = useDispatch();
  const [dialog, setDialog] = useState<GateDialog>("none");

  const open = useCallback(() => setDialog("prompt"), []);
  const close = useCallback(() => setDialog("none"), []);

  const start = useCallback(async () => {
    const faceLiveness = getFaceLivenessModule();
    if (!faceLiveness?.startLiveness) {
      console.warn("[FaceGate] FaceLiveness native module not found. Rebuild the app (not just a Metro reload).");
      return;
    }

    try {
      if (!(await ensureCameraPermission())) return;

      const sessionResp = await (appOperation.customer as any).createFaceLivenessSessionAPI();
      const sessionId = sessionResp?.data;
      if (!sessionId) throw new Error("Session API did not return a valid sessionId");

      const result = await faceLiveness.startLiveness(sessionId);
      if (result && typeof result === "object") {
        if (result.status === "success") {
          setDialog("none");
          const verifyResp = await (appOperation.customer as any).verifyFaceLivenessSessionAPI({ sessionId });
          if (verifyResp?.success) {
            if (verifyResp?.data?.confidence >= MIN_CONFIDENCE) {
              dispatch(getProfile(true));
              setDialog("success");
            } else {
              setDialog("failed");
            }
          }
        } else if (result.status === "cancelled") {
          Alert.alert(result.message ? `Cancelled: ${result.message}` : "Cancelled");
        } else {
          Alert.alert(`Result: ${JSON.stringify(result)}`);
        }
      } else {
        Alert.alert(result ? `Result: ${String(result)}` : "Liveness Success");
      }
    } catch (e) {
      console.error("[FaceGate] Error:", e);
      setDialog("failed");
    }
  }, [dispatch]);

  return { dialog, open, close, start };
}

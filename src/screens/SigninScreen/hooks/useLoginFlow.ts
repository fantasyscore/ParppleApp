import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import auth, { getAuth, GoogleAuthProvider, signInWithCredential } from "@react-native-firebase/auth";
import { appleAuth } from "@invertase/react-native-apple-authentication";
import { useDispatch } from "react-redux";
import { userLogin } from "../../../actions/authActions";
import { setEmailAuth } from "../../../slices/loginServices/authSlice";
import { useFcmToken } from "./useFcmToken";

const GOOGLE_WEB_CLIENT_ID = "316625885811-s7ak9u8n13up5egaqa3l07hdi7i8sau1.apps.googleusercontent.com";
/**
 * After a successful login the app navigates away on its own. The loader stays up
 * until then so the Welcome screen doesn't flash back; this only bounds it in
 * case no navigation ever happens.
 */
const LOADER_SAFETY_TIMEOUT_MS = 5000;

const SIGN_IN_ABORTED_CODES = [
  statusCodes.SIGN_IN_CANCELLED,
  statusCodes.IN_PROGRESS,
  statusCodes.PLAY_SERVICES_NOT_AVAILABLE,
];

/**
 * Every way of signing in from the Welcome screen (Google, email/password,
 * Apple) plus the shared "backend login is running" loader state.
 */
export function useLoginFlow() {
  const dispatch = useDispatch();
  const fcmToken = useFcmToken();
  const [loading, setLoading] = useState(false);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
    return () => {
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
    };
  }, []);

  const startLoading = useCallback(() => setLoading(true), []);
  const stopLoading = useCallback(() => setLoading(false), []);
  const keepLoadingUntilNavigation = useCallback(() => {
    if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
    safetyTimerRef.current = setTimeout(() => setLoading(false), LOADER_SAFETY_TIMEOUT_MS);
  }, []);

  /** Backend login with a Google / Firebase ID token. Resolves true when the backend accepted it. */
  const loginWithIdToken = useCallback(
    async (idToken: string) =>
      (await dispatch(
        userLogin({ phoneNumber: null, googleToken: idToken, fcmtoken: fcmToken, iosToken: null }, true)
      )) === true,
    [dispatch, fcmToken]
  );

  const signInWithGoogle = useCallback(async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      // Always force the account chooser (never silent sign-in)
      try {
        await GoogleSignin.signOut();
      } catch {
        // nothing to sign out
      }

      const signInResult: any = await GoogleSignin.signIn({ prompt: "select_account" } as any);
      const idToken: string | undefined = signInResult.data?.idToken ?? signInResult.idToken;
      if (!idToken) throw new Error("No ID token found");

      dispatch(setEmailAuth(signInResult));
      startLoading();
      // Backend login and Firebase sign-in run in parallel; the loader covers both.
      const [accepted] = await Promise.all([
        loginWithIdToken(idToken),
        signInWithCredential(getAuth(), GoogleAuthProvider.credential(idToken)),
      ]);
      if (accepted) keepLoadingUntilNavigation();
      else stopLoading();
    } catch (error: any) {
      stopLoading();
      // Cancelling or a missing Play Services dialog is not an error worth logging
      if (!SIGN_IN_ABORTED_CODES.includes(error?.code)) console.log("[Login] Google sign-in failed:", error);
    }
  }, [dispatch, startLoading, stopLoading, keepLoadingUntilNavigation, loginWithIdToken]);

  /**
   * Email/password sign-in. Starts the loader right away and, on success, keeps it
   * up until navigation. On failure it leaves the loader running and returns
   * false: the caller restores its UI and then calls `stopLoading()` so both
   * changes land in the same render.
   */
  const signInWithEmail = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      startLoading();
      try {
        const result = await auth().signInWithEmailAndPassword(email, password);
        const idToken = await result.user.getIdToken();
        if (!idToken) throw new Error("No ID token found");

        dispatch(setEmailAuth(result));
        const accepted = await loginWithIdToken(idToken);
        if (accepted) keepLoadingUntilNavigation();
        return accepted;
      } catch (error) {
        console.log("[Login] Email sign-in failed:", error);
        return false;
      }
    },
    [dispatch, startLoading, keepLoadingUntilNavigation, loginWithIdToken]
  );

  /**
   * Sign in with Apple (iOS only). Shown on the Welcome screen next to Google: App Store rules
   * require it whenever another social login is offered.
   */
  const signInWithApple = useCallback(async () => {
    if (Platform.OS !== "ios") return;
    try {
      const response = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });
      if (!response.identityToken) {
        console.warn("[Apple Sign-In] No identity token received");
        return;
      }
      dispatch(setEmailAuth(response));
      startLoading();
      const accepted =
        (await dispatch(
          userLogin({ phoneNumber: null, googleToken: null, iosToken: response.identityToken, fcmtoken: fcmToken }, true)
        )) === true;
      if (accepted) keepLoadingUntilNavigation();
      else stopLoading();
    } catch (error: any) {
      stopLoading();
      // The user closing the Apple sheet is not an error
      if (error?.code === "ERR_REQUEST_CANCELED" || error?.code === 1001 || error?.code === "1001") return;
      console.warn("[Apple Sign-In] Error:", error?.message ?? error);
    }
  }, [dispatch, fcmToken, startLoading, stopLoading, keepLoadingUntilNavigation]);

  return { loading, stopLoading, signInWithGoogle, signInWithEmail, signInWithApple };
}

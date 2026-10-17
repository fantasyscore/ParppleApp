import { useCallback, useRef, useState } from "react";

const TAPS_TO_REVEAL = 5;

interface Options {
  /** Email/password sign-in; returns true when accepted. Must start the screen loader itself. */
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  /** Called together with re-showing the form after a failed attempt */
  stopLoading: () => void;
}

/**
 * Hidden email/password login (used for store review accounts): tapping the logo
 * TAPS_TO_REVEAL times opens a form. Owns the tap counter and the form state, so a
 * failed attempt can bring the form back with what the user typed.
 */
export function useReviewLogin({ signInWithEmail, stopLoading }: Options) {
  const tapCountRef = useRef(0);
  const inFlightRef = useRef(false);
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onLogoPress = useCallback(() => {
    tapCountRef.current += 1;
    if (tapCountRef.current < TAPS_TO_REVEAL) return;
    tapCountRef.current = 0;
    setVisible(true);
  }, []);

  const resetForm = useCallback(() => {
    setEmail("");
    setPassword("");
    setError("");
  }, []);

  const close = useCallback(() => {
    if (inFlightRef.current) return;
    setVisible(false);
    resetForm();
  }, [resetForm]);

  const submit = useCallback(async () => {
    if (inFlightRef.current) return;
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }
    inFlightRef.current = true;
    setError("");
    // Hide the form and let signInWithEmail raise the loader in the same render: no dark gap in between.
    setVisible(false);
    const accepted = await signInWithEmail(trimmedEmail, password);
    inFlightRef.current = false;
    if (accepted) {
      resetForm();
    } else {
      // Bring the form back (with what was typed) so the user can correct it.
      stopLoading();
      setVisible(true);
      setError("Login failed. Please check your details and try again.");
    }
  }, [email, password, signInWithEmail, stopLoading, resetForm]);

  return { onLogoPress, form: { visible, email, password, error, setEmail, setPassword, close, submit } };
}

export type ReviewLoginForm = ReturnType<typeof useReviewLogin>["form"];

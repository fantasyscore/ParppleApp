import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useLatest } from "./useLatest";

/** Calls `onForeground` each time the app returns to the foreground from the background / inactive state. */
export function useOnAppForeground(onForeground: () => void) {
  const callbackRef = useLatest(onForeground);
  const previousStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      const previousState = previousStateRef.current;
      previousStateRef.current = nextState;
      if (nextState === "active" && (previousState === "background" || previousState === "inactive")) {
        callbackRef.current();
      }
    });
    return () => subscription.remove();
  }, [callbackRef]);
}

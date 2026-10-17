import { InteractionManager } from "react-native";

/** Runs `callback` after the current interactions/animations settle. Returns a cancel function. */
export const runAfterInitialInteractions = (callback: () => void, delay = 0) => {
  let interactionHandle: { cancel?: () => void } | null = null;
  const timer = setTimeout(() => {
    interactionHandle = InteractionManager.runAfterInteractions(callback);
  }, delay);

  return () => {
    clearTimeout(timer);
    interactionHandle?.cancel?.();
  };
};

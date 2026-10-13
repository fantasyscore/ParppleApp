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

export const capitalizeFirstLetter = (text: string) => {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/** Male users who haven't bought a publish plan can't see photos or use most actions. */
export const isPublishLocked = (userData: any): boolean =>
  userData?.gender === "male" && userData?.isPublish === false;

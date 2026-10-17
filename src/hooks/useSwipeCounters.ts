import { useCallback, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SUPER_LIKES_REMAINING_KEY, SWIPES_PER_DAY_KEY, SWIPES_REMAINING_KEY } from "../helper/Constants";
import { useLatest } from "./useLatest";

/**
 * Remaining swipes / super likes / swipes-per-day. Server values from `userData`
 * win; AsyncStorage only seeds the counters before the first profile response
 * arrives and keeps them across launches.
 */
export function useSwipeCounters(userData: any) {
  const [remainingSwipes, setRemainingSwipes] = useState(0);
  const [remainingSuperLikes, setRemainingSuperLikes] = useState(0);
  const [swipesPerDay, setSwipesPerDay] = useState(0);
  const remainingSwipesRef = useLatest(remainingSwipes);
  const userDataRef = useLatest(userData);
  const hasReadCacheRef = useRef(false);
  const userId = userData?._id;

  // Read the cache once, as soon as we know whose counters to load
  useEffect(() => {
    if (!userId || hasReadCacheRef.current) return;
    hasReadCacheRef.current = true;

    (async () => {
      try {
        const [swipes, superLikes, perDay] = await Promise.all([
          AsyncStorage.getItem(`${SWIPES_REMAINING_KEY}_${userId}`),
          AsyncStorage.getItem(`${SUPER_LIKES_REMAINING_KEY}_${userId}`),
          AsyncStorage.getItem(`${SWIPES_PER_DAY_KEY}_${userId}`),
        ]);

        // If API data has already populated Redux, do NOT overwrite it!
        if (userDataRef.current?.swipesRemaining !== undefined) return;

        if (swipes !== null) setRemainingSwipes(parseInt(swipes, 10));
        if (superLikes !== null) setRemainingSuperLikes(parseInt(superLikes, 10));
        if (perDay !== null) setSwipesPerDay(parseInt(perDay, 10));
      } catch (error) {
        console.warn("Error loading stored values:", error);
      }
    })();
  }, [userId, userDataRef]);

  // Server data overrides the local counters whenever those specific fields change
  useEffect(() => {
    if (
      userData &&
      (userData.swipesRemaining !== undefined ||
        userData.superLikesRemaining !== undefined ||
        userData.swipesPerDay !== undefined)
    ) {
      setRemainingSwipes(userData?.swipesRemaining ?? 0);
      setRemainingSuperLikes(userData?.superLikesRemaining ?? 0);
      setSwipesPerDay(userData?.swipesPerDay ?? 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.swipesRemaining, userData?.superLikesRemaining, userData?.swipesPerDay]);

  // Persist
  useEffect(() => {
    if (!userId) return;

    AsyncStorage.multiSet([
      [`${SWIPES_REMAINING_KEY}_${userId}`, String(remainingSwipes)],
      [`${SUPER_LIKES_REMAINING_KEY}_${userId}`, String(remainingSuperLikes)],
      [`${SWIPES_PER_DAY_KEY}_${userId}`, String(swipesPerDay)],
    ]).catch((error) => console.warn("Error saving stored values:", error));
  }, [remainingSwipes, remainingSuperLikes, swipesPerDay, userId]);

  const consumeSwipe = useCallback(() => {
    setRemainingSwipes((prev) => Math.max((prev ?? 0) - 1, 0));
  }, []);

  return { remainingSwipesRef, consumeSwipe };
}

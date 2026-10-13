import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { swipeLikeDisLike } from "../../../../actions/authActions";
import NavigationService from "../../../../navigation/NavigationService";
import { NAVIGATION_SUBSCRIPTION_SCREEN } from "../../../../navigation/routes";
import { useLatest } from "../../../../hooks/useLatest";
import { useLikeDislikeAnimation } from "../../../../hooks/useLikeDislikeAnimation";

interface Options {
  userData: any;
  /** Latest remaining-swipes count (see useSwipeCounters) */
  remainingSwipesRef: { current: number };
  consumeSwipe: () => void;
  removeProfile: (profileId: string) => void;
  /** Called first on every action so an open profile preview can close */
  onActionStart: () => void;
  /** Free likes are used up and the user can verify their face to continue */
  onVerifyForMoreLikes: () => void;
}

/** Like / dislike / crush-note flows: gating, animation, API call and removing the card from the deck. */
export function useSwipeActions({
  userData,
  remainingSwipesRef,
  consumeSwipe,
  removeProfile,
  onActionStart,
  onVerifyForMoreLikes,
}: Options) {
  const dispatch = useDispatch();
  const userDataRef = useLatest(userData);
  const animation = useLikeDislikeAnimation();
  const { runLikeAnimation, runDislikeAnimation, crushLikeAnimation, isSwipeAnimatingRef } = animation;

  const swipe = useCallback(
    (item: any, type: "like" | "dislike") => {
      if (!item?._id) return;

      if (type === "like" && userDataRef.current?.subscription?.perks?.unlimitedLikes !== true) {
        consumeSwipe();
      }

      dispatch(swipeLikeDisLike({ swipedId: item._id, type }));
      removeProfile(item._id);
    },
    [dispatch, consumeSwipe, removeProfile, userDataRef]
  );

  const dislike = useCallback(
    (item: any) => {
      onActionStart();
      if (isSwipeAnimatingRef.current) return;
      runDislikeAnimation(() => swipe(item, "dislike"));
    },
    [onActionStart, isSwipeAnimatingRef, runDislikeAnimation, swipe]
  );

  const like = useCallback(
    (item: any) => {
      onActionStart();
      if (isSwipeAnimatingRef.current) return;

      const user = userDataRef.current;
      if (user?.subscription?.perks?.unlimitedLikes !== true && remainingSwipesRef.current <= 0) {
        if (user?.gender == "female" && user?.faceVerified === false) {
          onVerifyForMoreLikes();
        } else {
          NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN);
        }
        return;
      }

      runLikeAnimation(() => swipe(item, "like"));
    },
    [onActionStart, isSwipeAnimatingRef, runLikeAnimation, swipe, onVerifyForMoreLikes, remainingSwipesRef, userDataRef]
  );

  /** After a crush note is sent the card leaves the deck, without counting as a swipe. */
  const crushNoteSent = useCallback(
    (item: any) => {
      onActionStart();
      if (isSwipeAnimatingRef.current) return;
      crushLikeAnimation(() => {
        if (item?._id) removeProfile(item._id);
      });
    },
    [onActionStart, isSwipeAnimatingRef, crushLikeAnimation, removeProfile]
  );

  return { like, dislike, crushNoteSent, animation };
}

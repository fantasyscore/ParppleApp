import { useCallback, useEffect, useMemo, useRef } from 'react';
import { SharedValue, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

// Timings (ms) shared by the like, dislike and crush-note effects.
const FADE_IN_MS = 100;
const POP_UP_MS = 170;
const SETTLE_DOWN_MS = 130;
const SETTLE_MS = 100;
// The card is removed once the pop sequence above has finished (170 + 130 + 100)
const COMPLETE_AFTER_MS = POP_UP_MS + SETTLE_DOWN_MS + SETTLE_MS;
const FADE_OUT_MS = 130;
const TRANSITION_MS = 320;

type Effect = {
    runningRef: React.MutableRefObject<boolean>;
    timerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
    overlayOpacity: SharedValue<number>;
    iconScale: SharedValue<number>;
};

/** Per-effect state; the returned object is stable across renders. */
const useEffectState = (): Effect => {
    const runningRef = useRef(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const overlayOpacity = useSharedValue(0);
    const iconScale = useSharedValue(0.7);
    return useMemo(() => ({ runningRef, timerRef, overlayOpacity, iconScale }), [overlayOpacity, iconScale]);
};

export const useLikeDislikeAnimation = () => {
    const dislike = useEffectState();
    const like = useEffectState();
    const crush = useEffectState();

    // True from the moment an effect starts until the list has had time to settle after the card left
    const isSwipeAnimatingRef = useRef(false);
    const releaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const run = useCallback((effect: Effect, onComplete?: () => void) => {
        if (effect.runningRef.current) return;
        effect.runningRef.current = true;
        isSwipeAnimatingRef.current = true;

        if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current);
        if (effect.timerRef.current) clearTimeout(effect.timerRef.current);

        effect.overlayOpacity.value = 0;
        effect.iconScale.value = 0.7;
        effect.overlayOpacity.value = withTiming(1, { duration: FADE_IN_MS });
        effect.iconScale.value = withSequence(
            withTiming(1.28, { duration: POP_UP_MS }),
            withTiming(0.9, { duration: SETTLE_DOWN_MS }),
            withTiming(1, { duration: SETTLE_MS })
        );

        effect.timerRef.current = setTimeout(() => {
            onComplete?.();

            effect.overlayOpacity.value = withTiming(0, { duration: FADE_OUT_MS });
            effect.runningRef.current = false;
            effect.timerRef.current = null;

            releaseTimerRef.current = setTimeout(() => {
                isSwipeAnimatingRef.current = false;
                releaseTimerRef.current = null;
            }, TRANSITION_MS + 120);
        }, COMPLETE_AFTER_MS);
    }, []);

    const runDislikeAnimation = useCallback((onComplete?: () => void) => run(dislike, onComplete), [run, dislike]);
    const runLikeAnimation = useCallback((onComplete?: () => void) => run(like, onComplete), [run, like]);
    const crushLikeAnimation = useCallback((onComplete?: () => void) => run(crush, onComplete), [run, crush]);

    useEffect(() => {
        return () => {
            [releaseTimerRef.current, dislike.timerRef.current, like.timerRef.current, crush.timerRef.current].forEach((timer) => {
                if (timer) clearTimeout(timer);
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const dislikeOverlayStyle = useAnimatedStyle(() => ({ opacity: dislike.overlayOpacity.value }));
    const dislikeIconAnimatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: dislike.iconScale.value }] }));
    const likeOverlayStyle = useAnimatedStyle(() => ({ opacity: like.overlayOpacity.value }));
    const likeIconAnimatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: like.iconScale.value }] }));
    const crushlikeOverlayStyle = useAnimatedStyle(() => ({ opacity: crush.overlayOpacity.value }));
    const crushlikeIconAnimatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: crush.iconScale.value }] }));

    return {
        runLikeAnimation,
        runDislikeAnimation,
        crushLikeAnimation,
        likeOverlayStyle,
        likeIconAnimatedStyle,
        dislikeOverlayStyle,
        dislikeIconAnimatedStyle,
        crushlikeOverlayStyle,
        crushlikeIconAnimatedStyle,
        isSwipeAnimatingRef,
    };
};

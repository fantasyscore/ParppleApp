import { useCallback, useRef, useEffect } from 'react';
import { useSharedValue, withSequence, withTiming, useAnimatedStyle } from 'react-native-reanimated';

const TRANSITION_MS = 320;

export const useLikeDislikeAnimation = () => {
    const isDislikeFxRunningRef = useRef(false);
    const dislikeOverlayOpacity = useSharedValue(0);
    const dislikeIconScale = useSharedValue(0.7);

    const isLikeFxRunningRef = useRef(false);
    const likeOverlayOpacity = useSharedValue(0);
    const likeIconScale = useSharedValue(0.7);

    const isCrushFxRunningRef = useRef(false);
    const crushOverlayOpacity = useSharedValue(0);
    const crushIconScale = useSharedValue(0.7);

    const isSwipeAnimatingRef = useRef(false);
    const swipeAnimationReleaseTimerRef = useRef<NodeJS.Timeout | null>(null);
    const dislikeFxTimerRef = useRef<NodeJS.Timeout | null>(null);
    const likeFxTimerRef = useRef<NodeJS.Timeout | null>(null);
    const crushFxTimerRef = useRef<NodeJS.Timeout | null>(null);

    const runDislikeAnimation = useCallback((onComplete?: () => void) => {
        if (isDislikeFxRunningRef.current) return;
        isDislikeFxRunningRef.current = true;
        isSwipeAnimatingRef.current = true;

        if (swipeAnimationReleaseTimerRef.current) {
            clearTimeout(swipeAnimationReleaseTimerRef.current);
        }
        dislikeOverlayOpacity.value = 0;
        dislikeIconScale.value = 0.7;

        dislikeOverlayOpacity.value = withTiming(1, { duration: 70 });
        dislikeIconScale.value = withSequence(
            withTiming(1.28, { duration: 120 }),
            withTiming(0.9, { duration: 90 }),
            withTiming(1, { duration: 70 })
        );

        if (dislikeFxTimerRef.current) {
            clearTimeout(dislikeFxTimerRef.current);
        }
        
        dislikeFxTimerRef.current = setTimeout(() => {
            if (onComplete) onComplete();
            
            dislikeOverlayOpacity.value = withTiming(0, { duration: 90 });
            isDislikeFxRunningRef.current = false;
            dislikeFxTimerRef.current = null;
            
            swipeAnimationReleaseTimerRef.current = setTimeout(() => {
                isSwipeAnimatingRef.current = false;
                swipeAnimationReleaseTimerRef.current = null;
            }, TRANSITION_MS + 120);
        }, 240);
    }, [dislikeIconScale, dislikeOverlayOpacity]);

    const runLikeAnimation = useCallback((onComplete?: () => void) => {
        if (isLikeFxRunningRef.current) return;
        isLikeFxRunningRef.current = true;
        isSwipeAnimatingRef.current = true;
        
        if (swipeAnimationReleaseTimerRef.current) {
            clearTimeout(swipeAnimationReleaseTimerRef.current);
        }
        likeOverlayOpacity.value = 0;
        likeIconScale.value = 0.7;

        likeOverlayOpacity.value = withTiming(1, { duration: 70 });
        likeIconScale.value = withSequence(
            withTiming(1.28, { duration: 120 }),
            withTiming(0.9, { duration: 90 }),
            withTiming(1, { duration: 70 })
        );

        if (likeFxTimerRef.current) {
            clearTimeout(likeFxTimerRef.current);
        }
        
        likeFxTimerRef.current = setTimeout(() => {
            if (onComplete) onComplete();
            
            likeOverlayOpacity.value = withTiming(0, { duration: 90 });
            isLikeFxRunningRef.current = false;
            likeFxTimerRef.current = null;
            
            swipeAnimationReleaseTimerRef.current = setTimeout(() => {
                isSwipeAnimatingRef.current = false;
                swipeAnimationReleaseTimerRef.current = null;
            }, TRANSITION_MS + 120);
        }, 240);
    }, [likeIconScale, likeOverlayOpacity]);


    const crushLikeAnimation = useCallback((onComplete?: () => void) => {
        if (isCrushFxRunningRef.current) return;
        isCrushFxRunningRef.current = true;
        isSwipeAnimatingRef.current = true;
        
        if (swipeAnimationReleaseTimerRef.current) {
            clearTimeout(swipeAnimationReleaseTimerRef.current);
        }
        crushOverlayOpacity.value = 0;
        crushIconScale.value = 0.7;

        crushOverlayOpacity.value = withTiming(1, { duration: 70 });
        crushIconScale.value = withSequence(
            withTiming(1.28, { duration: 120 }),
            withTiming(0.9, { duration: 90 }),
            withTiming(1, { duration: 70 })
        );

        if (crushFxTimerRef.current) {
            clearTimeout(crushFxTimerRef.current);
        }
        
        crushFxTimerRef.current = setTimeout(() => {
            if (onComplete) onComplete();
            
            crushOverlayOpacity.value = withTiming(0, { duration: 90 });
            isCrushFxRunningRef.current = false;
            crushFxTimerRef.current = null;
            
            swipeAnimationReleaseTimerRef.current = setTimeout(() => {
                isSwipeAnimatingRef.current = false;
                swipeAnimationReleaseTimerRef.current = null;
            }, TRANSITION_MS + 120);
        }, 240);
    }, [crushIconScale, crushOverlayOpacity]);


    useEffect(() => {
        return () => {
            if (swipeAnimationReleaseTimerRef.current) {
                clearTimeout(swipeAnimationReleaseTimerRef.current);
            }
            if (dislikeFxTimerRef.current) {
                clearTimeout(dislikeFxTimerRef.current);
            }
            if (likeFxTimerRef.current) {
                clearTimeout(likeFxTimerRef.current);
            }
            if (crushFxTimerRef.current) {
                clearTimeout(crushFxTimerRef.current);
            }
        };
    }, []);

    const dislikeOverlayStyle = useAnimatedStyle(() => ({
        opacity: dislikeOverlayOpacity.value,
    }));

    const dislikeIconAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: dislikeIconScale.value }],
    }));

    const likeOverlayStyle = useAnimatedStyle(() => ({
        opacity: likeOverlayOpacity.value,
    }));

    const likeIconAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: likeIconScale.value }],
    }));
    const crushlikeOverlayStyle = useAnimatedStyle(() => ({
        opacity: crushOverlayOpacity.value,
    }));

    const crushlikeIconAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: crushIconScale.value }],
    }));
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

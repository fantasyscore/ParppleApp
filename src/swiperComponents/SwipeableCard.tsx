import React, {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  type PropsWithChildren,
} from 'react';
import { useWindowDimensions, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  interpolate,
  ReduceMotion,
  type SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import type { SwiperCardOptions, SwiperCardRefType } from 'rn-swiper-list';
import { scheduleOnRN, scheduleOnUI } from 'react-native-worklets';

import OverlayLabel from './OverlayLabel';

const SwipeableCard = forwardRef(function SwipeableCard<T>(
  props: PropsWithChildren<SwiperCardOptions<T>> & {
    sharedTranslateX?: SharedValue<number>;
    sharedTranslateY?: SharedValue<number>;
    onSwipeRightDenied?: () => void;
    onSwipeTopDenied?: () => void;
    disableTouchSwipe?: boolean;
  },
  ref: React.ForwardedRef<SwiperCardRefType>
) {
  const {
    index,
    activeIndex,
    prerenderItems = 4,
    onSwipeLeft,
    onSwipeRight,
    onSwipeTop,
    onSwipeBottom,
    cardStyle,
    regularCardStyle,
    children,
    disableRightSwipe,
    disableLeftSwipe,
    disableTopSwipe,
    disableBottomSwipe,
    translateXRange,
    translateYRange,
    rotateInputRange,
    rotateOutputRange,
    inputOverlayLabelRightOpacityRange,
    outputOverlayLabelRightOpacityRange,
    inputOverlayLabelLeftOpacityRange,
    outputOverlayLabelLeftOpacityRange,
    inputOverlayLabelTopOpacityRange,
    outputOverlayLabelTopOpacityRange,
    inputOverlayLabelBottomOpacityRange,
    outputOverlayLabelBottomOpacityRange,
    OverlayLabelRight,
    OverlayLabelLeft,
    OverlayLabelTop,
    OverlayLabelBottom,
    onSwipeStart,
    onSwipeActive,
    onSwipeEnd,
    swipeBackXSpringConfig,
    swipeBackYSpringConfig,
    swipeRightSpringConfig,
    swipeLeftSpringConfig,
    swipeTopSpringConfig,
    swipeBottomSpringConfig,
    onPress,
    direction = 'y',
    overlayLabelContainerStyle,
    swipeVelocityThreshold,
    sharedTranslateX,
    sharedTranslateY,
    onSwipeRightDenied,
    onSwipeTopDenied,
    disableTouchSwipe,
  } = props;

  const { width, height } = useWindowDimensions();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const maxCardTranslation = width * 1.5;
  const maxCardTranslationY = height * 1.5;

  const SWIPE_THRESHOLD_X = width * 0.18;
  const SWIPE_THRESHOLD_Y = height * 0.1;
  // Super Like lock zone: once user crosses vertical threshold, keep SUPER LIKE unless user "escapes" with a larger horizontal tilt.
  // IMPORTANT: This does NOT change LIKE/NOPE thresholds; it only gates them while locked.
  const SUPERLIKE_ESCAPE_X = SWIPE_THRESHOLD_X * 1.35;
  const SUPERLIKE_INTENT_RATIO = 1.15; // vertical must be meaningfully dominant
  const isTouchSwipeDisabled =
    !!disableTouchSwipe ||
    !!disableLeftSwipe &&
    !!disableRightSwipe &&
    !!disableTopSwipe &&
    !!disableBottomSwipe;

  const swipeRight = useCallback(() => {
    onSwipeRight?.(index);
    scheduleOnUI(() => {
      'worklet';
      translateX.value = withSpring(
        maxCardTranslation,
        {
        ...swipeRightSpringConfig,
        reduceMotion: ReduceMotion.Never,
        },
        (finished) => {
          // Hard reset (no animation) once the card is off-screen.
          // This keeps button indicators active for tap-triggered swipes until the card exits.
          if (finished) {
            if (sharedTranslateX) sharedTranslateX.value = 0;
            if (sharedTranslateY) sharedTranslateY.value = 0;
          }
        }
      );
      activeIndex.value = activeIndex.value + 1;
    });
  }, [
    index,
    onSwipeRight,
    translateX,
    translateY,
    maxCardTranslation,
    swipeRightSpringConfig,
    activeIndex,
    sharedTranslateX,
    sharedTranslateY,
  ]);

  const swipeLeft = useCallback(() => {
    onSwipeLeft?.(index);
    scheduleOnUI(() => {
      'worklet';
      translateX.value = withSpring(
        -maxCardTranslation,
        {
        ...swipeLeftSpringConfig,
        reduceMotion: ReduceMotion.Never,
        },
        (finished) => {
          // Hard reset (no animation) once the card is off-screen.
          if (finished) {
            if (sharedTranslateX) sharedTranslateX.value = 0;
            if (sharedTranslateY) sharedTranslateY.value = 0;
          }
        }
      );
      activeIndex.value = activeIndex.value + 1;
    });
  }, [
    index,
    onSwipeLeft,
    translateX,
    translateY,
    maxCardTranslation,
    swipeLeftSpringConfig,
    activeIndex,
    sharedTranslateX,
    sharedTranslateY,
  ]);

  const swipeTop = useCallback(() => {
    onSwipeTop?.(index);
    scheduleOnUI(() => {
      'worklet';
      translateY.value = withSpring(
        -maxCardTranslationY,
        {
        ...swipeTopSpringConfig,
        reduceMotion: ReduceMotion.Never,
        },
        (finished) => {
          // Hard reset (no animation) once the card is off-screen.
          if (finished) {
            if (sharedTranslateX) sharedTranslateX.value = 0;
            if (sharedTranslateY) sharedTranslateY.value = 0;
          }
        }
      );
      activeIndex.value = activeIndex.value + 1;
    });
  }, [
    index,
    onSwipeTop,
    translateY,
    maxCardTranslationY,
    swipeTopSpringConfig,
    activeIndex,
    sharedTranslateX,
    sharedTranslateY,
  ]);

  const swipeBottom = useCallback(() => {
    onSwipeBottom?.(index);
    scheduleOnUI(() => {
      'worklet';
      translateY.value = withSpring(maxCardTranslationY, {
        ...swipeBottomSpringConfig,
        reduceMotion: ReduceMotion.Never,
      });
      activeIndex.value = activeIndex.value + 1;
    });
  }, [
    index,
    onSwipeBottom,
    translateY,
    maxCardTranslationY,
    swipeBottomSpringConfig,
    activeIndex,
  ]);

  const swipeBack = useCallback(() => {
    scheduleOnUI(() => {
      'worklet';
      cancelAnimation(translateX);
      cancelAnimation(translateY);
      translateX.value = withSpring(0, {
        ...swipeBackXSpringConfig,
        reduceMotion: ReduceMotion.Never,
      });
      translateY.value = withSpring(0, {
        ...swipeBackYSpringConfig,
        reduceMotion: ReduceMotion.Never,
      });
    });
  }, [translateX, translateY, swipeBackXSpringConfig, swipeBackYSpringConfig]);

  useImperativeHandle(
    ref,
    () => ({
      swipeLeft,
      swipeRight,
      swipeBack,
      swipeTop,
      swipeBottom,
    }),
    [swipeLeft, swipeRight, swipeBack, swipeTop, swipeBottom]
  );

  const rotateX = useDerivedValue(() =>
    interpolate(
      translateX.value,
      rotateInputRange ?? [],
      rotateOutputRange ?? [],
      'clamp'
    )
  );

  /**
   * Overlay exclusivity (Tinder-style):
   * - If UP intent is dominant or SUPER LIKE is locked, hide LEFT/RIGHT overlays.
   * - If user escapes (absX >= SUPERLIKE_ESCAPE_X), hide SUPER LIKE overlay immediately.
   *
   * Note: This does NOT affect card motion/tilt — only the overlay label opacity drivers.
   */
  const isSuperLikeIntent = useDerivedValue(() => {
    if (translateY.value >= 0) return false;
    return (
      Math.abs(translateY.value) >
      Math.abs(translateX.value) * SUPERLIKE_INTENT_RATIO
    );
  });
  const isSuperLikeLocked = useDerivedValue(() => {
    return (
      translateY.value < -SWIPE_THRESHOLD_Y &&
      Math.abs(translateX.value) < SUPERLIKE_ESCAPE_X
    );
  });
  const isSuperLikeMode = useDerivedValue(
    () => isSuperLikeIntent.value || isSuperLikeLocked.value
  );
  const overlayTranslateX = useDerivedValue(() => {
    // While in SUPER LIKE mode and not escaped, force X overlays to 0 (hide YAS/NOPE).
    if (isSuperLikeMode.value && Math.abs(translateX.value) < SUPERLIKE_ESCAPE_X) {
      return 0;
    }
    return translateX.value;
  });
  const overlayTranslateY = useDerivedValue(() => {
    // Only show SUPER LIKE overlay while in SUPER LIKE mode and not escaped.
    if (isSuperLikeMode.value && Math.abs(translateX.value) < SUPERLIKE_ESCAPE_X) {
      return translateY.value;
    }
    return 0;
  });

  const scale = useDerivedValue(() => {
    const currentActive = Math.floor(activeIndex.value);
    const indexDiff = index - currentActive;
    // back cards smaller
    return 1 - 0.04 * Math.min(Math.max(indexDiff, 0), prerenderItems - 1);
  });

  const rCardStyle = useAnimatedStyle(() => {
    const currentActive = Math.floor(activeIndex.value);
    const indexDiff = index - currentActive;

    const shouldRender =
      index < currentActive + prerenderItems && index >= currentActive - 1;

    // slight vertical offset for stack effect
    const stackOffsetY =
      indexDiff > 0 ? Math.min(indexDiff, prerenderItems - 1) * 10 : 0;

    return {
      opacity: shouldRender && indexDiff < prerenderItems ? 1 : 0,
      position: 'absolute',
      // zIndex: 100 - Math.abs(indexDiff),
      transform: [
        { rotate: `${rotateX.value}rad` },
        { scale: scale.value },
        { translateX: translateX.value },
        { translateY: translateY.value + stackOffsetY },
      ],
    };
  });

  const tap = Gesture.Tap().onEnd((_event, success) => {
    if (success && onPress) {
      scheduleOnRN(onPress);
    }
  });

  const pan = Gesture.Pan()
    .onBegin(() => {
      const currentActive = Math.floor(activeIndex.value);
      if (currentActive !== index) return;
      if (isTouchSwipeDisabled) return;
      if (sharedTranslateX) sharedTranslateX.value = 0;
      if (sharedTranslateY) sharedTranslateY.value = 0;
      if (onSwipeStart) scheduleOnRN(onSwipeStart);
    })
    .onUpdate((event) => {
      const currentActive = Math.floor(activeIndex.value);
      if (currentActive !== index) return;
      if (isTouchSwipeDisabled) return;

      translateX.value = event.translationX;
      translateY.value = event.translationY;
      if (sharedTranslateX) sharedTranslateX.value = translateX.value;
      if (sharedTranslateY) sharedTranslateY.value = translateY.value;

      // Gesture owns the state: on every frame update, notify parent (JS)
      // so buttons can subscribe to swipe progress/direction.
      if (onSwipeActive) {
        scheduleOnRN(onSwipeActive, event.translationX, SWIPE_THRESHOLD_X);
      }
    })
    .onFinalize((event) => {
      const currentActive = Math.floor(activeIndex.value);
      if (currentActive !== index) return;
      if (isTouchSwipeDisabled) {
        translateX.value = 0;
        translateY.value = 0;
        if (sharedTranslateX) sharedTranslateX.value = 0;
        if (sharedTranslateY) sharedTranslateY.value = 0;
        return;
      }
      if (onSwipeEnd) scheduleOnRN(onSwipeEnd);

      const { translationX, translationY } = event;

      // SUPER LIKE (Swipe Up) lock-zone priority:
      // If user crosses vertical threshold, commit SUPER LIKE unless they "escape" with a larger horizontal tilt.
      if (translationY < -SWIPE_THRESHOLD_Y && Math.abs(translationX) < SUPERLIKE_ESCAPE_X) {
        // user is still in SUPER LIKE lock zone
        if (disableTopSwipe) {
          // DENIED: do not commit, do not remove card, reset immediately, then navigate
          cancelAnimation(translateX);
          cancelAnimation(translateY);
          translateX.value = 0;
          translateY.value = 0;
          if (sharedTranslateX) sharedTranslateX.value = 0;
          if (sharedTranslateY) sharedTranslateY.value = 0;
          if (onSwipeTopDenied) scheduleOnRN(onSwipeTopDenied);
          return;
        }
        if (sharedTranslateX) sharedTranslateX.value = 0;
        if (sharedTranslateY) sharedTranslateY.value = 0;
        scheduleOnRN(swipeTop);
        return;
      }
      // escaped: allow LIKE/NOPE checks below (using existing thresholds)

      if (translationX > SWIPE_THRESHOLD_X) {
        if (disableRightSwipe) {
          // DENIED: do not commit, do not remove card, reset immediately, then navigate
          cancelAnimation(translateX);
          cancelAnimation(translateY);
          translateX.value = 0;
          translateY.value = 0;
          if (sharedTranslateX) sharedTranslateX.value = 0;
          if (sharedTranslateY) sharedTranslateY.value = 0;
          if (onSwipeRightDenied) scheduleOnRN(onSwipeRightDenied);
          return;
        }
        // Hard reset button indicators immediately on commit
        if (sharedTranslateX) sharedTranslateX.value = 0;
        if (sharedTranslateY) sharedTranslateY.value = 0;
        scheduleOnRN(swipeRight);
        return;
      }
      if (translationX < -SWIPE_THRESHOLD_X && !disableLeftSwipe) {
        // Hard reset button indicators immediately on commit
        if (sharedTranslateX) sharedTranslateX.value = 0;
        if (sharedTranslateY) sharedTranslateY.value = 0;
        scheduleOnRN(swipeLeft);
        return;
      }

      if (direction === 'y' || direction === 'both') {
        if (translationY < -SWIPE_THRESHOLD_Y) {
          if (disableTopSwipe) {
            cancelAnimation(translateX);
            cancelAnimation(translateY);
            translateX.value = 0;
            translateY.value = 0;
            if (sharedTranslateX) sharedTranslateX.value = 0;
            if (sharedTranslateY) sharedTranslateY.value = 0;
            if (onSwipeTopDenied) scheduleOnRN(onSwipeTopDenied);
            return;
          }
          scheduleOnRN(swipeTop);
          return;
        }
        if (translationY > SWIPE_THRESHOLD_Y && !disableBottomSwipe) {
          scheduleOnRN(swipeBottom);
          return;
        }
      }

      // snap back (cancelled swipe) — hard reset button indicators immediately
      if (sharedTranslateX) sharedTranslateX.value = 0;
      if (sharedTranslateY) sharedTranslateY.value = 0;
      translateX.value = withSpring(
        0,
        {
        ...swipeBackXSpringConfig,
        reduceMotion: ReduceMotion.Never,
        },
        // No delayed reset — already done above.
      );
      translateY.value = withSpring(
        0,
        {
        ...swipeBackYSpringConfig,
        reduceMotion: ReduceMotion.Never,
        },
        // No delayed reset — already done above.
      );
    });

  const composed = isTouchSwipeDisabled ? tap : Gesture.Race(tap, pan);

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[rCardStyle, cardStyle]}>
        {OverlayLabelLeft && (
          <OverlayLabel
            overlayLabelContainerStyle={overlayLabelContainerStyle}
            inputRange={inputOverlayLabelLeftOpacityRange}
            outputRange={outputOverlayLabelLeftOpacityRange}
            Component={OverlayLabelLeft}
            opacityValue={overlayTranslateX}
          />
        )}
        {OverlayLabelRight && (
          <OverlayLabel
            overlayLabelContainerStyle={overlayLabelContainerStyle}
            inputRange={inputOverlayLabelRightOpacityRange}
            outputRange={outputOverlayLabelRightOpacityRange}
            Component={OverlayLabelRight}
            opacityValue={overlayTranslateX}
          />
        )}
        {OverlayLabelTop && (
          <OverlayLabel
            overlayLabelContainerStyle={overlayLabelContainerStyle}
            inputRange={inputOverlayLabelTopOpacityRange}
            outputRange={outputOverlayLabelTopOpacityRange}
            Component={OverlayLabelTop}
            opacityValue={overlayTranslateY}
          />
        )}
        {OverlayLabelBottom && (
          <OverlayLabel
            overlayLabelContainerStyle={overlayLabelContainerStyle}
            inputRange={inputOverlayLabelBottomOpacityRange}
            outputRange={outputOverlayLabelBottomOpacityRange}
            Component={OverlayLabelBottom}
            opacityValue={translateY}
          />
        )}

        <Animated.View
          style={[StyleSheet.flatten([regularCardStyle, cardStyle])]}
        >
          {children}
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
});

export default memo(SwipeableCard) as typeof SwipeableCard;

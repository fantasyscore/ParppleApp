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
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import type { SwiperCardOptions, SwiperCardRefType } from 'rn-swiper-list';
import { scheduleOnRN, scheduleOnUI } from 'react-native-worklets';

import OverlayLabel from './OverlayLabel';

const SwipeableCard = forwardRef(function SwipeableCard<T>(
  props: PropsWithChildren<SwiperCardOptions<T>>,
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
  } = props;

  const { width, height } = useWindowDimensions();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const maxCardTranslation = width * 1.5;
  const maxCardTranslationY = height * 1.5;

  const SWIPE_THRESHOLD_X = width * 0.18;
  const SWIPE_THRESHOLD_Y = height * 0.1;

  const swipeRight = useCallback(() => {
    onSwipeRight?.(index);
    scheduleOnUI(() => {
      'worklet';
      translateX.value = withSpring(maxCardTranslation, {
        ...swipeRightSpringConfig,
        reduceMotion: ReduceMotion.Never,
      });
      activeIndex.value = activeIndex.value + 1;
    });
  }, [
    index,
    onSwipeRight,
    translateX,
    maxCardTranslation,
    swipeRightSpringConfig,
    activeIndex,
  ]);

  const swipeLeft = useCallback(() => {
    onSwipeLeft?.(index);
    scheduleOnUI(() => {
      'worklet';
      translateX.value = withSpring(-maxCardTranslation, {
        ...swipeLeftSpringConfig,
        reduceMotion: ReduceMotion.Never,
      });
      activeIndex.value = activeIndex.value + 1;
    });
  }, [
    index,
    onSwipeLeft,
    translateX,
    maxCardTranslation,
    swipeLeftSpringConfig,
    activeIndex,
  ]);

  const swipeTop = useCallback(() => {
    onSwipeTop?.(index);
    scheduleOnUI(() => {
      'worklet';
      translateY.value = withSpring(-maxCardTranslationY, {
        ...swipeTopSpringConfig,
        reduceMotion: ReduceMotion.Never,
      });
      activeIndex.value = activeIndex.value + 1;
    });
  }, [
    index,
    onSwipeTop,
    translateY,
    maxCardTranslationY,
    swipeTopSpringConfig,
    activeIndex,
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
      if (onSwipeStart) scheduleOnRN(onSwipeStart);
    })
    .onUpdate((event) => {
      const currentActive = Math.floor(activeIndex.value);
      if (currentActive !== index) return;

      translateX.value = event.translationX;
      translateY.value = event.translationY;

      if (onSwipeActive) {
        const vx = Math.abs(event.velocityX);
        const vy = Math.abs(event.velocityY);
        const vThreshold = swipeVelocityThreshold ?? 300;
        if (vx > vThreshold || vy > vThreshold) {
          scheduleOnRN(onSwipeActive);
        }
      }
    })
    .onFinalize((event) => {
      const currentActive = Math.floor(activeIndex.value);
      if (currentActive !== index) return;
      if (onSwipeEnd) scheduleOnRN(onSwipeEnd);

      const { translationX, translationY } = event;

      if (translationX > SWIPE_THRESHOLD_X && !disableRightSwipe) {
        scheduleOnRN(swipeRight);
        return;
      }
      if (translationX < -SWIPE_THRESHOLD_X && !disableLeftSwipe) {
        scheduleOnRN(swipeLeft);
        return;
      }

      if (direction === 'y' || direction === 'both') {
        if (translationY < -SWIPE_THRESHOLD_Y && !disableTopSwipe) {
          scheduleOnRN(swipeTop);
          return;
        }
        if (translationY > SWIPE_THRESHOLD_Y && !disableBottomSwipe) {
          scheduleOnRN(swipeBottom);
          return;
        }
      }

      // snap back
      translateX.value = withSpring(0, {
        ...swipeBackXSpringConfig,
        reduceMotion: ReduceMotion.Never,
      });
      translateY.value = withSpring(0, {
        ...swipeBackYSpringConfig,
        reduceMotion: ReduceMotion.Never,
      });
    });

  const composed = Gesture.Race(tap, pan);

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[rCardStyle, cardStyle]}>
        {OverlayLabelLeft && (
          <OverlayLabel
            overlayLabelContainerStyle={overlayLabelContainerStyle}
            inputRange={inputOverlayLabelLeftOpacityRange}
            outputRange={outputOverlayLabelLeftOpacityRange}
            Component={OverlayLabelLeft}
            opacityValue={translateX}
          />
        )}
        {OverlayLabelRight && (
          <OverlayLabel
            overlayLabelContainerStyle={overlayLabelContainerStyle}
            inputRange={inputOverlayLabelRightOpacityRange}
            outputRange={outputOverlayLabelRightOpacityRange}
            Component={OverlayLabelRight}
            opacityValue={translateX}
          />
        )}
        {OverlayLabelTop && (
          <OverlayLabel
            overlayLabelContainerStyle={overlayLabelContainerStyle}
            inputRange={inputOverlayLabelTopOpacityRange}
            outputRange={outputOverlayLabelTopOpacityRange}
            Component={OverlayLabelTop}
            opacityValue={translateY}
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

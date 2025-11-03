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
  withTiming,
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
    item,
    activeIndex,
    prerenderItems = 5,
    onSwipeLeft,
    onSwipeRight,
    onSwipeTop,
    cardStyle,
    regularCardStyle,
    children,
    disableRightSwipe,
    disableLeftSwipe,
    disableTopSwipe,
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
    OverlayLabelRight,
    OverlayLabelLeft,
    OverlayLabelTop,
    onSwipeStart,
    onSwipeActive,
    onSwipeEnd,
    swipeBackXSpringConfig,
    swipeBackYSpringConfig,
    swipeRightSpringConfig,
    swipeLeftSpringConfig,
    swipeTopSpringConfig,
    onPress,
    direction = 'y',
    overlayLabelContainerStyle,
  } = props;

  const { width, height } = useWindowDimensions();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const nextActiveIndex = useSharedValue(0);

  const maxCardTranslation = width * 1.5;
  const maxCardTranslationY = height * 1.5;

  // Swipe thresholds
  const SWIPE_THRESHOLD_X = width * 0.18;
  const SWIPE_THRESHOLD_Y = height * 0.10;

  const swipeRight = useCallback(() => {
    onSwipeRight?.(index);
    scheduleOnUI(() => {
      translateX.value = withSpring(maxCardTranslation, {
        ...swipeRightSpringConfig,
        reduceMotion: ReduceMotion.Never,
      });
      activeIndex.value++;
    });
  }, [index, activeIndex, maxCardTranslation, onSwipeRight, translateX, swipeRightSpringConfig]);

  const swipeLeft = useCallback(() => {
    onSwipeLeft?.(index);
    scheduleOnUI(() => {
      translateX.value = withSpring(-maxCardTranslation, {
        ...swipeLeftSpringConfig,
        reduceMotion: ReduceMotion.Never,
      });
      activeIndex.value++;
    });
  }, [index, activeIndex, maxCardTranslation, onSwipeLeft, translateX, swipeLeftSpringConfig]);

  const swipeTop = useCallback(() => {
    onSwipeTop?.(index);
    scheduleOnUI(() => {
      translateY.value = withSpring(-maxCardTranslationY, {
        ...swipeTopSpringConfig,
        reduceMotion: ReduceMotion.Never,
      });
      activeIndex.value++;
    });
  }, [index, activeIndex, maxCardTranslationY, onSwipeTop, translateY, swipeTopSpringConfig]);

  const swipeBack = useCallback(() => {
    scheduleOnUI(() => {
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
    }),
    [swipeLeft, swipeRight, swipeBack, swipeTop]
  );

  const inputRangeX = translateXRange ?? [];
  const inputRangeY = translateYRange ?? [];

  const rotateX = useDerivedValue(() =>
    interpolate(
      translateX.value,
      rotateInputRange ?? [],
      rotateOutputRange ?? [],
      'clamp'
    )
  );

  const tap = Gesture.Tap().onEnd((_event, success) => {
    if (success && onPress) scheduleOnRN(onPress);
  });

  const pan = Gesture.Pan()
    .onBegin(() => {
      nextActiveIndex.value = Math.floor(activeIndex.value);
      if (onSwipeStart) scheduleOnRN(onSwipeStart);
    })
    .onUpdate((event) => {
      const currentActive = Math.floor(activeIndex.value);
      if (currentActive !== index) return;
      if (onSwipeActive) scheduleOnRN(onSwipeActive);

      translateX.value = event.translationX;
      translateY.value = event.translationY;

      if (Math.abs(event.translationY) > height / 11) {
        nextActiveIndex.value = interpolate(
          translateY.value,
          inputRangeY,
          [currentActive + 1, currentActive, currentActive + 1],
          'clamp'
        );
      } else {
        nextActiveIndex.value = interpolate(
          translateX.value,
          inputRangeX,
          [currentActive + 1, currentActive, currentActive + 1],
          'clamp'
        );
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
      if (translationY < -SWIPE_THRESHOLD_Y && !disableTopSwipe) {
        scheduleOnRN(swipeTop);
        return;
      }

      translateX.value = withSpring(0, swipeBackXSpringConfig);
      translateY.value = withSpring(0, swipeBackYSpringConfig);
    });

  const rCardStyle = useAnimatedStyle(() => {
    const currentActive = Math.floor(activeIndex.value);
    const shouldRender =
      index < currentActive + prerenderItems && index >= currentActive - 1;
    const indexDiff = index - currentActive;

    return {
      opacity: withTiming(
        shouldRender && indexDiff < prerenderItems ? 1 : 0,
        { reduceMotion: ReduceMotion.Never }
      ),
      position: 'absolute',
      zIndex: -index,
      transform: [
        { rotate: `${rotateX.value}rad` },
        {
          scale: withTiming(1 - 0.07 * indexDiff, {
            reduceMotion: ReduceMotion.Never,
          }),
        },
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
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

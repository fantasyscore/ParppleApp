import React, { useImperativeHandle, type ForwardedRef } from 'react';
import { useAnimatedReaction } from 'react-native-reanimated';
import { Dimensions, View } from 'react-native';
import type {
  SwiperCardRefType,
  SwiperOptions,
  SwiperCardOptions,
} from 'rn-swiper-list';
import { scheduleOnRN } from 'react-native-worklets';

import useSwipeControls from './hooks/useSwipeControls';
import SwiperCard from './SwipeableCard';
import type { SpringConfig } from 'react-native-reanimated/lib/typescript/animation/spring';
import metrics from '../assets/Metrics';

const { width: windowWidth, height: windowHeight } = Dimensions.get('screen');

const SWIPE_SPRING_CONFIG: SpringConfig = {
  damping: 6,
  stiffness: 60,
  mass: 0.1,
  overshootClamping: false,
};

const Swiper = <T,>(
  {
    data,
    renderCard,
    prerenderItems = Math.max(data.length - 1, 1),
    onSwipeRight,
    onSwipeLeft,
    onSwipedAll,
    onSwipeTop,
    onSwipeBottom,
    onIndexChange,
    cardStyle,
    regularCardStyle,
    disableRightSwipe,
    disableLeftSwipe,
    disableTopSwipe,
    disableBottomSwipe,
    translateXRange = [-windowWidth / 4, 0, windowWidth / 4],
    translateYRange = [-windowHeight / 11, 0, windowHeight / 11],
    rotateInputRange = [-windowWidth / 3, 0, windowWidth / 3],
    rotateOutputRange = [-Math.PI / 20, 0, Math.PI / 20],
    inputOverlayLabelRightOpacityRange = [windowWidth / 7, windowWidth / 3],
    outputOverlayLabelRightOpacityRange = [0, 3],
    inputOverlayLabelLeftOpacityRange = [-windowWidth / 7, -(windowWidth / 3)],
    outputOverlayLabelLeftOpacityRange = [0, 3],
    inputOverlayLabelTopOpacityRange = [0, -(windowHeight / 3)],
    outputOverlayLabelTopOpacityRange = [0, 1],
    inputOverlayLabelBottomOpacityRange = [0, windowHeight / 3],
    outputOverlayLabelBottomOpacityRange = [0, 1],
    OverlayLabelRight,
    OverlayLabelLeft,
    OverlayLabelTop,
    OverlayLabelBottom,
    onSwipeStart,
    onSwipeActive,
    onSwipeEnd,
    swipeBackXSpringConfig = SWIPE_SPRING_CONFIG,
    swipeBackYSpringConfig = SWIPE_SPRING_CONFIG,
    swipeRightSpringConfig = SWIPE_SPRING_CONFIG,
    swipeLeftSpringConfig = SWIPE_SPRING_CONFIG,
    swipeTopSpringConfig = SWIPE_SPRING_CONFIG,
    swipeBottomSpringConfig = SWIPE_SPRING_CONFIG,
    loop = false,
    keyExtractor,
    onPress,
    swipeVelocityThreshold,
    direction = 'y',
    overlayLabelContainerStyle,
    initialIndex = 0,
  }: SwiperOptions<T>,
  ref: ForwardedRef<SwiperCardRefType>
) => {
  const clampedInitialIndex = Math.max(
    0,
    Math.min(initialIndex, data.length - 1)
  );
  const adjustedPrerenderItems = Math.min(
    prerenderItems,
    Math.max(data.length - clampedInitialIndex - 1, 1)
  );

  const {
    activeIndex,
    refs,
    swipeRight,
    swipeLeft,
    swipeBack,
    swipeTop,
    swipeBottom,
  } = useSwipeControls(data, loop, clampedInitialIndex);

  useImperativeHandle(ref, () => {
    return {
      swipeLeft,
      swipeRight,
      swipeBack,
      swipeTop,
      swipeBottom,
    };
  }, [swipeLeft, swipeRight, swipeBack, swipeTop, swipeBottom]);

  useAnimatedReaction(
    () => {
      return activeIndex.value >= data.length;
    },
    (isSwipingFinished: boolean) => {
      if (isSwipingFinished && onSwipedAll) {
        scheduleOnRN(onSwipedAll);
      }
    },
    [data]
  );

  useAnimatedReaction(
    () => activeIndex.value,
    (currentValue, previousValue) => {
      if (currentValue !== previousValue && onIndexChange) {
        scheduleOnRN(onIndexChange, currentValue);
      }
    },
    []
  );

  const Card = SwiperCard as unknown as React.ComponentType<
    React.PropsWithChildren<SwiperCardOptions<T>> & {
      ref?: React.Ref<SwiperCardRefType>;
    }
  >;

  return data
    .slice(clampedInitialIndex)
    .map((item, index) => {
      const actualIndex = index + clampedInitialIndex;
      return (
        <Card
          key={keyExtractor ? keyExtractor(item, actualIndex) : actualIndex}
          cardStyle={cardStyle}
          regularCardStyle={regularCardStyle}
          index={actualIndex}
          prerenderItems={adjustedPrerenderItems}
          disableRightSwipe={disableRightSwipe}
          disableLeftSwipe={disableLeftSwipe}
          disableTopSwipe={disableTopSwipe}
          disableBottomSwipe={disableBottomSwipe}
          translateXRange={translateXRange}
          translateYRange={translateYRange}
          rotateOutputRange={rotateOutputRange}
          rotateInputRange={rotateInputRange}
          inputOverlayLabelRightOpacityRange={
            inputOverlayLabelRightOpacityRange
          }
          outputOverlayLabelRightOpacityRange={
            outputOverlayLabelRightOpacityRange
          }
          inputOverlayLabelLeftOpacityRange={inputOverlayLabelLeftOpacityRange}
          outputOverlayLabelLeftOpacityRange={
            outputOverlayLabelLeftOpacityRange
          }
          inputOverlayLabelTopOpacityRange={inputOverlayLabelTopOpacityRange}
          outputOverlayLabelTopOpacityRange={outputOverlayLabelTopOpacityRange}
          inputOverlayLabelBottomOpacityRange={
            inputOverlayLabelBottomOpacityRange
          }
          outputOverlayLabelBottomOpacityRange={
            outputOverlayLabelBottomOpacityRange
          }
          activeIndex={activeIndex}
          OverlayLabelRight={OverlayLabelRight}
          OverlayLabelLeft={OverlayLabelLeft}
          OverlayLabelTop={OverlayLabelTop}
          OverlayLabelBottom={OverlayLabelBottom}
          ref={refs[actualIndex]}
          onSwipeRight={(cardIndex: number) => onSwipeRight?.(cardIndex)}
          onSwipeLeft={(cardIndex: number) => onSwipeLeft?.(cardIndex)}
          onSwipeTop={(cardIndex: number) => onSwipeTop?.(cardIndex)}
          onSwipeBottom={(cardIndex: number) => onSwipeBottom?.(cardIndex)}
          onSwipeStart={onSwipeStart}
          onSwipeActive={onSwipeActive}
          onSwipeEnd={onSwipeEnd}
          swipeBackXSpringConfig={swipeBackXSpringConfig}
          swipeBackYSpringConfig={swipeBackYSpringConfig}
          swipeRightSpringConfig={swipeRightSpringConfig}
          swipeLeftSpringConfig={swipeLeftSpringConfig}
          swipeTopSpringConfig={swipeTopSpringConfig}
          swipeBottomSpringConfig={swipeBottomSpringConfig}
          onPress={onPress}
          swipeVelocityThreshold={swipeVelocityThreshold}
          item={item}
          direction={direction}
          overlayLabelContainerStyle={overlayLabelContainerStyle}
        >
          {renderCard(item, actualIndex)}
        </Card>
      );
    })
    .reverse();
};

export default React.forwardRef(Swiper);

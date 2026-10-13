import React, { useEffect, useRef, memo } from 'react';
import { Animated, StyleProp, StyleSheet, ViewStyle } from 'react-native';

type Props = {
  size: number;
  /** Ring color */
  color?: string;
  /** Optional fill inside each ring */
  fillColor?: string;
  ringWidth?: number;
  /** Extra layout for both rings (e.g. an offset) */
  style?: StyleProp<ViewStyle>;
};

const PulsingCircle = ({ size, color = "#6F13F225", fillColor, ringWidth = 1, style }: Props) => {
  const anim = useRef(new Animated.Value(0)).current;
  const animTwo = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const pulse = (animation: Animated.Value) => {
      animation.setValue(0);
      Animated.timing(animation, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      }).start(() => {
        if (!isMounted) return;
        pulse(animation);
      });
    };

    pulse(anim);

    timeoutId = setTimeout(() => {
      if (!isMounted) return;
      pulse(animTwo);
    }, 1500);

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      anim.stopAnimation();
      animTwo.stopAnimation();
    };
  }, [anim, animTwo]);

  const getAnimatedStyle = (animation: Animated.Value) => ({
    transform: [
      {
        scale: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 3],
        }),
      },
    ],
    opacity: animation.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    }),
  });

  return (
    <>
      <Animated.View
        style={[
          styles.pulse,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: color,
            borderWidth: ringWidth,
            backgroundColor: fillColor,
          },
          style,
          getAnimatedStyle(anim),
        ]}
      />
      <Animated.View
        style={[
          styles.pulse,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: color,
            borderWidth: ringWidth,
            backgroundColor: fillColor,
          },
          style,
          getAnimatedStyle(animTwo),
        ]}
      />
    </>
  );
};

export default memo(PulsingCircle);

const styles = StyleSheet.create({
  pulse: {
    position: 'absolute',
  },
});
import React, { useEffect, useRef, memo } from 'react';
import { Animated, StyleSheet } from 'react-native';

type Props = {
  size: number;
  color?: string;
};

const PulsingCircle = ({ size, color = "#6F13F225" }: Props) => {
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
  }, []);

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
          },
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
          },
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
    borderWidth: 1,
  },
});
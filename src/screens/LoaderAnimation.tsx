import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

const SpinnerLoader = () => {
  const numDots = 12;
  const animations = useRef([...Array(numDots)].map(() => new Animated.Value(1))).current;

  useEffect(() => {
    const createFadeAnimation = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 0,
            duration: 600,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 1,
            duration: 600,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const all = animations.map((a, i) => createFadeAnimation(a, i * 100));
    all.forEach((a) => a.start());
  }, [animations]);

  return (
    <View style={styles.container}>
      <View style={styles.spinner}>
        {animations.map((opacity, i) => {
          const rotate = `${i * 30}deg`; // 360/12 = 30 degrees
          return (
            <Animated.View
              key={i}
              style={[
                styles.bar,
                {
                  transform: [{ rotate }, { translateY: -30 }],
                  opacity,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

export default SpinnerLoader;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  spinner: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  bar: {
    position: "absolute",
    width: 6,
    height: 18,
    borderRadius: 3,
    backgroundColor: "#7F3DFF", // currentColor equivalent
  },
});

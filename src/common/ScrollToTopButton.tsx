import React from "react";
import { Animated, StyleSheet } from "react-native";
import FastImage from "react-native-fast-image";
import metrics from "../assets/Metrics";
import { TouchableOpacityView } from "../common/TouchableOpacityView";
import { scrollatthetopIcon } from "../helper/ImageAssets";

interface ScrollToTopButtonProps {
  visible: boolean;
  /** 0 -> 1 progress driving the fade/slide-in */
  anim: Animated.Value;
  onPress: () => void;
}

const ScrollToTopButton = ({ visible, anim, onPress }: ScrollToTopButtonProps) => {
  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }],
        },
      ]}
    >
      <TouchableOpacityView activeOpacity={1} onPress={onPress} style={styles.button}>
        <FastImage source={scrollatthetopIcon} resizeMode="contain" style={styles.icon} />
      </TouchableOpacityView>
    </Animated.View>
  );
};

export default ScrollToTopButton;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: metrics.hp12,
    right: metrics.hp2,
    zIndex: 999,
  },
  button: {
    height: metrics.hp8,
    width: metrics.hp8,
  },
  icon: {
    height: metrics.hp8,
    width: metrics.hp8,
  },
});

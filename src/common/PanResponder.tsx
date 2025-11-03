import { useRef } from "react";
import { Animated, Dimensions, PanResponder } from "react-native";
import { colors } from "../theme/colors";
import metrics from "../assets/Metrics";
const { width, height } = Dimensions.get("window");
const position: any = useRef(new Animated.ValueXY()).current;
const animationValue = useRef(new Animated.Value(0)).current;

export const panResponder = (position: any, isAnimating: any, prevPhoto: any, nextPhoto: any, swipeCard: any) => useRef(
    PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
            position.setOffset({ x: position.x._value || 0, y: position.y._value || 0 });
            position.setValue({ x: 0, y: 0 });
        },
        onPanResponderMove: Animated.event([null, { dx: position.x, dy: position.y }], { useNativeDriver: false }),
        onPanResponderRelease: (_, gesture) => {
            position.flattenOffset();
            if (isAnimating) return;

            const tapThreshold = 5;
            const swipeThreshold = 120;

            if (Math.abs(gesture.dx) < tapThreshold && Math.abs(gesture.dy) < tapThreshold) {
                // treat as tap
                if (gesture.x0 < width / 2) prevPhoto();
                else nextPhoto();
                Animated.spring(position, { toValue: { x: 0, y: 0 }, friction: 8, useNativeDriver: false }).start();
                return;
            }
            if (gesture.dx > swipeThreshold) {
                swipeCard("right");
            } else if (gesture.dx < -swipeThreshold) {
                swipeCard("left");
            } else {
                Animated.spring(position, { toValue: { x: 0, y: 0 }, friction: 8, useNativeDriver: false }).start();
            }
        },
        onPanResponderTerminate: () => {
            Animated.spring(position, { toValue: { x: 0, y: 0 }, friction: 8, useNativeDriver: false }).start();
        },
    })
).current;

export const yesOpacity = position.x.interpolate({
    inputRange: [0, width / 4, width / 2],
    outputRange: [0, 0.5, 1],
    extrapolate: "clamp",
});
export const yesTranslate = position.x.interpolate({
    inputRange: [0, width / 2],
    outputRange: [-50, 0],
    extrapolate: "clamp",
});
export const yesColor = position.x.interpolate({
    inputRange: [0, width / 2],
    outputRange: [colors.white, colors.singleButtonGreen],
    extrapolate: 'clamp',
});
export const yesImage = position.x.interpolate({
    inputRange: [0, width / 2],
    outputRange: [colors.singleButtonGreen, colors.white],
    extrapolate: 'clamp',
});
export const nopeOpacity = position.x.interpolate({
    inputRange: [-width / 2, -width / 4, 0],
    outputRange: [1, 0.5, 0],
    extrapolate: "clamp",
});
export const nopeColor = position.x.interpolate({
    inputRange: [-width / 2, 0],
    outputRange: [colors.purple, colors.white],
    extrapolate: "clamp",
});
export const nopeColorImage = position.x.interpolate({
    inputRange: [-width / 2, 0],
    outputRange: [colors.white, colors.purple],
    extrapolate: "clamp",
});
export const nopeTranslate = position.x.interpolate({
    inputRange: [-width / 2, 0],
    outputRange: [0, 50],
    extrapolate: "clamp",
});
export const topTextOpacityon = animationValue.interpolate({
    inputRange: [0.5, 1],
    outputRange: [1, 0],
    extrapolate: "clamp",
});
export const bottomDetailsOpacity = animationValue.interpolate({
    inputRange: [0, 0.5],
    outputRange: [1, 0],
    extrapolate: "clamp",
});
export const bottomPosition = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [metrics.hp3_5, metrics.hp2],
    extrapolate: "clamp",
});
export const arrowRotation = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
});
export const topTextOpacity = animationValue.interpolate({
    inputRange: [0.5, 1],
    outputRange: [0, 1],
    extrapolate: "clamp",
});

export const topTextOpacityRevers = animationValue.interpolate({
    inputRange: [0.5, 1],
    outputRange: [1, 0], // 👈 reversed values
    extrapolate: "clamp",
});
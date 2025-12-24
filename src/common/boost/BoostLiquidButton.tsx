import React, { useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  LinearGradient,
  Mask,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import Animated, {
  Easing,
  useAnimatedStyle,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import FastImage from "react-native-fast-image";

import metrics from "../../assets/Metrics";
import { colors } from "../../theme/colors";
import { fontSize, INTER_BOLD } from "../AppText";
import { interBold } from "../../theme/typography";

type Props = {
  /** Button diameter */
  size: number;
  /** 1 => full, 0 => empty */
  remainingFraction: number;
  /** centered text (e.g. 29:45) */
  timerText: string;
  /** icon shown when not running */
  iconSource: any;
  /** if false, we show icon even when running (as watermark) */
  showIconWhileRunning?: boolean;
  /** running state */
  isRunning: boolean;
  /** liquid gradient colors (top -> bottom) */
  gradientColors?: [string, string];
};

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedSvgText = Animated.createAnimatedComponent(SvgText);

function clamp01(v: number) {
  "worklet";
  return Math.max(0, Math.min(1, v));
}

export const BoostLiquidButton: React.FC<Props> = ({
  size,
  remainingFraction,
  timerText,
  iconSource,
  showIconWhileRunning = false,
  isRunning,
  gradientColors = ["#6F13F2", "#400B8C"],
}) => {
  // Smoothly animate level to avoid "steppy" per-second updates
  const level = useSharedValue(clamp01(remainingFraction));
  // Horizontal wave motion phase
  const phase = useSharedValue(0);

  useEffect(() => {
    level.value = withTiming(clamp01(remainingFraction), {
      duration: 450,
      easing: Easing.linear,
    });
  }, [level, remainingFraction]);

  useEffect(() => {
    // Subtle left-right wave motion (premium feel)
    phase.value = 0;
    phase.value = withRepeat(
      withTiming(2 * Math.PI, { duration: 1800, easing: Easing.linear }),
      -1,
      false
    );
  }, [phase]);

  const animatedProps = useAnimatedProps(() => {
    "worklet";
    const f = clamp01(level.value);
    const w = size;
    const h = size;

    // Drain top -> bottom: at start f=1 => topY ~ 0 ; end f=0 => topY ~ h
    const topY = h - h * f;

    // Subtle wave settings (scaled)
    const amp = Math.max(1.5, h * 0.045);
    const wavelength = Math.max(40, w * 0.9);
    const steps = 28; // more steps => smoother edge

    let d = "";
    for (let i = 0; i <= steps; i++) {
      const x = (w * i) / steps;
      const y =
        topY +
        Math.sin((2 * Math.PI * x) / wavelength + phase.value) * amp;
      if (i === 0) d += `M ${x} ${y}`;
      else d += ` L ${x} ${y}`;
    }

    // Close shape down to bottom
    d += ` L ${w} ${h}`;
    d += ` L 0 ${h} Z`;

    return { d };
  }, [size]);

  const r = size / 2;
  // Avoid id collisions if multiple instances are on screen
  const clipId = useMemo(() => `boostLiquidClip-${Math.random().toString(36).slice(2)}`, []);
  const gradId = useMemo(() => `boostLiquidGrad-${Math.random().toString(36).slice(2)}`, []);
  const textGradId = useMemo(() => `boostTextGrad-${Math.random().toString(36).slice(2)}`, []);
  const liquidMaskId = useMemo(() => `boostTextLiquidMask-${Math.random().toString(36).slice(2)}`, []);
  const airMaskId = useMemo(() => `boostTextAirMask-${Math.random().toString(36).slice(2)}`, []);

  // Typography (match AppText ELEVEN + INTER_BOLD)
  const textSize = fontSize(11);
  const textBoxH = textSize * 1.25;
  const textTopY = r - textBoxH / 2;
  const textBottomY = r + textBoxH / 2;

  // Smooth crossfade based on intersection between liquid top and timer text bounding box
  const whiteTextAnimatedProps = useAnimatedProps(() => {
    "worklet";
    const f = clamp01(level.value);
    const h = size;
    const topY = h - h * f;
    const coverage = Math.max(0, Math.min(1, (textBottomY - topY) / textBoxH));
    return { opacity: coverage };
  }, [size, textBottomY, textBoxH]);

  const gradTextAnimatedProps = useAnimatedProps(() => {
    "worklet";
    const f = clamp01(level.value);
    const h = size;
    const topY = h - h * f;
    const coverage = Math.max(0, Math.min(1, (textBottomY - topY) / textBoxH));
    return { opacity: 1 - coverage };
  }, [size, textBottomY, textBoxH]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Liquid fill clipped inside circle */}
      {isRunning && (
        <Svg width={size} height={size + metrics.hp0_2} style={StyleSheet.absoluteFill}>
          <Defs>
            <ClipPath id={clipId}>
              <Circle cx={r} cy={r} r={r} />
            </ClipPath>
            <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={gradientColors[0]} />
              <Stop offset="1" stopColor={gradientColors[1]} />
            </LinearGradient>
            <LinearGradient id={textGradId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={gradientColors[0]} />
              <Stop offset="1" stopColor={gradientColors[1]} />
            </LinearGradient>

            {/* Text masks (liquid vs air) */}
            <Mask id={liquidMaskId}>
              <Rect x="0" y="0" width={size} height={size} fill="black" />
              <AnimatedPath animatedProps={animatedProps} fill="white" />
            </Mask>
            <Mask id={airMaskId}>
              <Rect x="0" y="0" width={size} height={size} fill="white" />
              <AnimatedPath animatedProps={animatedProps} fill="black" />
            </Mask>
          </Defs>

          <G clipPath={`url(#${clipId})`}>
            {/* Liquid body */}
            <AnimatedPath animatedProps={animatedProps} fill={`url(#${gradId})`} />

            {/* Timer text: white where it overlaps liquid */}
            <G mask={`url(#${liquidMaskId})`}>
              <AnimatedSvgText
                animatedProps={whiteTextAnimatedProps}
                x={r}
                y={r + textSize * 0.35}
                fill={colors.white}
                fontSize={textSize}
                fontFamily={interBold}
                textAnchor="middle"
              >
                {timerText}
              </AnimatedSvgText>
            </G>

            {/* Timer text: gradient where it's above liquid */}
            <G mask={`url(#${airMaskId})`}>
              <AnimatedSvgText
                animatedProps={gradTextAnimatedProps}
                x={r}
                y={r + textSize * 0.35}
                fill={`url(#${textGradId})`}
                fontSize={textSize}
                fontFamily={interBold}
                textAnchor="middle"
              >
                {timerText}
              </AnimatedSvgText>
            </G>
          </G>
        </Svg>
      )}

      {/* Optional icon */}
      {!isRunning ? (
        <FastImage source={iconSource} resizeMode="contain" style={styles.icon} />
      ) : showIconWhileRunning ? (
        <FastImage
          source={iconSource}
          resizeMode="contain"
          tintColor={colors.white}
          style={[styles.icon, { opacity: 0.15, }]}
        />
      ) : null}

      {/* Timer is rendered inside SVG above; keep RN layer clean to avoid flicker */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: metrics.hp50,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    height: metrics.hp3_5,
    width: metrics.hp3_5,
    tintColor: colors.purple,
  },
});



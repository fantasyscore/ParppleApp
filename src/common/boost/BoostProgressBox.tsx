import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, LayoutChangeEvent, StyleSheet, View } from "react-native";
import Svg, { Rect } from "react-native-svg";
import LinearGradient from "react-native-linear-gradient";
import FastImage from "react-native-fast-image";

import metrics from "../../assets/Metrics";
import { colors } from "../../theme/colors";
import { AppText, ELEVEN, FORTEEN, INTER_BOLD, INTER_MEDIUM, WHITE } from "../AppText";
import { flashIcon } from "../../helper/ImageAssets";

type Props = {
  /** 1.0 => full border, 0.0 => empty */
  remainingFraction: number;
  remainingLabel: string;
  title?: string;
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const AnimatedRect = Animated.createAnimatedComponent(Rect);

export const BoostProgressBox: React.FC<Props> = ({
  remainingFraction,
  remainingLabel,
  title = "Boost Active",
}) => {
  const [box, setBox] = useState({ w: 0, h: 0 });
  const fracAnim = useRef(new Animated.Value(clamp01(remainingFraction))).current;
  const badgePulse = useRef(new Animated.Value(0)).current;

  const r = metrics.hp1_5;
  const stroke = metrics.hp0_3;

  const perimeter = useMemo(() => {
    const w = Math.max(0, box.w - stroke);
    const h = Math.max(0, box.h - stroke);
    const cr = Math.max(0, r);
    // Perimeter of rounded rect: 2*(w+h-2r) + 2*pi*r
    return 2 * (w + h - 2 * cr) + 2 * Math.PI * cr;
  }, [box.h, box.w, r, stroke]);

  useEffect(() => {
    Animated.timing(fracAnim, {
      toValue: clamp01(remainingFraction),
      duration: 450,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [fracAnim, remainingFraction]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(badgePulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(badgePulse, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [badgePulse]);

  const dashOffsetAnim = useMemo(() => {
    if (!perimeter) return new Animated.Value(0);
    // remainingFraction: 1 => offset 0 (full), 0 => offset perimeter (empty)
    return fracAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [perimeter, 0],
    });
  }, [fracAnim, perimeter]);

  const badgeOpacity = badgePulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.65, 1],
  });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (!width || !height) return;
    setBox({ w: width, h: height });
  };

  return (
    <View onLayout={onLayout} style={styles.outer}>
      {/* Progress border */}
      {box.w > 0 && box.h > 0 && (
        <Svg width={box.w} height={box.h} style={StyleSheet.absoluteFill}>
          {/* Base border */}
          <Rect
            x={stroke / 2}
            y={stroke / 2}
            width={box.w - stroke}
            height={box.h - stroke}
            rx={r}
            ry={r}
            stroke={"#6F13F22A"}
            strokeWidth={stroke}
            fill="none"
          />
          {/* Progress border */}
          <AnimatedRect
            x={stroke / 2}
            y={stroke / 2}
            width={box.w - stroke}
            height={box.h - stroke}
            rx={r}
            ry={r}
            stroke={colors.purple}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={perimeter}
            strokeDashoffset={dashOffsetAnim as any}
          />
        </Svg>
      )}

      <LinearGradient
        colors={["#6F13F214", "#6F13F20A", "#6F13F214"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.inner}
      >
        <View style={styles.row}>
          <View style={styles.iconWrap}>
            <FastImage source={flashIcon} resizeMode="contain" style={styles.icon} />
          </View>

          <View style={{ flex: 1 }}>
            <AppText type={ELEVEN} weight={INTER_MEDIUM} color={colors.purple}>
              {title}
            </AppText>
            <AppText type={FORTEEN} weight={INTER_BOLD} color={colors.lightBlack}>
              {remainingLabel} left
            </AppText>
          </View>

          <Animated.View style={[styles.badge, { opacity: badgeOpacity }]}>
            <AppText type={ELEVEN} weight={INTER_BOLD} color={WHITE}>
              LIVE
            </AppText>
          </Animated.View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    borderRadius: metrics.hp1_5,
    backgroundColor: colors.white,
    overflow: "hidden",
  },
  inner: {
    paddingHorizontal: metrics.hp2,
    paddingVertical: metrics.hp1_5,
    borderRadius: metrics.hp1_5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    height: metrics.hp4_5,
    width: metrics.hp4_5,
    borderRadius: metrics.hp1_5,
    backgroundColor: "#6F13F21A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: metrics.hp1_5,
  },
  icon: {
    height: metrics.hp2_2,
    width: metrics.hp2_2,
    tintColor: colors.purple,
  },
  badge: {
    paddingHorizontal: metrics.hp1,
    paddingVertical: metrics.hp0_4,
    borderRadius: metrics.hp2,
    backgroundColor: colors.purple,
  },
});



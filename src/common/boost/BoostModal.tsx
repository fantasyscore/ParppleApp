import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Modal, StyleSheet, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";

import metrics from "../../assets/Metrics";
import { colors } from "../../theme/colors";
import { AppText, BLACK, ELEVEN, FORTEEN, INTER_BOLD, INTER_MEDIUM, TWENTY_TWO, WHITE } from "../AppText";
import { TouchableOpacityView } from "../TouchableOpacityView";
import { Screen } from "../../theme/dimens";

type Props = {
  visible: boolean;
  onClose: () => void;
  boostsAvailable: number;
  durationMinutes: number;
  isRunning: boolean;
  remainingFraction: number;
  remainingLabel: string;
  onStart: () => void;
  isActivating?: boolean;
};

export const BoostModal: React.FC<Props> = ({
  visible,
  onClose,
  boostsAvailable,
  durationMinutes,
  isRunning,
  remainingFraction,
  remainingLabel,
  onStart,
  isActivating = false,
}) => {
  const scale = useRef(new Animated.Value(0.96)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const livePulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    opacity.setValue(0);
    scale.setValue(0.96);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(livePulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(livePulse, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [livePulse, visible]);

  const subTitle = useMemo(() => {
    if (isRunning) return "Your profile is boosted right now";
    return "Get seen faster for a limited time";
  }, [isRunning]);

  return (
    <Modal
      visible={visible}
      transparent
      // Avoid Android "blink" by disabling native modal animation; we animate the sheet ourselves.
      animationType="fade"
      statusBarTranslucent
      hardwareAccelerated
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Animated.View style={[styles.sheet, { opacity, transform: [{ scale }] }]}>
          <LinearGradient
            colors={["#6F13F21F", "#FFFFFF", "#FFFFFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.card}
          >
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <AppText type={TWENTY_TWO} weight={INTER_BOLD} color={BLACK}>
                  Boost
                </AppText>
                <AppText type={ELEVEN} weight={INTER_MEDIUM} color={colors.darkOpecity}>
                  {subTitle}
                </AppText>
              </View>
              <TouchableOpacityView onPress={onClose} style={styles.closeBtn}>
                <AppText type={FORTEEN} weight={INTER_BOLD} color={colors.lightBlack}>
                  Close
                </AppText>
              </TouchableOpacityView>
            </View>

            {isRunning ? (
              <View style={styles.runningCard}>
                <View style={styles.runningRow}>
                  <Animated.View
                    style={[
                      styles.liveDot,
                      {
                        opacity: livePulse.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.5, 1],
                        }),
                        transform: [
                          {
                            scale: livePulse.interpolate({
                              inputRange: [0, 1],
                              outputRange: [1, 1.2],
                            }),
                          },
                        ],
                      },
                    ]}
                  />
                  <AppText type={ELEVEN} weight={INTER_BOLD} color={colors.purple}>
                    Boost is LIVE
                  </AppText>
                </View>
                <AppText type={TWENTY_TWO} weight={INTER_BOLD} color={BLACK} style={{ marginTop: metrics.hp0_5 }}>
                  {remainingLabel}
                </AppText>
                <AppText type={ELEVEN} weight={INTER_MEDIUM} color={colors.darkOpecity} style={{ marginTop: -metrics.hp0_5 }}>
                  remaining
                </AppText>
              </View>
            ) : null}

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <AppText type={ELEVEN} weight={INTER_MEDIUM} color={colors.darkOpecity}>
                  Boosters left
                </AppText>
                <AppText type={FORTEEN} weight={INTER_BOLD} color={colors.purple}>
                  {boostsAvailable}
                </AppText>
              </View>
              <View style={styles.sep} />
              <View style={styles.infoItem}>
                <AppText type={ELEVEN} weight={INTER_MEDIUM} color={colors.darkOpecity}>
                  Duration
                </AppText>
                <AppText type={FORTEEN} weight={INTER_BOLD} color={colors.lightBlack}>
                  {durationMinutes} min
                </AppText>
              </View>
            </View>

            {!isRunning ? (
              <TouchableOpacityView
                onPress={onStart}
                disabled={boostsAvailable <= 0 || isActivating}
                style={[
                  styles.startBtn,
                  (boostsAvailable <= 0 || isActivating) && { opacity: 0.5 },
                ]}
              >
                <AppText type={FORTEEN} weight={INTER_BOLD} color={WHITE}>
                  {isActivating ? "Starting..." : "Start Boost"}
                </AppText>
              </TouchableOpacityView>
            ) : (
              <View style={styles.runningHint}>
                <AppText type={ELEVEN} weight={INTER_MEDIUM} color={colors.darkOpecity}>
                  Boost is running • {remainingLabel} remaining
                </AppText>
              </View>
            )}
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "#00000066",
    justifyContent: "center",
    paddingHorizontal: metrics.hp2,
  },
  sheet: {
    borderRadius: metrics.hp2,
    width:"100%",
    backgroundColor:colors.white,
    paddingHorizontal:metrics.hp2,
    paddingVertical:metrics.hp2
  },
  card: {
    borderRadius: metrics.hp2,
    // padding: metrics.hp2,
    backgroundColor: colors.white,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal:metrics.hp1,
    paddingVertical:metrics.hp1
    // gap: metrics.hp1,
  },
  closeBtn: {
    paddingHorizontal: metrics.hp1_5,
    paddingVertical: metrics.hp0_8,
    borderRadius: metrics.hp2,
    backgroundColor: "#0000000A",
  },
  runningCard: {
    marginTop: metrics.hp1,
    borderRadius: metrics.hp1_5,
    paddingVertical: metrics.hp1_5,
    paddingHorizontal: metrics.hp1_5,
    backgroundColor: "#6F13F20F",
    borderWidth: metrics.hp0_1,
    borderColor: "#6F13F233",
    alignItems: "center",
  },
  runningRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: metrics.hp0_7,
  },
  liveDot: {
    height: metrics.hp0_8,
    width: metrics.hp0_8,
    borderRadius: metrics.hp0_5,
    backgroundColor: colors.purple,
  },
  infoRow: {
    marginTop: metrics.hp1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: metrics.hp1_5,
    borderWidth: metrics.hp0_1,
    borderColor: colors.nanoOpecity,
    backgroundColor: "#FFFFFF",
    paddingVertical: metrics.hp1_2,
    paddingHorizontal: metrics.hp1_5,
  },
  infoItem: {
    flex: 1,
  },
  sep: {
    width: metrics.hp0_1,
    height: metrics.hp4,
    backgroundColor: colors.nanoOpecity,
    marginHorizontal: metrics.hp1,
  },
  startBtn: {
    marginTop: metrics.hp2,
    height: metrics.hp5_5,
    borderRadius: metrics.hp4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.purple,
  },
  runningHint: {
    marginTop: metrics.hp2,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: metrics.hp1,
  },
});



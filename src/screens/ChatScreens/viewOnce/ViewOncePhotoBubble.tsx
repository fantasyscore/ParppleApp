import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import metrics from "../../../assets/Metrics";
import { AppText, INTER_MEDIUM, INTER_SEMI_BOLD, TEN, TWELVE, WHITE } from "../../../common/AppText";
import { TouchableOpacityView } from "../../../common/TouchableOpacityView";
import { DISSOLVE_DURATION_MS } from "./useViewOncePhotos";

interface ViewOncePhotoBubbleProps {
  message: any;
  onOpen: (messageId: string) => void;
  /** Long press (used to delete my own photo) */
  onLongPress?: () => void;
}

// Small flecks that fly off while the bubble dissolves: [x travel, y travel, size]
const PARTICLES: [number, number, number][] = [
  [-34, -22, 5], [-12, -34, 4], [14, -30, 6], [36, -18, 4], [-40, 6, 4], [40, 10, 5],
  [-24, 24, 5], [2, 30, 4], [26, 26, 6],
];

/** The chat bubble of a view-once photo: a placeholder only, never a preview of the photo. */
const ViewOncePhotoBubble = ({ message, onOpen, onLongPress }: ViewOncePhotoBubbleProps) => {
  // Played once, when the photo has just been viewed: the bubble fades, shrinks and breaks into flecks
  const dissolve = useRef(new Animated.Value(0)).current;
  const dissolving = message?.dissolving === true;
  useEffect(() => {
    if (!dissolving) return;
    Animated.timing(dissolve, {
      toValue: 1,
      duration: DISSOLVE_DURATION_MS,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [dissolving, dissolve]);

  const isMine = message?.isMine === true;
  const status: string = message?.mediaStatus || "unopened";
  const canOpen = !isMine && status === "unopened" && !String(message?._id).startsWith("pending-");

  const title = status === "opened" ? "Opened" : status === "expired" ? "Expired" : "📷 Photo";
  const subtitle =
    status !== "unopened" ? null : message?.sending ? "Sending..." : isMine ? "Delivered" : "Tap to view";

  const dissolveStyle = {
    opacity: dissolve.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 0.5, 0] }),
    transform: [
      { scale: dissolve.interpolate({ inputRange: [0, 1], outputRange: [1, 0.7] }) },
      { translateY: dissolve.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) },
    ],
  };

  return (
    <Animated.View style={dissolveStyle}>
    <TouchableOpacityView
      activeOpacity={canOpen ? 0.7 : 1}
      disabled={!canOpen && !(isMine && onLongPress)}
      onPress={canOpen ? () => onOpen(String(message._id)) : undefined}
      onLongPress={isMine ? onLongPress : undefined}
      style={[styles.bubble, isMine ? styles.mine : styles.theirs, status !== "unopened" && styles.used]}
    >
      <AppText type={TWELVE} weight={INTER_SEMI_BOLD} color={WHITE}>
        {title}
      </AppText>
      {subtitle ? (
        <View style={styles.subtitleRow}>
          <AppText type={TEN} weight={INTER_MEDIUM} color={WHITE} style={styles.subtitle}>
            {subtitle}
          </AppText>
        </View>
      ) : null}
    </TouchableOpacityView>
    {dissolving
      ? PARTICLES.map(([x, y, size], index) => (
          <Animated.View
            key={index}
            pointerEvents="none"
            style={[
              styles.particle,
              {
                width: size,
                height: size,
                backgroundColor: isMine ? "#555359" : "#7A4E40",
                opacity: dissolve.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0] }),
                transform: [
                  { translateX: dissolve.interpolate({ inputRange: [0, 1], outputRange: [0, x] }) },
                  { translateY: dissolve.interpolate({ inputRange: [0, 1], outputRange: [0, y] }) },
                ],
              },
            ]}
          />
        ))
      : null}
    </Animated.View>
  );
};

export default ViewOncePhotoBubble;

const styles = StyleSheet.create({
  bubble: {
    paddingHorizontal: metrics.hp2,
    borderRadius: metrics.hp1,
    minWidth: metrics.hp14,
    minHeight: metrics.hp5,
    justifyContent: "center",
  },
  // Same colours as the text bubbles
  mine: {
    backgroundColor: "#555359",
    borderBottomRightRadius: 0,
    marginRight: metrics.hp0_3,
  },
  theirs: {
    backgroundColor: "#7A4E40",
    borderBottomLeftRadius: 0,
    // The profile photo beside it sits a little above the row's bottom: lift the bubble so both share a centre line
    marginBottom: metrics.hp1,
  },
  particle: {
    position: "absolute",
    top: "50%",
    left: "50%",
    borderRadius: 1,
  },
  used: {
    opacity: 0.65,
  },
  subtitleRow: {
    marginTop: metrics.hp0_3,
  },
  subtitle: {
    opacity: 0.8,
  },
});

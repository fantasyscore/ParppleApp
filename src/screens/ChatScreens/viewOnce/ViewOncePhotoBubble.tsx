import React, { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, Easing, Image, StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import metrics from "../../../assets/Metrics";
import { AppText, INTER_BOLD, TEN, WHITE } from "../../../common/AppText";
import { pepoleTabNewNrml } from "../../../helper/ImageAssets";
import { colors } from "../../../theme/colors";
import { TouchableOpacityView } from "../../../common/TouchableOpacityView";
import { DISSOLVE_DURATION_MS } from "./useViewOncePhotos";

interface ViewOncePhotoBubbleProps {
  message: any;
  onOpen: (messageId: string) => void;
  /** Long press (used to delete my own photo) */
  onLongPress?: () => void;
  /** Blurred backdrop for a photo I received and haven't opened yet: the sender's profile photo */
  placeholderUri?: string;
}

const SENT_CAPTION = "They can view this photo only once.\nIt disappears after they open it.";
const RECEIVED_CAPTION = "You can view this photo only once.\nIt disappears after you open it.";

// Small flecks that fly off while the bubble dissolves: [x travel, y travel, size]
const PARTICLES: [number, number, number][] = [
  [-34, -22, 5], [-12, -34, 4], [14, -30, 6], [36, -18, 4], [-40, 6, 4], [40, 10, 5],
  [-24, 24, 5], [2, 30, 4], [26, 26, 6],
];

/**
 * The chat bubble of a view-once photo. My own photo is shown in full (from this device's copy). A photo I received
 * is never shown before it's opened: the bubble shows a heavily blurred backdrop with an eye; tapping opens it once.
 */
const ViewOncePhotoBubble = ({ message, onOpen, onLongPress, placeholderUri }: ViewOncePhotoBubbleProps) => {
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

  const ownPhotoUri: string | undefined = isMine ? message?.localUri : undefined;
  // Blurred preview of the photo itself when the backend sends one with the message (the photo only arrives on open),
  // otherwise the sender's profile photo, blurred beyond recognition
  const backdropUri: string | undefined = isMine ? undefined : message?.thumbnailUrl || placeholderUri;
  const showEye = !ownPhotoUri && status === "unopened";
  const caption = message?.sending ? "Sending..." : isMine ? SENT_CAPTION : RECEIVED_CAPTION;

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
      activeOpacity={canOpen ? 0.8 : 1}
      disabled={!canOpen && !(isMine && onLongPress)}
      onPress={canOpen ? () => onOpen(String(message._id)) : undefined}
      onLongPress={isMine ? onLongPress : undefined}
      style={[styles.bubble, isMine ? styles.mine : styles.theirs, status !== "unopened" && styles.used]}
    >
      <View style={styles.photoBox}>
        {ownPhotoUri ? (
          <FastImage source={{ uri: ownPhotoUri }} resizeMode="cover" style={StyleSheet.absoluteFill} />
        ) : backdropUri ? (
          <Image source={{ uri: backdropUri }} resizeMode="cover" blurRadius={25} style={StyleSheet.absoluteFill} />
        ) : null}
        {showEye ? (
          <FastImage source={pepoleTabNewNrml} resizeMode="contain" tintColor={colors.white} style={styles.eyeIcon} />
        ) : null}
        {message?.sending ? (
          <View style={styles.sendingOverlay}>
            <ActivityIndicator size="small" color={colors.white} />
          </View>
        ) : null}
      </View>
      <AppText type={TEN} weight={INTER_BOLD} color={WHITE} style={styles.caption}>
        {caption}
      </AppText>
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
    padding: metrics.hp1,
    borderRadius: metrics.hp1,
  },
  photoBox: {
    width: metrics.hp30,
    height: metrics.hp30,
    borderRadius: metrics.hp1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2A2A2D",
  },
  eyeIcon: {
    width: metrics.hp8,
    height: metrics.hp8,
  },
  sendingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  caption: {
    textAlign: "center",
    marginTop: metrics.hp1,
    marginBottom: metrics.hp0_3,
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
});

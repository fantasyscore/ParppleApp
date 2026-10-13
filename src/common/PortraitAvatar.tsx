import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import FastImage from "react-native-fast-image";
import { PHOTO_ASPECT_RATIO } from "../helper/Constants";

interface PortraitAvatarProps {
  /** A remote photo ({ uri }) or a bundled placeholder (require() asset) */
  source: any;
  /** Size, radius, border and margins of the avatar frame */
  style?: StyleProp<ViewStyle>;
  /** Rendered on top of the photo (online dots, overlays) */
  children?: React.ReactNode;
}

/**
 * Small avatar for profile photos, which are stored as portrait 3:4 frames.
 * `resizeMode="cover"` would centre the portrait inside a square or circle
 * and crop equal amounts off the top and bottom — which is where the head is.
 * Here the photo is laid out at its real 3:4 ratio and pinned to the top, so
 * the frame clips the lower part of the photo instead. Bundled placeholders
 * are not portraits and keep the plain centred cover.
 */
const PortraitAvatar = ({ source, style, children }: PortraitAvatarProps) => {
  const isPlaceholder = typeof source === "number";
  return (
    <View style={[styles.frame, style]}>
      <FastImage
        source={source}
        resizeMode="cover"
        style={isPlaceholder ? StyleSheet.absoluteFill : styles.portrait}
      />
      {children}
    </View>
  );
};

export default PortraitAvatar;

const styles = StyleSheet.create({
  frame: {
    overflow: "hidden",
  },
  portrait: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    aspectRatio: PHOTO_ASPECT_RATIO,
  },
});

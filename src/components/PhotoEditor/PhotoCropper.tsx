import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Image, PixelRatio, Platform, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { captureRef } from "react-native-view-shot";
import { colors } from "../../theme/colors";
import { PHOTO_ASPECT_RATIO } from "../../helper/Constants";

const MAX_ZOOM = 5;
// 1620 x 2160 keeps the long edge at the same 2160 cap the sticker editor exports with
const MAX_EXPORT_WIDTH = 1620;
const FRAME_MARGIN = 16;

export interface PhotoCropperHandle {
  /** Flattens the visible 3:4 frame to a JPEG file and resolves with its local URI */
  capture: () => Promise<string>;
}

interface PhotoCropperProps {
  /** Original, full-quality local image URI */
  imageUri: string;
  /** Space the 3:4 frame has to fit into */
  areaWidth: number;
  areaHeight: number;
}

/**
 * How far the image may travel from the frame center before an edge of the
 * frame would become visible. Worklet: runs on the UI thread inside gestures.
 */
const clampPan = (value: number, zoom: number, displayedSize: number, frameSize: number) => {
  "worklet";
  const limit = Math.max(0, (displayedSize * zoom - frameSize) / 2);
  return Math.min(limit, Math.max(-limit, value));
};

/**
 * A fixed 3:4 frame over the photo. The photo starts "cover"-fitted (it always
 * fills the frame) and the user drags and pinches it to choose the framing;
 * the image can never be moved or zoomed out far enough to expose empty space.
 * Gestures run on the UI thread through Reanimated shared values, so there are
 * no React re-renders while the user interacts.
 */
const PhotoCropper = forwardRef<PhotoCropperHandle, PhotoCropperProps>(
  ({ imageUri, areaWidth, areaHeight }, ref) => {
    const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
    const frameRef = useRef<View>(null);

    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const zoom = useSharedValue(1);
    const startX = useSharedValue(0);
    const startY = useSharedValue(0);
    const startZoom = useSharedValue(1);

    useEffect(() => {
      let cancelled = false;
      setImageSize(null);
      Image.getSize(
        imageUri,
        (width, height) => {
          if (!cancelled && width && height) setImageSize({ width, height });
        },
        (err) => console.warn("[PhotoCropper] getSize failed:", err)
      );
      return () => {
        cancelled = true;
      };
    }, [imageUri]);

    const frame = useMemo(() => {
      const width = Math.max(
        0,
        Math.min(areaWidth - FRAME_MARGIN * 2, (areaHeight - FRAME_MARGIN * 2) * PHOTO_ASPECT_RATIO)
      );
      return { width, height: width / PHOTO_ASPECT_RATIO };
    }, [areaWidth, areaHeight]);

    // At zoom 1 the photo exactly covers the frame
    const layout = useMemo(() => {
      if (!imageSize || !frame.width) return null;
      const baseScale = Math.max(frame.width / imageSize.width, frame.height / imageSize.height);
      return {
        baseScale,
        displayedWidth: imageSize.width * baseScale,
        displayedHeight: imageSize.height * baseScale,
      };
    }, [imageSize, frame]);

    // New photo or new frame size: start centered at "cover"
    useEffect(() => {
      translateX.value = 0;
      translateY.value = 0;
      zoom.value = 1;
    }, [imageUri, frame.width, frame.height, translateX, translateY, zoom]);

    useImperativeHandle(
      ref,
      () => ({
        capture: async () => {
          if (!layout || !frameRef.current) throw new Error("Crop frame is not ready");
          // Never export more pixels than the source holds in the visible region,
          // nor more than the screen actually rendered
          const visibleSourceWidth = frame.width / (layout.baseScale * zoom.value);
          const width = Math.max(
            1,
            Math.round(
              Math.min(MAX_EXPORT_WIDTH, visibleSourceWidth, frame.width * PixelRatio.get())
            )
          );
          const height = Math.round(width / PHOTO_ASPECT_RATIO);
          const uri = await captureRef(frameRef, { format: "jpg", quality: 0.92, width, height });
          return Platform.OS === "android" && !uri.startsWith("file://") ? `file://${uri}` : uri;
        },
      }),
      [layout, frame.width, zoom]
    );

    const gesture = useMemo(() => {
      if (!layout) return Gesture.Pan().enabled(false);
      const { displayedWidth, displayedHeight } = layout;
      const frameWidth = frame.width;
      const frameHeight = frame.height;

      const pan = Gesture.Pan()
        .minPointers(1)
        .maxPointers(2)
        .onStart(() => {
          startX.value = translateX.value;
          startY.value = translateY.value;
        })
        .onUpdate((e) => {
          translateX.value = clampPan(startX.value + e.translationX, zoom.value, displayedWidth, frameWidth);
          translateY.value = clampPan(startY.value + e.translationY, zoom.value, displayedHeight, frameHeight);
        });

      const pinch = Gesture.Pinch()
        .onStart(() => {
          startZoom.value = zoom.value;
        })
        .onUpdate((e) => {
          const next = Math.min(MAX_ZOOM, Math.max(1, startZoom.value * e.scale));
          zoom.value = next;
          // Zooming out shrinks the allowed travel; pull the photo back inside it
          translateX.value = clampPan(translateX.value, next, displayedWidth, frameWidth);
          translateY.value = clampPan(translateY.value, next, displayedHeight, frameHeight);
        });

      return Gesture.Simultaneous(pan, pinch);
    }, [layout, frame.width, frame.height, startX, startY, startZoom, translateX, translateY, zoom]);

    const imageStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: zoom.value }],
    }));

    if (!layout) return <ActivityIndicator color={colors.white} />;

    return (
      <View style={{ width: frame.width, height: frame.height }}>
        <GestureDetector gesture={gesture}>
          <View
            ref={frameRef}
            collapsable={false}
            style={[styles.frame, { width: frame.width, height: frame.height }]}
          >
            <Animated.Image
              source={{ uri: imageUri }}
              resizeMode="cover"
              style={[
                {
                  position: "absolute",
                  width: layout.displayedWidth,
                  height: layout.displayedHeight,
                  left: (frame.width - layout.displayedWidth) / 2,
                  top: (frame.height - layout.displayedHeight) / 2,
                },
                imageStyle,
              ]}
            />
          </View>
        </GestureDetector>
        {/* Guides sit outside the captured view so they never end up in the export */}
        <View pointerEvents="none" style={styles.guides}>
          <View style={[styles.guideLine, styles.guideVertical, { left: "33.333%" }]} />
          <View style={[styles.guideLine, styles.guideVertical, { left: "66.666%" }]} />
          <View style={[styles.guideLine, styles.guideHorizontal, { top: "33.333%" }]} />
          <View style={[styles.guideLine, styles.guideHorizontal, { top: "66.666%" }]} />
        </View>
      </View>
    );
  }
);

PhotoCropper.displayName = "PhotoCropper";

export default PhotoCropper;

const styles = StyleSheet.create({
  frame: {
    overflow: "hidden",
    backgroundColor: "#151517",
  },
  guides: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  guideLine: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  guideVertical: {
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
  },
  guideHorizontal: {
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
});

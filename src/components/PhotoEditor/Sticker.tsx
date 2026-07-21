import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { colors } from "../../theme/colors";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import { AppText, INTER_BOLD, WHITE, fontSize } from "../../common/AppText";
import metrics from "../../assets/Metrics";

export type StickerKind = "mask" | "emoji";

export interface StickerItem {
  id: string;
  kind: StickerKind;
  /** Mask stickers: bundled image source */
  source?: any;
  /** Mask stickers: asset height / width */
  aspect?: number;
  /** Emoji stickers: the character to render */
  emoji?: string;
  /** Center offset from the canvas center + initial scale/rotation (radians) */
  initial: { x: number; y: number; scale: number; rotation: number };
  z: number;
}

interface StickerProps {
  item: StickerItem;
  baseSize: number;
  canvasWidth: number;
  canvasHeight: number;
  selected: boolean;
  /** Hidden while flattening the canvas so controls never end up in the export */
  showControls: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const MIN_SCALE = 0.2;
const MAX_SCALE = 8;

/**
 * One free-transform sticker: pan to move, pinch to scale, two-finger twist to
 * rotate. All three gestures run simultaneously on the UI thread via
 * Reanimated shared values, so tracking stays at 60fps with no React
 * re-renders during interaction.
 */
const Sticker = ({
  item,
  baseSize,
  canvasWidth,
  canvasHeight,
  selected,
  showControls,
  onSelect,
  onDelete,
}: StickerProps) => {
  const width = baseSize;
  const height = item.kind === "mask" ? baseSize * (item.aspect || 1) : baseSize;

  const tx = useSharedValue(item.initial.x);
  const ty = useSharedValue(item.initial.y);
  const scale = useSharedValue(item.initial.scale);
  const rotation = useSharedValue(item.initial.rotation);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const startScale = useSharedValue(1);
  const startRotation = useSharedValue(0);

  const select = () => onSelect(item.id);

  const pan = Gesture.Pan()
    .minPointers(1)
    .maxPointers(2)
    .onBegin(() => {
      runOnJS(select)();
    })
    .onStart(() => {
      startX.value = tx.value;
      startY.value = ty.value;
    })
    .onUpdate((e) => {
      tx.value = startX.value + e.translationX;
      ty.value = startY.value + e.translationY;
    });

  const pinch = Gesture.Pinch()
    .onStart(() => {
      startScale.value = scale.value;
    })
    .onUpdate((e) => {
      const next = startScale.value * e.scale;
      scale.value = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
    });

  const rotate = Gesture.Rotation()
    .onStart(() => {
      startRotation.value = rotation.value;
    })
    .onUpdate((e) => {
      rotation.value = startRotation.value + e.rotation;
    });

  const composedGesture = Gesture.Simultaneous(pan, pinch, rotate);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
      { rotateZ: `${rotation.value}rad` },
    ],
  }));

  // Keep the delete control readable regardless of how far the sticker is
  // pinched in or out
  const controlCounterScale = useAnimatedStyle(() => ({
    transform: [{ scale: 1 / scale.value }],
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View
        style={[
          {
            position: "absolute",
            left: canvasWidth / 2 - width / 2,
            top: canvasHeight / 2 - height / 2,
            width,
            height,
            zIndex: item.z,
          },
          animatedStyle,
        ]}
      >
        <View
          style={[
            StyleSheet.absoluteFillObject,
            styles.content,
            selected && showControls && styles.selectedBorder,
          ]}
        >
          {item.kind === "mask" ? (
            <Image
              source={item.source}
              style={{ width: "100%", height: "100%" }}
              resizeMode="contain"
            />
          ) : (
            <Text
              allowFontScaling={false}
              style={{ fontSize: baseSize * 0.8, textAlign: "center" }}
            >
              {item.emoji}
            </Text>
          )}
        </View>
        {selected && showControls && (
          <Animated.View style={[styles.deleteButton, controlCounterScale]}>
            <TouchableOpacityView
              style={styles.deleteTouchable}
              onPress={() => onDelete(item.id)}
            >
              <AppText color={WHITE} weight={INTER_BOLD} style={styles.deleteText}>
                ×
              </AppText>
            </TouchableOpacityView>
          </Animated.View>
        )}
      </Animated.View>
    </GestureDetector>
  );
};

export default Sticker;

const styles = StyleSheet.create({
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  selectedBorder: {
    borderWidth: 1.5,
    borderColor: colors.white,
    borderStyle: "dashed",
  },
  deleteButton: {
    position: "absolute",
    top: -metrics.hp1_5,
    right: -metrics.hp1_5,
  },
  deleteTouchable: {
    width: metrics.hp3,
    height: metrics.hp3,
    borderRadius: metrics.hp3 / 2,
    backgroundColor: "red",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteText: {
    fontSize: fontSize(16),
    lineHeight: fontSize(18),
    textAlign: "center",
  },
});

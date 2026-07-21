import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { captureRef } from "react-native-view-shot";
import {
  AppText,
  EIGHTEEN,
  fontSize,
  FORTEEN,
  INTER_BOLD,
  INTER_MEDIUM,
  OPECITY,
  SCHEHERAZADE_BOLD,
  SCHEHERAZADE_SEMI_BOLD,
  TWELVE,
  TWENTY,
  WHITE,
} from "../../common/AppText";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import metrics from "../../assets/Metrics";
import { colors, newColor } from "../../theme/colors";
import { FACE_MASKS, FaceMaskAnalysis, FaceMaskOption } from "../../helper/faceMask";
import Sticker, { StickerItem } from "./Sticker";

const EMOJIS = ["😷", "😎", "🎭", "🤐", "❤️", "👑"];

// Longest edge of the flattened export; keeps files uploadable while staying
// well above the app's display sizes
const MAX_EXPORT_DIMENSION = 2160;

export interface PhotoEditorResult {
  /** Local file URI of the flattened, edited image */
  uri: string;
}

interface PhotoEditorModalProps {
  visible: boolean;
  /** Original, full-quality local image URI */
  imageUri: string;
  /** Face geometry when auto-detection succeeded, null for the manual fallback */
  analysis: FaceMaskAnalysis | null;
  busy: boolean;
  /** Status label shown while busy (e.g. "Uploading...") */
  busyLabel?: string;
  onCancel: () => void;
  onDone: (result: PhotoEditorResult) => void;
  /** Upload the original photo untouched — no editing, no flattening */
  onSkip: () => void;
}

interface FitRect {
  width: number;
  height: number;
  imageWidth: number;
  imageHeight: number;
}

let stickerSeq = 0;
const nextStickerId = () => `sticker_${++stickerSeq}`;

/**
 * Full-screen, Stories-style editor. The photo is shown at its contain-fit
 * size; masks and emojis are free-transform stickers on top. Done flattens
 * the canvas with react-native-view-shot and hands back a file URI — nothing
 * is uploaded from here, so the caller stays in charge of the network flow.
 */
const PhotoEditorModal = ({
  visible,
  imageUri,
  analysis,
  busy,
  busyLabel,
  onCancel,
  onDone,
  onSkip,
}: PhotoEditorModalProps) => {
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number } | null>(null);
  const [fit, setFit] = useState<FitRect | null>(null);
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const autoPlacedRef = useRef(false);
  const zRef = useRef(1);
  const shotRef = useRef<View>(null);

  const maskAspect = useMemo(() => {
    const asset = Image.resolveAssetSource(FACE_MASKS[0].source);
    return asset?.width && asset?.height ? asset.height / asset.width : 1;
  }, []);

  // Reset per photo
  useEffect(() => {
    if (visible) {
      autoPlacedRef.current = false;
      zRef.current = 1;
      setStickers([]);
      setSelectedId(null);
      setFit(null);
      setCapturing(false);
    }
  }, [visible, imageUri]);

  // Contain-fit the image inside the measured canvas
  useEffect(() => {
    if (!visible || !canvasSize || !imageUri) return;
    let cancelled = false;
    Image.getSize(
      imageUri,
      (imageWidth, imageHeight) => {
        if (cancelled || !imageWidth || !imageHeight) return;
        const scale = Math.min(canvasSize.width / imageWidth, canvasSize.height / imageHeight);
        setFit({
          width: imageWidth * scale,
          height: imageHeight * scale,
          imageWidth,
          imageHeight,
        });
      },
      (err) => console.warn("[PhotoEditor] getSize failed:", err)
    );
    return () => {
      cancelled = true;
    };
  }, [visible, canvasSize, imageUri]);

  const maskBaseSize = fit ? fit.width * 0.6 : 0;
  const emojiBaseSize = fit ? fit.width * 0.35 : 0;

  const addOrReplaceSticker = useCallback(
    (art: { kind: "mask"; option: FaceMaskOption } | { kind: "emoji"; emoji: string }) => {
      if (selectedId) {
        // Replace the selected sticker's artwork, keeping its transform
        setStickers((prev) =>
          prev.map((s) =>
            s.id === selectedId
              ? {
                ...s,
                kind: art.kind,
                source: art.kind === "mask" ? art.option.source : undefined,
                aspect: art.kind === "mask" ? maskAspect : undefined,
                emoji: art.kind === "emoji" ? art.emoji : undefined,
              }
              : s
          )
        );
        return;
      }
      const id = nextStickerId();
      setStickers((prev) => [
        ...prev,
        {
          id,
          kind: art.kind,
          source: art.kind === "mask" ? art.option.source : undefined,
          aspect: art.kind === "mask" ? maskAspect : undefined,
          emoji: art.kind === "emoji" ? art.emoji : undefined,
          initial: { x: 0, y: 0, scale: 1, rotation: 0 },
          z: ++zRef.current,
        },
      ]);
      setSelectedId(id);
    },
    [selectedId, maskAspect]
  );

  const deleteSticker = useCallback((id: string) => {
    setStickers((prev) => prev.filter((s) => s.id !== id));
    setSelectedId((cur) => (cur === id ? null : cur));
  }, []);

  const bringToFrontAndSelect = useCallback((id: string) => {
    setSelectedId(id);
    setStickers((prev) => prev.map((s) => (s.id === id ? { ...s, z: ++zRef.current } : s)));
  }, []);

  // Auto-place the default mask over the detected eyes, mapped from the
  // detection image space into the contain-fit canvas space
  useEffect(() => {
    if (!visible || !fit || !analysis || autoPlacedRef.current || !maskBaseSize) return;
    autoPlacedRef.current = true;

    const s = fit.width / analysis.imageWidth;
    const toCanvas = (p: { x: number; y: number }) => ({ x: p.x * s, y: p.y * s });
    const [eyeA, eyeB] = [toCanvas(analysis.leftEye), toCanvas(analysis.rightEye)].sort(
      (a, b) => a.x - b.x
    );
    const eyeCenterX = (eyeA.x + eyeB.x) / 2;
    const eyeCenterY = (eyeA.y + eyeB.y) / 2;
    const angleRad = Math.atan2(eyeB.y - eyeA.y, eyeB.x - eyeA.x);

    const option = FACE_MASKS[0];
    const visibleWidth = analysis.faceFrame.width * s * 1.05;
    const assetWidth = visibleWidth / option.contentWidthFraction;
    const assetHeight = assetWidth * maskAspect;
    const scale = assetWidth / maskBaseSize;

    // Anchor the mask's eye-hole line to the midpoint between the eyes
    const anchorOffsetY = (option.eyeLineYFraction - 0.5) * assetHeight;
    const centerX = eyeCenterX + anchorOffsetY * Math.sin(angleRad);
    const centerY = eyeCenterY - anchorOffsetY * Math.cos(angleRad);

    const id = nextStickerId();
    setStickers([
      {
        id,
        kind: "mask",
        source: option.source,
        aspect: maskAspect,
        initial: {
          x: centerX - fit.width / 2,
          y: centerY - fit.height / 2,
          scale,
          rotation: angleRad,
        },
        z: ++zRef.current,
      },
    ]);
    setSelectedId(id);
  }, [visible, fit, analysis, maskBaseSize, maskAspect]);

  const handleDone = async () => {
    if (busy || capturing || !fit || !shotRef.current) return;
    try {
      setCapturing(true);
      setSelectedId(null);
      // Let the frame without selection borders/controls commit before capture
      await new Promise((resolve) => setTimeout(resolve, 80));

      const exportScale = Math.min(
        1,
        MAX_EXPORT_DIMENSION / Math.max(fit.imageWidth, fit.imageHeight)
      );
      const uri = await captureRef(shotRef, {
        format: "jpg",
        quality: 0.92,
        width: Math.round(fit.imageWidth * exportScale),
        height: Math.round(fit.imageHeight * exportScale),
      });
      onDone({ uri: Platform.OS === "android" && !uri.startsWith("file://") ? `file://${uri}` : uri });
    } catch (err) {
      console.error("[PhotoEditor] Capture failed:", err);
    } finally {
      setCapturing(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={busy ? undefined : onCancel}>
      <GestureHandlerRootView style={styles.root}>
        <View style={{
          flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: metrics.hp2,
          paddingTop: Platform.OS === "ios" ? metrics.hp6 : metrics.hp2,
          paddingBottom: metrics.hp1,
        }}>
          <TouchableOpacityView style={styles.closeButton} onPress={onCancel} disabled={busy}>
            <AppText color={WHITE} weight={INTER_BOLD} style={styles.closeText}>×</AppText>
          </TouchableOpacityView>
          <TouchableOpacityView
            style={styles.skipButton}
            onPress={onSkip}
            disabled={busy || capturing}
          >
            <AppText weight={SCHEHERAZADE_BOLD} color={WHITE} type={EIGHTEEN} style={styles.skipText}>
              Skip
            </AppText>
          </TouchableOpacityView>
        </View>
        <View
          style={styles.canvasArea}
          onLayout={(e) =>
            setCanvasSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })
          }
        >
          {fit && (
            <View
              ref={shotRef}
              collapsable={false}
              style={{ width: fit.width, height: fit.height, overflow: "hidden" }}
            >
              <Image
                source={{ uri: imageUri }}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
              />
              <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setSelectedId(null)} />
              {stickers.map((item) => (
                <Sticker
                  key={item.id}
                  item={item}
                  baseSize={item.kind === "mask" ? maskBaseSize : emojiBaseSize}
                  canvasWidth={fit.width}
                  canvasHeight={fit.height}
                  selected={item.id === selectedId}
                  showControls={!capturing}
                  onSelect={bringToFrontAndSelect}
                  onDelete={deleteSticker}
                />
              ))}
            </View>
          )}
          {!fit && <ActivityIndicator color={colors.white} />}
        </View>

        <View style={styles.tray}>
          <AppText type={TWELVE} weight={INTER_MEDIUM} color={OPECITY} style={styles.trayHint}>
            {selectedId
              ? `Tap ${analysis ? "a mask or emoji" : "an emoji"} to replace the selected sticker`
              : `Tap ${analysis ? "a mask or emoji" : "an emoji"} to add it, then drag, pinch and rotate`}
          </AppText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.trayContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Masks only make sense when a face was detected; the manual
                fallback offers free-placement emojis/stickers instead */}
            {analysis &&
              FACE_MASKS.map((option) => (
                <TouchableOpacityView
                  key={option.id}
                  style={styles.trayItem}
                  onPress={() => addOrReplaceSticker({ kind: "mask", option })}
                >
                  <Image source={option.source} style={styles.trayMask} resizeMode="contain" />
                </TouchableOpacityView>
              ))}
            {EMOJIS.map((emoji) => (
              <TouchableOpacityView
                key={emoji}
                style={styles.trayItem}
                onPress={() => addOrReplaceSticker({ kind: "emoji", emoji })}
              >
                <Text allowFontScaling={false} style={styles.trayEmoji}>{emoji}</Text>
              </TouchableOpacityView>
            ))}
          </ScrollView>
          <TouchableOpacityView style={styles.doneButton} onPress={handleDone} disabled={busy || capturing}>
            <AppText weight={SCHEHERAZADE_BOLD} color={WHITE} type={TWENTY}>
              Done
            </AppText>
          </TouchableOpacityView>

        </View>

        {(busy || capturing) && (
          <View style={styles.busyOverlay}>
            <ActivityIndicator color={colors.white} size="large" />
            <AppText color={WHITE} weight={INTER_BOLD} style={styles.busyText}>
              {busy ? busyLabel || "Uploading..." : "Preparing image..."}
            </AppText>
          </View>
        )}
      </GestureHandlerRootView>
    </Modal>
  );
};

export default PhotoEditorModal;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: newColor.blackNew,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: metrics.hp2,
    paddingTop: Platform.OS === "ios" ? metrics.hp6 : metrics.hp2,
    paddingBottom: metrics.hp1,
  },
  closeButton: {
    width: metrics.hp3_5,
    height: metrics.hp3_5,
    borderRadius: metrics.hp3_5 / 2,
    backgroundColor: colors.lightWhite,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    fontSize: fontSize(18),
    lineHeight: fontSize(20),
    textAlign: "center",
    marginTop: -metrics.hp0_3
  },
  title: {
    fontSize: fontSize(22),
  },
  doneButton: {
    borderWidth: metrics.hp0_1,
    borderColor: colors.white,
    paddingHorizontal: metrics.hp2,
    paddingVertical: metrics.hp0_5,
    marginHorizontal:metrics.hp2,
    alignItems:"center",justifyContent:"center",
    marginVertical:metrics.hp2
  },
  canvasArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tray: {
    paddingBottom: Platform.OS === "ios" ? metrics.hp3 : metrics.hp2,
    borderTopWidth: metrics.hp0_1,
    borderTopColor: colors.lightWhite,
  },
  trayHint: {
    textAlign: "center",
    marginTop: metrics.hp1,
  },
  trayContent: {
    columnGap: metrics.hp1,
    paddingHorizontal: metrics.hp2,
    paddingVertical: metrics.hp1,
  },
  trayItem: {
    width: metrics.hp8,
    height: metrics.hp8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#151517",
    borderWidth: metrics.hp0_1,
    borderColor: colors.lightWhite,
  },
  trayMask: {
    width: "85%",
    height: "85%",
  },
  trayEmoji: {
    fontSize: fontSize(34),
  },
  skipButton: {
    alignSelf: "center",
    paddingVertical: metrics.hp0_5,
  },
  skipText: {
    opacity: 0.8,
  },
  busyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  busyText: {
    marginTop: metrics.hp2,
  },
});

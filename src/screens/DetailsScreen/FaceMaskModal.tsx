import React, { useCallback, useMemo, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  AppText,
  fontSize,
  INTER_BOLD,
  INTER_MEDIUM,
  SCHEHERAZADE_BOLD,
  SCHEHERAZADE_SEMI_BOLD,
  TWELVE,
  TWENTY,
  WHITE,
  OPECITY,
} from "../../common/AppText";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import metrics from "../../assets/Metrics";
import { colors, newColor } from "../../theme/colors";
import { FACE_MASKS, FaceMaskAnalysis, FaceMaskOption } from "../../helper/faceMask";

// How much wider than the detected face the visible mask art renders,
// tuned for Venetian eye masks
const MASK_WIDTH_TO_FACE_RATIO = 1.05;

const PREVIEW_WIDTH = metrics.wp90;
const PREVIEW_HEIGHT = metrics.hp48;

interface FaceMaskModalProps {
  visible: boolean;
  /** Original, uncompressed local image URI selected by the user */
  imageUri: string;
  analysis: FaceMaskAnalysis;
  /** Called with the chosen mask id, or null when the user continues/skips without one */
  onDone: (maskId: string | null) => void;
}

interface MaskLayout {
  left: number;
  top: number;
  width: number;
  height: number;
  angleDegrees: number;
  /** Offset from the view center to the eye-line anchor, pre-rotation */
  anchorOffsetY: number;
}

const FaceMaskModal = ({ visible, imageUri, analysis, onDone }: FaceMaskModalProps) => {
  const [selectedMask, setSelectedMask] = useState<FaceMaskOption | null>(null);

  const closeWith = useCallback(
    (maskId: string | null) => {
      setSelectedMask(null);
      onDone(maskId);
    },
    [onDone]
  );

  // Map face geometry (image pixels) into the preview box, which shows the
  // image with resizeMode="contain"
  const maskLayout: MaskLayout | null = useMemo(() => {
    if (!selectedMask || !analysis.imageWidth || !analysis.imageHeight) return null;

    const scale = Math.min(
      PREVIEW_WIDTH / analysis.imageWidth,
      PREVIEW_HEIGHT / analysis.imageHeight
    );
    const offsetX = (PREVIEW_WIDTH - analysis.imageWidth * scale) / 2;
    const offsetY = (PREVIEW_HEIGHT - analysis.imageHeight * scale) / 2;

    const toPreview = (p: { x: number; y: number }) => ({
      x: p.x * scale + offsetX,
      y: p.y * scale + offsetY,
    });

    // Order by x so the rotation angle stays in (-90°, 90°) regardless of
    // which eye ML Kit labels "left"
    const [eyeA, eyeB] = [toPreview(analysis.leftEye), toPreview(analysis.rightEye)].sort(
      (a, b) => a.x - b.x
    );
    const eyeCenterX = (eyeA.x + eyeB.x) / 2;
    const eyeCenterY = (eyeA.y + eyeB.y) / 2;
    const angleDegrees =
      (Math.atan2(eyeB.y - eyeA.y, eyeB.x - eyeA.x) * 180) / Math.PI;

    // Size by the visible art, not the padded asset box: the PNGs carry
    // transparent margins, so the raw box would render the art too small
    const visibleWidth = analysis.faceFrame.width * scale * MASK_WIDTH_TO_FACE_RATIO;
    const maskWidth = visibleWidth / selectedMask.contentWidthFraction;
    const asset = Image.resolveAssetSource(selectedMask.source);
    const aspect = asset?.width && asset?.height ? asset.height / asset.width : 1;
    const maskHeight = maskWidth * aspect;

    // Anchor the mask's eye-hole line onto the midpoint between the detected
    // eyes. RN rotates around the view center, so we place the view centered
    // on the anchor and counter-shift by the (rotated) center→anchor offset.
    const anchorOffsetY = (selectedMask.eyeLineYFraction - 0.5) * maskHeight;
    const angleRad = (angleDegrees * Math.PI) / 180;
    const centerX = eyeCenterX + anchorOffsetY * Math.sin(angleRad);
    const centerY = eyeCenterY - anchorOffsetY * Math.cos(angleRad);

    return {
      left: centerX - maskWidth / 2,
      top: centerY - maskHeight / 2,
      width: maskWidth,
      height: maskHeight,
      angleDegrees,
      anchorOffsetY,
    };
  }, [selectedMask, analysis]);

  const renderMaskItem = (mask: FaceMaskOption) => {
    const isSelected = selectedMask?.id === mask.id;
    return (
      <TouchableOpacityView
        key={mask.id}
        onPress={() => setSelectedMask(isSelected ? null : mask)}
        style={[styles.maskItem, isSelected && styles.maskItemSelected]}
      >
        <Image source={mask.source} style={styles.maskThumb} resizeMode="contain" />
      </TouchableOpacityView>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => closeWith(null)}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <TouchableOpacityView style={styles.closeButton} onPress={() => closeWith(null)}>
            <AppText color={WHITE} weight={INTER_BOLD} style={styles.closeText}>×</AppText>
          </TouchableOpacityView>

          <AppText style={styles.title} weight={SCHEHERAZADE_SEMI_BOLD} color={WHITE}>
            Choose a Face Mask (Optional)
          </AppText>
          <AppText style={styles.subtitle} type={TWELVE} weight={INTER_MEDIUM} color={OPECITY}>
            You can continue without a mask.
          </AppText>

          <View style={styles.previewContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles.previewImage}
              resizeMode="contain"
            />
            {selectedMask && maskLayout && (
              <Image
                source={selectedMask.source}
                resizeMode="stretch"
                style={{
                  position: "absolute",
                  left: maskLayout.left,
                  top: maskLayout.top,
                  width: maskLayout.width,
                  height: maskLayout.height,
                  transform: [{ rotate: `${maskLayout.angleDegrees}deg` }],
                }}
              />
            )}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.maskList}
          >
            {FACE_MASKS.map(renderMaskItem)}
          </ScrollView>

          <TouchableOpacity
            activeOpacity={1}
            onPress={() => closeWith(selectedMask?.id ?? null)}
            style={styles.continueButton}
          >
            <AppText weight={SCHEHERAZADE_BOLD} color={WHITE} type={TWENTY}>
              Continue
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => closeWith(null)} style={styles.skipButton}>
            <AppText weight={SCHEHERAZADE_BOLD} color={WHITE} type={TWENTY} style={styles.skipText}>
              Skip
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default FaceMaskModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.transparentBlack,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: metrics.wp90 + metrics.hp2 * 2,
    backgroundColor: newColor.blackNew,
    borderWidth: metrics.hp0_1,
    borderColor: colors.lightWhite,
    paddingVertical: metrics.hp2,
    paddingHorizontal: metrics.hp2,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: metrics.hp1,
    right: metrics.hp1,
    width: metrics.hp3_5,
    height: metrics.hp3_5,
    borderRadius: metrics.hp3_5 / 2,
    backgroundColor: colors.lightWhite,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  closeText: {
    fontSize: fontSize(18),
    lineHeight: fontSize(20),
    textAlign: "center",
  },
  title: {
    textAlign: "center",
    fontSize: fontSize(22),
    marginTop: metrics.hp1,
    marginHorizontal: metrics.hp3,
  },
  subtitle: {
    textAlign: "center",
    marginTop: metrics.hp0_5,
  },
  previewContainer: {
    width: PREVIEW_WIDTH,
    height: PREVIEW_HEIGHT,
    marginTop: metrics.hp2,
    backgroundColor: "#151517",
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  maskList: {
    columnGap: metrics.hp1,
    paddingVertical: metrics.hp1_5,
    paddingHorizontal: metrics.hp0_5,
  },
  maskItem: {
    width: metrics.hp8,
    height: metrics.hp8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#151517",
    borderWidth: metrics.hp0_1,
    borderColor: colors.lightWhite,
  },
  maskItemSelected: {
    borderColor: colors.white,
    borderWidth: metrics.hp0_2,
  },
  maskThumb: {
    width: "85%",
    height: "85%",
  },
  continueButton: {
    height: metrics.hp6,
    width: "90%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: metrics.hp0_1,
    borderColor: colors.white,
    marginTop: metrics.hp1,
  },
  skipButton: {
    marginTop: metrics.hp1,
    paddingVertical: metrics.hp0_5,
  },
  skipText: {
    opacity: 0.8,
  },
});

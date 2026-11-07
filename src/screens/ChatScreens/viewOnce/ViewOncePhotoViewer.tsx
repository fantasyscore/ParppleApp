import React, { useEffect, useState } from "react";
import { ActivityIndicator, AppState, Image, Modal, Platform, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Zoomable } from "@likashefqet/react-native-image-zoom";
import { CaptureEventType, CaptureProtection } from "react-native-capture-protection";
import metrics from "../../../assets/Metrics";
import { AppText, INTER_MEDIUM, TWELVE, WHITE } from "../../../common/AppText";
import { TouchableOpacityView } from "../../../common/TouchableOpacityView";
import { toastAlert } from "../../../actions/UploadImageActions";

interface ViewOncePhotoViewerProps {
  visible: boolean;
  /** The photo as a data URI held in memory; null while it is still loading */
  imageUri: string | null;
  onClose: () => void;
}

/**
 * Full-screen viewer for a view-once photo. The picture is never cached to disk: it is shown from memory,
 * dropped when the viewer closes or the app leaves the foreground, and (iOS) hidden while the screen is
 * being recorded. Android blocks screenshots / recording through FLAG_SECURE on the whole window.
 */
const ViewOncePhotoViewer = ({ visible, imageUri, onClose }: ViewOncePhotoViewerProps) => {
  const [captured, setCaptured] = useState(false);

  // Leaving the app closes the viewer, which throws the photo away
  useEffect(() => {
    if (!visible) return;
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") onClose();
    });
    return () => subscription.remove();
  }, [visible, onClose]);

  // iOS: the app-wide screenshot protection doesn't reach this Modal, so a screenshot used to capture the photo. While
  // the viewer is open the whole window (Modal included) is put behind iOS's secure-field layer, so a screenshot comes
  // out black, like Android's FLAG_SECURE; it's lifted again when the viewer closes. The photo is also hidden while the
  // screen is recorded / mirrored. Android is already covered by FLAG_SECURE and is left alone.
  useEffect(() => {
    if (!visible || Platform.OS !== "ios") return;
    CaptureProtection.prevent({ screenshot: true }).catch?.(() => undefined);
    const listener = CaptureProtection.addListener((eventType: CaptureEventType) => {
      if (eventType === CaptureEventType.RECORDING) setCaptured(true);
      else if (eventType === CaptureEventType.END_RECORDING) setCaptured(false);
      else if (eventType === CaptureEventType.CAPTURED) toastAlert.showToastError("Screenshots aren't allowed for this photo.");
    });
    return () => {
      listener?.remove?.();
      setCaptured(false);
      CaptureProtection.allow({ screenshot: true }).catch?.(() => undefined);
    };
  }, [visible]);

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <GestureHandlerRootView style={styles.container}>
        {imageUri && !captured ? (
          // Pinch or double-tap to zoom
          <Zoomable minScale={1} maxScale={4} doubleTapScale={2.5} isPanEnabled isPinchEnabled isDoubleTapEnabled style={styles.image}>
            <Image source={{ uri: imageUri }} resizeMode="contain" style={styles.image} />
          </Zoomable>
        ) : (
          <ActivityIndicator size="large" color={WHITE} />
        )}
        <TouchableOpacityView onPress={onClose} style={styles.closeButton}>
          <AppText color={WHITE} type={TWELVE} weight={INTER_MEDIUM}>
            ✕  Close
          </AppText>
        </TouchableOpacityView>
        <AppText color={WHITE} type={TWELVE} weight={INTER_MEDIUM} style={styles.note}>
          This photo disappears once you close it.
        </AppText>
      </GestureHandlerRootView>
    </Modal>
  );
};

export default ViewOncePhotoViewer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    top: metrics.hp6,
    right: metrics.hp2,
    paddingHorizontal: metrics.hp2,
    paddingVertical: metrics.hp1,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: metrics.hp4,
  },
  note: {
    position: "absolute",
    bottom: metrics.hp5,
    alignSelf: "center",
    opacity: 0.7,
  },
});

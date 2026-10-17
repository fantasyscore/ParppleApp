import React from "react";
import { Modal, StyleSheet, View } from "react-native";
import metrics from "../../../../assets/Metrics";
import { colors } from "../../../../theme/colors";
import { AppText, ELEVEN, FORTEEN, INTER_BOLD, INTER_MEDIUM, INTER_SEMI_BOLD, LIGHT_BLACK, OPECITY_DARK, SCHEHERAZADE_BOLD, TWELVE, TWENTY_TWO, WHITE } from "../../../../common/AppText";
import { TouchableOpacityView } from "../../../../common/TouchableOpacityView";
import { Screen } from "../../../../theme/dimens";
import { GateDialog } from "../useFaceVerificationGate";

interface Copy {
  title: string;
  message: string;
  primary: string;
  secondary?: string;
}

const COPY: Record<Exclude<GateDialog, "none">, Copy> = {
  prompt: {
    title: "Verify Your Identity",
    message: "Complete a quick face verification to secure your account. This process takes only a few seconds.",
    primary: "Start Verification",
    secondary: "Skip for Now",
  },
  success: {
    title: "Verification Successful",
    message: "Your face verification has been completed successfully. Your account is now fully verified.",
    primary: "Continue",
  },
  failed: {
    title: "Verification Failed",
    message: "We were unable to verify your identity. Please try again in a well-lit environment and ensure your face is clearly visible.",
    primary: "Try Again",
    secondary: "Cancel",
  },
};

interface FaceGateDialogsProps {
  dialog: GateDialog;
  onStart: () => void;
  onClose: () => void;
}

/** The three light dialogs of the iOS pre-purchase face check (prompt, success, failure). */
const FaceGateDialogs = ({ dialog, onStart, onClose }: FaceGateDialogsProps) => {
  if (dialog === "none") return null;
  const copy = COPY[dialog];
  // Success only dismisses; the other two retry / start
  const onPrimary = dialog === "success" ? onClose : onStart;

  return (
    <Modal animationType="fade" transparent visible onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <AppText type={TWENTY_TWO} weight={SCHEHERAZADE_BOLD} color={LIGHT_BLACK} style={styles.title}>
            {copy.title}
          </AppText>
          <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK} style={styles.message}>
            {copy.message}
          </AppText>
          <TouchableOpacityView onPress={onPrimary} style={[styles.button, styles.primary]}>
            <AppText color={WHITE} weight={INTER_SEMI_BOLD} type={TWELVE}>
              {copy.primary}
            </AppText>
          </TouchableOpacityView>
          {copy.secondary ? (
            <TouchableOpacityView onPress={onClose} style={[styles.button, styles.secondary]}>
              <AppText color={LIGHT_BLACK} weight={INTER_BOLD} type={FORTEEN}>
                {copy.secondary}
              </AppText>
            </TouchableOpacityView>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

export default FaceGateDialogs;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.transparentBlack,
    paddingHorizontal: metrics.hp2,
  },
  card: {
    backgroundColor: colors.white,
    width: Screen.Width / 1.15,
    borderRadius: metrics.hp2,
    paddingHorizontal: metrics.hp2,
    paddingVertical: metrics.hp3,
  },
  title: {
    textAlign: "center",
  },
  message: {
    textAlign: "center",
    marginTop: metrics.hp0_5,
  },
  button: {
    height: metrics.hp5,
    borderWidth: 1,
    borderRadius: metrics.hp4,
    alignItems: "center",
    justifyContent: "center",
    marginTop: metrics.hp1,
  },
  primary: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
    marginTop: metrics.hp3,
  },
  secondary: {
    backgroundColor: colors.transparent,
    borderColor: colors.transparent,
  },
});

import React from "react";
import { StyleSheet, View } from "react-native";
import metrics from "../../../../assets/Metrics";
import { AppText, BLACK, FORTEEN, INTER_BOLD, INTER_MEDIUM, OPECITY, RED, SCHEHERAZADE_BOLD, TWELVE, TWENTY_TWO, WHITE } from "../../../../common/AppText";
import { TouchableOpacityView } from "../../../../common/TouchableOpacityView";
import PremiumAnimatedModal from "../../../../common/PremiumAnimatedModal";
import { FaceVerificationStage } from "../../../../hooks/useFaceVerification";

interface LikeLimitModalProps {
  visible: boolean;
  stage: FaceVerificationStage;
  error: string;
  onStart: () => void;
  onClose: () => void;
}

const PrimaryButton = ({ label, onPress, last }: { label: string; onPress: () => void; last?: boolean }) => (
  <TouchableOpacityView onPress={onPress} style={[styles.primaryButton, !last && styles.buttonGap]}>
    <AppText color={BLACK} weight={INTER_BOLD} type={FORTEEN}>
      {label}
    </AppText>
  </TouchableOpacityView>
);

const SecondaryButton = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <TouchableOpacityView onPress={onPress} style={styles.secondaryButton}>
    <AppText color={WHITE} weight={INTER_BOLD} type={FORTEEN}>
      {label}
    </AppText>
  </TouchableOpacityView>
);

const StatusIcon = ({ symbol, backgroundColor, borderColor, symbolColor }: { symbol: string; backgroundColor: string; borderColor: string; symbolColor: string }) => (
  <View style={[styles.statusIcon, { backgroundColor, borderColor }]}>
    <AppText color={symbolColor} weight={INTER_BOLD} type={TWENTY_TWO}>{symbol}</AppText>
  </View>
);

/** "Like limit reached": offers face verification for unlimited likes and shows the verification result. */
const LikeLimitModal = ({ visible, stage, error, onStart, onClose }: LikeLimitModalProps) => (
  <PremiumAnimatedModal visible={visible} onClose={onClose}>
    {stage === "prompt" && (
      <View style={styles.content}>
        <AppText type={TWENTY_TWO} weight={SCHEHERAZADE_BOLD} color={WHITE} style={styles.title}>
          Like Limit Reached
        </AppText>
        <AppText type={TWELVE} weight={INTER_MEDIUM} color={OPECITY} style={styles.message}>
          Keep the likes flowing. You get 5 free likes every 24 hours - or unlimited likes when you verify your profile. Your verification selfie is completely private and never shown to anyone.
        </AppText>
        <PrimaryButton label="Continue" onPress={onStart} />
        <SecondaryButton label="Close" onPress={onClose} />
      </View>
    )}

    {stage === "success" && (
      <View style={styles.content}>
        <StatusIcon symbol="✓" backgroundColor="#73D673" borderColor="rgba(76, 175, 80, 0.3)" symbolColor={WHITE} />
        <AppText type={TWENTY_TWO} weight={SCHEHERAZADE_BOLD} color={WHITE} style={[styles.title, styles.titleAfterIcon]}>
          Verification Successful
        </AppText>
        <AppText type={TWELVE} weight={INTER_MEDIUM} color={OPECITY} style={styles.message}>
          Your face verification has been completed successfully. Your account is now fully verified.
        </AppText>
        <PrimaryButton label="Continue" onPress={onClose} last />
      </View>
    )}

    {stage === "error" && (
      <View style={styles.content}>
        <StatusIcon symbol="!" backgroundColor="#FF6483" borderColor="rgba(255,0,0,0.3)" symbolColor={RED} />
        <AppText type={TWENTY_TWO} weight={SCHEHERAZADE_BOLD} color={WHITE} style={[styles.title, styles.titleAfterIcon]}>
          Verification Failed
        </AppText>
        <AppText type={TWELVE} weight={INTER_MEDIUM} color={OPECITY} style={styles.message}>
          {error || "We were unable to verify your identity. Please try again in a well-lit environment and ensure your face is clearly visible."}
        </AppText>
        <PrimaryButton label="Try Again" onPress={onStart} />
        <SecondaryButton label="Cancel" onPress={onClose} />
      </View>
    )}
  </PremiumAnimatedModal>
);

export default LikeLimitModal;

const styles = StyleSheet.create({
  content: {
    alignItems: "center",
  },
  statusIcon: {
    height: metrics.hp8,
    width: metrics.hp8,
    borderRadius: metrics.hp4,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: metrics.hp2,
    borderWidth: 1,
  },
  title: {
    textAlign: "center",
    marginBottom: metrics.hp1,
  },
  titleAfterIcon: {
    marginTop: -metrics.hp2,
  },
  message: {
    textAlign: "center",
    marginBottom: metrics.hp3,
    marginTop: -metrics.hp2,
  },
  primaryButton: {
    backgroundColor: "#E6B7A8",
    height: metrics.hp6,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  buttonGap: {
    marginBottom: metrics.hp1_5,
  },
  secondaryButton: {
    backgroundColor: "rgba(255,255,255,0.05)",
    height: metrics.hp6,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
});

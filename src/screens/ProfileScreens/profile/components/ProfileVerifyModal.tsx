import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import metrics from "../../../../assets/Metrics";
import { AppText, BLACK, FORTEEN, INTER_BOLD, INTER_MEDIUM, OPECITY, RED, SCHEHERAZADE_BOLD, TWELVE, TWENTY_TWO, WHITE } from "../../../../common/AppText";
import { TouchableOpacityView } from "../../../../common/TouchableOpacityView";
import PremiumAnimatedModal from "../../../../common/PremiumAnimatedModal";
import { FaceVerificationStage } from "../../../../hooks/useFaceVerification";

interface ProfileVerifyModalProps {
  visible: boolean;
  stage: FaceVerificationStage;
  error: string;
  onStart: () => void;
  onClose: () => void;
}

const PrimaryButton = ({ label, onPress, last }: { label: string; onPress: () => void; last?: boolean }) => (
  <TouchableOpacityView onPress={onPress} style={[styles.primary, !last && styles.gap]}>
    <AppText color={BLACK} weight={INTER_BOLD} type={FORTEEN}>
      {label}
    </AppText>
  </TouchableOpacityView>
);

const SecondaryButton = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <TouchableOpacityView onPress={onPress} style={styles.secondary}>
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

/** "Verify your identity" dialog opened from the profile header's verification badge. */
const ProfileVerifyModal = ({ visible, stage, error, onStart, onClose }: ProfileVerifyModalProps) => (
  <PremiumAnimatedModal visible={visible} onClose={onClose}>
    {stage === "prompt" && (
      <View style={styles.content}>
        <AppText type={TWENTY_TWO} weight={SCHEHERAZADE_BOLD} color={WHITE} style={styles.title}>
          Verify Your Identity
        </AppText>
        <AppText type={TWELVE} weight={INTER_MEDIUM} color={OPECITY} style={styles.message}>
          Complete a quick face verification to secure your account. This process takes only a few seconds.
        </AppText>
        <PrimaryButton label="Start Verification" onPress={onStart} />
        <SecondaryButton label="Close" onPress={onClose} />
      </View>
    )}

    {stage === "verifying" && (
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#E6B7A8" style={styles.spinner} />
        <AppText type={TWENTY_TWO} weight={SCHEHERAZADE_BOLD} color={WHITE} style={styles.title}>
          Verifying...
        </AppText>
        <AppText type={TWELVE} weight={INTER_MEDIUM} color={OPECITY} style={styles.message}>
          Please complete the face check and wait a moment while we confirm your identity.
        </AppText>
      </View>
    )}

    {stage === "success" && (
      <View style={styles.content}>
        <StatusIcon symbol="✓" backgroundColor="#73D673" borderColor="rgba(76, 175, 80, 0.3)" symbolColor={WHITE} />
        <AppText type={TWENTY_TWO} weight={SCHEHERAZADE_BOLD} color={WHITE} style={[styles.title, styles.afterIcon]}>
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
        <AppText type={TWENTY_TWO} weight={SCHEHERAZADE_BOLD} color={WHITE} style={[styles.title, styles.afterIcon]}>
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

export default ProfileVerifyModal;

const styles = StyleSheet.create({
  spinner: {
    marginBottom: metrics.hp3,
  },
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
  afterIcon: {
    marginTop: -metrics.hp2,
  },
  message: {
    textAlign: "center",
    marginBottom: metrics.hp3,
    marginTop: -metrics.hp2,
  },
  primary: {
    backgroundColor: "#E6B7A8",
    height: metrics.hp6,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  gap: {
    marginBottom: metrics.hp1_5,
  },
  secondary: {
    backgroundColor: "rgba(255,255,255,0.05)",
    height: metrics.hp6,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
});

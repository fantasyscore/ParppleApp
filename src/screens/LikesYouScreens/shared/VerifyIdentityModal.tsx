import React from "react";
import { StyleSheet, View } from "react-native";
import metrics from "../../../assets/Metrics";
import { AppText, BLACK, EIGHTEEN, FORTEEN, INTER_BOLD, INTER_MEDIUM, INTER_REGULAR, INTER_SEMI_BOLD, THIRTEEN, TWENTY_TWO, WHITE } from "../../../common/AppText";
import { colors } from "../../../theme/colors";
import { TouchableOpacityView } from "../../../common/TouchableOpacityView";
import PortraitAvatar from "../../../common/PortraitAvatar";
import PremiumAnimatedModal from "../../../common/PremiumAnimatedModal";
import PulsingCircle from "../../../common/PulsingCircle";
import { dummyfemaleProfile } from "../../../helper/ImageAssets";
import { FaceVerificationStage } from "../../../hooks/useFaceVerification";

const ACCENT = "#F69E82";

interface VerifyIdentityModalProps {
  visible: boolean;
  stage: FaceVerificationStage;
  error: string;
  /** The user's own photo, shown inside the pulse */
  photoUrl?: string;
  onStart: () => void;
  onClose: () => void;
}

const StatusIcon = ({ symbol, backgroundColor }: { symbol: string; backgroundColor: string }) => (
  <View style={[styles.statusIcon, { backgroundColor }]}>
    <AppText type={TWENTY_TWO} color={WHITE} weight={INTER_BOLD}>{symbol}</AppText>
  </View>
);

/** Face-verification prompt used by the likes / views screens, with the result states. */
const VerifyIdentityModal = ({ visible, stage, error, photoUrl, onStart, onClose }: VerifyIdentityModalProps) => (
  <PremiumAnimatedModal visible={visible} onClose={onClose}>
    {stage === "prompt" ? (
      <View style={styles.content}>
        <PulsingCircle
          size={metrics.hp12}
          color="#F69E8250"
          fillColor="#F69E8225"
          ringWidth={metrics.hp0_1}
          style={styles.pulse}
        />
        <PortraitAvatar source={photoUrl ? { uri: photoUrl } : dummyfemaleProfile} style={styles.avatar} />
        <AppText style={styles.promptTitle} type={EIGHTEEN} color={WHITE} weight={INTER_BOLD}>
          Verify Your Identity
        </AppText>
        <AppText style={styles.promptMessage} type={THIRTEEN} color={WHITE} weight={INTER_REGULAR}>
          To keep our community safe, please complete a quick face verification to continue.
        </AppText>
        <TouchableOpacityView style={[styles.button, styles.accentButton]} onPress={onStart}>
          <AppText type={FORTEEN} color={BLACK} weight={INTER_SEMI_BOLD}>
            Verify Now
          </AppText>
        </TouchableOpacityView>
        <TouchableOpacityView style={styles.textButton} onPress={onClose}>
          <AppText type={THIRTEEN} color={ACCENT} weight={INTER_MEDIUM}>
            Cancel
          </AppText>
        </TouchableOpacityView>
      </View>
    ) : stage === "success" ? (
      <View style={styles.resultContent}>
        <StatusIcon symbol="✓" backgroundColor="#4CAF50" />
        <AppText type={EIGHTEEN} color={WHITE} weight={INTER_BOLD}>
          Verification Successful!
        </AppText>
        <AppText style={styles.resultMessage} type={THIRTEEN} color={WHITE} weight={INTER_REGULAR}>
          Thank you for verifying your identity.
        </AppText>
        <TouchableOpacityView style={[styles.button, styles.successButton]} onPress={onClose}>
          <AppText type={FORTEEN} color={WHITE} weight={INTER_SEMI_BOLD}>
            Continue
          </AppText>
        </TouchableOpacityView>
      </View>
    ) : (
      <View style={styles.resultContent}>
        <StatusIcon symbol="✕" backgroundColor={colors.red} />
        <AppText type={EIGHTEEN} color={WHITE} weight={INTER_BOLD}>
          Verification Failed
        </AppText>
        <AppText style={[styles.resultMessage, styles.errorMessage]} type={THIRTEEN} color={WHITE} weight={INTER_REGULAR}>
          {error || "We couldn't verify your identity. Please try again in good lighting."}
        </AppText>
        <TouchableOpacityView style={[styles.button, styles.errorButton]} onPress={onStart}>
          <AppText type={FORTEEN} color={WHITE} weight={INTER_SEMI_BOLD}>
            Try Again
          </AppText>
        </TouchableOpacityView>
        <TouchableOpacityView style={styles.textButton} onPress={onClose}>
          <AppText type={THIRTEEN} color={ACCENT} weight={INTER_MEDIUM}>
            Cancel
          </AppText>
        </TouchableOpacityView>
      </View>
    )}
  </PremiumAnimatedModal>
);

export default VerifyIdentityModal;

const styles = StyleSheet.create({
  content: {
    alignItems: "center",
  },
  resultContent: {
    alignItems: "center",
    paddingVertical: metrics.hp2,
  },
  pulse: {
    marginTop: -metrics.hp4_5,
  },
  avatar: {
    height: metrics.hp12,
    width: metrics.hp12,
    borderRadius: metrics.hp12 / 2,
    marginTop: -metrics.hp16_5,
    borderWidth: metrics.hp0_1,
    borderColor: ACCENT,
  },
  promptTitle: {
    marginTop: metrics.hp4,
  },
  promptMessage: {
    textAlign: "center",
    marginTop: metrics.hp2,
    paddingHorizontal: metrics.hp2,
  },
  statusIcon: {
    height: metrics.hp8,
    width: metrics.hp8,
    borderRadius: metrics.hp4,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: metrics.hp2,
  },
  resultMessage: {
    textAlign: "center",
    marginTop: metrics.hp1,
  },
  errorMessage: {
    paddingHorizontal: metrics.hp2,
  },
  button: {
    paddingVertical: metrics.hp1_5,
    paddingHorizontal: metrics.hp4,
    borderRadius: metrics.hp2,
    marginTop: metrics.hp3,
    width: "100%",
    alignItems: "center",
  },
  accentButton: {
    backgroundColor: ACCENT,
  },
  successButton: {
    backgroundColor: "#4CAF50",
  },
  errorButton: {
    backgroundColor: colors.red,
  },
  textButton: {
    marginTop: metrics.hp2,
  },
});

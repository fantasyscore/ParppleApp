import React, { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, Modal, StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import LinearGradient from "react-native-linear-gradient";
import metrics from "../../assets/Metrics";
import { colors } from "../../theme/colors";
import { AppText, ELEVEN, FORTEEN, INTER_EXTRA_BOLD, INTER_MEDIUM, INTER_REGULAR, INTER_SEMI_BOLD, LIGHT_BLACK, OPECITY_DARK, TEN, WHITE } from "../../common/AppText";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import { applogo } from "../../helper/ImageAssets";

export type PaymentStage = "verifying" | "success" | "error";

interface PaymentStatusModalProps {
  visible: boolean;
  stage: PaymentStage;
  /** Shown on success, e.g. what the user just got */
  successMessage: string;
  /** Shown on error when the backend gave no message */
  errorFallback: string;
  error: string;
  transactionId?: string;
  /** Called when the user dismisses a finished (success / error) dialog */
  onClose: (stage: PaymentStage) => void;
}

/**
 * "Verifying payment" dialog shown after the store reports a purchase. It cannot be
 * dismissed while the backend is still verifying (including the Android back button).
 */
const PaymentStatusModal = ({ visible, stage, successMessage, errorFallback, error, transactionId, onClose }: PaymentStatusModalProps) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    if (!visible) return;
    opacity.setValue(0);
    scale.setValue(0.96);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
  }, [opacity, scale, visible]);

  const verifying = stage === "verifying";

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent hardwareAccelerated onRequestClose={() => {}}>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.card, { opacity, transform: [{ scale }] }]}>
          <View style={styles.content}>
            <View style={styles.iconRing}>
              <FastImage source={applogo} resizeMode="contain" style={styles.icon} tintColor={colors.black} />
            </View>

            <AppText type={FORTEEN} weight={INTER_EXTRA_BOLD} color={LIGHT_BLACK} style={styles.title}>
              {stage === "success" ? "Payment Successful" : stage === "error" ? "Payment Verification Failed" : "Verifying Payment"}
            </AppText>

            {stage === "success" ? (
              <>
                <AppText type={ELEVEN} weight={INTER_REGULAR} color={OPECITY_DARK} style={styles.message}>
                  {successMessage}
                </AppText>
                <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK} style={styles.message}>
                  Enjoy unlimited access and exclusive benefits!
                </AppText>
                {transactionId ? (
                  <View style={styles.metaBox}>
                    <AppText type={TEN} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                      Transaction ID
                    </AppText>
                    <AppText type={TEN} weight={INTER_MEDIUM} color={OPECITY_DARK} style={styles.transactionId}>
                      {transactionId}
                    </AppText>
                  </View>
                ) : null}
              </>
            ) : stage === "error" ? (
              <AppText type={ELEVEN} weight={INTER_REGULAR} color={OPECITY_DARK} style={styles.message}>
                {error || errorFallback}
              </AppText>
            ) : (
              <View style={styles.verifyingRow}>
                <ActivityIndicator size="small" color={colors.purple} />
                <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK} style={styles.verifyingText}>
                  Please wait…
                </AppText>
              </View>
            )}

            <TouchableOpacityView
              activeOpacity={0.9}
              disabled={verifying}
              onPress={() => !verifying && onClose(stage)}
              style={[styles.buttonWrap, verifying && styles.buttonDisabled]}
            >
              <LinearGradient
                colors={stage === "error" ? [colors.red, "#FF5B6B"] : ["#6F13F2", "#2B7CFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.button}
              >
                <AppText color={WHITE} weight={INTER_SEMI_BOLD} type={FORTEEN}>
                  {stage === "success" ? "Done" : stage === "error" ? "OK" : "Verifying…"}
                </AppText>
              </LinearGradient>
            </TouchableOpacityView>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default PaymentStatusModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "#00000066",
    justifyContent: "center",
    paddingHorizontal: metrics.hp2,
  },
  card: {
    borderRadius: metrics.hp2,
    backgroundColor: colors.white,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 12,
  },
  content: {
    paddingHorizontal: metrics.hp2_5,
    paddingTop: metrics.hp2_5,
    paddingBottom: metrics.hp2,
    alignItems: "center",
  },
  iconRing: {
    height: metrics.hp10,
    width: metrics.hp10,
    borderRadius: metrics.hp50,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: metrics.hp0_1,
    borderColor: "#6F13F233",
    shadowColor: "#6F13F2",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 6,
  },
  icon: {
    height: metrics.hp7,
    width: metrics.hp7,
  },
  title: {
    textAlign: "center",
    marginTop: metrics.hp1,
  },
  message: {
    textAlign: "center",
    marginTop: metrics.hp1,
  },
  metaBox: {
    marginTop: metrics.hp2,
    width: "100%",
    borderRadius: metrics.hp1_5,
    borderWidth: metrics.hp0_1,
    borderColor: colors.nanoOpecity,
    backgroundColor: "#FFFFFF",
    paddingVertical: metrics.hp1,
    paddingHorizontal: metrics.hp1_5,
    alignItems: "center",
  },
  transactionId: {
    marginTop: metrics.hp0_5,
  },
  verifyingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: metrics.hp2,
  },
  verifyingText: {
    marginLeft: metrics.hp1,
  },
  buttonWrap: {
    width: "100%",
    marginTop: metrics.hp2_5,
    borderRadius: metrics.hp4,
    overflow: "hidden",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  button: {
    height: metrics.hp5_5,
    width: "100%",
    borderRadius: metrics.hp4,
    alignItems: "center",
    justifyContent: "center",
  },
});

import React from "react";
import { ActivityIndicator, StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import metrics from "../../assets/Metrics";
import { colors } from "../../theme/colors";
import { AppText, SCHEHERAZADE_BOLD, TWENTY, WHITE } from "../../common/AppText";

interface OnboardingButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** Visually muted (e.g. nothing selected yet) but still pressable so the screen can explain why */
  dimmed?: boolean;
  loading?: boolean;
  activeOpacity?: number;
  /** Span the whole row (minus margins) instead of 90% of it */
  fullRow?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** The outlined "Next" / "Continue" button on the bottom layer of every sign-up step. */
const OnboardingButton = ({
  label,
  onPress,
  disabled,
  dimmed,
  loading,
  activeOpacity = 0.5,
  fullRow,
  style,
}: OnboardingButtonProps) => (
  <TouchableOpacity
    activeOpacity={activeOpacity}
    onPress={onPress}
    disabled={disabled || loading}
    style={[styles.button, !fullRow && styles.fixedWidth, (dimmed || loading) && styles.dimmed, style]}
  >
    {loading ? (
      <ActivityIndicator color={colors.white} />
    ) : (
      <AppText weight={SCHEHERAZADE_BOLD} color={WHITE} type={TWENTY}>
        {label}
      </AppText>
    )}
  </TouchableOpacity>
);

export default OnboardingButton;

const styles = StyleSheet.create({
  button: {
    height: metrics.hp7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: metrics.hp0_1,
    borderColor: colors.white,
    marginHorizontal: metrics.hp2,
    marginTop: metrics.hp2,
  },
  fixedWidth: {
    width: "90%",
  },
  dimmed: {
    opacity: 0.5,
  },
});

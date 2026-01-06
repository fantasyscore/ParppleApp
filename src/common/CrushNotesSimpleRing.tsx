import React from "react";
import { StyleSheet, View } from "react-native";
import { AppText, ELEVEN, INTER_BOLD } from "./AppText";
import { colors } from "../theme/colors";

type Props = {
  remaining: number;
  size?: number;
  strokeWidth?: number;
  activeColor?: string;
  trackColor?: string;
  inactiveTextColor?: string;
};

/**
 * Simple (non-SVG, non-animated) ring with centered numeric count.
 * - No media/photos/avatars
 * - Purely visual indicator + number
 */
export const CrushNotesSimpleRing: React.FC<Props> = ({
  remaining,
  size = 34,
  strokeWidth = 2,
  activeColor = colors.purple,
  trackColor = "#00000012",
  inactiveTextColor = "#00000055",
}) => {
  const n = Number.isFinite(Number(remaining)) ? Math.max(0, Math.floor(Number(remaining))) : 0;
  const isEmpty = n <= 0;

  return (
    <View
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: isEmpty ? trackColor : activeColor,
          opacity: isEmpty ? 0.75 : 1,
        },
      ]}
    >
      <AppText type={ELEVEN} weight={INTER_BOLD} color={isEmpty ? inactiveTextColor : activeColor}>
        {String(n)}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  ring: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
});



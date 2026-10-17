import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { colors } from "../../../theme/colors";

/** Dark full-screen veil with a spinner, shown while the backend login runs. */
const LoginLoadingOverlay = ({ visible }: { visible: boolean }) => {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color={colors.white} />
    </View>
  );
};

export default LoginLoadingOverlay;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000B3",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
    elevation: 20,
  },
});

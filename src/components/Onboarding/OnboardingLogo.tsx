import React from "react";
import { StyleSheet } from "react-native";
import FastImage from "react-native-fast-image";
import metrics from "../../assets/Metrics";
import { applogo } from "../../helper/ImageAssets";

/** App logo at the top of every sign-up step. */
const OnboardingLogo = () => <FastImage source={applogo} resizeMode="contain" style={styles.logo} />;

export default OnboardingLogo;

const styles = StyleSheet.create({
  logo: {
    height: metrics.hp7,
    width: metrics.hp20,
    alignSelf: "center",
    marginTop: metrics.hp8,
  },
});

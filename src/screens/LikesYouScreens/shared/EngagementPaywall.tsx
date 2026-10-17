import React from "react";
import { ImageBackground, StyleSheet, TouchableOpacity } from "react-native";
import metrics from "../../../assets/Metrics";
import { AppText, fontSize, FORTEEN, INTER_SEMI_BOLD, SCHEHERAZADE_BOLD, THIRTY, TWENTY } from "../../../common/AppText";
import NavigationService from "../../../navigation/NavigationService";
import { NAVIGATION_SUBSCRIPTION_SCREEN } from "../../../navigation/routes";
import { EngagementConfig } from "./engagementConfig";

const ACCENT = "#D08FA9";

/** Full-screen upsell for users who can't see who liked / viewed them yet. */
const EngagementPaywall = ({ paywall }: { paywall: EngagementConfig["paywall"] }) => (
  <ImageBackground source={paywall.image} resizeMode="stretch" style={styles.container}>
    <AppText weight={SCHEHERAZADE_BOLD} style={styles.titleTop}>
      {paywall.titleTop}
    </AppText>
    <AppText type={THIRTY} weight={SCHEHERAZADE_BOLD} style={styles.titleBottom}>
      {paywall.titleBottom}
    </AppText>
    <AppText type={FORTEEN} weight={INTER_SEMI_BOLD} style={styles.subtitle}>
      {paywall.subtitle}
    </AppText>
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN)}
      style={styles.button}
    >
      <AppText type={TWENTY} weight={SCHEHERAZADE_BOLD} style={styles.buttonText}>
        Unlock Now
      </AppText>
    </TouchableOpacity>
  </ImageBackground>
);

export default EngagementPaywall;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  titleTop: {
    color: ACCENT,
    fontSize: fontSize(50),
  },
  titleBottom: {
    color: ACCENT,
    marginTop: -metrics.hp9,
    fontSize: fontSize(50),
  },
  subtitle: {
    color: ACCENT,
    marginTop: -metrics.hp4,
  },
  button: {
    height: metrics.hp7,
    position: "absolute",
    bottom: metrics.hp13,
    borderWidth: metrics.hp0_1,
    borderColor: ACCENT,
    width: "95%",
    backgroundColor: "#00000050",
  },
  buttonText: {
    color: ACCENT,
    marginTop: metrics.hp0_5,
    textAlign: "center",
  },
});

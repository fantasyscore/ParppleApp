import React from "react";
import { ImageBackground, StyleSheet, TouchableOpacity } from "react-native";
import metrics from "../../../assets/Metrics";
import { AppText, SCHEHERAZADE_BOLD, TWENTY } from "../../../common/AppText";
import NavigationService from "../../../navigation/NavigationService";
import { NAVIGATION_PEOPLE_SCREEN } from "../../../navigation/routes";
import { EngagementConfig } from "./engagementConfig";

const ACCENT = "#D08FA9";

interface EngagementEmptyStateProps {
  empty: EngagementConfig["empty"];
  /** Artwork for the current tab */
  image: any;
  showButton: boolean;
}

/** Artwork shown when a tab has no profiles, with a shortcut back to discovery. */
const EngagementEmptyState = ({ empty, image, showButton }: EngagementEmptyStateProps) => (
  <ImageBackground
    source={image}
    resizeMode={empty.resizeMode}
    style={[styles.container, empty.marginTop !== undefined && { marginTop: empty.marginTop }]}
  >
    {showButton ? (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => NavigationService.navigate(NAVIGATION_PEOPLE_SCREEN)}
        style={styles.button}
      >
        <AppText type={TWENTY} weight={SCHEHERAZADE_BOLD} style={styles.buttonText}>
          {empty.buttonLabel}
        </AppText>
      </TouchableOpacity>
    ) : null}
  </ImageBackground>
);

export default EngagementEmptyState;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
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

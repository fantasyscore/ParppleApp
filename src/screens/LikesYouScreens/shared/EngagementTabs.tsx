import React from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import metrics from "../../../assets/Metrics";
import { AppText, SCHEHERAZADE_BOLD, SIXTEEN } from "../../../common/AppText";
import { TouchableOpacityView } from "../../../common/TouchableOpacityView";
import { tabViewForLikes } from "../../../helper/ImageAssets";
import { EngagementTab } from "./engagementConfig";

const ACTIVE_TINT = "#E6B7A8";
const INACTIVE_TINT = "#555359";
const INACTIVE_LABEL = "#FAFAFA66";

interface EngagementTabsProps {
  tabs: [EngagementTab, EngagementTab];
  selected: string;
  onSelect: (key: string) => void;
}

/** The two overlapping tab pills under the header; the selected one sits on top. */
const EngagementTabs = ({ tabs, selected, onSelect }: EngagementTabsProps) => (
  <View style={styles.row}>
    {tabs.map((tab, index) => {
      const active = selected === tab.key;
      return (
        <TouchableOpacityView
          key={tab.key}
          onPress={() => onSelect(tab.key)}
          activeOpacity={1}
          style={[
            index === 1 && styles.overlap,
            { zIndex: active ? 2 : 1, elevation: active ? 2 : 1 },
          ]}
        >
          <ImageBackground
            source={tabViewForLikes}
            resizeMode={index === 0 ? "stretch" : "contain"}
            style={styles.pill}
            imageStyle={{ tintColor: active ? ACTIVE_TINT : INACTIVE_TINT }}
          >
            <View style={styles.pillContent}>
              <FastImage
                source={tab.icon}
                tintColor={active ? "black" : INACTIVE_LABEL}
                resizeMode="contain"
                style={styles.icon}
              />
              <AppText
                style={[styles.label, { color: active ? "black" : INACTIVE_LABEL }]}
                weight={SCHEHERAZADE_BOLD}
                type={SIXTEEN}
              >
                {" "}{tab.label}
              </AppText>
            </View>
          </ImageBackground>
        </TouchableOpacityView>
      );
    })}
  </View>
);

export default EngagementTabs;

const styles = StyleSheet.create({
  row: {
    position: "absolute",
    top: metrics.hp11,
    alignSelf: "center",
    flexDirection: "row",
    zIndex: 0,
  },
  overlap: {
    marginLeft: -metrics.hp4,
  },
  pill: {
    height: metrics.hp6,
    width: metrics.hp22,
    justifyContent: "center",
    alignItems: "center",
  },
  pillContent: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: metrics.hp1,
  },
  icon: {
    width: metrics.hp3,
    height: metrics.hp3,
  },
  label: {
    marginTop: -metrics.hp0_5,
  },
});

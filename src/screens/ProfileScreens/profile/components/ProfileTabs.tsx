import React from "react";
import { ImageBackground, Platform, StyleSheet, View } from "react-native";
import metrics from "../../../../assets/Metrics";
import { AppText, SCHEHERAZADE_BOLD, SIXTEEN } from "../../../../common/AppText";
import { TouchableOpacityView } from "../../../../common/TouchableOpacityView";
import { tabViewForLikes } from "../../../../helper/ImageAssets";

export type ProfileTab = "My Bio" | "Photos" | "Turn On";

const TABS: ProfileTab[] = ["My Bio", "Photos", "Turn On"];
// Stacking order of an inactive tab: the middle one sits above its neighbours
const INACTIVE_Z_INDEX = [1, 2, 1];

/** The three overlapping tab pills straddling the bottom edge of the profile header. */
const ProfileTabs = ({ selected, onSelect }: { selected: ProfileTab; onSelect: (tab: ProfileTab) => void }) => (
  <View style={styles.container}>
    {TABS.map((tab, index) => {
      const active = selected === tab;
      const zIndex = active ? 3 : INACTIVE_Z_INDEX[index];
      return (
        <TouchableOpacityView
          key={tab}
          onPress={() => onSelect(tab)}
          activeOpacity={1}
          style={[index > 0 && styles.overlap, { zIndex, elevation: zIndex }]}
        >
          <ImageBackground
            source={tabViewForLikes}
            resizeMode="stretch"
            style={styles.pill}
            imageStyle={{ tintColor: active ? "#E6B7A8" : "#555359" }}
          >
            <View style={styles.pillContent}>
              <AppText
                style={[styles.label, { color: active ? "black" : "#FAFAFA66" }]}
                weight={SCHEHERAZADE_BOLD}
                type={SIXTEEN}
              >
                {tab}
              </AppText>
            </View>
          </ImageBackground>
        </TouchableOpacityView>
      );
    })}
  </View>
);

export default ProfileTabs;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: -metrics.hp7_5,
    flexDirection: "row",
    alignSelf: "center",
    paddingHorizontal: metrics.hp2,
    paddingBottom: metrics.hp2,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 14,
  },
  overlap: {
    marginLeft: -metrics.hp3,
  },
  pill: {
    height: metrics.hp6,
    width: metrics.hp14,
    justifyContent: "center",
    alignItems: "center",
  },
  pillContent: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: metrics.hp1,
  },
  label: {
    marginTop: -metrics.hp0_5,
  },
});

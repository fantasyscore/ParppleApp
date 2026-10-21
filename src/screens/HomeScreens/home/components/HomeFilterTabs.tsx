import React, { memo } from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import metrics from "../../../../assets/Metrics";
import { AppText, SCHEHERAZADE_BOLD, THIRTEEN, TWELVE } from "../../../../common/AppText";
import { TouchableOpacityView } from "../../../../common/TouchableOpacityView";
import { allusers, allusersBlack, nearbyusers, nearybyusersBlack, onlineusers, onlineusersBlack, tabViewForLikes, verifiedusers, verifiedusersBlack } from "../../../../helper/ImageAssets";
import { Screen } from "../../../../theme/dimens";
import { newColor } from "../../../../theme/colors";

export type HomeFilter = "all" | "nearby" | "verified" | "online";

// `icon` is for an inactive tab, `activeIcon` (the black artwork) for the selected one: no tinting
const FILTERS: { key: HomeFilter; label: string; icon: any; activeIcon: any }[] = [
  { key: "all", label: "All", icon: allusers, activeIcon: allusersBlack },
  { key: "nearby", label: "Near By", icon: nearbyusers, activeIcon: nearybyusersBlack },
  { key: "online", label: "Online", icon: onlineusers, activeIcon: onlineusersBlack },
  { key: "verified", label: "Verified", icon: verifiedusers, activeIcon: verifiedusersBlack },
];

// Same colours as the Likes You tabs
const ACTIVE_TINT = "#E6B7A8";
const INACTIVE_TINT = "#555359";
const INACTIVE_LABEL = "#FAFAFA66";

// Four pills that overlap a little and together span the screen minus the same side padding the list uses
const SIDE_PADDING = metrics.hp2;
const PILL_OVERLAP = Screen.Width * 0.03;
const PILL_WIDTH = (Screen.Width - SIDE_PADDING * 2 + PILL_OVERLAP * 3) / 4;

const ROW_VERTICAL_MARGIN = metrics.hp1;
const PILL_HEIGHT = metrics.hp5_5;
/** Total height of the tab row: the list needs it to place its items (getItemLayout) */
export const FILTER_TABS_HEIGHT = PILL_HEIGHT + ROW_VERTICAL_MARGIN * 2;

interface HomeFilterTabsProps {
  selected: HomeFilter;
  onSelect: (filter: HomeFilter) => void;
}

/** All / Near By / Verified / Online: the Likes You tab design, with the selected pill on top. */
const HomeFilterTabs = ({ selected, onSelect }: HomeFilterTabsProps) => (
  <View style={styles.row}>
    {FILTERS.map((filter, index) => {
      const active = selected === filter.key;
      return (
        <TouchableOpacityView
          key={filter.key}
          onPress={() => onSelect(filter.key)}
          activeOpacity={1}
          style={[index > 0 && styles.overlap, { zIndex: active ? 2 : 1, elevation: active ? 2 : 1 }]}
        >
          {/* Dark edges on the left and right of every pill (dark copies of it behind), so each tab stays visible
              where the pills overlap */}
          <ImageBackground
            source={tabViewForLikes}
            resizeMode="stretch"
            style={[styles.pill, styles.shadowPill, { transform: [{ translateX: -2.5 }, { translateY: 2 }] }]}
            imageStyle={{ tintColor: "#000000" }}
          />
          <ImageBackground
            source={tabViewForLikes}
            resizeMode="stretch"
            style={[styles.pill, styles.shadowPill, { transform: [{ translateX: 2.5 }, { translateY: 2 }] }]}
            imageStyle={{ tintColor: "#000000" }}
          />
          <ImageBackground
            source={tabViewForLikes}
            resizeMode="stretch"
            style={styles.pill}
            imageStyle={{ tintColor: active ? ACTIVE_TINT : INACTIVE_TINT }}
          >
            <View style={styles.pillContent}>
              {/* The black artwork for the selected tab, the normal one otherwise; no tinting */}
              <FastImage source={active ? filter.activeIcon : filter.icon} resizeMode="contain" style={styles.icon} />
              <AppText
                style={[styles.label, { color: active ? "black" : INACTIVE_LABEL }]}
                weight={SCHEHERAZADE_BOLD}
                type={THIRTEEN}
                numberOfLines={1}
              >
                {filter.label}
              </AppText>
            </View>
          </ImageBackground>
        </TouchableOpacityView>
      );
    })}
  </View>
);

export default memo(HomeFilterTabs);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignSelf: "stretch",
    paddingHorizontal: SIDE_PADDING,
    marginTop: -metrics.hp1,
    // marginBottom: metrics.hp1,
    zIndex: 3,
  },
  overlap: {
    marginLeft: -PILL_OVERLAP,
  },
  shadowPill: {
    position: "absolute",
    opacity: 0.6,
  },
  pill: {
    height: PILL_HEIGHT,
    width: PILL_WIDTH,
    justifyContent: "center",
    alignItems: "center",
  },
  pillContent: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: metrics.hp0_5,
  },
  icon: {
    width: metrics.hp2_22,
    height: metrics.hp2_22,
  },
  label: {
    marginTop: -metrics.hp0_5,
  },
});

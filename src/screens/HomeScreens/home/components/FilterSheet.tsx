import React from "react";
import { ImageBackground, ScrollView, StyleSheet, View } from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import FastImage from "react-native-fast-image";
import metrics from "../../../../assets/Metrics";
import { newColor } from "../../../../theme/colors";
import { AppText, BLACK, EIGHTEEN, fontSize, FORTEEN, INTER_SEMI_BOLD, SCHEHERAZADE_BOLD, TWELVE, WHITE } from "../../../../common/AppText";
import { TouchableOpacityView } from "../../../../common/TouchableOpacityView";
import { resetButtonNew, serachButtonNew, toggalOffButtonNew, toggalOnButtonNew } from "../../../../helper/ImageAssets";
import { SearchFilters } from "../hooks/useSearchFilters";

const SLIDER_COLORS = {
  selectedStyle: { backgroundColor: "#D08FA9" },
  unselectedStyle: { backgroundColor: "#555" },
  markerStyle: { backgroundColor: "#D08FA9", height: metrics.hp2_5, width: metrics.hp2_5, marginTop: metrics.hp0_5 },
};

const ToggleRow = ({ label, type, on, onPress }: { label: string; type?: typeof FORTEEN; on: boolean; onPress: () => void }) => (
  <View style={styles.filterRow}>
    <AppText type={type} weight={INTER_SEMI_BOLD} color={WHITE} style={styles.rowLabel}>
      {label}
    </AppText>
    <TouchableOpacityView onPress={onPress}>
      <FastImage source={on ? toggalOnButtonNew : toggalOffButtonNew} resizeMode="contain" style={styles.toggleIcon} />
    </TouchableOpacityView>
  </View>
);

/** "Search Preferences" bottom sheet: age range, global/radius toggle, photos-only toggle. */
const FilterSheet = ({ filters }: { filters: SearchFilters }) => {
  const {
    sheetRef,
    ageRange,
    setAgeRange,
    locationRadiusEnabled,
    toggleLocationRadius,
    radius,
    setRadius,
    photosOnly,
    togglePhotosOnly,
    isApplying,
    reset,
    apply,
  } = filters;

  return (
    <RBSheet
      ref={sheetRef}
      draggable={true}
      height={metrics.hp60}
      customStyles={{
        wrapper: { backgroundColor: "rgba(0,0,0,0.5)" },
        draggableIcon: { backgroundColor: "#E6B7A8" },
        container: {
          backgroundColor: newColor.blackNew,
          borderTopLeftRadius: metrics.hp3,
          borderTopRightRadius: metrics.hp3,
          paddingBottom: metrics.hp4,
        },
      }}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
        <AppText type={EIGHTEEN} weight={SCHEHERAZADE_BOLD} style={styles.sheetTitle}>
          Search Preferences
        </AppText>

        <View style={styles.separator} />

        <AppText weight={INTER_SEMI_BOLD} color={WHITE} style={[styles.filterLabel, styles.rowLabel]}>
          Age range {ageRange[0]} - {ageRange[1]}
        </AppText>
        <View style={styles.sliderWrapper}>
          <MultiSlider
            values={[ageRange[0], ageRange[1]]}
            sliderLength={metrics.wp80}
            onValuesChange={(values) => setAgeRange(values)}
            min={18}
            max={80}
            step={1}
            {...SLIDER_COLORS}
          />
        </View>

        <View style={[styles.separator, styles.separatorTight]} />

        <ToggleRow label="Global Radius" type={FORTEEN} on={locationRadiusEnabled} onPress={toggleLocationRadius} />
        {!locationRadiusEnabled ? (
          <>
            <View style={styles.radiusLabels}>
              <AppText type={TWELVE} weight={INTER_SEMI_BOLD} color={WHITE}>{radius} Km</AppText>
              <AppText type={TWELVE} weight={INTER_SEMI_BOLD} color={WHITE}>200 km</AppText>
            </View>
            <View style={styles.sliderWrapper}>
              <MultiSlider
                values={[radius[0]]}
                sliderLength={metrics.wp80}
                onValuesChange={(values) => setRadius(values)}
                min={0}
                max={200}
                step={1}
                {...SLIDER_COLORS}
              />
            </View>
          </>
        ) : null}

        <View style={[styles.separator, styles.separatorTight]} />

        <ToggleRow label="Photos Only" on={photosOnly} onPress={togglePhotosOnly} />

        <View style={[styles.separator, styles.separatorLoose]} />
      </ScrollView>

      <View style={styles.actionRow}>
        <TouchableOpacityView onPress={reset}>
          <ImageBackground source={resetButtonNew} resizeMode="contain" style={styles.actionButton}>
            <AppText color={WHITE} weight={SCHEHERAZADE_BOLD} type={EIGHTEEN}>
              Reset
            </AppText>
          </ImageBackground>
        </TouchableOpacityView>
        <TouchableOpacityView onPress={isApplying ? undefined : apply}>
          <ImageBackground
            source={serachButtonNew}
            resizeMode="contain"
            style={[styles.actionButton, isApplying && styles.actionButtonBusy]}
          >
            <AppText color={BLACK} weight={SCHEHERAZADE_BOLD} type={EIGHTEEN}>
              {isApplying ? "Applying..." : "Search"}
            </AppText>
          </ImageBackground>
        </TouchableOpacityView>
      </View>
    </RBSheet>
  );
};

export default FilterSheet;

const styles = StyleSheet.create({
  sheetContent: {
    paddingHorizontal: metrics.hp3,
    paddingTop: metrics.hp1,
  },
  sheetTitle: {
    textAlign: "center",
    marginBottom: metrics.hp2,
    color: "#E6B7A8",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: metrics.hp2,
    marginTop: -metrics.hp1,
  },
  separatorTight: {
    marginTop: metrics.hp1,
  },
  separatorLoose: {
    marginTop: metrics.hp2,
  },
  filterLabel: {
    marginBottom: metrics.hp1,
  },
  rowLabel: {
    fontSize: fontSize(14),
  },
  sliderWrapper: {
    alignItems: "center",
    marginTop: -metrics.hp1,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleIcon: {
    height: metrics.hp3_5,
    width: metrics.hp6,
  },
  radiusLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: metrics.hp2,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: metrics.hp2,
    paddingHorizontal: metrics.hp4,
  },
  actionButton: {
    height: metrics.hp6,
    width: metrics.hp18,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonBusy: {
    opacity: 0.5,
  },
});

import React from "react";
import { StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import metrics from "../../../../assets/Metrics";
import { colors } from "../../../../theme/colors";
import { AppText, ELEVEN, INTER_BOLD, WHITE } from "../../../../common/AppText";

/** Small rounded pill with an icon and a value (gender, age, height, city...). */
const InfoChip = ({ icon, text }: { icon: any; text: string }) => (
  <View style={styles.chip}>
    <FastImage source={icon} resizeMode="contain" style={styles.icon} tintColor={colors.white} />
    <AppText color={WHITE} weight={INTER_BOLD} type={ELEVEN}>
      {"  "}{text}
    </AppText>
  </View>
);

export default InfoChip;

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: metrics.hp1_5,
    paddingVertical: metrics.hp0_5,
    borderRadius: metrics.hp4,
    backgroundColor: "#5B6168",
    marginRight: metrics.hp1,
  },
  icon: {
    height: metrics.hp2,
    width: metrics.hp2,
  },
});

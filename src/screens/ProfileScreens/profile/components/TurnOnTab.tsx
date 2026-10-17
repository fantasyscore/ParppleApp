import React from "react";
import { FlatList, ImageBackground, StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import metrics from "../../../../assets/Metrics";
import { colors, newColor } from "../../../../theme/colors";
import { AppText, EIGHTEEN, ELEVEN, SCHEHERAZADE_BOLD } from "../../../../common/AppText";
import { TouchableOpacityView } from "../../../../common/TouchableOpacityView";
import { rightSelectTrunOns, trunOnBackground } from "../../../../helper/ImageAssets";
import { TURN_ON_IMAGES } from "../../../../helper/turnOnImages";

interface TurnOnTabProps {
  turnOns: any[];
  selectedIds: any[];
  onToggle: (id: any) => void;
}

/** The "Turn On" tab: tap a card to add / remove that turn-on from the profile. */
const TurnOnTab = ({ turnOns, selectedIds, onToggle }: TurnOnTabProps) => {
  const renderItem = ({ item }: any) => {
    const itemId = item._id || item.id;
    const isSelected = selectedIds.includes(itemId);
    return (
      <TouchableOpacityView activeOpacity={1} onPress={() => onToggle(itemId)}>
        <ImageBackground
          source={trunOnBackground}
          tintColor={isSelected ? "#E6B7A8" : "#555359"}
          resizeMode="cover"
          style={styles.card}
        >
          <FastImage source={TURN_ON_IMAGES[item.value]} resizeMode="contain" style={styles.icon} />
          <View style={styles.texts}>
            <AppText style={{ color: isSelected ? newColor.blackNew : "#E6B7A8" }} type={EIGHTEEN} weight={SCHEHERAZADE_BOLD}>
              {item.value}
            </AppText>
            <AppText
              type={ELEVEN}
              style={[styles.message, { color: isSelected ? newColor.blackNew : colors.white, opacity: isSelected ? 0.8 : 1 }]}
            >
              {item.message}
            </AppText>
          </View>
          {isSelected ? <FastImage source={rightSelectTrunOns} resizeMode="contain" style={styles.check} /> : null}
        </ImageBackground>
      </TouchableOpacityView>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={turnOns}
        renderItem={renderItem}
        keyExtractor={(item) => item._id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columns}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default TurnOnTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: metrics.hp2,
  },
  listContent: {
    paddingHorizontal: metrics.hp2,
    alignItems: "center",
    marginTop: metrics.hp3,
    paddingBottom: metrics.hp5,
  },
  columns: {
    columnGap: metrics.hp2,
    marginTop: metrics.hp6,
  },
  card: {
    height: metrics.hp21,
    width: metrics.hp20,
    marginBottom: metrics.hp2,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    height: metrics.hp17,
    width: metrics.hp17,
    position: "absolute",
    top: -metrics.hp8,
  },
  texts: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: metrics.hp2,
  },
  message: {
    textAlign: "center",
    marginTop: -metrics.hp1,
  },
  check: {
    height: metrics.hp3,
    width: metrics.hp3,
    position: "absolute",
    right: metrics.hp2,
    bottom: metrics.hp2,
  },
});

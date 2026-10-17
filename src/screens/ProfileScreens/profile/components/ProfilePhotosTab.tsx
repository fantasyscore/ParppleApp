import React, { useMemo } from "react";
import { FlatList, ImageBackground, Platform, StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import metrics from "../../../../assets/Metrics";
import { colors } from "../../../../theme/colors";
import { AppText, INTER_BOLD, OPECITY, SCHEHERAZADE_BOLD, SIXTEEN, TWELVE } from "../../../../common/AppText";
import { TouchableOpacityView } from "../../../../common/TouchableOpacityView";
import { trunOnBackground, uploadIcon } from "../../../../helper/ImageAssets";
import { ProfilePhoto } from "../hooks/useProfilePhotos";

type Slot = ProfilePhoto | { id: "upload-box"; isUploadBox: true };

interface ProfilePhotosTabProps {
  photos: ProfilePhoto[];
  canAddMore: boolean;
  onUpload: () => void;
  onDelete: (photo: ProfilePhoto) => void;
}

/** The "Photos" tab: an upload tile followed by the profile's photos, each deletable. */
const ProfilePhotosTab = ({ photos, canAddMore, onUpload, onDelete }: ProfilePhotosTabProps) => {
  const slots: Slot[] = useMemo(
    () => [...(canAddMore ? [{ id: "upload-box" as const, isUploadBox: true as const }] : []), ...photos],
    [canAddMore, photos]
  );

  const renderSlot = ({ item }: { item: Slot }) => {
    if ("isUploadBox" in item) {
      return (
        <ImageBackground source={trunOnBackground} resizeMode="stretch" style={styles.frame}>
          <View style={styles.itemWrapper}>
            <TouchableOpacityView onPress={onUpload} style={styles.box}>
              <FastImage source={uploadIcon} resizeMode="contain" tintColor={colors.white} style={styles.uploadIcon} />
              <AppText type={SIXTEEN} weight={SCHEHERAZADE_BOLD} color={OPECITY}>
                Upload
              </AppText>
            </TouchableOpacityView>
          </View>
        </ImageBackground>
      );
    }

    return (
      <ImageBackground source={trunOnBackground} resizeMode="stretch" style={styles.frame}>
        <View style={styles.itemWrapper}>
          <View style={styles.box}>
            {item.image ? (
              <View style={styles.fill}>
                <FastImage source={{ uri: item.image }} style={styles.fill} resizeMode="cover" />
                {item.loading && (
                  <View style={styles.deletingOverlay}>
                    <AppText color={OPECITY} weight={INTER_BOLD} type={TWELVE}>
                      Deleting...
                    </AppText>
                  </View>
                )}
              </View>
            ) : null}
          </View>

          {item.image && !item.loading && (
            <TouchableOpacityView onPress={() => onDelete(item)} style={styles.deleteButton}>
              <AppText color={colors.white} weight={INTER_BOLD} style={styles.deleteText}>×</AppText>
            </TouchableOpacityView>
          )}
        </View>
      </ImageBackground>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={slots}
        renderItem={renderSlot}
        keyExtractor={(item, index) => item.id || String(index)}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columns}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default ProfilePhotosTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: metrics.hp2,
  },
  listContent: {
    marginTop: metrics.hp4,
    paddingBottom: metrics.hp10,
  },
  columns: {
    gap: metrics.hp1,
  },
  frame: {
    height: metrics.hp22,
    width: metrics.hp20,
    marginBottom: metrics.hp4,
    alignItems: "center",
    justifyContent: "center",
  },
  itemWrapper: {
    height: metrics.hp18,
    width: metrics.hp16,
    position: "relative",
  },
  box: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#151517",
  },
  fill: {
    width: "100%",
    height: "100%",
  },
  uploadIcon: {
    height: metrics.hp3,
    width: metrics.hp3,
    marginTop: metrics.hp1,
  },
  deletingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    position: "absolute",
    top: metrics.hp0_5,
    right: metrics.hp0_5,
    width: metrics.hp2,
    height: metrics.hp2,
    backgroundColor: "red",
    borderRadius: metrics.hp2_5 / 2,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    elevation: 5,
  },
  deleteText: {
    color: "white",
    fontSize: metrics.hp1_8,
    lineHeight: metrics.hp1_8,
    textAlign: "center",
    fontWeight: "600",
    marginTop: Platform.OS === "ios" ? metrics.hp0_1 : -metrics.hp0_2,
  },
});

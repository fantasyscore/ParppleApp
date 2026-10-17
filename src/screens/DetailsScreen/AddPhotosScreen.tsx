import React, { useState } from "react";
import { FlatList, ImageBackground, Platform, StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import { useDispatch, useSelector } from "react-redux";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { AppText, fontSize, INTER_BOLD, INTER_SEMI_BOLD, OPECITY, RED, SCHEHERAZADE_BOLD, SCHEHERAZADE_SEMI_BOLD, SIXTEEN, THIRTEEN, TWELVE, WHITE } from "../../common/AppText";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import metrics from "../../assets/Metrics";
import { colors, newColor } from "../../theme/colors";
import { addPhotoImageTop, BottomLayer, trunOnBackground, uploadIcon } from "../../helper/ImageAssets";
import { toastAlert } from "../../actions/UploadImageActions";
import { deletePhotoAPI } from "../../actions/authActions";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_LOCATION_SCREEN } from "../../navigation/routes";
import { setAddProfile } from "../../slices/loginServices/authSlice";
import { useLatest } from "../../hooks/useLatest";
import PhotoEditorModal from "../../components/PhotoEditor/PhotoEditorModal";
import { usePhotoEditorUpload, UploadedPhoto } from "../../components/PhotoEditor/usePhotoEditorUpload";
import OnboardingLogo from "../../components/Onboarding/OnboardingLogo";
import OnboardingButton from "../../components/Onboarding/OnboardingButton";

const SLOT_COUNT = 4;
const MIN_PHOTOS = 2;

interface PhotoSlot {
  id: string;
  image: string;
  imageId: string;
  loading: boolean;
}

const emptySlot = (position: number): PhotoSlot => ({ id: String(position), image: "", imageId: "", loading: false });
const createEmptySlots = () => Array.from({ length: SLOT_COUNT }, (_, index) => emptySlot(index + 1));

/** Sign-up step: add 2-4 photos. Each photo goes through the shared crop / sticker / upload pipeline. */
const AddPhotoScreen = () => {
  const dispatch = useDispatch();
  const addProfileData = useSelector((state: any) => state?.auth?.addProfileData);
  const addProfileDataRef = useLatest(addProfileData);
  const [photos, setPhotos] = useState<PhotoSlot[]>(createEmptySlots);
  const photosRef = useLatest(photos);

  const updateSlot = (index: number, patch: Partial<PhotoSlot>) =>
    setPhotos((prev) => prev.map((photo, i) => (i === index ? { ...photo, ...patch } : photo)));

  const { pickAndEdit, editorVisible, editorProps } = usePhotoEditorUpload({
    canStart: () => {
      if (photosRef.current.some((photo) => photo.loading)) {
        toastAlert.showToastError("Please wait for the current uploading to finish.");
        return false;
      }
      return true;
    },
    // No profile exists yet during sign-up, so the gender being entered is the one to use
    getGender: () => addProfileDataRef.current?.gender,
    onUploaded: (slotIndex: number, uploaded: UploadedPhoto) =>
      updateSlot(slotIndex, { image: uploaded.url, imageId: uploaded.imageId, loading: false }),
  });

  // Removes the slot at `index` and shifts the remaining photos left
  const removeSlotAndShiftLeft = (index: number) => {
    setPhotos((prev) => {
      const remaining = prev.filter((_, i) => i !== index);
      return [...remaining, emptySlot(0)].map((photo, i) => ({ ...photo, id: String(i + 1) }));
    });
  };

  const deleteImage = async (photo: PhotoSlot, index: number) => {
    if (photo.loading) return;

    // Never reached the backend: just clear it locally
    if (!photo.imageId) {
      removeSlotAndShiftLeft(index);
      return;
    }

    updateSlot(index, { loading: true });
    try {
      const res = await dispatch(deletePhotoAPI({ imageId: photo.imageId }) as any);
      if (res?.statusCode === 200 || res?.success || res?.code === 200) {
        removeSlotAndShiftLeft(index);
      } else {
        updateSlot(index, { loading: false });
        toastAlert.showToastError(res?.message || "Failed to delete image");
      }
    } catch (err: any) {
      console.error("[AddPhotosScreen] Delete API error:", err);
      updateSlot(index, { loading: false });
      toastAlert.showToastError(err?.message || "An error occurred while deleting the image");
    }
  };

  const uploadedPhotos = photos.filter((photo) => photo.image !== "");
  const remaining = Math.max(0, MIN_PHOTOS - uploadedPhotos.length);

  const onSubmit = () => {
    if (remaining > 0) {
      toastAlert.showToastError(`Please add ${remaining} more photo${remaining > 1 ? "s" : ""} to continue`);
      return;
    }
    dispatch(
      setAddProfile({
        ...addProfileData,
        gallery: uploadedPhotos.map((photo, index) => ({ priority: index === 0, url: photo.image })),
        fieldVisibility: { ...addProfileData?.fieldVisibility },
      })
    );
    NavigationService.navigate(NAVIGATION_LOCATION_SCREEN);
  };

  const renderSlot = ({ item, index }: { item: PhotoSlot; index: number }) => (
    <ImageBackground source={trunOnBackground} resizeMode="stretch" style={styles.trunback}>
      <View style={styles.itemWrapper}>
        <TouchableOpacityView
          onPress={() => {
            if (!item.image) pickAndEdit(index);
          }}
          style={styles.boxContainer}
          disabled={item.loading}
        >
          {item.image ? (
            <View style={styles.fill}>
              <FastImage source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
              {item.loading && (
                <View style={styles.deletingOverlay}>
                  <AppText color={OPECITY} weight={INTER_BOLD} type={TWELVE}>
                    Deleting...
                  </AppText>
                </View>
              )}
            </View>
          ) : (
            <>
              <FastImage source={uploadIcon} resizeMode="contain" tintColor={colors.white} style={styles.icon} />
              <AppText type={SIXTEEN} weight={SCHEHERAZADE_BOLD} color={OPECITY}>
                Upload
              </AppText>
            </>
          )}
        </TouchableOpacityView>

        {item.image && !item.loading && (
          <TouchableOpacityView onPress={() => deleteImage(item, index)} style={styles.deleteButtonContainer}>
            <AppText color={colors.white} weight={INTER_BOLD} style={styles.deleteButtonText}>×</AppText>
          </TouchableOpacityView>
        )}
      </View>
    </ImageBackground>
  );

  return (
    <AppSafeAreaView color={newColor.blackNew}>
      <OnboardingLogo />
      <AppText style={styles.title} weight={SCHEHERAZADE_SEMI_BOLD} color={WHITE}>
        Add Your Photos
      </AppText>
      <FastImage source={addPhotoImageTop} resizeMode="contain" style={styles.topArt} />
      <FlatList
        data={photos}
        renderItem={renderSlot}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.listColumns}
      />
      <AppText style={styles.minimumText} color={RED} weight={INTER_SEMI_BOLD} type={THIRTEEN}>
        Minimum {MIN_PHOTOS} photos are required
      </AppText>
      {remaining === 0 ? (
        <ImageBackground source={BottomLayer} resizeMode="stretch" style={styles.bottomLayer}>
          <OnboardingButton label="Next" onPress={onSubmit} activeOpacity={1} />
        </ImageBackground>
      ) : null}
      {editorVisible && <PhotoEditorModal {...editorProps} />}
    </AppSafeAreaView>
  );
};

export default AddPhotoScreen;

const styles = StyleSheet.create({
  title: {
    textAlign: "center",
    fontSize: fontSize(26),
    marginTop: metrics.hp1,
  },
  topArt: {
    height: metrics.hp20,
    width: metrics.hp20,
    marginTop: metrics.hp20,
    left: metrics.hp12,
    position: "absolute",
  },
  listContent: {
    alignItems: "center",
    marginTop: metrics.hp13,
  },
  listColumns: {
    columnGap: metrics.hp2,
  },
  trunback: {
    height: metrics.hp22,
    width: metrics.hp20,
    marginBottom: metrics.hp4,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomLayer: {
    height: metrics.hp15,
    width: "100%",
    paddingVertical: metrics.hp2,
    alignItems: "center",
  },
  itemWrapper: {
    height: metrics.hp18,
    width: metrics.hp16,
    position: "relative",
  },
  boxContainer: {
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
  icon: {
    height: metrics.hp3,
    width: metrics.hp3,
    marginTop: metrics.hp1,
  },
  image: {
    height: "100%",
    width: "100%",
  },
  deletingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonContainer: {
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
  deleteButtonText: {
    color: "white",
    fontSize: metrics.hp1_8,
    lineHeight: metrics.hp1_8,
    textAlign: "center",
    fontWeight: "600",
    marginTop: Platform.OS === "ios" ? metrics.hp0_1 : -metrics.hp0_2,
  },
  minimumText: {
    position: "absolute",
    bottom: metrics.hp12,
    left: metrics.hp10,
  },
});

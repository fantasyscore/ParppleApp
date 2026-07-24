import React, { useRef, useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { Alert, Dimensions, FlatList, ImageBackground, Modal, PermissionsAndroid, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { AppText, EIGHTEEN, ELEVEN, fontSize, INTER_BOLD, INTER_MEDIUM, LIGHT_BLACK, OPECITY, OPECITY_DARK, RED, SCHEHERAZADE_BOLD, SCHEHERAZADE_SEMI_BOLD, SIXTEEN, TWELVE, TWENTY, WHITE } from "../../common/AppText";
import metrics from "../../assets/Metrics";
import { addPhotoImageTop, applogo, BottomLayer, trunOnBackground, uploadIcon } from "../../helper/ImageAssets";
import { colors, newColor } from "../../theme/colors";
import FastImage from "react-native-fast-image";
import { launchImageLibrary } from "react-native-image-picker";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import GoButton from "../../common/GoButton";
import { toastAlert } from "../../actions/UploadImageActions";
import { useDispatch, useSelector } from "react-redux";
import { addProfile, deletePhotoAPI, discoverProfile, getNewMatches, getProfile, uploadImagesPhotoAPI } from "../../actions/authActions";
import LinearGradient from "react-native-linear-gradient";
import { check, request, PERMISSIONS, RESULTS, openSettings } from "react-native-permissions";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_LOCATION_SCREEN } from "../../navigation/routes";
import { setAddProfile } from "../../slices/loginServices/authSlice";
import PhotoEditorModal, { PhotoEditorResult } from "../../components/PhotoEditor/PhotoEditorModal";
import { analyzeFaceForMask, FaceMaskAnalysis } from "../../helper/faceMask";

interface PermissionResult {
  granted: boolean;
  newlyGranted: boolean;
}

async function requestGalleryPermission(): Promise<PermissionResult> {
  if (Platform.OS === "android") {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES || PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: "Gallery Permission",
          message: "App needs access to your photos to upload them.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
      return { granted: isGranted, newlyGranted: false };
    } catch (err) {
      console.warn("Android permission error:", err);
      return { granted: false, newlyGranted: false };
    }
  } else {
    // iOS permission handling
    try {
      const permission = PERMISSIONS.IOS.PHOTO_LIBRARY;
      const checkResult = await check(permission);

      if (checkResult === RESULTS.GRANTED || checkResult === RESULTS.LIMITED) {
        return { granted: true, newlyGranted: false };
      }

      if (checkResult === RESULTS.BLOCKED) {
        Alert.alert(
          "Photo Library Permission Required",
          "Photo library access is disabled. Please enable it in your device Settings to choose profile photos.",
          [
            { text: "Open Settings", onPress: () => openSettings().catch(() => null) },
            { text: "Cancel", style: "cancel" },
          ]
        );
        return { granted: false, newlyGranted: false };
      }

      // Request permission if not determined
      const requestResult = await request(permission);
      if (requestResult === RESULTS.BLOCKED) {
        Alert.alert(
          "Photo Library Permission Required",
          "Photo library access is disabled. Please enable it in your device Settings to choose profile photos.",
          [
            { text: "Open Settings", onPress: () => openSettings().catch(() => null) },
            { text: "Cancel", style: "cancel" },
          ]
        );
      }
      const isAllowed = requestResult === RESULTS.GRANTED || requestResult === RESULTS.LIMITED;
      return { granted: isAllowed, newlyGranted: isAllowed };
    } catch (err) {
      console.warn("iOS permission error:", err);
      return { granted: false, newlyGranted: false };
    }
  }
}

const AddPhotoScreen = () => {
  const dispatch = useDispatch();
  const addProfileData = useSelector((state: any) => state?.auth?.addProfileData);
  const datalistnew = new Array(1).fill(null).map((_, index) => ({ id: String(index) }));
  const [photos, setPhotos] = useState<{ id: string; image: string; imageId: string; loading: boolean }[]>(
    Array(4)
      .fill(null)
      .map((_, i) => ({ id: String(i + 1), image: "", imageId: "", loading: false }))
  );

  // The editor pipeline works on exactly one photo at a time: the slot being
  // filled, the untouched local image, and the (optional) auto-detected face
  const [editorState, setEditorState] = useState<{
    visible: boolean;
    slotIndex: number;
    imageUri: string;
    analysis: FaceMaskAnalysis | null;
    fileName: string;
    fileType: string;
  }>({ visible: false, slotIndex: -1, imageUri: "", analysis: null, fileName: "", fileType: "" });
  const [editorBusy, setEditorBusy] = useState(false);

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const isPickerOpenRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState("")
  const onLongPressImage = (imageUri: string) => {
    if (!imageUri) return;
    setPreviewImage(imageUri);
    setPreviewVisible(true);
  };

  const updateSlot = (
    index: number,
    patch: Partial<{ image: string; imageId: string; loading: boolean }>
  ) => setPhotos((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));

  /**
   * Step 1 of the flow: pick ONE photo for the tapped slot. Nothing is
   * uploaded here — the photo goes straight into the editor, and only the
   * flattened result the editor hands back ever reaches the network.
   */
  const pickImageForSlot = async (index: number) => {
    if (isPickerOpenRef.current || editorState.visible) {
      console.log("[AddPhotosScreen] pickImageForSlot: picker or editor already open. Request ignored.");
      return;
    }

    const isAnyLoading = photos.some((p) => p.loading);
    if (isAnyLoading) {
      toastAlert.showToastError("Please wait for the current uploading to finish.");
      return;
    }

    try {
      const permissionResult = await requestGalleryPermission();
      console.log("[AddPhotosScreen] pickImageForSlot permission result:", permissionResult);

      if (!permissionResult.granted) {
        return;
      }

      isPickerOpenRef.current = true;

      // Safe presentation buffer delay for first-time grants on iOS
      if (Platform.OS === "ios" && permissionResult.newlyGranted) {
        console.log("[AddPhotosScreen] Newly granted iOS photo permission. Deferring picker presentation by 800ms...");
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      console.log("[AddPhotosScreen] Launching image library for single image selection...");
      launchImageLibrary(
        {
          mediaType: "photo",
          selectionLimit: 1,
          // Full quality: the editor needs the original pixels, and the only
          // file ever uploaded is the flattened editor output
          quality: 1,
          ...(Platform.OS === 'ios' && { presentationStyle: 'pageSheet' })
        },
        async (res: any) => {
          isPickerOpenRef.current = false;

          if (res.didCancel) {
            console.log("[AddPhotosScreen] Image picker cancelled by user.");
            return;
          }
          if (res.errorCode || res.errorMessage) {
            console.error("[AddPhotosScreen] Image picker error:", res.errorMessage || res.errorCode);
            return;
          }
          const asset = res.assets?.[0];
          if (!asset?.uri) {
            console.log("[AddPhotosScreen] No asset selected.");
            return;
          }

          // Step 2: try automatic face detection; the editor opens either way.
          // A valid analysis auto-places the mask, null falls back to the
          // manual sticker editor.
          const analysis = await analyzeFaceForMask(asset.uri);
          setEditorState({
            visible: true,
            slotIndex: index,
            imageUri: asset.uri,
            analysis,
            fileName: asset.fileName || `image_${Date.now()}.jpg`,
            fileType: asset.type || "image/jpeg",
          });
        }
      );
    } catch (e) {
      console.error("[AddPhotosScreen] pickImageForSlot outer exception:", e);
      isPickerOpenRef.current = false;
    }
  };

  /** Uploads a local image file. Returns the failure message, if any. */
  const uploadEditedImage = async (
    file: { uri: string; name: string; type: string },
    slotIndex: number
  ): Promise<{ ok: boolean; message?: string }> => {
    try {
      const formData = new FormData();
      formData.append("image", {
        uri: file.uri,
        type: file.type,
        name: file.name,
      } as any);

      const response: any = await dispatch(uploadImagesPhotoAPI(formData));
      console.log("[AddPhotosScreen] Photo upload response:", response);

      if (response?.statusCode === 200 && response?.data && response?.data?.success !== false) {
        const imageUrl =
          typeof response.data === "string"
            ? response.data
            : response.data.url || response.data.image || response.data.fileUrl || "";
        const imageId = response.data?._id || response.data?.id || "";
        if (imageUrl) {
          updateSlot(slotIndex, { image: imageUrl, imageId, loading: false });
          return { ok: true };
        }
      }
      return {
        ok: false,
        message: response?.data?.message || response?.message || "Unsupported image format or size.",
      };
    } catch (err: any) {
      console.error("[AddPhotosScreen] Photo upload failed:", err);
      return { ok: false, message: err?.message || "An error occurred during upload. Please try again." };
    }
  };

  const closeEditor = () =>
    setEditorState({ visible: false, slotIndex: -1, imageUri: "", analysis: null, fileName: "", fileType: "" });

  /**
   * Shared tail of the editor flow: upload the given file while the editor
   * stays open behind a busy overlay; close it only once the backend has the
   * URL. Failures offer Retry (same file) or Cancel (nothing saved, editor
   * stays open so the user's edits aren't lost).
   */
  const uploadFromEditor = async (file: { uri: string; name: string; type: string }) => {
    const { slotIndex } = editorState;
    setEditorBusy(true);
    let done = false;
    while (!done) {
      const outcome = await uploadEditedImage(file, slotIndex);
      if (outcome.ok) {
        done = true;
        setEditorBusy(false);
        closeEditor();
      } else {
        setResponseMessage(outcome.message || "");
        const choice = await new Promise<"retry" | "cancel">((resolve) => {
          Alert.alert(
            "Upload Failed",
            outcome.message || "Something went wrong while uploading this photo.",
            [
              { text: "Cancel", style: "cancel", onPress: () => resolve("cancel") },
              { text: "Retry", onPress: () => resolve("retry") },
            ],
            { cancelable: false }
          );
        });
        if (choice === "cancel") {
          done = true;
          setEditorBusy(false);
        }
      }
    }
  };

  /** Done: upload the flattened editor output (always a JPEG). */
  const onEditorDone = (result: PhotoEditorResult) =>
    uploadFromEditor({
      uri: result.uri,
      name: editorState.fileName.replace(/\.[^.]+$/, "") + "_edited.jpg",
      type: "image/jpeg",
    });

  /** Skip: upload the original picked photo untouched, in its native format. */
  const onEditorSkip = () =>
    uploadFromEditor({
      uri: editorState.imageUri,
      name: editorState.fileName,
      type: editorState.fileType,
    });

  const onEditorCancel = () => {
    if (editorBusy) return;
    closeEditor();
  };

  // Removes the slot at `index` and shifts the remaining photos left
  const removeSlotAndShiftLeft = (index: number) => {
    setPhotos((prev) => {
      const remainingSlots = prev.filter((_, i) => i !== index);
      return [...remainingSlots, { id: "", image: "", imageId: "", loading: false }].map(
        (item, idx) => ({
          id: String(idx + 1),
          image: item.image || "",
          imageId: item.imageId || "",
          loading: item.loading || false,
        })
      );
    });
  };

  const deleteImage = async (item: any, index: number) => {
    if (item.loading) return; // Prevent duplicate requests

    // If it's just "Unsupported" local state, just clear it immediately
    if (item.image === "Unsupported") {
      removeSlotAndShiftLeft(index);
      return;
    }

    const imageId = item.imageId;

    if (!imageId) {
      // Fallback: clear and shift left locally
      removeSlotAndShiftLeft(index);
      return;
    }

    // 1. Show loading state on the deleting slot
    setPhotos((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], loading: true };
      return updated;
    });

    try {
      // 2. Call the delete image API
      const res = await dispatch(deletePhotoAPI({ imageId }) as any);

      if (res?.statusCode === 200 || res?.success || res?.code === 200) {
        // 3. Delete was successful. We now remove the image from the local list
        // and shift subsequent images to the left to maintain order/priority.
        removeSlotAndShiftLeft(index);
      } else {
        // Handle failure: reset loading
        setPhotos((prev) => {
          const updated = [...prev];
          updated[index] = { ...updated[index], loading: false };
          return updated;
        });
        toastAlert.showToastError(res?.message || "Failed to delete image");
      }
    } catch (err: any) {
      console.error("[AddPhotosScreen] Delete API error:", err);
      // Handle failure: reset loading
      setPhotos((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], loading: false };
        return updated;
      });
      toastAlert.showToastError(err?.message || "An error occurred while deleting the image");
    }
  };

  const uploadedCount = photos.filter((p) => p.image !== "" && p.image !== "Unsupported").length;
  const minRequired = 1;
  const remaining = Math.max(0, minRequired - uploadedCount);

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <ImageBackground source={trunOnBackground} resizeMode="stretch" style={styles.trunback}>
      <View style={styles.itemWrapper}>
        <TouchableOpacityView
          onPress={() => {
            if (!item.image || item.image === "Unsupported") {
              pickImageForSlot(index);
            }
          }}
          onLongPress={() => onLongPressImage(item.image)}
          style={[styles.boxContainer, { width: "100%", height: "100%", marginBottom: 0 }]}
          disabled={item.loading}
        >
          {item.image && item.image !== "Unsupported" ? (
            <View style={{ width: "100%", height: "100%" }}>
              <FastImage source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
              {item.loading && (
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" }]}>
                  <AppText color={OPECITY} weight={INTER_BOLD} type={TWELVE}>
                    Deleting...
                  </AppText>
                </View>
              )}
            </View>
          ) : item.loading ? (
            <View style={styles.loaderContainer}>
              <AppText color={OPECITY} weight={INTER_BOLD}>
                Uploading...
              </AppText>
            </View>
          ) : item.image === "Unsupported" ? (
            <View style={styles.loaderContainer}>
              <AppText color={RED} weight={INTER_BOLD}>
                Unsupported
              </AppText>
            </View>
          ) : (
            <>
              <FastImage source={uploadIcon} resizeMode="contain" tintColor={colors.white} style={[styles.icon, { marginTop: metrics.hp1 }]} />
              <AppText type={SIXTEEN} weight={SCHEHERAZADE_BOLD} color={OPECITY}>
                Upload
              </AppText>
            </>
          )}
        </TouchableOpacityView>

        {item.image && !item.loading && (
          <TouchableOpacityView
            onPress={() => deleteImage(item, index)}
            style={styles.deleteButtonContainer}
          >
            <AppText color={colors.white} weight={INTER_BOLD} style={styles.deleteButtonText}>×</AppText>
          </TouchableOpacityView>
        )}
      </View>
    </ImageBackground>
  );



  const onSubmit = async () => {
    // if (isSubmitting) return;
    if (remaining > 0) return toastAlert.showToastError(`Please add ${remaining} more photo${remaining > 1 ? "s" : ""} to continue`);

    setIsSubmitting(true);
    const uploadedPhotos = photos.filter((p) => p.image !== "" && p.image !== "Unsupported");
    const galleryData = uploadedPhotos.map((p, index) => ({
      priority: index === 0,
      url: p.image,
    }));
    try {
      const dataToSave = {
        ...addProfileData,
        gallery: galleryData,
        fieldVisibility: { ...addProfileData?.fieldVisibility }
      };
      console.log(dataToSave, "dataToSavedataToSave")
      dispatch(setAddProfile(dataToSave));
      NavigationService.navigate(NAVIGATION_LOCATION_SCREEN);
    } finally {
      setIsSubmitting(false);
    }
  };
  const unsupportedImage = photos.find(
    item => item.image === "Unsupported"
  );
  const onSkip = () => {
    const dataToSave = {
      ...addProfileData,
      gallery: [],
      fieldVisibility: { ...addProfileData?.fieldVisibility }
    };
    dispatch(setAddProfile(dataToSave));
    NavigationService.navigate(NAVIGATION_LOCATION_SCREEN);
  }


  return (
    <AppSafeAreaView color={newColor.blackNew}>
      <FastImage source={applogo} resizeMode="contain" style={styles.logo} />
      <AppText style={{ textAlign: "center", fontSize: fontSize(26), marginTop: metrics.hp1 }} weight={SCHEHERAZADE_SEMI_BOLD} color={WHITE}>
        Add Your Photos
      </AppText>
      <FastImage source={addPhotoImageTop} resizeMode="contain" style={{ height: metrics.hp20, width: metrics.hp20, marginTop: metrics.hp20, left: metrics.hp12, position: "absolute" }} />
      <FlatList
        data={photos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ alignItems: "center", marginTop: metrics.hp13 }}
        columnWrapperStyle={{ columnGap: metrics.hp2 }}
      />
      {remaining !== 0 ?
        <TouchableOpacity onPress={() => onSkip()} style={{ width: metrics.hp10, alignSelf: "flex-end" }}>
          <AppText style={styles.skipText} type={TWENTY} weight={SCHEHERAZADE_BOLD} color={WHITE}>
            Skip
          </AppText>
        </TouchableOpacity>
        : <></>}
      {remaining === 0 ?
        <ImageBackground source={BottomLayer} resizeMode="stretch" style={styles.bottomLayer}>
          <TouchableOpacity activeOpacity={1} onPress={() => onSubmit()} style={styles.phoneContainer}>
            <AppText weight={SCHEHERAZADE_BOLD} color={WHITE} type={TWENTY}>
              Next
            </AppText>
          </TouchableOpacity>
        </ImageBackground> : <></>
      }
      {editorState.visible && (
        <PhotoEditorModal
          visible={editorState.visible}
          imageUri={editorState.imageUri}
          analysis={editorState.analysis}
          busy={editorBusy}
          busyLabel="Uploading..."
          onCancel={onEditorCancel}
          onDone={onEditorDone}
          onSkip={onEditorSkip}
        />
      )}

      {/* <HeaderCommon />
      <View style={styles.container}>
        <TopCommonLine icon={addPhotoIcon} datalist={datalistnew} />
        <View style={{ paddingHorizontal: metrics.hp2 }}>
          <DubleTextLine firstText={"Add your photos"} />
          <AppText style={{ marginTop: -metrics.hp2 }} type={TWELVE} weight={INTER_MEDIUM} color={OPECITY}>
            Upload atleast 1 photos to start
          </AppText>
          <AppText style={{ marginTop: metrics.hp5, marginBottom: metrics.hp1 }} color={OPECITY_DARK} weight={INTER_MEDIUM} type={TWELVE}>
            Press hold to preview image
          </AppText>
          <FlatList
            data={photos}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={3}
            columnWrapperStyle={{ gap: metrics.hp2 }}
          />
          {unsupportedImage ?
            <AppText type={TWELVE} weight={INTER_MEDIUM} color={RED}>
              {responseMessage}
            </AppText> :
            <>
              {remaining > 0 && (
                <AppText color={RED} weight={INTER_MEDIUM} type={TWELVE}>
                  Please add {remaining} more photo{remaining > 1 ? "s" : ""} to continue
                </AppText>
              )}
            </>
          }

        </View>
      </View>
      <LinearGradient start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }} style={{ height: metrics.hp19 }} colors={["#ffffff50", colors.white, colors.white]}>
        <View style={{ marginTop: metrics.hp9 }}>
          <GoButton
            colortrue={remaining == 0 ? true : false}
            disabled={isSubmitting}
            onPress={() => onSubmit()}
          />
        </View>
      </LinearGradient>
      {previewVisible && (
        <Modal visible={previewVisible} transparent animationType="fade">
          <View style={styles.modalBackground}>
            <TouchableOpacityView
              style={styles.modalCloseArea}
              onPress={() => setPreviewVisible(false)}
            />
            <FastImage
              source={{ uri: previewImage }}
              style={styles.fullImage}
              resizeMode="cover"
            />
            <TouchableOpacityView
              style={styles.closeButton}
              onPress={() => setPreviewVisible(false)}>
              <AppText weight={INTER_BOLD} type={ELEVEN} color={LIGHT_BLACK}>Close</AppText>
            </TouchableOpacityView>
          </View>
        </Modal>
      )} */}

    </AppSafeAreaView>
  );
};


export default AddPhotoScreen;

const styles = StyleSheet.create({
  trunback: {
    height: metrics.hp22,
    width: metrics.hp20,
    marginBottom: metrics.hp4,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    height: metrics.hp7,
    width: metrics.hp25,
    alignSelf: "center",
    marginTop: metrics.hp8,
  },
  bottomLayer: {
    height: metrics.hp15,
    width: "100%",
    paddingVertical: metrics.hp2,
    alignItems: "center"
  },
  phoneContainer: {
    height: metrics.hp7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: metrics.hp0_1,
    borderColor: colors.white,
    marginHorizontal: metrics.hp2,
    marginTop: metrics.hp2,
    width: "90%"
  },
  container: {
    marginTop: metrics.hp3,
    flex: 1,
  },
  itemWrapper: {
    height: metrics.hp18,
    width: metrics.hp16,
    position: "relative",
  },
  boxContainer: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#151517"
  },
  icon: {
    height: metrics.hp3,
    width: metrics.hp3,
  },
  image: {
    height: "100%",
    width: "100%",
  },
  loaderContainer: {
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    // backgroundColor: colors,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: colors.transparentBlack,
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: Dimensions.get("window").width * 0.9,
    height: Dimensions.get("window").height * 0.7,
    borderRadius: metrics.hp3,
  },
  closeButton: {
    position: "absolute",
    bottom: metrics.hp5,
    backgroundColor: colors.white,
    paddingHorizontal: metrics.hp3,
    paddingVertical: metrics.hp1,
    borderRadius: metrics.hp5,

  },
  modalCloseArea: {
    ...StyleSheet.absoluteFillObject,
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
  skipText: {
    alignSelf: "flex-end",
    marginRight: metrics.hp3,
    marginBottom: metrics.hp5
  }
});

import React, { useRef, useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { Alert, Dimensions, FlatList, ImageBackground, Modal, PermissionsAndroid, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import HeaderCommon from "../../common/HeaderCommon";
import TopCommonLine from "../../common/TopCommonLine";
import DubleTextLine from "../../common/DubleTextLine";
import { AppText, EIGHTEEN, ELEVEN, fontSize, INTER_BOLD, INTER_MEDIUM, LIGHT_BLACK, OPECITY, OPECITY_DARK, RED, SCHEHERAZADE_BOLD, SCHEHERAZADE_SEMI_BOLD, SIXTEEN, TWELVE, TWENTY, WHITE } from "../../common/AppText";
import metrics from "../../assets/Metrics";
import { addPhotoIcon, applogo, BottomLayer, trunOnBackground, uploadIcon } from "../../helper/ImageAssets";
import { colors, newColor } from "../../theme/colors";
import FastImage from "react-native-fast-image";
import { launchImageLibrary } from "react-native-image-picker";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import GoButton from "../../common/GoButton";
import { toastAlert } from "../../actions/UploadImageActions";
import { useDispatch, useSelector } from "react-redux";
import { addProfile, deletePhotoAPI, discoverProfile, getNewMatches, getProfile, uploadImagesPhotoAPI } from "../../actions/authActions";
import { Image as ImageCompressor } from "react-native-compressor";
import LinearGradient from "react-native-linear-gradient";
import { check, request, PERMISSIONS, RESULTS, openSettings } from "react-native-permissions";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_LOCATION_SCREEN } from "../../navigation/routes";
import { setAddProfile } from "../../slices/loginServices/authSlice";

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
  const [photos, setPhotos] = useState(
    Array(4)
      .fill({ id: "", image: "", imageId: "", loading: false })
      .map((_, i) => ({ id: String(i + 1), image: "", imageId: "", loading: false }))
  );

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
  const pickMultipleImages = async () => {
    // Prevent multiple simultaneous picker launches
    if (isPickerOpenRef.current) {
      console.log("[AddPhotosScreen] pickMultipleImages: picker is already open or transitioning. Request ignored.");
      return;
    }

    const isAnyLoading = photos.some((p) => p.loading);
    if (isAnyLoading) {
      toastAlert.showToastError("Please wait for the current action to finish.");
      return;
    }

    try {
      const permissionResult = await requestGalleryPermission();
      console.log("[AddPhotosScreen] pickMultipleImages permission result:", permissionResult);

      if (!permissionResult.granted) {
        return;
      }

      const currentCount = photos.filter((p) => p.image !== "" && p.image !== "Unsupported").length;
      const remainingSlots = 6 - currentCount;

      if (remainingSlots <= 0) {
        toastAlert.showToastError("You can upload a maximum of 6 photos only.");
        return;
      }

      isPickerOpenRef.current = true;

      // Safe presentation buffer delay for first-time grants on iOS
      if (Platform.OS === "ios" && permissionResult.newlyGranted) {
        console.log("[AddPhotosScreen] Newly granted iOS photo permission. Deferring picker presentation by 800ms...");
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      console.log("[AddPhotosScreen] Launching image library for multiple images selection...");
      launchImageLibrary(
        {
          mediaType: "photo",
          selectionLimit: remainingSlots,
          quality: 0.8,
          ...(Platform.OS === 'ios' && { presentationStyle: 'pageSheet' })
        },
        async (res: any) => {
          // Always reset the flag when picker closes
          isPickerOpenRef.current = false;

          // Handle cancellation or errors
          if (res.didCancel) {
            console.log("[AddPhotosScreen] Multiple images picker cancelled by user.");
            return;
          }
          if (res.errorCode || res.errorMessage) {
            console.error("[AddPhotosScreen] Image picker error:", res.errorMessage || res.errorCode);
            return;
          }
          if (!res.assets || res.assets.length === 0) {
            console.log("[AddPhotosScreen] No assets selected.");
            return;
          }

          const assets = res.assets.slice(0, remainingSlots);
          console.log(`[AddPhotosScreen] Selected ${assets.length} image(s) to upload.`);

          // Set loading state
          setPhotos((prev) => {
            const updated = [...prev];
            let count = 0;
            for (let i = 0; i < updated.length && count < assets.length; i++) {
              if (updated[i].image === "") {
                updated[i].loading = true;
                count++;
              }
            }
            return updated;
          });

          // Process uploads asynchronously after state update
          try {
            const uploadedUrls: { url: string; imageId: string }[] = [];

            for (const asset of assets) {
              try {
                const compressedUri = await ImageCompressor.compress(asset.uri, {
                  compressionMethod: "auto",
                  quality: 0.6,
                  maxWidth: 720,
                  maxHeight: 1080,
                });

                const formData = new FormData();
                formData.append("image", {
                  uri: compressedUri,
                  type: asset.type || "image/jpeg",
                  name: asset.fileName || `image_${Date.now()}.jpg`,
                } as any);

                const response: any = await dispatch(uploadImagesPhotoAPI(formData));
                console.log("[AddPhotosScreen] Upload response:", response);

                if (response?.statusCode === 200 && response?.data) {
                  const imageUrl = typeof response.data === 'string' ? response.data : (response.data.url || response.data.image || response.data.fileUrl || "");
                  const imageId = response.data?._id || response.data?.id || "";
                  uploadedUrls.push({ url: imageUrl || "Unsupported", imageId });
                  if (response?.data?.success === false || imageUrl === "Unsupported") {
                    setResponseMessage(response?.data?.message || response?.message || "Unsupported image format or size.");
                  }
                } else {
                  uploadedUrls.push({ url: "Unsupported", imageId: "" });
                  setResponseMessage(response?.message || response?.data?.message || "Unsupported image format or size.");
                }
              } catch (err) {
                console.error("[AddPhotosScreen] Compression or upload failed:", err);
                uploadedUrls.push({ url: "Unsupported", imageId: "" });
                setResponseMessage("Compression or upload failed. Please try a different image.");
              }
            }

            // Update photos with uploaded URLs
            setPhotos((prev) => {
              let uploadIndex = 0;
              const finalPhotos = prev.map((p) => {
                if (p.loading && p.image === "" && uploadIndex < uploadedUrls.length) {
                  const newImage = uploadedUrls[uploadIndex].url;
                  const newId = uploadedUrls[uploadIndex].imageId;
                  uploadIndex++;
                  return { ...p, loading: false, image: newImage, imageId: newId };
                }
                return p;
              });
              return finalPhotos;
            });
          } catch (err) {
            console.error("[AddPhotosScreen] Upload processing failed:", err);
            setPhotos((prev) => prev.map((p) => ({ ...p, loading: false })));
          }
        }
      );
    } catch (e) {
      console.error("[AddPhotosScreen] pickMultipleImages outer exception:", e);
      isPickerOpenRef.current = false;
    }
  };

  const pickSingleImage = async (index: number) => {
    // Prevent multiple simultaneous picker launches
    if (isPickerOpenRef.current) {
      console.log("[AddPhotosScreen] pickSingleImage: picker is already open or transitioning. Request ignored.");
      return;
    }

    const isAnyLoading = photos.some((p) => p.loading);
    if (isAnyLoading) {
      toastAlert.showToastError("Please wait for the current uploading to finish.");
      return;
    }

    try {
      const permissionResult = await requestGalleryPermission();
      console.log("[AddPhotosScreen] pickSingleImage permission result:", permissionResult);

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
          quality: 0.8,
          ...(Platform.OS === 'ios' && { presentationStyle: 'pageSheet' })
        },
        async (res: any) => {
          // Always reset the flag when picker closes
          isPickerOpenRef.current = false;

          // Handle cancellation or errors
          if (res.didCancel) {
            console.log("[AddPhotosScreen] Single image picker cancelled by user.");
            return;
          }
          if (res.errorCode || res.errorMessage) {
            console.error("[AddPhotosScreen] Image picker error:", res.errorMessage || res.errorCode);
            return;
          }
          if (!res.assets || res.assets.length === 0) {
            console.log("[AddPhotosScreen] No asset selected.");
            return;
          }

          // Set loading state
          setPhotos((prev) => {
            const updated = [...prev];
            updated[index].loading = true;
            return updated;
          });

          // Process upload asynchronously after state update
          try {
            const compressedUri = await ImageCompressor.compress(res.assets[0].uri, {
              compressionMethod: "auto",
              quality: 0.6,
              maxWidth: 720,
              maxHeight: 1080,
            });

            const formData = new FormData();
            formData.append("image", {
              uri: compressedUri,
              type: res.assets[0].type || "image/jpeg",
              name: res.assets[0].fileName || `image_${Date.now()}.jpg`,
            } as any);

            const response: any = await dispatch(uploadImagesPhotoAPI(formData));
            console.log("[AddPhotosScreen] Single upload response:", response);

            setPhotos((prev) => {
              const updated = [...prev];
              updated[index].loading = false;
              if (response?.statusCode === 200 && response?.data) {
                const imageUrl = typeof response.data === 'string' ? response.data : (response.data.url || response.data.image || response.data.fileUrl || "");
                const imageId = response.data?._id || response.data?.id || "";
                updated[index].image = imageUrl || "Unsupported";
                updated[index].imageId = imageId;
                if (response?.data?.success === false || imageUrl === "Unsupported") {
                  setResponseMessage(response?.data?.message || response?.message || "Unsupported image format or size.");
                }
              } else {
                updated[index].image = "Unsupported";
                setResponseMessage(response?.message || response?.data?.message || "Unsupported image format or size.");
              }
              return updated;
            });
          } catch (err) {
            console.error("[AddPhotosScreen] Single upload failed:", err);
            setResponseMessage("An error occurred during upload. Please try a different image.");
            setPhotos((prev) => {
              const updated = [...prev];
              updated[index].loading = false;
              updated[index].image = "Unsupported";
              return updated;
            });
          }
        }
      );
    } catch (e) {
      console.error("[AddPhotosScreen] pickSingleImage outer exception:", e);
      isPickerOpenRef.current = false;
    }
  };


  const deleteImage = async (item: any, index: number) => {
    if (item.loading) return; // Prevent duplicate requests

    // If it's just "Unsupported" local state, just clear it immediately
    if (item.image === "Unsupported") {
      setPhotos((prev) => {
        const remainingSlots = prev.filter((_, i) => i !== index);
        return [...remainingSlots, { image: "", imageId: "", loading: false }]
          .map((item, idx) => {
            const img = item.image || "";
            return {
              id: String(idx + 1),
              image: img,
              imageId: item.imageId || "",
              loading: item.loading || false,
            };
          });
      });
      return;
    }

    const imageId = item.imageId;

    if (!imageId) {
      // Fallback: clear and shift left locally
      setPhotos((prev) => {
        const remainingSlots = prev.filter((_, i) => i !== index);
        return [...remainingSlots, { image: "", imageId: "", loading: false }]
          .map((item, idx) => {
            const img = item.image || "";
            return {
              id: String(idx + 1),
              image: img,
              imageId: item.imageId || "",
              loading: item.loading || false,
            };
          });
      });
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
        setPhotos((prev) => {
          const remainingSlots = prev.filter((_, i) => i !== index);
          return [...remainingSlots, { image: "", imageId: "", loading: false }]
            .map((item, idx) => {
              const img = item.image || "";
              return {
                id: String(idx + 1),
                image: img,
                imageId: item.imageId || "",
                loading: item.loading || false,
              };
            });
        });
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
              pickMultipleImages();
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
      console.log(dataToSave,"dataToSavedataToSave")
      dispatch(setAddProfile(dataToSave));
      NavigationService.navigate(NAVIGATION_LOCATION_SCREEN);
    } finally {
      setIsSubmitting(false);
    }
  };
  const unsupportedImage = photos.find(
    item => item.image === "Unsupported"
  );
  const onSkip =()=>{
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
      <FlatList
        data={photos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ alignItems: "center", marginTop: metrics.hp10 }}
        columnWrapperStyle={{ columnGap: metrics.hp2 }}
      />
      {remaining !== 0 ?
      <TouchableOpacity onPress={()=>onSkip()} style={{ width:metrics.hp10, alignSelf:"flex-end"}}>
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

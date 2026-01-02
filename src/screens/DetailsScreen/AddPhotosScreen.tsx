import React, { useRef, useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { Dimensions, FlatList, Modal, PermissionsAndroid, Platform, StyleSheet, View } from "react-native";
import HeaderCommon from "../../common/HeaderCommon";
import TopCommonLine from "../../common/TopCommonLine";
import DubleTextLine from "../../common/DubleTextLine";
import { AppText, ELEVEN, INTER_BOLD, INTER_MEDIUM, LIGHT_BLACK, OPECITY, OPECITY_DARK, RED, TWELVE } from "../../common/AppText";
import metrics from "../../assets/Metrics";
import { addPhotoIcon, uploadIcon } from "../../helper/ImageAssets";
import { colors } from "../../theme/colors";
import FastImage from "react-native-fast-image";
import { launchImageLibrary } from "react-native-image-picker";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import GoButton from "../../common/GoButton";
import { toastAlert, uploadImageCloud } from "../../actions/UploadImageActions";
import { useDispatch, useSelector } from "react-redux";
import { addProfile, discoverProfile, getNewMatches, getProfile } from "../../actions/authActions";
import { Image as ImageCompressor } from "react-native-compressor";
import LinearGradient from "react-native-linear-gradient";
async function requestGalleryPermission() {
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
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  } else {
    return true; // iOS auto handles
  }
}

const AddPhotoScreen = () => {
  const dispatch = useDispatch();
  const addProfileData = useSelector((state: any) => state?.auth?.addProfileData);
  const datalistnew = new Array(1).fill(null).map((_, index) => ({ id: String(index) }));
  const [photos, setPhotos] = useState(
    Array(6)
      .fill({ id: "", image: "", loading: false })
      .map((_, i) => ({ id: String(i + 1), image: "", loading: false }))
  );
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const isPickerOpenRef = useRef(false);
  
  const onLongPressImage = (imageUri: string) => {
    if (!imageUri) return;
    setPreviewImage(imageUri);
    setPreviewVisible(true);
  };
  const pickMultipleImages = async () => {
    // Prevent multiple simultaneous picker launches
    if (isPickerOpenRef.current) return;
    
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    isPickerOpenRef.current = true;

    launchImageLibrary(
      { 
        mediaType: "photo", 
        selectionLimit: 6,
        quality: 0.8,
        ...(Platform.OS === 'ios' && { presentationStyle: 'pageSheet' })
      }, 
      async (res: any) => {
        // Always reset the flag when picker closes
        isPickerOpenRef.current = false;
        
        // Handle cancellation or errors
        if (res.didCancel) return;
        if (res.errorCode || res.errorMessage) {
          console.error("Image picker error:", res.errorMessage);
          return;
        }
        if (!res.assets || res.assets.length === 0) return;

      const assets = res.assets.slice(0, 6);

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
        const uploadedUrls: string[] = [];

        for (const asset of assets) {
          try {
            const compressedUri = await ImageCompressor.compress(asset.uri, {
              compressionMethod: "auto",
              quality: 0.6,
              maxWidth: 720,
              maxHeight: 1080,
            });

            const cloudUrl = await uploadImageCloud(compressedUri);
            uploadedUrls.push(cloudUrl);
          } catch (err) {
            console.error("Compression or upload failed:", err);
            uploadedUrls.push("");
          }
        }

          // Update photos with uploaded URLs
        setPhotos((prev) => {
          const updated = [...prev];
          let uploadIndex = 0;
          for (let i = 0; i < updated.length && uploadIndex < uploadedUrls.length; i++) {
            if (updated[i].loading) {
              updated[i].loading = false;
              if (uploadedUrls[uploadIndex]) updated[i].image = uploadedUrls[uploadIndex];
              uploadIndex++;
            }
          }
          return updated;
        });
      } catch (err) {
        console.error("Upload failed:", err);
        setPhotos((prev) => prev.map((p) => ({ ...p, loading: false })));
      }
      }
    );
  };

  const pickSingleImage = async (index: number) => {
    // Prevent multiple simultaneous picker launches
    if (isPickerOpenRef.current) return;
    
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    isPickerOpenRef.current = true;

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
        if (res.didCancel) return;
        if (res.errorCode || res.errorMessage) {
          console.error("Image picker error:", res.errorMessage);
          return;
        }
        if (!res.assets || res.assets.length === 0) return;

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

        const cloudUrl = await uploadImageCloud(compressedUri);
        setPhotos((prev) => {
          const updated = [...prev];
          updated[index].loading = false;
          updated[index].image = cloudUrl;
          return updated;
        });
      } catch (err) {
        console.error("Single upload failed:", err);
        setPhotos((prev) => {
          const updated = [...prev];
          updated[index].loading = false;
          return updated;
        });
      }
      }
    );
  };


  const uploadedCount = photos.filter((p) => p.image !== "").length;
  const minRequired = 2;
  const remaining = Math.max(0, minRequired - uploadedCount);

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacityView
      onPress={() => (item.image ? pickSingleImage(index) : pickMultipleImages())}
      onLongPress={() => onLongPressImage(item.image)} // 👈 added
      style={styles.boxContainer}
      disabled={item.loading}
    >
      {item.loading ? (
        <View style={styles.loaderContainer}>
          <AppText color={LIGHT_BLACK} weight={INTER_BOLD}>
            Uploading...
          </AppText>
        </View>
      ) : item.image ? (
        <FastImage source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
      ) : (
        <FastImage source={uploadIcon} resizeMode="contain" style={styles.icon} />
      )}
    </TouchableOpacityView>
  );


  const onSubmit = () => {
    if (remaining > 0) return toastAlert.showToastError(`Please add ${remaining} more photo${remaining > 1 ? "s" : ""} to continue`)
    const uploadedPhotos = photos.filter((p) => p.image !== "");
    const galleryData = uploadedPhotos.map((p, index) => ({
      priority: index === 0,
      url: p.image,
    }));
    const data = {
      ...addProfileData,
      gallery: galleryData,
      fieldVisibility: { ...addProfileData?.fieldVisibility }
    };
    console.log(data, "datadatadata");

    dispatch(addProfile(data));
    dispatch(getProfile(true));
    dispatch(discoverProfile());
    dispatch(getNewMatches())
  };

  return (
    <AppSafeAreaView>
      <HeaderCommon />
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
          {remaining > 0 && (
            <AppText color={RED} weight={INTER_MEDIUM} type={TWELVE}>
              Please add {remaining} more photo{remaining > 1 ? "s" : ""} to continue
            </AppText>
          )}
        </View>
      </View>
      <LinearGradient start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }} style={{ height: metrics.hp19 }} colors={["#ffffff50", colors.white, colors.white]}>
        <View style={{ marginTop: metrics.hp9 }}>
          <GoButton colortrue={remaining == 0 ? true : false} onPress={() => onSubmit()} />
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
      )}

    </AppSafeAreaView>
  );
};


export default AddPhotoScreen;

const styles = StyleSheet.create({
  container: {
    marginTop: metrics.hp3,
    flex: 1,
  },
  boxContainer: {
    height: metrics.hp12,
    width: "30%",
    borderWidth: metrics.hp0_1,
    borderColor: colors.opecity,
    marginBottom: metrics.hp1,
    borderRadius: metrics.hp1_5,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
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

});

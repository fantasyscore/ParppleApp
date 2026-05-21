import React, { useEffect, useState, useRef } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { Alert, FlatList, PermissionsAndroid, Platform, ScrollView, StyleSheet, TextInput, View, Modal, Dimensions } from "react-native";
import HeaderCommon from "../../common/HeaderCommon";
import metrics from "../../assets/Metrics";
import { Screen } from "../../theme/dimens";
import { colors } from "../../theme/colors";
import { AppText, BLACK, EIGHT, EIGHTEEN, ELEVEN, fontSize, INTER_BOLD, INTER_EXTRA_BOLD, INTER_MEDIUM, INTER_SEMI_BOLD, LIGHT_BLACK, PURPLE, RED, TWELVE } from "../../common/AppText";
import FastImage from "react-native-fast-image";
import { aboutIcon, addPhotoIcon, bussnisIcon, childrenIcon, dateIcon, drikingIcon, familyIcon, ganderIcon, homeIcon, infoIcon, keywordRightArrow, langIcon, lifeStyleIcon, locIcon, moonIcon, moreAboutU, nameIcon, partnerheart, personHeartIcon, petsIcon, politicalIcon, pronounIcon, religiousIcon, schoolIcon, searchIcon, sexualityIcon, smookingIcon, straightenIcon, uploadIcon, workIcon } from "../../helper/ImageAssets";
import HeadLineContiner from "../../common/HeadLineContiner";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import { launchImageLibrary } from "react-native-image-picker";
import { interMedium } from "../../theme/typography";
import ButtonSheet from "../../common/ButtonSheet";
import EditButtonCommon from "../../common/EditButtonCommon";
import { dataPets, DrinkData, ExerciseData, SmokeData } from "../../common/UiltData";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_ABOUT_SCREEN, NAVIGATION_BELONG_SCREEN, NAVIGATION_CHILDERN_SCREEN, NAVIGATION_COMMONSELECT_PAGE_SCREEN, NAVIGATION_DATE_SCREEN, NAVIGATION_DATING_SCREEN, NAVIGATION_EDUCATION_SCREEN, NAVIGATION_FAMILY_PLANING_SCREEN, NAVIGATION_GANDER_SCREEN, NAVIGATION_HEIGHT_SCREEN, NAVIGATION_JOB_TITLE_SCREEN, NAVIGATION_LANGUAGE_SPEAK_SCREEN, NAVIGATION_LIFE_STYLE_SCREEN, NAVIGATION_NAME_SCREEN, NAVIGATION_PERSONAL_INTEREST_SCREEN, NAVIGATION_POLITICAL_SCREEN, NAVIGATION_PROFILE_STRENGTH_SCREEN, NAVIGATION_PRONOUN_SCREEN, NAVIGATION_RELATION_SCREEN, NAVIGATION_RELIGIOUS_SCREEN, NAVIGATION_SEXUALITY_SCREEN, NAVIGATION_USER_EDIT_PROFILE_SCREEN, NAVIGATION_WORK_PLACE_SCREEN, NAVIGATION_ZODIACSING_SCREEN } from "../../navigation/routes";
import { useDispatch, useSelector } from "react-redux";
import { attributesGet, editProfile, getProfile, uploadImagesPhotoAPI, deletePhotoAPI } from "../../actions/authActions";
import { toastAlert } from "../../actions/UploadImageActions";
import { Image as ImageCompressor } from "react-native-compressor";
import { check, request, PERMISSIONS, RESULTS, openSettings } from "react-native-permissions";

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

const EditProfileScreen = () => {
    const dispatch = useDispatch();
    const userData = useSelector((state: any) => state.auth.userData);
    const attributesRemove = userData?.attributes?.filter((item: any) =>
        ["smoke", "drink", "workout", "pets"].includes(item?.type)
    );
    const attributes = userData?.attributes?.filter(
        (item: any) => !["smoke", "drink", "workout", "pets"].includes(item?.type)
    );
    const [bio, setBio] = useState(userData?.bio);
    const workout = attributesRemove?.find((item: any) => item.type === "workout");
    const smoke = attributesRemove?.find((item: any) => item.type === "smoke");
    const drink = attributesRemove?.find((item: any) => item.type === "drink");
    const pets = attributesRemove?.find((item: any) => item.type === "pets");
    const idsOnlyRemo = attributesRemove.map((item: any) => item._id);
    const idsOnly = attributes.map((item: any) => item._id);

    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState("");
    const isPickerOpenRef = useRef(false);
    const [responseMessage, setResponseMessage] = useState("");

    const onLongPressImage = (imageUri: string) => {
        if (!imageUri || imageUri === "Unsupported") return;
        setPreviewImage(imageUri);
        setPreviewVisible(true);
    };

    useEffect(() => {
        setBio(userData?.bio)
    }, [userData?.bio])
    const [photos, setPhotos] = useState(
        Array(6)
            .fill({ id: "", image: "", imageId: "", loading: false })
            .map((_, i) => ({ id: String(i + 1), image: "", imageId: "", loading: false }))
    );
    useEffect(() => {
        if (userData?.gallery && Array.isArray(userData.gallery)) {
            setPhotos((prev) => {
                let galleryIndex = 0;
                return prev.map((item) => {
                    if (item.image === "Unsupported") {
                        return item;
                    }
                    if (item.loading) {
                        return item;
                    }
                    const galleryItem = userData.gallery[galleryIndex];
                    const url = galleryItem?.url || "";
                    const imageId = galleryItem?._id || galleryItem?.id || "";
                    galleryIndex++;
                    return { ...item, image: url, imageId: imageId };
                });
            });
        }
    }, [userData]);

    const deleteImage = async (item: any, index: number) => {
        if (item.loading) return; // Prevent duplicate requests

        // const isAnyLoading = photos.some((p) => p.loading);
        // if (isAnyLoading) {
        //     toastAlert.showToastError("Please wait for the current uploading to finish.");
        //     return;
        // }

        // If it's just "Unsupported" local state, just clear it immediately
        if (item.image === "Unsupported") {
            setPhotos((prev) => {
                const updated = [...prev];
                updated[index] = { ...updated[index], image: "", imageId: "", loading: false };
                return updated;
            });
            return;
        }

        // Find the image ID from userData gallery or state
        const galleryItem = userData?.gallery?.find((g: any) => g.url === item.image);
        const imageId = galleryItem?._id || galleryItem?.id || item.imageId;

        if (!imageId) {
            // Fallback: clear and shift left locally
            setPhotos((prev) => {
                const remainingSlots = prev.filter((_, i) => i !== index);
                return [...remainingSlots, { image: "", imageId: "", loading: false }]
                    .map((item, idx) => {
                        const img = item.image || "";
                        const matchingGalleryItem = userData?.gallery?.find((g: any) => g.url === img);
                        const matchingId = matchingGalleryItem?._id || matchingGalleryItem?.id || item.imageId || "";
                        return {
                            id: String(idx + 1),
                            image: img,
                            imageId: matchingId,
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
            const res = await dispatch(deletePhotoAPI({ imageId }));

            if (res?.statusCode === 200 || res?.success || res?.code === 200) {
                // 3. Delete was successful. We now remove the image from the local list
                // and shift subsequent images to the left to maintain order/priority,
                // while completely preserving any ongoing/pending uploading states!
                setPhotos((prev) => {
                    const remainingSlots = prev.filter((_, i) => i !== index);
                    const newPhotos = [...remainingSlots, { image: "", imageId: "", loading: false }]
                        .map((item, idx) => {
                            const img = item.image || "";
                            const matchingGalleryItem = userData?.gallery?.find((g: any) => g.url === img);
                            const matchingId = matchingGalleryItem?._id || matchingGalleryItem?.id || item.imageId || "";
                            return {
                                id: String(idx + 1),
                                image: img,
                                imageId: matchingId,
                                loading: item.loading || false,
                            };
                        });

                    // 4. Update the backend gallery state to save the new order/priority
                    const newGalleryData = newPhotos
                        .filter(p => p.image !== "" && p.image !== "Unsupported")
                        .map((p, idx) => ({
                            priority: idx === 0,
                            url: p.image,
                        }));

                    dispatch(editProfile({ gallery: newGalleryData }, true));

                    return newPhotos;
                });

                // toastAlert.showToastError("Image deleted successfully");
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
            console.error("[EditProfileScreen] Delete API error:", err);
            // Handle failure: reset loading
            setPhotos((prev) => {
                const updated = [...prev];
                updated[index] = { ...updated[index], loading: false };
                return updated;
            });
            toastAlert.showToastError(err?.message || "An error occurred while deleting the image");
        }
    };

    const pickMultipleImages = async () => {
        if (isPickerOpenRef.current) {
            console.log("[EditProfileScreen] pickMultipleImages: picker is already open or transitioning. Request ignored.");
            return;
        }

        const isAnyLoading = photos.some((p) => p.loading);
        if (isAnyLoading) {
            toastAlert.showToastError("Please wait for the current uploading to finish.");
            return;
        }

        try {
            const permissionResult = await requestGalleryPermission();
            console.log("[EditProfileScreen] pickMultipleImages permission result:", permissionResult);

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

            if (Platform.OS === "ios" && permissionResult.newlyGranted) {
                console.log("[EditProfileScreen] Newly granted iOS photo permission. Deferring picker presentation by 800ms...");
                await new Promise((resolve) => setTimeout(resolve, 800));
            }

            console.log("[EditProfileScreen] Launching image library for multiple images selection...");
            launchImageLibrary(
                {
                    mediaType: "photo",
                    selectionLimit: remainingSlots,
                    quality: 0.8,
                    ...(Platform.OS === 'ios' && { presentationStyle: 'pageSheet' })
                },
                async (res: any) => {
                    isPickerOpenRef.current = false;

                    if (res.didCancel) {
                        console.log("[EditProfileScreen] Multiple images picker cancelled by user.");
                        return;
                    }
                    if (res.errorCode || res.errorMessage) {
                        console.error("[EditProfileScreen] Image picker error:", res.errorMessage || res.errorCode);
                        return;
                    }
                    if (!res.assets || res.assets.length === 0) {
                        console.log("[EditProfileScreen] No assets selected.");
                        return;
                    }

                    const assets = res.assets.slice(0, remainingSlots);

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

                                const formData = new FormData();
                                formData.append("image", {
                                    uri: compressedUri,
                                    type: asset.type || "image/jpeg",
                                    name: asset.fileName || `image_${Date.now()}.jpg`,
                                } as any);

                                const response: any = await dispatch(uploadImagesPhotoAPI(formData));
                                console.log("[EditProfileScreen] Upload response:", response);

                                if (response?.statusCode === 200 && response?.data) {
                                    const imageUrl = typeof response.data === 'string' ? response.data : (response.data.url || response.data.image || response.data.fileUrl || "");
                                    uploadedUrls.push(imageUrl || "Unsupported");
                                    if (response?.data?.success === false) {
                                        setResponseMessage(response?.data?.message);
                                    }
                                } else {
                                    uploadedUrls.push("Unsupported");
                                }
                            } catch (err) {
                                console.error("[EditProfileScreen] Compression or upload failed:", err);
                                uploadedUrls.push("Unsupported");
                            }
                        }

                        setPhotos((prev) => {
                            let uploadIndex = 0;
                            const finalPhotos = prev.map((p) => {
                                if (p.loading && p.image === "" && uploadIndex < uploadedUrls.length) {
                                    const newImage = uploadedUrls[uploadIndex];
                                    uploadIndex++;
                                    return { ...p, loading: false, image: newImage };
                                }
                                return p;
                            });

                            const galleryData = finalPhotos
                                .filter((p) => p.image !== "" && p.image !== "Unsupported")
                                .map((p, index) => ({
                                    priority: index === 0,
                                    url: p.image,
                                }));

                            dispatch(editProfile({ gallery: galleryData }, true));

                            return finalPhotos;
                        });
                    } catch (err) {
                        console.error("[EditProfileScreen] Upload failed:", err);
                        setPhotos((prev) => prev.map((p) => ({ ...p, loading: false })));
                    }
                }
            );
        } catch (e) {
            console.error("[EditProfileScreen] pickMultipleImages outer exception:", e);
            isPickerOpenRef.current = false;
        }
    };

    const pickSingleImage = async (index: number) => {
        if (isPickerOpenRef.current) {
            console.log("[EditProfileScreen] pickSingleImage: picker is already open or transitioning. Request ignored.");
            return;
        }

        const isAnyLoading = photos.some((p) => p.loading);
        if (isAnyLoading) {
            toastAlert.showToastError("Please wait for the current action to finish.");
            return;
        }

        try {
            const permissionResult = await requestGalleryPermission();
            console.log("[EditProfileScreen] pickSingleImage permission result:", permissionResult);

            if (!permissionResult.granted) {
                return;
            }

            isPickerOpenRef.current = true;

            if (Platform.OS === "ios" && permissionResult.newlyGranted) {
                console.log("[EditProfileScreen] Newly granted iOS photo permission. Deferring picker presentation by 800ms...");
                await new Promise((resolve) => setTimeout(resolve, 800));
            }

            console.log("[EditProfileScreen] Launching image library for single image selection...");
            launchImageLibrary(
                {
                    mediaType: "photo",
                    selectionLimit: 1,
                    quality: 0.8,
                    ...(Platform.OS === 'ios' && { presentationStyle: 'pageSheet' })
                },
                async (res: any) => {
                    isPickerOpenRef.current = false;

                    if (res.didCancel) {
                        console.log("[EditProfileScreen] Single image picker cancelled by user.");
                        return;
                    }
                    if (res.errorCode || res.errorMessage) {
                        console.error("[EditProfileScreen] Image picker error:", res.errorMessage || res.errorCode);
                        return;
                    }
                    if (!res.assets || res.assets.length === 0) {
                        console.log("[EditProfileScreen] No asset selected.");
                        return;
                    }

                    setPhotos((prev) => {
                        const updated = [...prev];
                        updated[index].loading = true;
                        return updated;
                    });

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
                        console.log("[EditProfileScreen] Single upload response:", response);

                        let imageUrl = "Unsupported";
                        if (response?.statusCode === 200 && response?.data) {
                            imageUrl = typeof response.data === 'string' ? response.data : (response.data.url || response.data.image || response.data.fileUrl || "Unsupported");
                            if (response?.data?.success === false || imageUrl === "Unsupported") {
                                setResponseMessage(response?.data?.message || response?.message || "Unsupported image format or size.");
                            }
                        } else {
                            setResponseMessage(response?.message || response?.data?.message || "Unsupported image format or size.");
                        }

                        setPhotos((prev) => {
                            const updated = [...prev];
                            updated[index] = {
                                ...updated[index],
                                loading: false,
                                image: imageUrl,
                            };

                            const galleryData = updated
                                .filter((p) => p.image !== "" && p.image !== "Unsupported")
                                .map((p, i) => ({
                                    priority: i === 0,
                                    url: p.image,
                                }));

                            dispatch(editProfile({ gallery: galleryData }, true));

                            return updated;
                        });
                    } catch (err) {
                        console.error("[EditProfileScreen] Single upload failed:", err);
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
            console.error("[EditProfileScreen] pickSingleImage outer exception:", e);
            isPickerOpenRef.current = false;
        }
    };

    const renderItem = ({ item, index }: { item: any; index: number }) => {

        return (
            <View style={styles.itemWrapper}>
                <TouchableOpacityView
                    onPress={() => {
                        if (!item.image || item.image === "Unsupported") {
                            pickMultipleImages();
                        }
                    }}
                    onLongPress={() => onLongPressImage(item.image)}
                    style={[
                        styles.boxContainer,
                        { width: "100%", height: "100%", marginBottom: 0 }
                    ]}
                    disabled={item.loading}
                >
                    {item.image && item.image !== "Unsupported" ? (
                        <View style={{ width: "100%", height: "100%" }}>
                            <FastImage source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
                            {item.loading && (
                                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" }]}>
                                    <AppText color={colors.white} weight={INTER_BOLD} type={TWELVE}>
                                        Deleting...
                                    </AppText>
                                </View>
                            )}
                        </View>
                    ) : item.loading ? (
                        <View style={styles.loaderContainer}>
                            <AppText color={LIGHT_BLACK} weight={INTER_BOLD}>
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
                        <FastImage source={uploadIcon} resizeMode="contain" style={styles.icon} />
                    )}

                    {item.image && item.image !== "Unsupported" && index === 0 && (
                        <View style={styles.mainContainer}>
                            <AppText type={EIGHT} weight={INTER_MEDIUM} color={BLACK}>
                                Main
                            </AppText>
                        </View>
                    )}
                    {item.image && item.image !== "Unsupported" && index >= 1 && (
                        <View style={styles.indedxContainer}>
                            <AppText type={EIGHT} weight={INTER_MEDIUM} color={BLACK}>
                                {index}
                            </AppText>
                        </View>
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
        );
    };

    const uploadedCount = photos.filter((p) => p.image !== "" && p.image !== "Unsupported").length;
    const minRequired = 6;
    const remaining = Math.max(0, minRequired - uploadedCount);
    const onSubmit = () => {
        dispatch(getProfile())
    };
    const unsupportedImage = photos.find(
        item => item.image === "Unsupported"
    );

    return (
        <AppSafeAreaView>
            <HeaderCommon title={"Edit Profile"} edit={true} preview={true} PreviewOnpress={onSubmit} />
            <View style={styles.singleLine} />
            <ScrollView contentContainerStyle={{
                paddingHorizontal: metrics.hp2,
                paddingBottom: metrics.hp5
            }} showsVerticalScrollIndicator={false}>
                <AppText style={{ marginTop: metrics.hp2 }} type={TWELVE} weight={INTER_SEMI_BOLD}>
                    Profile Strength
                </AppText>
                <TouchableOpacityView disabled={true} onPress={() => NavigationService.navigate(NAVIGATION_PROFILE_STRENGTH_SCREEN)} style={styles.persentageContainer}>
                    <AppText color={PURPLE} weight={INTER_EXTRA_BOLD} type={EIGHTEEN}>
                        {Math.trunc(userData?.profileCompletion)}%
                    </AppText>
                    {/* <FastImage source={keywordRightArrow} resizeMode="contain" style={styles.keywordRightArrow} /> */}
                </TouchableOpacityView>
                <HeadLineContiner
                    circle={remaining == 2 ? true : false}
                    redText={"Add Now"}
                    secondLine={"Pick best your of your photos"}
                    Icons={addPhotoIcon} headLines={"My photos"} />
                <View>
                    <FlatList
                        data={photos}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        numColumns={3}
                        scrollEnabled={false}
                        contentContainerStyle={{ marginTop: metrics.hp2 }}
                        columnWrapperStyle={{ gap: metrics.hp2 }}
                    />
                </View>
                {unsupportedImage ?
                    <AppText type={TWELVE} weight={INTER_MEDIUM} color={RED}>
                        {responseMessage}
                    </AppText> :
                    <>
                        {remaining > 0 && (
                            <AppText color={RED} weight={INTER_MEDIUM} type={TWELVE}>
                                Add {remaining} of your best photos.
                            </AppText>
                        )}
                    </>
                }
                <View style={styles.singleLine} />
                <HeadLineContiner
                    redText={"Important"}
                    setting={false}
                    circle={bio}
                    secondLine={"Tell about yourself fun and interesting thing."}
                    Icons={aboutIcon} headLines={"My Bio"} />
                <TouchableOpacityView onPress={() => NavigationService.navigate(NAVIGATION_ABOUT_SCREEN, { filter: "Bio", data: userData?.bio })} style={styles.inputContainer}>
                    <TextInput
                        allowFontScaling={false}
                        placeholder="Write about you..."
                        placeholderTextColor={colors.opecity}
                        numberOfLines={5}
                        multiline={true}
                        maxLength={200}
                        editable={false}
                        onChangeText={(item) => setBio(item)}
                        value={bio}
                        style={{
                            fontSize: fontSize(12),
                            fontFamily: interMedium,
                            fontWeight: "500",
                            color: colors.black,
                        }}
                    />
                </TouchableOpacityView>
                <View style={styles.singleLine} />
                <HeadLineContiner
                    secondLine={"Add most specific interests you love"}
                    circle={attributes}
                    Icons={personHeartIcon} headLines={"My Interests"} />
                <ButtonSheet Icons={personHeartIcon}
                    titile={"Select"} edit={true} data={attributes}
                    onPress={() => { dispatch(attributesGet()), NavigationService.navigate(NAVIGATION_PERSONAL_INTEREST_SCREEN, { filter: "My Interests", data: attributes, ids: idsOnlyRemo }) }} />
                <View style={styles.singleLine} />
                <HeadLineContiner
                    circle={userData?.height && userData?.pronouns?.length && userData?.zodiaSign}
                    Icons={infoIcon} headLines={"Personal Info"} />
                <EditButtonCommon
                    first={true} Icons={pronounIcon}
                    title={"Pronoun"}
                    filluptext={userData?.pronouns
                        ?.map((item: any, index: any) =>
                            index === userData?.pronouns?.length - 1 ? `${item}` : `${item}, `
                        )
                        .join('')}
                    onPress={() => NavigationService.navigate(NAVIGATION_PRONOUN_SCREEN, { filter: "Pronoun", data: userData?.pronouns })} />
                <EditButtonCommon Icons={straightenIcon}
                    title={"Height"} filluptext={userData?.height}
                    onPress={() => NavigationService.navigate(NAVIGATION_HEIGHT_SCREEN, { filter: "Height", data: userData?.height })} />
                <EditButtonCommon Icons={moonIcon}
                    title={"Zodiac"} filluptext={userData?.zodiaSign}
                    hidden={userData?.fieldVisibility?.zodiaSign}
                    onPress={() => NavigationService.navigate(NAVIGATION_ZODIACSING_SCREEN, { filter: "Zodiac", data: userData?.zodiaSign, fieldVisibility: userData?.fieldVisibility })} />
                <View style={styles.singleLine} />
                <HeadLineContiner
                    circle={userData?.relationsShipStatus && userData?.preferredGender && userData?.relationshipPreference}
                    secondLine={"Covers most popular thing about you"}
                    Icons={moreAboutU} headLines={"More about you"} />
                <EditButtonCommon Icons={partnerheart}
                    title={"Relationship Status"}
                    first={true}
                    filluptext={userData?.relationsShipStatus}
                    onPress={() => NavigationService.navigate(NAVIGATION_RELATION_SCREEN, { filter: "Relationship Status", data: userData?.relationsShipStatus })} />
                <EditButtonCommon Icons={dateIcon}
                    title={"Whom to date"}
                    filluptext={userData?.preferredGender}
                    onPress={() => NavigationService.navigate(NAVIGATION_DATE_SCREEN, { filter: "Whom to date", data: userData?.preferredGender })} />
                <EditButtonCommon Icons={homeIcon}
                    title={"Dating Intentions"}
                    filluptext={userData?.relationshipPreference}
                    hidden={userData?.fieldVisibility?.relationshipPreference}
                    onPress={() => NavigationService.navigate(NAVIGATION_DATING_SCREEN, { filter: "Dating Intentions", data: userData?.relationshipPreference, fieldVisibility: userData?.fieldVisibility })} />
                <View style={styles.singleLine} />
                <HeadLineContiner
                    circle={smoke?.displayLabel && drink?.displayLabel && workout?.displayLabel && pets?.displayLabel}
                    Icons={lifeStyleIcon} headLines={"About Your Lifestyle"} />
                <EditButtonCommon Icons={smookingIcon}
                    title={"Smoke"}
                    filluptext={smoke?.displayLabel}
                    first={true}
                    onPress={() => { dispatch(attributesGet()), NavigationService.navigate(NAVIGATION_LIFE_STYLE_SCREEN, { filter: "Smoke", data: attributesRemove, ids: idsOnly }) }} />
                <EditButtonCommon Icons={drikingIcon}
                    title={"Drink"}
                    filluptext={drink?.displayLabel}
                    onPress={() => { dispatch(attributesGet()), NavigationService.navigate(NAVIGATION_LIFE_STYLE_SCREEN, { filter: "Drink", data: attributesRemove, ids: idsOnly }) }} />
                <EditButtonCommon Icons={workIcon}
                    title={"Workout"}
                    filluptext={workout?.displayLabel}
                    onPress={() => { dispatch(attributesGet()), NavigationService.navigate(NAVIGATION_LIFE_STYLE_SCREEN, { filter: "Workout", data: attributesRemove, ids: idsOnly }) }} />
                <EditButtonCommon Icons={petsIcon}
                    title={"Pets"}
                    filluptext={pets?.displayLabel}
                    onPress={() => { dispatch(attributesGet()), NavigationService.navigate(NAVIGATION_LIFE_STYLE_SCREEN, { filter: "Pets", data: attributesRemove, ids: idsOnly }) }} />
                {/* <EditButtonCommon Icons={religiousIcon}
                    title={"Religious Beliefs"}
                    hidden={userData?.fieldVisibility?.relegiousBelief}
                    filluptext={userData?.relegiousBelief
                        ?.map((item: any, index: any) =>
                            index === userData?.relegiousBelief?.length - 1 ? `${item}` : `${item}, `
                        )
                        .join('')}
                    onPress={() => NavigationService.navigate(NAVIGATION_RELIGIOUS_SCREEN, { filter: "Religious Beliefs", data: userData?.relegiousBelief, fieldVisibility: userData?.fieldVisibility })} /> */}
                <View style={styles.singleLine} />
                <HeadLineContiner
                    circle={userData?.education && userData?.work && userData?.jobTitle}
                    Icons={bussnisIcon} headLines={"Career Call"} />
                <EditButtonCommon Icons={schoolIcon}
                    title={"Education"}
                    first={true}
                    filluptext={userData?.education}
                    hidden={userData?.fieldVisibility?.education}
                    onPress={() => NavigationService.navigate(NAVIGATION_EDUCATION_SCREEN, { filter: "Education", data: userData?.education, fieldVisibility: userData?.fieldVisibility })} />
                <EditButtonCommon Icons={workIcon}
                    title={"Work"}
                    filluptext={userData?.work}
                    hidden={userData?.fieldVisibility?.work}
                    onPress={() => NavigationService.navigate(NAVIGATION_WORK_PLACE_SCREEN, { filter: "Work", data: userData?.work, fieldVisibility: userData?.fieldVisibility })} />
                <EditButtonCommon Icons={searchIcon}
                    title={"Job Title"}
                    filluptext={userData?.jobTitle}
                    hidden={userData?.fieldVisibility?.jobTitle}
                    onPress={() => NavigationService.navigate(NAVIGATION_JOB_TITLE_SCREEN, { filter: "Job Title", data: userData?.jobTitle, fieldVisibility: userData?.fieldVisibility })} />
                <View style={styles.singleLine} />
                <HeadLineContiner
                    circle={userData?.city && userData?.homeTown}
                    Icons={locIcon} headLines={"You belongs to"} />
                <EditButtonCommon Icons={locIcon}
                    title={"Location"}
                    filluptext={userData?.city}
                    first={true} />
                <EditButtonCommon Icons={homeIcon}
                    title={"Hometown"}
                    filluptext={userData?.homeTown}
                    hidden={userData?.fieldVisibility?.homeTown}
                    onPress={() => NavigationService.navigate(NAVIGATION_BELONG_SCREEN, { filter: "Hometown", data: userData?.homeTown, fieldVisibility: userData?.fieldVisibility })} />
                <View style={styles.singleLine} />
                <HeadLineContiner
                    circle={userData?.children && userData?.familyPlanning}
                    Icons={familyIcon} headLines={"Family Plans"} />
                <EditButtonCommon Icons={childrenIcon}
                    title={"Children"}
                    filluptext={userData?.children}
                    hidden={userData?.fieldVisibility?.children}
                    first={true}
                    onPress={() => NavigationService.navigate(NAVIGATION_CHILDERN_SCREEN, { filter: "Children", data: userData?.children, fieldVisibility: userData?.fieldVisibility })} />
                <EditButtonCommon Icons={familyIcon}
                    title={"Family Planning"}
                    filluptext={userData?.familyPlanning}
                    hidden={userData?.fieldVisibility?.familyPlanning}
                    onPress={() => NavigationService.navigate(NAVIGATION_FAMILY_PLANING_SCREEN, { filter: "Family Planning", data: userData?.familyPlanning, fieldVisibility: userData?.fieldVisibility })} />
                <View style={styles.singleLine} />
                <HeadLineContiner
                    circle={userData?.gender}
                    Icons={ganderIcon} headLines={"Gender"} />
                <ButtonSheet Icons={personHeartIcon} headLines={"What are their interests?"}
                    color={userData?.gender ? true : false}
                    titile={userData?.gender ? "Gender" : "Add Gender"} edit={true} hidden={userData?.fieldVisibility?.gender ? userData?.gender : "Hidden"}
                    /* onPress={() => NavigationService.navigate(NAVIGATION_GANDER_SCREEN, { filter: "Add Gender", data: userData?.gender, fieldVisibility: userData?.fieldVisibility })} */ />
                <View style={styles.singleLine} />
                <HeadLineContiner
                    circle={userData?.sexualOrientation} s
                    Icons={sexualityIcon} headLines={"Sexuality"} />
                <ButtonSheet Icons={personHeartIcon} headLines={"What are their interests?"}
                    titile={userData?.sexualOrientation ? "Sexuality" : "Add Sexuality"} edit={true} hidden={userData?.fieldVisibility?.sexualOrientation ? userData?.sexualOrientation : "Hidden"}
                    color={userData?.sexualOrientation ? true : false}
                    onPress={() => NavigationService.navigate(NAVIGATION_SEXUALITY_SCREEN, { filter: "Add Sexuality", data: userData?.sexualOrientation, fieldVisibility: userData?.fieldVisibility })} />
                <View style={styles.singleLine} />
                <HeadLineContiner
                    circle={userData?.languages?.length}
                    Icons={langIcon} headLines={"Language"} />
                <ButtonSheet Icons={personHeartIcon} headLines={"What are their interests?"}
                    titile={"Add Language"} edit={true} data={userData?.languages}
                    hidden={!userData?.fieldVisibility?.languages && "Hidden"}
                    onPress={() => NavigationService.navigate(NAVIGATION_LANGUAGE_SPEAK_SCREEN, { filter: "Add Language", data: userData?.languages, fieldVisibility: userData?.fieldVisibility })} />
            </ScrollView>
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
    )
};
export default EditProfileScreen;
const styles = StyleSheet.create({
    singleLine: {
        height: metrics.hp0_2,
        backgroundColor: colors.nanoOpecity,
        marginTop: metrics.hp2
    },
    persentageContainer: {
        height: metrics.hp5_5,
        borderRadius: metrics.hp1_5,
        backgroundColor: colors.lightTenGreen,
        borderWidth: metrics.hp0_1,
        borderColor: colors.darkGreenTen,
        marginTop: metrics.hp1,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: metrics.hp2,
        justifyContent: "space-between"
    },
    keywordRightArrow: {
        height: metrics.hp2_4,
        width: metrics.hp2_4
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
    inputContainer: {
        height: metrics.hp10,
        backgroundColor: colors.lightBack,
        borderRadius: metrics.hp1_5,
        marginTop: metrics.hp2,
        paddingHorizontal: metrics.hp1
    },
    mainContainer: {
        paddingHorizontal: metrics.hp0_5, paddingVertical: metrics.hp0_1, backgroundColor: colors.white, position: "absolute", borderRadius: metrics.hp3, top: metrics.hp1, left: metrics.hp1
    },
    indedxContainer: {
        height: metrics.hp1_7,
        width: metrics.hp1_7, backgroundColor: colors.white, position: "absolute", borderRadius: metrics.hp50, alignItems: "center", justifyContent: "center",
        top: metrics.hp1, left: metrics.hp1
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
    itemWrapper: {
        width: "30%",
        height: metrics.hp12,
        marginBottom: metrics.hp1,
        position: "relative",
    },
    deleteButtonContainer: {
        position: "absolute",
        top: metrics.hp0_5,
        right: metrics.hp0_5,
        width: metrics.hp2,
        height: metrics.hp2,
        borderRadius: metrics.hp1_2,
        backgroundColor: colors.red,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
        zIndex: 999,
    },
    deleteButtonText: {
        fontSize: fontSize(14),
        lineHeight: fontSize(14),
        color: colors.white,
        textAlign: "center",
        fontWeight:"600",
        marginTop: Platform.OS === 'ios' ? metrics.hp0_1 : -metrics.hp0_2,
    },
})
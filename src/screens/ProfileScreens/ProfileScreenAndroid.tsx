import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { Dimensions, FlatList, ImageBackground, Linking, Platform, ScrollView, StyleSheet, View, Modal, TextInput, Animated, ActivityIndicator, NativeModules, Alert } from "react-native";
import PeopleHeader from "../../common/PeopleHeader";
import { bioBackground, biosToggla, dobIcon, editButtonBackground, heightIconWhiteNew, locationIconWhiteNew, ProfileBackGroundNew, pronounIcon, tabViewForLikes, trunOnBackground, uploadIcon, beingWatchIcon, bitingIcon, blinedFlodedIcon, dirtyTalks, fantasiesIcon, fotFetiesIcon, hairIcon, hugsIcon, massageIcon, musicIcons, oralIcon, rightSelectTrunOns, roomServiceIcon, scentsIcon, sextingIcon, smooheshIcon, TattosIcon, BottomLayer, danceNewIcon, rolePlayImageNew, choclateImageNew, touchNewIcon, dummyMaleProfile, dummyfemaleProfile, sexualityIcon, applogo, modalBackground, verifiedBadgeIcon } from "../../helper/ImageAssets";
import metrics from "../../assets/Metrics";
import { colors, newColor } from "../../theme/colors";
import Svg, { Circle } from "react-native-svg";
import FastImage from "react-native-fast-image";
import { AppText, BLACK, EIGHTEEN, ELEVEN, FORTEEN, INTER_BOLD, INTER_EXTRA_BOLD, INTER_MEDIUM, INTER_REGULAR, INTER_SEMI_BOLD, LIGHT_BLACK, NINE, OPECITY, OPECITY_DARK, PURPLE, RED, SCHEHERAZADE_BOLD, SIXTEEN, SKYBLUE, TEN, THIRTEEN, TWELVE, TWENTY, TWENTY_TWO, WHITE } from "../../common/AppText";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import { premiumDetaiData, PurchaseCards, SafetyTips, TrustTransparency } from "../../common/UiltData";
import { Screen } from "../../theme/dimens";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_CRUSH_PURCHESE_SCREEN, NAVIGATION_EDIT_PROFILE_SCREEN, NAVIGATION_FILTER_SCREEN, NAVIGATION_PROFILE_BOOST_PURCHASE_SCREEN, NAVIGATION_SETTING_SCREEN, NAVIGATION_SUBSCRIPTION_ALL_SCREEN, NAVIGATION_SUBSCRIPTION_SCREEN, NAVIGATION_SUPERLIKE_PURCHESE_SCREEN, NAVIGATION_FACE_LIVENESS_TEST_SCREEN } from "../../navigation/routes";
import { useDispatch, useSelector } from "react-redux";
import { getProfile, editProfile, deletePhotoAPI, publishProfileEveryone } from "../../actions/authActions";
import { appOperation } from "../../appOperation";
import Carousel from "react-native-reanimated-carousel";
import NewHeader from "../../common/NewHeader";
import LinearGradient from "react-native-linear-gradient";
import { toastAlert } from "../../actions/UploadImageActions";
import { setProfileHide } from "../../slices/loginServices/authSlice";
import PhotoEditorModal from "../../components/PhotoEditor/PhotoEditorModal";
import { usePhotoEditorUpload, UploadedPhoto } from "../../components/PhotoEditor/usePhotoEditorUpload";
import { useIsFocused } from "@react-navigation/native";
import { check, openSettings, PERMISSIONS, request, RESULTS } from "react-native-permissions";

const TURN_ON_IMAGES: any = {
    "Smooches": smooheshIcon,
    "Hugs": hugsIcon,
    "Massage": massageIcon,
    "Oral": oralIcon,
    "Dirty Talk": dirtyTalks,
    "Fantasies": fantasiesIcon,
    "Music": musicIcons,
    "Foot Fetish": fotFetiesIcon,
    "Scents": scentsIcon,
    "Biting": bitingIcon,
    "Hair": hairIcon,
    "Being Watched": beingWatchIcon,
    "Sexting": sextingIcon,
    "Room Service": roomServiceIcon,
    "Blindfolded": blinedFlodedIcon,
    "Tattoos": TattosIcon,
    "Dance": danceNewIcon,
    "Role-Play": rolePlayImageNew,
    "Chocolate": choclateImageNew,
    "Touch": touchNewIcon,
};
type FaceLivenessResult =
    | { status?: string; message?: string }
    | string
    | null
    | undefined;
const { width, height } = Dimensions.get('window');

const PremiumAnimatedModal = ({ visible, onClose, children }: any) => {
    const [show, setShow] = useState(visible);
    const translateY = useRef(new Animated.Value(metrics.hp5)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            setShow(true);
            Animated.parallel([
                Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.spring(translateY, { toValue: 0, friction: 8, tension: 50, useNativeDriver: true })
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
                Animated.timing(translateY, { toValue: metrics.hp2, duration: 250, useNativeDriver: true })
            ]).start(() => setShow(false));
        }
    }, [visible]);

    if (!show) return null;

    return (
        <Modal transparent visible={show} onRequestClose={onClose} animationType="none">
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", paddingHorizontal: metrics.hp2 }}>
                <Animated.View style={{ opacity, transform: [{ translateY }], width: "100%" }}>
                    <ImageBackground style={{ width: "100%", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 15 }} source={modalBackground} resizeMode="stretch">
                        <View style={{ padding: metrics.hp2 }}>
                            {children}
                        </View>
                    </ImageBackground>
                </Animated.View>
            </View>
        </Modal>
    );
};

const ProfileScreenAndroid = () => {
    const dispatch = useDispatch();
    const isFocused = useIsFocused();
    const [percentage, setPercentage] = useState(25);
    const [selectedTab, setSelectedTab] = useState("My Bio");
    const [activeIndex, setActiveIndex] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [isBioModalVisible, setBioModalVisible] = useState(false);
    const [bioInput, setBioInput] = useState("");
    const [bioError, setBioError] = useState("");
    const userData = useSelector((state: any) => state.auth.userData);
    const profileHide = useSelector((state: any) => state.auth.profileHide);
    const turnOnData = useSelector((state: any) => state?.auth?.turnOnData);


    const [selectedTurnOnIds, setSelectedTurnOnIds] = useState<any[]>([]);

    const [verifyModalVisible, setVerifyModalVisible] = useState(false);
    const [verifyStage, setVerifyStage] = useState<'prompt' | 'verifying' | 'success' | 'error'>('prompt');
    const [verifyError, setVerifyError] = useState<string>('');
    const [verifyResponse, setVerifyResponse] = useState<any>(null);

    useEffect(() => {
        if (userData?.turnOns) {
            const initialTurnOnIds = userData.turnOns.map((t: any) => t._id || t.id);
            setSelectedTurnOnIds(initialTurnOnIds);
        }
    }, [userData?.turnOns, isFocused]);

    const handleTurnOnSelect = async (id: any) => {
        const isSelected = selectedTurnOnIds.includes(id);
        const newSelectedIds = isSelected
            ? selectedTurnOnIds.filter((item: any) => item !== id)
            : [...selectedTurnOnIds, id];

        setSelectedTurnOnIds(newSelectedIds);

        try {
            const response: any = await appOperation.customer.editProfileAPI({ attributes: newSelectedIds });
            if (response?.statusCode == 200) {
                dispatch(getProfile(true) as any);
            } else {
                setSelectedTurnOnIds(selectedTurnOnIds);
                toastAlert.showToastError(response?.message || "Something went wrong!");
            }
        } catch (e) {
            // Revert on failure
            setSelectedTurnOnIds(selectedTurnOnIds);
            toastAlert.showToastError("Failed to update turn ons");
        }
    };

    const renderTurnOnItem = ({ item }: any) => {
        const itemId = item._id || item.id;
        const isSelected = selectedTurnOnIds.includes(itemId);
        return (
            <TouchableOpacityView activeOpacity={1} onPress={() => handleTurnOnSelect(itemId)}>
                <ImageBackground source={trunOnBackground} tintColor={isSelected ? "#E6B7A8" : "#555359"} resizeMode="cover" style={styles.turnOnTrunback}>
                    <FastImage source={TURN_ON_IMAGES[item.value]} resizeMode="contain" style={styles.turnOnImagesIcon} />
                    <View style={{ alignItems: "center", justifyContent: "center", paddingHorizontal: metrics.hp2 }}>
                        <AppText style={{ color: isSelected ? newColor.blackNew : "#E6B7A8" }} type={EIGHTEEN} weight={SCHEHERAZADE_BOLD}>
                            {item.value}
                        </AppText>
                        <AppText type={ELEVEN} style={{ textAlign: "center", marginTop: -metrics.hp1, color: isSelected ? newColor.blackNew : colors.white, opacity: isSelected ? 0.8 : 1 }}>
                            {item.message}
                        </AppText>
                    </View>
                    {isSelected ?
                        <FastImage source={rightSelectTrunOns} resizeMode="contain" style={{ height: metrics.hp3, width: metrics.hp3, position: "absolute", right: metrics.hp2, bottom: metrics.hp2 }} /> : null}
                </ImageBackground>
            </TouchableOpacityView>
        )
    };
    const [localPhotos, setLocalPhotos] = useState<any[]>([]);
    const localPhotosRef = useRef<any[]>([]);
    localPhotosRef.current = localPhotos;

    useEffect(() => {
        if (userData?.gallery) {
            const initialPhotos = userData.gallery.map((g: any, index: number) => ({
                id: String(index),
                image: g.url || "",
                imageId: g._id || g.id || "",
                loading: false
            }));
            setLocalPhotos(initialPhotos.slice(0, 4));
        }
    }, [userData?.gallery]);

    // Shared pick → face-detect → edit → upload pipeline (same as AddPhotosScreen)
    const { pickAndEdit, editorVisible, editorProps } = usePhotoEditorUpload({
        canStart: () => {
            const isAnyLoading = localPhotosRef.current.some((p) => p.loading);
            if (isAnyLoading) {
                toastAlert.showToastError("Please wait for the current action to finish.");
                return false;
            }
            return true;
        },
        onUploaded: async (_context: any, uploaded: UploadedPhoto) => {
            const combined = [
                { id: `new-${Date.now()}`, image: uploaded.url, imageId: uploaded.imageId, loading: false },
                ...localPhotosRef.current.filter((p) => !p.loading),
            ].slice(0, 4);
            setLocalPhotos(combined);

            const galleryData = combined
                .filter((p) => p.image !== "Unsupported" && p.image !== "")
                .map((p, index) => ({
                    priority: index === 0,
                    url: p.image,
                }));

            await dispatch(editProfile({ gallery: galleryData }, true) as any);
            dispatch(getProfile(false, true));
        },
    });

    const deleteImage = async (item: any) => {
        if (item.loading) return;

        const imageId = item.imageId;

        if (!imageId) {
            setLocalPhotos(prev => prev.filter(p => p.id !== item.id));
            return;
        }

        setLocalPhotos((prev) => {
            const next = prev.map(p => p.id === item.id ? { ...p, loading: true } : p);
            return next;
        });

        try {
            const res = await dispatch(deletePhotoAPI({ imageId }) as any);

            if (res?.statusCode === 200 || res?.success || res?.code === 200) {
                const remaining = localPhotosRef.current.filter(p => p.id !== item.id);
                setLocalPhotos(remaining);

                const galleryData = remaining.map((p, index) => ({
                    priority: index === 0,
                    url: p.image,
                }));
                await dispatch(editProfile({ gallery: galleryData }, true) as any);
                dispatch(getProfile(false, true));
            } else {
                setLocalPhotos((prev) => prev.map(p => p.id === item.id ? { ...p, loading: false } : p));
                toastAlert.showToastError(res?.message || "Failed to delete image");
            }
        } catch (err: any) {
            console.error("Delete API error:", err);
            setLocalPhotos((prev) => prev.map(p => p.id === item.id ? { ...p, loading: false } : p));
            toastAlert.showToastError(err?.message || "An error occurred while deleting the image");
        }
    };

    const renderPhotoItem = ({ item }: { item: any }) => {
        if (item.isUploadBox) {
            return (
                <ImageBackground source={trunOnBackground} resizeMode="stretch" style={styles.trunback}>
                    <View style={styles.itemWrapper}>
                        <TouchableOpacityView
                            onPress={() => pickAndEdit()}
                            style={[styles.boxContainer, { width: "100%", height: "100%", marginBottom: 0 }]}
                        >
                            <FastImage source={uploadIcon} resizeMode="contain" tintColor={colors.white} style={[styles.icon, { marginTop: metrics.hp1 }]} />
                            <AppText type={SIXTEEN} weight={SCHEHERAZADE_BOLD} color={OPECITY}>
                                Upload
                            </AppText>
                        </TouchableOpacityView>
                    </View>
                </ImageBackground>
            );
        }

        return (
            <ImageBackground source={trunOnBackground} resizeMode="stretch" style={styles.trunback}>
                <View style={styles.itemWrapper}>
                    <View style={[styles.boxContainer, { width: "100%", height: "100%", marginBottom: 0 }]}>
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
                        ) : null}
                    </View>

                    {item.image && !item.loading && (
                        <TouchableOpacityView
                            onPress={() => deleteImage(item)}
                            style={styles.deleteButtonContainer}
                        >
                            <AppText color={colors.white} weight={INTER_BOLD} style={styles.deleteButtonText}>×</AppText>
                        </TouchableOpacityView>
                    )}
                </View>
            </ImageBackground>
        );
    };

    useEffect(() => {
        const n = Number(userData?.profileCompletion);
        setPercentage(Number.isFinite(n) ? n : 0);
    }, [userData?.profileCompletion])
    const size = metrics.hp12;
    const strokeWidth = metrics.hp0_5;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const safePct = Number.isFinite(Number(percentage)) ? Math.max(0, Math.min(100, Number(percentage))) : 0;
    const progress = (safePct / 100) * circumference;


    const renderPurchaesCards = ({ item, index }: any) => {
        return (
            <TouchableOpacityView key={index} activeOpacity={1} onPress={() => NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN, { comming: item })} style={{ marginRight: index == 2 ? metrics.hp2 : 0 }}>
                <ImageBackground
                    source={item.icon}
                    resizeMode="cover"
                    style={styles.purchaesCardContainer}
                    imageStyle={{ borderRadius: metrics.hp1_5 }}>
                </ImageBackground>
            </TouchableOpacityView>
        )
    };
    const navigateButton = (item: any) => {
        if (item?.title === "Boost") return NavigationService.navigate(NAVIGATION_PROFILE_BOOST_PURCHASE_SCREEN);
        if (item?.title === "Super Like") return NavigationService.navigate(NAVIGATION_SUPERLIKE_PURCHESE_SCREEN);
        if (item?.id === "3") return NavigationService.navigate(NAVIGATION_SUBSCRIPTION_ALL_SCREEN);

    };
    const onSubmit = () => {
        let navigate = false;
        let profile = true;
        dispatch(getProfile(navigate, profile))
    };
    const width = Dimensions.get('screen').width;
    console.log(userData, "userDatauserData");

    const hideUnHideProfile = () => {
        const dataNew = {
            isPublish: userData?.isPublish == false ? true : false
        }
        dispatch(publishProfileEveryone(dataNew))
        toastAlert.showToastError(userData?.isPublish === false ? "Your profile is published" : "Your profile is hidden")
    };
    const planHai = userData?.subscription?.plan === "publish_one_week" || userData?.subscription?.plan === "publish_one_month" || userData?.subscription?.plan === "publish_six_months";
    const hasPublishPlan =
        userData?.subscription?.plan === "publish_one_week" ||
        userData?.subscription?.plan === "publish_one_month" ||
        userData?.subscription?.plan === "publish_six_months";

    const canManagePublish =
        userData?.gender === "female" ||
        (userData?.gender === "male" && hasPublishPlan);

    const isPublishButton =
        userData?.isPublish === false || profileHide === "Hide";

    const handlePublishPress = () => {
        if (canManagePublish) {
            hideUnHideProfile();
        } else {
            NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN);
        }
    };
    const capitalizeFirstLetter = (text: string) => {
        if (!text) return text;
        return text.charAt(0).toUpperCase() + text.slice(1);
    };

    const FaceLiveness = (NativeModules as any)?.FaceLiveness as
        | { startLiveness?: (sessionId: string) => Promise<FaceLivenessResult> }
        | undefined;

    const moduleAvailable = useMemo(() => {
        return Boolean(FaceLiveness && typeof FaceLiveness.startLiveness === 'function');
    }, [FaceLiveness]);
    const getCameraPermissionType = useCallback(() => {
        return Platform.OS === "ios" ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
    }, []);
    const ensureCameraPermission = useCallback(async (): Promise<boolean> => {
        try {
            const permissionType = getCameraPermissionType();
            const currentStatus = await check(permissionType);

            if (currentStatus === RESULTS.GRANTED) return true;

            if (currentStatus === RESULTS.BLOCKED) {
                Alert.alert(
                    "Camera permission required",
                    "Camera permission is disabled. Please enable it from Settings to continue face verification.",
                    [
                        { text: "Open Settings", onPress: () => openSettings().catch(() => null) },
                        { text: "Cancel", style: "cancel" },
                    ]
                );
                return false;
            }

            const requestedStatus = await request(permissionType);
            if (requestedStatus === RESULTS.GRANTED) return true;

            Alert.alert(
                "Camera permission denied",
                "Face verification requires camera access. You can enable it from Settings.",
                [
                    { text: "Open Settings", onPress: () => openSettings().catch(() => null) },
                    { text: "Cancel", style: "cancel" },
                ]
            );
            return false;
        } catch (error) {
            console.warn("Camera permission check failed:", error);
            Alert.alert("Permission error", "Unable to check camera permission. Please try again.");
            return false;
        }
    }, [getCameraPermissionType]);

    const start = async () => {
        if (!moduleAvailable) {
            const msg =
                'FaceLiveness native module not found. Make sure you rebuilt the app (not just Metro reload).';
            console.warn('[FaceLivenessTest] ' + msg);
            return;
        }

        // setLoading(true);

        try {
            const isCameraAllowed = await ensureCameraPermission();
            if (!isCameraAllowed) {
                return;
            }

            console.log('[FaceLivenessTest] Requesting session from /faceId/liveliness');
            const sessionResp = await (appOperation.customer as any).createFaceLivenessSessionAPI();
            const sessionId = sessionResp?.data
            console.log(sessionId, "sessionResp");

            if (!sessionId) {
                throw new Error('Session API did not return a valid sessionId');
            }

            console.log('[FaceLivenessTest] Starting native liveness with sessionId:', sessionId);
            if (!FaceLiveness || typeof FaceLiveness.startLiveness !== 'function') {
                throw new Error('FaceLiveness native module is not available on this device.');
            }
            const res = await FaceLiveness.startLiveness(sessionId);
            console.log('[FaceLivenessTest] Native result:', res);

            // Normalize a few common shapes.
            if (res && typeof res === 'object') {
                const status = (res as any).status;
                if (status === 'success') {
                    console.log('[FaceLivenessTest] Verifying session via faceId/verifySessionResult');
                    const verifyResp = await (appOperation.customer as any).verifyFaceLivenessSessionAPI({
                        sessionId,
                    });
                    if (verifyResp?.data?.success) {
                        dispatch(getProfile(true))
                        setVerifyStage('success');
                    } else {
                        setVerifyError(verifyResp?.data?.message || "Verification failed. Please try again.");
                        setVerifyStage('error');
                    }
                } else if (status === 'cancelled') {
                    setVerifyError("Verification cancelled.");
                    setVerifyStage('error');
                } else {
                    setVerifyError(`Result: ${JSON.stringify(res)}`);
                    setVerifyStage('error');
                }
            } else {
                setVerifyError("Liveness Success");
                setVerifyStage('error');
            }
        } catch (e: any) {
            const msg = e?.message ?? String(e);
            console.error('[FaceLivenessTest] Error:', e);
            setVerifyError(msg);
            setVerifyStage('error');
        } finally {
            // setLoading(false);
        }
    };

    return (
        <AppSafeAreaView color={colors.transparent}>
            <LinearGradient style={{ flex: 1 }} colors={["#212123", "#555359"]}>
                <ImageBackground
                    source={ProfileBackGroundNew}
                    resizeMode="cover"
                    style={{ height: metrics.hp47, marginBottom: metrics.hp4, position: "relative", zIndex: 1, overflow: "visible" }}>
                    <AppSafeAreaView
                        color="transparent"
                        style={{ flex: 1, backgroundColor: "transparent" }}>
                        <NewHeader
                            profile={"Profile"}
                            onPress={() => NavigationService.goBack()}
                            onPressTwo={() => NavigationService.navigate(NAVIGATION_SETTING_SCREEN)}
                            isPublishButton={isPublishButton}
                            onVerificationPress={() => {
                                setVerifyError('');
                                setVerifyStage('prompt' as any);
                                setVerifyModalVisible(true);
                            }}
                        />
                        <View style={{ marginTop: metrics.hp2, paddingHorizontal: metrics.hp2, flexDirection: "row", alignItems: "center" }}>
                            <TouchableOpacityView activeOpacity={1} style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
                                <FastImage
                                    source={userData?.gallery?.length === 0 ? userData?.gender === "male" ? dummyMaleProfile : dummyfemaleProfile : { uri: userData?.gallery[0]?.url }}
                                    resizeMode="cover"
                                    style={[styles.imageContainer, { borderWidth: metrics.hp0_2, borderColor: "#E6B7A8" }]}
                                />
                                {userData?.faceVerified ?
                                    <FastImage source={verifiedBadgeIcon} resizeMode='contain' style={{ height: metrics.hp4, width: metrics.hp4, position: "absolute", right: metrics.hp0_5, top: metrics.hp1 }} />
                                    : <></>}

                            </TouchableOpacityView>
                            <AppText type={TWENTY} weight={SCHEHERAZADE_BOLD} style={{ color: "#E6B7A8" }}>
                                {" "}{userData?.username}
                            </AppText>
                        </View>
                        <View style={{ paddingHorizontal: metrics.hp2 }}>

                            <View style={{ flexDirection: "row", alignItems: "center", marginTop: metrics.hp2 }}>
                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: metrics.hp1_5, paddingVertical: metrics.hp0_5, borderRadius: metrics.hp4, backgroundColor: "#5B6168", marginRight: metrics.hp1 }}>
                                    <FastImage source={pronounIcon} resizeMode="contain" style={{ height: metrics.hp2, width: metrics.hp2 }} tintColor={colors.white} />
                                    <AppText color={WHITE} weight={INTER_BOLD} type={ELEVEN}>
                                        {"  "}{capitalizeFirstLetter(userData?.gender)}
                                    </AppText>
                                </View>
                                {userData?.sexualOrientation ?
                                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: metrics.hp1_5, paddingVertical: metrics.hp0_5, borderRadius: metrics.hp4, backgroundColor: "#5B6168", marginRight: metrics.hp1 }}>
                                        <FastImage source={sexualityIcon} resizeMode="contain" style={{ height: metrics.hp2, width: metrics.hp2 }} tintColor={colors.white} />
                                        <AppText color={WHITE} weight={INTER_BOLD} type={ELEVEN}>
                                            {"  "}{capitalizeFirstLetter(userData?.sexualOrientation)}
                                        </AppText>
                                    </View> : <></>}
                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: metrics.hp1_5, paddingVertical: metrics.hp0_5, borderRadius: metrics.hp4, backgroundColor: "#5B6168", marginRight: metrics.hp1 }}>
                                    <FastImage source={dobIcon} resizeMode="contain" style={{ height: metrics.hp2, width: metrics.hp2 }} tintColor={colors.white} />
                                    <AppText color={WHITE} weight={INTER_BOLD} type={ELEVEN}>
                                        {"  "}{userData?.age} years
                                    </AppText>
                                </View>
                                {userData?.sexualOrientation ? <></> :
                                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: metrics.hp1_5, paddingVertical: metrics.hp0_5, borderRadius: metrics.hp4, backgroundColor: "#5B6168", marginRight: metrics.hp1 }}>
                                        <FastImage source={heightIconWhiteNew} resizeMode="contain" style={{ height: metrics.hp2, width: metrics.hp2 }} tintColor={colors.white} />
                                        <AppText color={WHITE} weight={INTER_BOLD} type={ELEVEN}>
                                            {"  "}{(userData?.height || "")} ft
                                        </AppText>
                                    </View>
                                }
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", marginTop: metrics.hp1 }}>
                                {userData?.sexualOrientation ?
                                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: metrics.hp1_5, paddingVertical: metrics.hp0_5, borderRadius: metrics.hp4, backgroundColor: "#5B6168", marginRight: metrics.hp1 }}>
                                        <FastImage source={heightIconWhiteNew} resizeMode="contain" style={{ height: metrics.hp2, width: metrics.hp2 }} tintColor={colors.white} />
                                        <AppText color={WHITE} weight={INTER_BOLD} type={ELEVEN}>
                                            {"  "}{(userData?.height || "")} ft
                                        </AppText>
                                    </View>
                                    : <></>}
                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: metrics.hp1_5, paddingVertical: metrics.hp0_5, borderRadius: metrics.hp4, backgroundColor: "#5B6168", marginRight: metrics.hp1 }}>
                                    <FastImage source={locationIconWhiteNew} resizeMode="contain" style={{ height: metrics.hp2, width: metrics.hp2 }} tintColor={colors.white} />
                                    <AppText color={WHITE} weight={INTER_BOLD} type={ELEVEN}>
                                        {"  "}{capitalizeFirstLetter(userData?.city)}
                                    </AppText>
                                </View>
                            </View>

                        </View>
                        <TouchableOpacityView onPress={() => NavigationService.navigate(NAVIGATION_EDIT_PROFILE_SCREEN)}>
                            <ImageBackground source={editButtonBackground} resizeMode="stretch" style={{ height: metrics.hp6, width: "95%", alignSelf: "center", marginLeft: metrics.hp2, marginTop: metrics.hp2, alignItems: "center", justifyContent: "center" }} >
                                <AppText type={SIXTEEN} weight={SCHEHERAZADE_BOLD} color={WHITE}>
                                    Edit Profile{"   "}
                                </AppText>
                            </ImageBackground>
                        </TouchableOpacityView>
                    </AppSafeAreaView>
                    <View style={{
                        position: "absolute",
                        bottom: -metrics.hp7_5,
                        flexDirection: "row",
                        alignSelf: "center",
                        paddingHorizontal: metrics.hp2,
                        paddingBottom: metrics.hp2,
                        zIndex: 10,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.35,
                        shadowRadius: 16,
                        elevation: 14,
                    }}>
                        <TouchableOpacityView
                            onPress={() => setSelectedTab("My Bio")}
                            activeOpacity={1}
                            style={{
                                zIndex: selectedTab === "My Bio" ? 3 : 1,
                                elevation: selectedTab === "My Bio" ? 3 : 1,
                            }}>
                            <ImageBackground
                                source={tabViewForLikes}
                                resizeMode="stretch"
                                style={{
                                    height: metrics.hp6,
                                    width: metrics.hp14,
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                                imageStyle={{
                                    tintColor: selectedTab === "My Bio" ? "#E6B7A8" : "#555359",
                                }}>
                                <View style={{ flexDirection: "row", alignItems: "center", marginTop: metrics.hp1 }}>
                                    <AppText style={{ marginTop: -metrics.hp0_5, color: selectedTab === "My Bio" ? "black" : "#FAFAFA66" }} weight={SCHEHERAZADE_BOLD} type={SIXTEEN}>
                                        My Bio
                                    </AppText>
                                </View>
                            </ImageBackground>
                        </TouchableOpacityView>

                        <TouchableOpacityView
                            onPress={() => setSelectedTab("Photos")}
                            activeOpacity={1}
                            style={{
                                marginLeft: -metrics.hp3,
                                zIndex: selectedTab === "Photos" ? 3 : 2,
                                elevation: selectedTab === "Photos" ? 3 : 2,
                            }}>
                            <ImageBackground
                                source={tabViewForLikes}
                                resizeMode="stretch"
                                style={{
                                    height: metrics.hp6,
                                    width: metrics.hp14,
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                                imageStyle={{
                                    tintColor: selectedTab === "Photos" ? "#E6B7A8" : "#555359",
                                }}>
                                <View style={{ flexDirection: "row", alignItems: "center", marginTop: metrics.hp1 }}>
                                    <AppText style={{ marginTop: -metrics.hp0_5, color: selectedTab === "Photos" ? "black" : "#FAFAFA66" }} weight={SCHEHERAZADE_BOLD} type={SIXTEEN}>
                                        Photos
                                    </AppText>
                                </View>
                            </ImageBackground>
                        </TouchableOpacityView>

                        <TouchableOpacityView
                            onPress={() => setSelectedTab("Turn On")}
                            activeOpacity={1}
                            style={{
                                marginLeft: -metrics.hp3,
                                zIndex: selectedTab === "Turn On" ? 3 : 1,
                                elevation: selectedTab === "Turn On" ? 3 : 1,
                            }}>
                            <ImageBackground
                                source={tabViewForLikes}
                                resizeMode="stretch"
                                style={{
                                    height: metrics.hp6,
                                    width: metrics.hp14,
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                                imageStyle={{
                                    tintColor: selectedTab === "Turn On" ? "#E6B7A8" : "#555359",
                                }}>
                                <View style={{ flexDirection: "row", alignItems: "center", marginTop: metrics.hp1 }}>
                                    <AppText style={{ marginTop: -metrics.hp0_5, color: selectedTab === "Turn On" ? "black" : "#FAFAFA66" }} weight={SCHEHERAZADE_BOLD} type={SIXTEEN}>
                                        Turn On
                                    </AppText>
                                </View>
                            </ImageBackground>
                        </TouchableOpacityView>
                    </View>
                </ImageBackground>
                {selectedTab === "My Bio" && (
                    <TouchableOpacityView
                        activeOpacity={0.9}
                        onPress={() => {
                            setBioInput(userData?.bio || "");
                            setBioError("");
                            setBioModalVisible(true);
                        }}
                    >
                        <ImageBackground source={bioBackground} resizeMode="stretch" style={{ /* height: metrics.hp15, */ marginTop: metrics.hp6, marginHorizontal: metrics.hp2 }}>
                            <ImageBackground source={biosToggla} resizeMode="contain" style={{ height: metrics.hp4, width: metrics.hp13, alignSelf: "center", marginTop: -metrics.hp2 }} >
                                <AppText style={{ textAlign: "center" }} type={FORTEEN} weight={SCHEHERAZADE_BOLD} color={WHITE}>
                                    " My bio
                                </AppText>
                            </ImageBackground>
                            <AppText style={{ marginHorizontal: metrics.hp2, textAlign: "center", marginVertical: metrics.hp1, lineHeight: metrics.hp2, marginBottom: metrics.hp3 }} type={TWELVE} weight={SCHEHERAZADE_BOLD} color={WHITE}>
                                {userData?.bio ? userData.bio : "Write something about yourself..."}
                            </AppText>
                        </ImageBackground>
                    </TouchableOpacityView>
                )}
                {selectedTab === "Photos" && (
                    <View style={{ flex: 1, paddingHorizontal: metrics.hp2 }}>
                        <FlatList
                            data={[...(localPhotos.length < 4 ? [{ id: "upload-box", isUploadBox: true }] : []), ...localPhotos]}
                            renderItem={renderPhotoItem}
                            keyExtractor={(item, index) => item.id || String(index)}
                            numColumns={2}
                            contentContainerStyle={{/*  alignItems: "center", */ marginTop: metrics.hp4, paddingBottom: metrics.hp10 }}
                            columnWrapperStyle={{ gap: metrics.hp1 }}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                )}
                {selectedTab === "Turn On" && (
                    <View style={{ flex: 1, paddingHorizontal: metrics.hp2 }}>
                        <FlatList
                            data={turnOnData}
                            renderItem={renderTurnOnItem}
                            keyExtractor={(item) => item._id.toString()}
                            numColumns={2}
                            contentContainerStyle={{ paddingHorizontal: metrics.hp2, alignItems: "center", marginTop: metrics.hp3, paddingBottom: metrics.hp5 }}
                            columnWrapperStyle={{ columnGap: metrics.hp2, marginTop: metrics.hp6 }}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                )}
            </LinearGradient>
            <ImageBackground
                source={BottomLayer}
                resizeMode="stretch"
                style={styles.bottomLayer}
            >
                <TouchableOpacityView
                    style={{
                        width: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    onPress={handlePublishPress}
                >
                    <LinearGradient
                        colors={
                            isPublishButton
                                ? ["#D08FA9", "#FDD2C1"]
                                : ["#151517", "#151517"]
                        }
                        style={{
                            height: metrics.hp7,
                            width: "90%",
                            alignItems: "center",
                            justifyContent: "center",
                            borderWidth: isPublishButton ? 0 : metrics.hp0_1,
                            borderColor: isPublishButton
                                ? colors.transparent
                                : colors.white,
                        }}
                    >
                        <AppText
                            type={EIGHTEEN}
                            weight={SCHEHERAZADE_BOLD}
                            color={isPublishButton ? BLACK : WHITE}
                        >
                            {isPublishButton ? "Publish Profile" : "Hide Profile"}
                        </AppText>
                    </LinearGradient>
                </TouchableOpacityView>
            </ImageBackground>
            <PremiumAnimatedModal
                visible={verifyModalVisible}
                onClose={() => setVerifyModalVisible(false)}
            >
                {verifyStage === 'prompt' && (
                    <View style={{ alignItems: "center" }}>
                        <AppText type={TWENTY_TWO} weight={SCHEHERAZADE_BOLD} color={WHITE} style={{ textAlign: "center", marginBottom: metrics.hp1 }}>
                            Verify Your Identity
                        </AppText>
                        <AppText type={TWELVE} weight={INTER_MEDIUM} color={OPECITY} style={{ textAlign: "center", marginBottom: metrics.hp3, marginTop: -metrics.hp2 }}>
                            Complete a quick face verification to secure your account. This process takes only a few seconds.
                        </AppText>
                        <TouchableOpacityView
                            onPress={start}
                            style={{ backgroundColor: "#E6B7A8", height: metrics.hp6, alignItems: "center", justifyContent: "center", width: "100%", marginBottom: metrics.hp1_5 }}
                        >
                            <AppText color={BLACK} weight={INTER_BOLD} type={FORTEEN}>
                                Start Verification
                            </AppText>
                        </TouchableOpacityView>
                        <TouchableOpacityView
                            onPress={() => setVerifyModalVisible(false)}
                            style={{ backgroundColor: "rgba(255,255,255,0.05)", height: metrics.hp6, alignItems: "center", justifyContent: "center", width: "100%", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" }}
                        >
                            <AppText color={WHITE} weight={INTER_BOLD} type={FORTEEN}>
                                Close
                            </AppText>
                        </TouchableOpacityView>
                    </View>
                )}

                {verifyStage === 'success' && (
                    <View style={{ alignItems: "center" }}>
                        <View style={{ height: metrics.hp8, width: metrics.hp8, borderRadius: metrics.hp4, backgroundColor: '#73D673', alignItems: 'center', justifyContent: 'center', marginBottom: metrics.hp2, borderWidth: 1, borderColor: 'rgba(76, 175, 80, 0.3)' }}>
                            <AppText color={WHITE} weight={INTER_BOLD} type={TWENTY_TWO}>✓</AppText>
                        </View>
                        <AppText type={TWENTY_TWO} weight={SCHEHERAZADE_BOLD} color={WHITE} style={{ textAlign: "center", marginBottom: metrics.hp1, marginTop: -metrics.hp2 }}>
                            Verification Successful
                        </AppText>
                        <AppText type={TWELVE} weight={INTER_MEDIUM} color={OPECITY} style={{ textAlign: "center", marginBottom: metrics.hp3, marginTop: -metrics.hp2 }}>
                            Your face verification has been completed successfully. Your account is now fully verified.
                        </AppText>
                        <TouchableOpacityView
                            onPress={() => setVerifyModalVisible(false)}
                            style={{ backgroundColor: "#E6B7A8", height: metrics.hp6, alignItems: "center", justifyContent: "center", width: "100%" }}
                        >
                            <AppText color={BLACK} weight={INTER_BOLD} type={FORTEEN}>
                                Continue
                            </AppText>
                        </TouchableOpacityView>
                    </View>
                )}
                {verifyStage === 'error' && (
                    <View style={{ alignItems: "center" }}>
                        <View style={{ height: metrics.hp8, width: metrics.hp8, borderRadius: metrics.hp4, backgroundColor: '#FF6483', alignItems: 'center', justifyContent: 'center', marginBottom: metrics.hp2, borderWidth: 1, borderColor: 'rgba(255,0,0,0.3)' }}>
                            <AppText color={RED} weight={INTER_BOLD} type={TWENTY_TWO}>!</AppText>
                        </View>
                        <AppText type={TWENTY_TWO} weight={SCHEHERAZADE_BOLD} color={WHITE} style={{ textAlign: "center", marginBottom: metrics.hp1, marginTop: -metrics.hp2 }}>
                            Verification Failed
                        </AppText>
                        <AppText type={TWELVE} weight={INTER_MEDIUM} color={OPECITY} style={{ textAlign: "center", marginBottom: metrics.hp3, marginTop: -metrics.hp2 }}>
                            {verifyError || "We were unable to verify your identity. Please try again in a well-lit environment and ensure your face is clearly visible."}
                        </AppText>
                        <TouchableOpacityView
                            onPress={() => {
                                // setVerifyStage('prompt' as any);
                                start();
                            }}
                            style={{ backgroundColor: "#E6B7A8", height: metrics.hp6, alignItems: "center", justifyContent: "center", width: "100%", marginBottom: metrics.hp1_5 }}
                        >
                            <AppText color={BLACK} weight={INTER_BOLD} type={FORTEEN}>
                                Try Again
                            </AppText>
                        </TouchableOpacityView>
                        <TouchableOpacityView
                            onPress={() => setVerifyModalVisible(false)}
                            style={{ backgroundColor: "rgba(255,255,255,0.05)", height: metrics.hp6, alignItems: "center", justifyContent: "center", width: "100%", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" }}
                        >
                            <AppText color={WHITE} weight={INTER_BOLD} type={FORTEEN}>
                                Cancel
                            </AppText>
                        </TouchableOpacityView>
                    </View>
                )}
            </PremiumAnimatedModal>

            <PremiumAnimatedModal
                visible={isBioModalVisible}
                onClose={() => setBioModalVisible(false)}
            >
                <AppText type={SIXTEEN} weight={SCHEHERAZADE_BOLD} color={WHITE} style={{ marginBottom: metrics.hp2 }}>
                    Edit Bio
                </AppText>

                <View style={{ backgroundColor: "#151517", padding: metrics.hp1_5, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)", marginTop: -metrics.hp2 }}>
                    <TextInput
                        style={{
                            color: colors.white,
                            fontSize: 14,
                            minHeight: metrics.hp10,
                            textAlignVertical: "top"
                        }}
                        multiline
                        maxLength={200}
                        autoFocus={true}
                        blurOnSubmit={false}
                        placeholder="Write something about yourself..."
                        placeholderTextColor="#FAFAFA66"
                        value={bioInput}
                        onChangeText={(text) => {
                            setBioInput(text);
                            setBioError("");
                        }}
                    />
                    <AppText type={TEN} color={bioInput.length >= 200 ? RED : OPECITY_DARK} style={{ alignSelf: "flex-end", marginTop: metrics.hp1 }}>
                        {bioInput.length} / 200
                    </AppText>
                </View>

                {bioError ? (
                    <AppText type={TWELVE} color={RED} style={{ marginTop: metrics.hp1 }}>
                        {bioError}
                    </AppText>
                ) : null}

                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: metrics.hp3 }}>
                    <TouchableOpacityView
                        onPress={() => setBioModalVisible(false)}
                        style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.05)", height: metrics.hp6, alignItems: "center", justifyContent: "center", marginRight: metrics.hp1, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" }}
                    >
                        <AppText type={FORTEEN} weight={INTER_BOLD} color={WHITE}>
                            Cancel
                        </AppText>
                    </TouchableOpacityView>
                    <TouchableOpacityView
                        onPress={() => {
                            const trimmed = bioInput.trim();
                            if (trimmed.length === 0) {
                                setBioError("Bio cannot be empty.");
                                return;
                            }
                            dispatch(editProfile({ bio: trimmed }, false));
                            setBioModalVisible(false);
                        }}
                        style={{ flex: 1, backgroundColor: "#E6B7A8", height: metrics.hp6, alignItems: "center", justifyContent: "center", marginLeft: metrics.hp1 }}
                    >
                        <AppText type={FORTEEN} weight={INTER_BOLD} color={BLACK}>
                            Update
                        </AppText>
                    </TouchableOpacityView>
                </View>
            </PremiumAnimatedModal>
            {editorVisible && <PhotoEditorModal {...editorProps} />}
        </AppSafeAreaView>
    );
};

export default ProfileScreenAndroid;

const styles = StyleSheet.create({
    trunback: {
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
    imgaeContainer: {
        flex: 1,

    },
    detailsContainer: {
        height: metrics.hp37,
        width: "100%",
    },
    inContainer: {
        paddingHorizontal: metrics.hp2,
        marginTop: metrics.hp6,
        flexDirection: "row",
        alignItems: "center"
    },
    imageContainer: {
        position: "absolute",
        height: metrics.hp10,
        width: metrics.hp10,
        borderRadius: metrics.hp50,
    },
    persentageContainer: {
        paddingHorizontal: metrics.hp1_5,
        paddingVertical: metrics.hp0_5,
        borderRadius: metrics.hp3,
        borderWidth: metrics.hp0_5,
        borderColor: colors.white,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.black,
        position: "absolute",
        bottom: -metrics.hp1
    },
    blueTikIcon: {
        height: metrics.hp2_5,
        width: metrics.hp2_5,
        marginTop: metrics.hp2
    },
    pencilIcon: {
        height: metrics.hp2,
        width: metrics.hp2,
    },
    completeContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: metrics.hp1_7,
        borderWidth: metrics.hp0_1,
        borderColor: colors.nanoOpecity,
        paddingVertical: metrics.hp0_7,
        borderRadius: metrics.hp5,
        justifyContent: "center",
        marginTop: metrics.hp1,
        width: metrics.hp17
    },
    headerTabs: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: metrics.hp3,
        paddingHorizontal: metrics.hp2,
        borderBottomWidth: metrics.hp0_1,
        borderBottomColor: colors.nanoOpecity
    },
    contaierTabs: {
        width: metrics.hp11,
        alignItems: "center",
        justifyContent: "center"
    },
    tabLine: {
        height: metrics.hp0_3,
        backgroundColor: colors.purple,
        width: metrics.hp11,
        borderTopRightRadius: metrics.hp1,
        borderTopLeftRadius: metrics.hp1
    },
    bottomContainer: {
        backgroundColor: "#F5F7FA",
        flex: 1,
        // paddingHorizontal: metrics.hp2
    },
    subDetails: {
        height: metrics.hp13,
        width: "30%",
        backgroundColor: colors.white,
        borderRadius: metrics.hp1_5,
        paddingHorizontal: metrics.hp1_5,
        paddingVertical: metrics.hp1_5
    },
    one: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        marginTop: metrics.hp2,
        paddingHorizontal: metrics.hp2
    },
    icons: {
        height: metrics.hp3,
        width: metrics.hp3
    },
    getMoreContainer: {
        paddingHorizontal: metrics.hp0_3,
        paddingVertical: metrics.hp0_1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.black,
        borderRadius: metrics.hp1,
        width: metrics.hp7,
        alignSelf: "center",
        position: "absolute",
        bottom: -metrics.hp1
    },
    purchaesCardContainer: {
        height: metrics.hp30,
        width: Screen.Width / 1,
        marginRight: metrics.hp1,
        borderRadius: metrics.hp1_5, // ✅ container radius
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: metrics.hp0_5 },
        shadowOpacity: 1,
        shadowRadius: metrics.hp1,
        elevation: 9,
    },
    PremiumText: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: metrics.hp4,
        paddingHorizontal: metrics.hp2
    },
    safetyComesContainer: {
        paddingHorizontal: metrics.hp2,
        paddingVertical: metrics.hp2,
        borderRadius: metrics.hp1_5,
        borderColor: "#6F13F233",
        backgroundColor: colors.white,
        marginTop: metrics.hp2,
        alignItems: "center",
        borderWidth: metrics.hp0_1,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: metrics.hp1 },
        shadowOpacity: 0.18,
        shadowRadius: metrics.hp1,
        elevation: 6,
    },
    checkSafetyIcon: {
        height: metrics.hp5,
        width: metrics.hp5
    },
    learnContainer: {
        height: metrics.hp3,
        width: "48%",
        backgroundColor: colors.lightBlack,
        borderRadius: metrics.hp4,
        alignItems: "center",
        justifyContent: "center"
    },
    reportContainer: {
        height: metrics.hp3,
        width: "48%",
        borderRadius: metrics.hp4,
        borderWidth: metrics.hp0_1,
        borderColor: colors.lightBlack,
        alignItems: "center",
        justifyContent: "center"
    },
    flexContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        marginTop: metrics.hp2
    },
    boxes: {
        width: "48%",
        height: metrics.hp15,
        borderWidth: metrics.hp0_1,
        borderColor: "#E2E2E2",
        paddingHorizontal: metrics.hp1,
        paddingVertical: metrics.hp1,
        borderRadius: metrics.hp1_5,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: metrics.hp1 },
        shadowOpacity: 0.18,
        shadowRadius: metrics.hp1,
        elevation: 3,
        backgroundColor: colors.white
    },
    sefetyContainer: {
        paddingVertical: metrics.hp1,
        paddingHorizontal: metrics.hp1,
        height: metrics.hp19,
        borderColor: "#E2E2E2",
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: metrics.hp1 },
        shadowOpacity: 0.18,
        shadowRadius: metrics.hp1,
        elevation: 3,
        backgroundColor: colors.white,
        borderRadius: metrics.hp1_5,
        marginTop: metrics.hp1
    },
    innerLines: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: metrics.hp0_6
    },
    visitBox: {
        height: metrics.hp2_7, width: metrics.hp13, backgroundColor: colors.white, alignItems: "center", justifyContent: "center", borderRadius: metrics.hp1_5, borderColor: colors.black, borderWidth: metrics.hp0_1, marginTop: metrics.hp1
    },
    turnOnTrunback: {
        height: metrics.hp21,
        width: metrics.hp20,
        marginBottom: metrics.hp2,
        alignItems: "center",
        justifyContent: "center",
    },
    turnOnImagesIcon: {
        height: metrics.hp17,
        width: metrics.hp17,
        position: "absolute",
        top: -metrics.hp8
    },
    bottomLayer: {
        width: "100%",
        paddingVertical: metrics.hp2,
        alignItems: "center",
        backgroundColor: "#555359",
    }
});
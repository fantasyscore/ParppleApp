import React, { useEffect, useState, useRef } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { Dimensions, FlatList, ImageBackground, Linking, Platform, ScrollView, StyleSheet, View, Modal, TextInput } from "react-native";
import PeopleHeader from "../../common/PeopleHeader";
import {  bioBackground, biosToggla,  dobIcon, editButtonBackground,  heightIconWhiteNew, locationIconWhiteNew, ProfileBackGroundNew,pronounIcon,  tabViewForLikes, trunOnBackground, uploadIcon, beingWatchIcon, bitingIcon, blinedFlodedIcon, dirtyTalks, fantasiesIcon, fotFetiesIcon, hairIcon, hugsIcon, massageIcon, musicIcons, oralIcon, rightSelectTrunOns, roomServiceIcon, scentsIcon, sextingIcon, smooheshIcon, TattosIcon, BottomLayer, danceNewIcon, rolePlayImageNew, choclateImageNew, touchNewIcon, dummyMaleProfile, dummyfemaleProfile } from "../../helper/ImageAssets";
import metrics from "../../assets/Metrics";
import { colors, newColor } from "../../theme/colors";
import Svg, { Circle } from "react-native-svg";
import FastImage from "react-native-fast-image";
import { AppText, BLACK, EIGHTEEN, ELEVEN, FORTEEN, INTER_BOLD, INTER_MEDIUM, INTER_SEMI_BOLD, LIGHT_BLACK, NINE, OPECITY, OPECITY_DARK, PURPLE, RED, SCHEHERAZADE_BOLD, SIXTEEN, SKYBLUE, TEN, THIRTEEN, TWELVE, TWENTY, WHITE } from "../../common/AppText";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import { premiumDetaiData, PurchaseCards, SafetyTips, TrustTransparency } from "../../common/UiltData";
import { Screen } from "../../theme/dimens";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_CRUSH_PURCHESE_SCREEN, NAVIGATION_EDIT_PROFILE_SCREEN, NAVIGATION_FILTER_SCREEN, NAVIGATION_PROFILE_BOOST_PURCHASE_SCREEN, NAVIGATION_SETTING_SCREEN, NAVIGATION_SUBSCRIPTION_ALL_SCREEN, NAVIGATION_SUBSCRIPTION_SCREEN, NAVIGATION_SUPERLIKE_PURCHESE_SCREEN } from "../../navigation/routes";
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
    }
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
                        <NewHeader profile={"Profile"}  onPress={() => NavigationService.goBack()} onPressTwo={() => NavigationService.navigate(NAVIGATION_SETTING_SCREEN)} />
                        <View style={{ marginTop: metrics.hp2, paddingHorizontal: metrics.hp2, flexDirection: "row", alignItems: "center" }}>
                            <TouchableOpacityView activeOpacity={1} style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
                                <FastImage
                                    source={userData?.gallery?.length === 0 ? userData?.gender === "male" ? dummyMaleProfile : dummyfemaleProfile : { uri: userData?.gallery[0]?.url }}
                                    resizeMode="cover"
                                    style={[styles.imageContainer, { borderWidth: metrics.hp0_2, borderColor: "#E6B7A8" }]}
                                />

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
                                        {"  "}{userData?.gender}
                                    </AppText>
                                </View>
                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: metrics.hp1_5, paddingVertical: metrics.hp0_5, borderRadius: metrics.hp4, backgroundColor: "#5B6168", marginRight: metrics.hp1 }}>
                                    <FastImage source={dobIcon} resizeMode="contain" style={{ height: metrics.hp2, width: metrics.hp2 }} tintColor={colors.white} />
                                    <AppText color={WHITE} weight={INTER_BOLD} type={ELEVEN}>
                                        {"  "}{userData?.age} years
                                    </AppText>
                                </View>
                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: metrics.hp1_5, paddingVertical: metrics.hp0_5, borderRadius: metrics.hp4, backgroundColor: "#5B6168", marginRight: metrics.hp1 }}>
                                    <FastImage source={heightIconWhiteNew} resizeMode="contain" style={{ height: metrics.hp2, width: metrics.hp2 }} tintColor={colors.white} />
                                    <AppText color={WHITE} weight={INTER_BOLD} type={ELEVEN}>
                                        {"  "}{userData?.height} ft
                                    </AppText>
                                </View>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", marginTop: metrics.hp1 }}>
                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: metrics.hp1_5, paddingVertical: metrics.hp0_5, borderRadius: metrics.hp4, backgroundColor: "#5B6168", marginRight: metrics.hp1 }}>
                                    <FastImage source={locationIconWhiteNew} resizeMode="contain" style={{ height: metrics.hp2, width: metrics.hp2 }} tintColor={colors.white} />
                                    <AppText color={WHITE} weight={INTER_BOLD} type={ELEVEN}>
                                        {"  "}{userData?.city}
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
                            <AppText style={{ marginHorizontal: metrics.hp2, textAlign: "center", marginVertical: metrics.hp1, lineHeight:metrics.hp2, marginBottom:metrics.hp3 }}type={TWELVE} weight={SCHEHERAZADE_BOLD} color={WHITE}>
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
            <ImageBackground source={BottomLayer} resizeMode="stretch" style={styles.bottomLayer}>
                <TouchableOpacityView style={{ width: "100%", alignItems: "center", justifyContent: "center" }} onPress={() => userData?.gender === "female" ? hideUnHideProfile() : NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN)}>
                    <LinearGradient colors={userData?.gender === "male" || userData?.isPublish === false ? ["#D08FA9", "#FDD2C1"] : profileHide === "Hide" ? ["#D08FA9", "#FDD2C1"] : ["#151517", "#151517"]} style={{ height: metrics.hp7, width: "90%", alignItems: "center", justifyContent: "center", borderWidth: userData?.gender === "male" ? 0 : profileHide === "Hide" ? 0 : metrics.hp0_1, borderColor: userData?.gender === "male" ? colors.transparent : profileHide === "Hide" ? colors.transparent : colors.white }}>
                        <AppText type={EIGHTEEN} weight={SCHEHERAZADE_BOLD} color={userData?.gender === "male" || userData?.isPublish === false ? BLACK : profileHide === "Hide" ? BLACK : WHITE}>
                            {userData?.gender === "male" || userData?.isPublish === false ? "Publish Profile" : profileHide === "Hide" ? "Publish Profile" : "Hide Profile"}
                        </AppText>
                    </LinearGradient>
                </TouchableOpacityView>
            </ImageBackground>
            {/* <ImageBackground
                source={profilebackGround}
                resizeMode="cover"
                style={styles.imgaeContainer}>
                <PeopleHeader profile={true} />

                <View style={styles.inContainer}>
                    <TouchableOpacityView onPress={onSubmit} style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
                        <Svg height={size} width={size}>
                            <Circle
                                stroke={colors.persentageBorder}
                                fill="none"
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                strokeWidth={strokeWidth}
                            />
                            <Circle
                                stroke={colors.singleButtonGreen}
                                fill="none"
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                strokeWidth={strokeWidth}
                                strokeDasharray={circumference}
                                strokeDashoffset={circumference - progress}
                                strokeLinecap="round"
                                rotation="90"
                                originX={size / 2}
                                originY={size / 2}
                            />
                        </Svg>
                        <FastImage
                            source={{ uri: userData?.gallery[0]?.url }}
                            resizeMode="cover"
                            style={styles.imageContainer}
                        />
                        <View style={styles.persentageContainer}>
                            <AppText type={TEN} weight={INTER_BOLD} color={WHITE}>
                                {Math.trunc(percentage)}%
                            </AppText>
                        </View>
                    </TouchableOpacityView>
                    <View>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent:"center" }}>
                            <AppText style={{ marginTop: metrics.hp2, textTransform: "capitalize", fontWeight: "700" }} type={EIGHTEEN} weight={INTER_BOLD}>{"    "}{userData?.firstName},<AppText type={EIGHTEEN} weight={INTER_MEDIUM}> {userData?.age}{"  "}</AppText>
                            </AppText>
                            {userData?.faceVerified == true && Platform.OS ==="ios" ? <FastImage source={blueTikeIcon} resizeMode="contain" style={styles.blueTikIcon} /> :
                            <FastImage source={blueTikeIcon} resizeMode="contain" style={styles.blueTikIcon} />}
                        </View>
                        <TouchableOpacityView onPress={() => NavigationService.navigate(NAVIGATION_EDIT_PROFILE_SCREEN)} style={styles.completeContainer}>
                            <FastImage source={pencilIcon} tintColor={colors.lightBlack} resizeMode="contain" style={styles.pencilIcon} />
                            <AppText color={LIGHT_BLACK} type={ELEVEN} weight={INTER_MEDIUM}>
                                {"  "}Complete profile
                            </AppText>
                        </TouchableOpacityView>
                    </View>
                </View>
                <View style={styles.headerTabs}>
                    <TouchableOpacityView onPress={() => setTabSelect("Premium")} style={styles.contaierTabs}>
                        <AppText type={THIRTEEN} weight={tabSelect == "Premium" ? INTER_BOLD : INTER_MEDIUM} color={tabSelect == "Premium" ? PURPLE : OPECITY}>
                            Premium
                        </AppText>
                        <View style={[styles.tabLine, { backgroundColor: tabSelect == "Premium" ? colors.purple : colors.transparent }]} />
                    </TouchableOpacityView>
                    <TouchableOpacityView onPress={() => setTabSelect("Safety")} style={styles.contaierTabs}>
                        <AppText type={THIRTEEN} weight={tabSelect == "Safety" ? INTER_BOLD : INTER_MEDIUM} color={tabSelect == "Safety" ? PURPLE : OPECITY}>
                            Safety
                        </AppText>
                        <View style={[styles.tabLine, { backgroundColor: tabSelect == "Safety" ? colors.purple : colors.transparent }]} />
                    </TouchableOpacityView>
                </View>
                {tabSelect == "Premium" &&
                    <View style={styles.bottomContainer}>
                        <View style={styles.one}>
                            {premiumDetaiData?.map((item, index) => {
                                return userData?.subscription?.plan !== "FREE" && item.id === "3" ? (
                                    <TouchableOpacityView onPress={() => navigateButton(item)}>
                                        <ImageBackground source={userData?.subscription?.plan === "SILVER" ? sliverCardSmall :
                                            userData?.subscription?.plan === "GOLD" ? goldCardSmall : platniumCardSmall
                                        } resizeMode="contain" style={{
                                            height: metrics.hp13,
                                            width: metrics.hp13,
                                        }}>
                                            <View style={styles.getMoreContainer}>
                                                <AppText style={{ marginTop: -metrics.hp0_1 }} weight={INTER_MEDIUM} color={WHITE} type={TEN}>
                                                    {item.headLine}
                                                </AppText>
                                            </View>
                                        </ImageBackground>
                                    </TouchableOpacityView>
                                ) : (
                                    <TouchableOpacityView onPress={() => navigateButton(item)} key={index} style={[styles.subDetails, { marginLeft: item.id == "2" ? metrics.hp0_5 : 0 }]}>
                                        <FastImage source={item.icon} resizeMode="contain" style={styles.icons} />
                                        <AppText color={index == 0 ? SKYBLUE : index == 1 ? RED : PURPLE} style={{ marginTop: index == 2 ? metrics.hp2 : metrics.hp2 }} type={index == 2 ? TWELVE : FORTEEN} weight={INTER_BOLD}>
                                            {item.numberText}
                                        </AppText>
                                        <AppText type={TEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                            {item.title}
                                        </AppText>
                                        <View style={styles.getMoreContainer}>
                                            <AppText style={{ marginTop: -metrics.hp0_1 }} weight={INTER_MEDIUM} color={WHITE} type={TEN}>
                                                {item.headLine}
                                            </AppText>
                                        </View>
                                    </TouchableOpacityView>
                                )
                            })}
                        </View>
                        <View style={styles.PremiumText}>
                            <FastImage source={premiumIcon} resizeMode="contain" style={styles.pencilIcon} />
                            <AppText type={TWELVE} weight={INTER_SEMI_BOLD}>
                                {"  "}Premium Plans
                            </AppText>
                        </View>
                        <View style={{ flex:1 }}>
                            <Carousel
                                width={width}
                                height={metrics.hp80}
                                autoPlay={false}
                                autoPlayInterval={4000}
                                defaultIndex={0}
                                loop={false}
                                mode="parallax"
                                data={PurchaseCards || []}
                                scrollAnimationDuration={300}
                                modeConfig={{
                                    parallaxScrollingScale: 0.9,
                                    parallaxAdjacentItemScale: 0.8,  // REQUIRED
                                    parallaxScrollingOffset: Math.round(width / 10) + metrics.hp1,
                                }}
                                style={{ height: metrics.hp40, marginTop: -metrics.hp2, }}
                                renderItem={({ item, index }: any) => (
                                    <TouchableOpacityView key={index} activeOpacity={1} onPress={() => NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN, { comming: item })} >
                                        <ImageBackground
                                            source={item.icon}
                                            resizeMode="cover"
                                            style={styles.purchaesCardContainer}
                                            imageStyle={{ borderRadius: metrics.hp1_5 }}>
                                        </ImageBackground>
                                    </TouchableOpacityView>
                                )}
                            />
                        </View>
                    </View>
                }
                {tabSelect == "Safety" &&
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: metrics.hp5 }} style={[styles.bottomContainer, { paddingHorizontal: metrics.hp2, }]}>
                        <View style={styles.safetyComesContainer}>
                            <FastImage source={checkSafety} resizeMode="contain" style={styles.checkSafetyIcon} />
                            <AppText weight={SCHEHERAZADE_BOLD} type={EIGHTEEN} color={BLACK}>
                                Your Safety Comes First
                            </AppText>
                            <AppText style={{ textAlign: "center", marginTop: -metrics.hp1 }} weight={INTER_SEMI_BOLD} color={OPECITY_DARK}>
                                We’re committed to keeping you safe — from your first swipe to your first date.
                            </AppText>
                            <View style={styles.flexContainer}>
                                <TouchableOpacityView onPress={() => Linking.openURL("https://parpple.com/safety")} style={styles.learnContainer}>
                                    <AppText weight={INTER_SEMI_BOLD} color={WHITE}>
                                        Learn Safety Tips
                                    </AppText>
                                </TouchableOpacityView>
                                <TouchableOpacityView onPress={() => Linking.openURL("https://parpple.com/contact-us")} style={styles.reportContainer}>
                                    <AppText weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                                        Report a Concern
                                    </AppText>
                                </TouchableOpacityView>
                            </View>
                        </View>
                        <AppText style={{ marginTop: metrics.hp2 }} type={TWELVE} weight={INTER_SEMI_BOLD} color={BLACK}>
                            Safety Tools
                        </AppText>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: metrics.hp1 }}>
                            <TouchableOpacityView onPress={() => Linking.openURL("https://parpple.com/safety")} style={styles.boxes}>
                                <FastImage source={blockPurppleIcon} resizeMode="contain" style={{ height: metrics.hp2, width: metrics.hp2 }} />
                                <AppText style={{ marginTop: metrics.hp1 }} color={LIGHT_BLACK} type={TWELVE} weight={INTER_SEMI_BOLD}>
                                    Block user{`\n`}
                                    Instantly
                                </AppText>
                                <AppText style={{ marginTop: metrics.hp0_1 }} color={OPECITY_DARK} type={TEN} weight={INTER_MEDIUM}>
                                    Stop unwanted chats with{`\n`}
                                    one tap.
                                </AppText>
                                <AppText style={{ marginTop: metrics.hp0_5 }} color={PURPLE} type={TEN} weight={INTER_SEMI_BOLD}>
                                    Learn How
                                </AppText>
                            </TouchableOpacityView>
                            <TouchableOpacityView onPress={() => NavigationService.navigate(NAVIGATION_SETTING_SCREEN)} style={styles.boxes}>
                                <FastImage source={locationPurppleIcon} resizeMode="contain" style={{ height: metrics.hp2, width: metrics.hp2 }} />
                                <AppText style={{ marginTop: metrics.hp1 }} color={LIGHT_BLACK} type={TWELVE} weight={INTER_SEMI_BOLD}>
                                    Profile{`\n`}
                                    Discovery
                                </AppText>
                                <AppText style={{ marginTop: metrics.hp0_1 }} color={OPECITY_DARK} type={TEN} weight={INTER_MEDIUM}>
                                    Choose whether you want to{`\n`}
                                    show profile to other.
                                </AppText>
                                <AppText style={{ marginTop: metrics.hp0_5 }} color={PURPLE} type={TEN} weight={INTER_SEMI_BOLD}>
                                    Change
                                </AppText>
                            </TouchableOpacityView>
                        </View>
                        <AppText style={{ marginTop: metrics.hp3 }} type={TWELVE} weight={INTER_SEMI_BOLD} color={BLACK}>
                            Safety Tips
                        </AppText>
                        <TouchableOpacityView onPress={() => Linking.openURL("https://parpple.com/safety")} style={styles.sefetyContainer}>
                            {SafetyTips?.map((item) => {
                                return (
                                    <View style={styles.innerLines}>
                                        <FastImage source={stylesRightArrow} resizeMode="contain" style={{ height: metrics.hp2, width: metrics.hp2 }} />
                                        <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                            {"  "}{item.line}
                                        </AppText>
                                    </View>
                                )
                            })}
                            <View style={{ flexDirection: "row", alignItems: "center", marginTop: metrics.hp1 }}>
                                <AppText type={TWELVE} weight={INTER_SEMI_BOLD} color={PURPLE}>
                                    Real All Tips{" "}
                                </AppText>
                                <FastImage source={arrowBackForSafety} resizeMode="contain" style={{ height: metrics.hp2, width: metrics.hp2_5, marginTop: metrics.hp0_5 }} />
                            </View>
                        </TouchableOpacityView>
                        <AppText style={{ marginTop: metrics.hp2 }} type={TEN} weight={INTER_SEMI_BOLD} color={BLACK}>
                            Reporting & Support
                        </AppText>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: metrics.hp1 }}>
                            <TouchableOpacityView onPress={() => Linking.openURL("https://parpple.com/contact-us")} style={[styles.boxes, { height: metrics.hp13 }]}>
                                <FastImage source={blockPurppleIcon} resizeMode="contain" style={{ height: metrics.hp2, width: metrics.hp2 }} />
                                <AppText style={{ marginTop: metrics.hp1 }} color={LIGHT_BLACK} type={TWELVE} weight={INTER_SEMI_BOLD}>
                                    Report a User
                                </AppText>
                                <AppText style={{ marginTop: metrics.hp0_1 }} color={OPECITY_DARK} type={TEN} weight={INTER_MEDIUM}>
                                    Harassment / Fake Profile /{`\n`}
                                    Scams
                                </AppText>
                                <AppText style={{ marginTop: metrics.hp0_5 }} color={PURPLE} type={TEN} weight={INTER_SEMI_BOLD}>
                                    Report Now
                                </AppText>
                            </TouchableOpacityView>
                            <TouchableOpacityView onPress={() => Linking.openURL("https://parpple.com/contact-us")} style={[styles.boxes, { height: metrics.hp13 }]}>
                                <FastImage source={locationPurppleIcon} resizeMode="contain" style={{ height: metrics.hp2, width: metrics.hp2 }} />
                                <AppText style={{ marginTop: metrics.hp1 }} color={LIGHT_BLACK} type={TWELVE} weight={INTER_SEMI_BOLD}>
                                    Contact Support
                                </AppText>
                                <AppText style={{ marginTop: metrics.hp0_1 }} color={OPECITY_DARK} type={TEN} weight={INTER_MEDIUM}>
                                    Write an email to our safety{`\n`}
                                    team.
                                </AppText>
                                <AppText style={{ marginTop: metrics.hp0_5 }} color={PURPLE} type={TEN} weight={INTER_SEMI_BOLD}>
                                    Write now
                                </AppText>
                            </TouchableOpacityView>
                        </View>
                        <AppText style={{ marginTop: metrics.hp3 }} type={TWELVE} weight={INTER_SEMI_BOLD} color={BLACK}>
                            Trust & Transparency
                        </AppText>
                        <TouchableOpacityView onPress={() => Linking.openURL("https://parpple.com/safety")} style={[styles.sefetyContainer, { height: metrics.hp15 }]}>
                            {TrustTransparency?.map((item) => {
                                return (
                                    <View style={styles.innerLines}>
                                        <FastImage source={stylesRightArrow} resizeMode="contain" style={{ height: metrics.hp2, width: metrics.hp2 }} />
                                        <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                            {"  "}{item.line}
                                        </AppText>
                                    </View>
                                )
                            })}
                            <View style={{ flexDirection: "row", alignItems: "center", marginTop: metrics.hp1 }}>
                                <AppText type={TEN} weight={INTER_SEMI_BOLD} color={PURPLE}>
                                    Read Our Safety Policy
                                </AppText>
                            </View>
                        </TouchableOpacityView>
                        <AppText style={{ marginTop: metrics.hp2 }} type={TEN} weight={INTER_SEMI_BOLD} color={BLACK}>
                            Resources & Partnerships
                        </AppText>
                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: metrics.hp2 }}>
                            <FastImage source={callIcon} resizeMode="contain" style={{ height: metrics.hp1_5, width: metrics.hp1_5 }} />
                            <AppText>
                                {"  "}National Cyber Crime Helpline
                            </AppText>
                        </View>
                        <TouchableOpacityView onPress={() => Linking.openURL("https://cybercrime.gov.in/Webform/Crime_NodalGrivanceList.aspx")} style={styles.visitBox}>
                            <AppText type={ELEVEN} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                                Visit Website
                            </AppText>
                        </TouchableOpacityView>
                     
                    </ScrollView>
                }
            </ImageBackground> */}
            {/* Bio Edit Modal */}
            <Modal
                visible={isBioModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setBioModalVisible(false)}
            >
                <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" }}>
                    <View style={{ width: "90%", backgroundColor: "#212123", borderRadius: metrics.hp2, padding: metrics.hp3 }}>
                        <AppText type={SIXTEEN} weight={SCHEHERAZADE_BOLD} color={WHITE} style={{ marginBottom: metrics.hp2 }}>
                            Edit Bio
                        </AppText>

                        <View style={{ backgroundColor: "#5B6168", borderRadius: metrics.hp1_5, padding: metrics.hp1_5 }}>
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
                            <AppText type={TEN} color={bioInput.length >= 200 ? RED : WHITE} style={{ alignSelf: "flex-end", marginTop: metrics.hp1 }}>
                                {bioInput.length} / 200
                            </AppText>
                        </View>

                        {bioError ? (
                            <AppText type={TWELVE} color={RED} style={{ marginTop: metrics.hp1 }}>
                                {bioError}
                            </AppText>
                        ) : null}

                        <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: metrics.hp3 }}>
                            <TouchableOpacityView
                                onPress={() => setBioModalVisible(false)}
                                style={{ paddingHorizontal: metrics.hp2, paddingVertical: metrics.hp1, marginRight: metrics.hp1 }}
                            >
                                <AppText type={FORTEEN} color={WHITE}>
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
                                    // dispatch(getProfile(false, true)); // ensure UI syncs immediately
                                    setBioModalVisible(false);
                                }}
                                style={{ backgroundColor: "#E6B7A8", paddingHorizontal: metrics.hp3, paddingVertical: metrics.hp1, borderRadius: metrics.hp4 }}
                            >
                                <AppText type={FORTEEN} weight={INTER_BOLD} color={BLACK}>
                                    Update
                                </AppText>
                            </TouchableOpacityView>
                        </View>
                    </View>
                </View>
            </Modal>
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
    },

});
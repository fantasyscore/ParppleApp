import React, { useEffect, useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { FlatList, PermissionsAndroid, Platform, ScrollView, StyleSheet, TextInput, View } from "react-native";
import HeaderCommon from "../../common/HeaderCommon";
import metrics from "../../assets/Metrics";
import { Screen } from "../../theme/dimens";
import { colors } from "../../theme/colors";
import { AppText, BLACK, EIGHT, EIGHTEEN, fontSize, INTER_BOLD, INTER_EXTRA_BOLD, INTER_MEDIUM, INTER_SEMI_BOLD, LIGHT_BLACK, PURPLE, RED, TWELVE } from "../../common/AppText";
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
import { attributesGet, editProfile, getProfile } from "../../actions/authActions";
import { toastAlert, uploadImageCloud } from "../../actions/UploadImageActions";
import { Image as ImageCompressor } from "react-native-compressor";

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



    useEffect(() => {
        setBio(userData?.bio)
    }, [userData?.bio])
    const [photos, setPhotos] = useState(
        Array(6)
            .fill({ id: "", image: "", loading: false })
            .map((_, i) => ({ id: String(i + 1), image: "", loading: false }))
    );
    useEffect(() => {
        if (userData?.gallery && Array.isArray(userData.gallery)) {
            setPhotos((prev) =>
                prev.map((item, index) => ({
                    ...item,
                    image: userData.gallery[index]?.url || "",
                }))
            );
        }
    }, [userData]);
    const pickMultipleImages = async () => {
        const hasPermission = await requestGalleryPermission();
        if (!hasPermission) return;

        launchImageLibrary({ mediaType: "photo", selectionLimit: 6 }, async (res: any) => {
            if (res.didCancel || !res.assets || res.assets.length === 0) return;

            const assets = res.assets.slice(0, 6);
            const currentCount = photos.filter((p) => p.image !== "").length;

            if (currentCount >= 6) {
                return toastAlert.showToastError("You can upload a maximum of 6 photos only.");
            }
            setPhotos((prev) => {
                const updated = [...prev];
                let count = 0;
                for (let i = 0; i < updated.length && count < assets.length; i++) {
                    if (updated[i].image === "") {
                        updated[i].loading = true;
                        updated[i].image = "";
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

                        const cloudUrl = await uploadImageCloud(compressedUri);
                        uploadedUrls.push(cloudUrl);
                    } catch (err) {
                        console.error("Compression or upload failed:", err);
                        uploadedUrls.push("");
                    }
                }

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

                const galleryData = photos
                    .map((p) => p.image)
                    .concat(uploadedUrls.filter(Boolean))
                    .slice(0, 6)
                    .map((p, index) => ({
                        priority: index === 0,
                        url: p,
                    }));

                dispatch(editProfile({ gallery: galleryData }, true));
            } catch (err) {
                console.error("Upload failed:", err);
                setPhotos((prev) => prev.map((p) => ({ ...p, loading: false })));
            }
        });
    };

    const pickSingleImage = async (index: number) => {
        const hasPermission = await requestGalleryPermission();
        if (!hasPermission) return;

        launchImageLibrary({ mediaType: "photo", selectionLimit: 1 }, async (res: any) => {
            if (res.didCancel || !res.assets || res.assets.length === 0) return;
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

                const cloudUrl = await uploadImageCloud(compressedUri);

                setPhotos((prev) => {
                    const updated = [...prev];
                    updated[index].loading = false;
                    updated[index].image = cloudUrl;
                    return updated;
                });

                const oldGallery = userData?.gallery?.map((img: any) => img.url) || [];
                const newGallery = [...oldGallery];
                newGallery[index] = cloudUrl;
                const galleryData = newGallery.slice(0, 6).map((p, i) => ({
                    priority: i === 0,
                    url: p,
                }));

                dispatch(editProfile({ gallery: galleryData }, true));
            } catch (err) {
                console.error("Single upload failed:", err);
                setPhotos((prev) => {
                    const updated = [...prev];
                    updated[index].loading = false;
                    return updated;
                });
            }
        });
    };

    const renderItem = ({ item, index }: { item: any; index: number }) => {
        return (
            <TouchableOpacityView
                onPress={() => (item.image ? pickSingleImage(index) : pickMultipleImages())}
                style={[
                    styles.boxContainer,

                ]}
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

                {item.image && index === 0 && (
                    <View style={styles.mainContainer}>
                        <AppText type={EIGHT} weight={INTER_MEDIUM} color={BLACK}>
                            Main
                        </AppText>
                    </View>
                )}
                {item.image && index >= 1 && (
                    <View style={styles.indedxContainer}>
                        <AppText type={EIGHT} weight={INTER_MEDIUM} color={BLACK}>
                            {index}
                        </AppText>
                    </View>
                )}
            </TouchableOpacityView>
        );
    };

    const uploadedCount = photos.filter((p) => p.image !== "").length;
    const minRequired = 6;
    const remaining = Math.max(0, minRequired - uploadedCount);
    const onSubmit = () => {
        dispatch(getProfile())
    };

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
                {remaining === 0 ? <></> :
                    <AppText color={RED} weight={INTER_MEDIUM} type={TWELVE}>
                        Add {remaining} of your best photos.
                    </AppText>
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
                <EditButtonCommon Icons={religiousIcon}
                    title={"Religious Beliefs"}
                    hidden={userData?.fieldVisibility?.relegiousBelief}
                    filluptext={userData?.relegiousBelief
                        ?.map((item: any, index: any) =>
                            index === userData?.relegiousBelief?.length - 1 ? `${item}` : `${item}, `
                        )
                        .join('')}
                    onPress={() => NavigationService.navigate(NAVIGATION_RELIGIOUS_SCREEN, { filter: "Religious Beliefs", data: userData?.relegiousBelief, fieldVisibility: userData?.fieldVisibility })} />
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
                    onPress={() => NavigationService.navigate(NAVIGATION_GANDER_SCREEN, { filter: "Add Gender", data: userData?.gender, fieldVisibility: userData?.fieldVisibility })} />
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
})
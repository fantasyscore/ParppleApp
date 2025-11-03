import React, { useEffect, useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { FlatList, PermissionsAndroid, Platform, ScrollView, StyleSheet, TextInput, View } from "react-native";
import HeaderCommon from "../../common/HeaderCommon";
import metrics from "../../assets/Metrics";
import { Screen } from "../../theme/dimens";
import { colors } from "../../theme/colors";
import { AppText, BLACK, EIGHT, EIGHTEEN, fontSize, INTER_EXTRA_BOLD, INTER_MEDIUM, INTER_SEMI_BOLD, PURPLE, RED, TWELVE } from "../../common/AppText";
import FastImage from "react-native-fast-image";
import { aboutIcon, addPhotoIcon, bussnisIcon, childrenIcon, dateIcon, drikingIcon, familyIcon, ganderIcon, homeIcon, infoIcon, keywordRightArrow, langIcon, lifeStyleIcon, locIcon, moonIcon, moreAboutU, nameIcon, partnerheart, personHeartIcon, petsIcon, politicalIcon, pronounIcon, religiousIcon, schoolIcon, searchIcon, sexualityIcon, smookingIcon, straightenIcon, uploadIcon, workIcon } from "../../helper/ImageAssets";
import HeadLineContiner from "../../common/HeadLineContiner";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import { launchImageLibrary } from "react-native-image-picker";
import { interMedium } from "../../theme/typography";
import ButtonSheet from "../../common/ButtonSheet";
import EditButtonCommon from "../../common/EditButtonCommon";
import { dataPets,DrinkData, ExerciseData, SmokeData } from "../../common/UiltData";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_BELONG_SCREEN, NAVIGATION_CHILDERN_SCREEN, NAVIGATION_COMMONSELECT_PAGE_SCREEN, NAVIGATION_DATE_SCREEN, NAVIGATION_DATING_SCREEN, NAVIGATION_EDUCATION_SCREEN, NAVIGATION_FAMILY_PLANING_SCREEN, NAVIGATION_GANDER_SCREEN, NAVIGATION_HEIGHT_SCREEN, NAVIGATION_JOB_TITLE_SCREEN, NAVIGATION_LANGUAGE_SPEAK_SCREEN, NAVIGATION_NAME_SCREEN, NAVIGATION_PERSONAL_INTEREST_SCREEN, NAVIGATION_POLITICAL_SCREEN, NAVIGATION_PROFILE_STRENGTH_SCREEN, NAVIGATION_PRONOUN_SCREEN, NAVIGATION_RELATION_SCREEN, NAVIGATION_RELIGIOUS_SCREEN, NAVIGATION_SEXUALITY_SCREEN, NAVIGATION_USER_EDIT_PROFILE_SCREEN, NAVIGATION_WORK_PLACE_SCREEN, NAVIGATION_ZODIACSING_SCREEN } from "../../navigation/routes";
import { useDispatch, useSelector } from "react-redux";
import { getProfile } from "../../actions/authActions";
import { uploadImageCloud } from "../../actions/UploadImageActions";
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
    console.log(userData,"userData");
    
    const [bio, setBio] = useState(userData?.bio)
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
                            maxWidth: 1080,
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
                    maxWidth: 1080,
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
        });
    };
    const renderItem = ({ item, index }: { item: { id: string; image: string }, index: number }) => {
        return (
            <TouchableOpacityView onPress={() => item.image ? pickSingleImage(index) : pickMultipleImages()} style={[styles.boxContainer, { borderWidth: item.image ? 0 : metrics.hp0_2 }]}>
                {item.image ? (
                    <FastImage source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
                ) : (
                    <FastImage source={uploadIcon} resizeMode="contain" style={styles.icon} />
                )}
                {item.image && index == 0 &&
                    <View style={styles.mainContainer}>
                        <AppText type={EIGHT} weight={INTER_MEDIUM} color={BLACK}>
                            Main
                        </AppText>
                    </View>}
                {item.image && index >= 1 &&
                    <View style={styles.indedxContainer}>
                        <AppText type={EIGHT} weight={INTER_MEDIUM} color={BLACK}>
                            {index}
                        </AppText>
                    </View>
                }
            </TouchableOpacityView>
        )
    };
    const uploadedCount = photos.filter((p) => p.image !== "").length;
    const minRequired = 6;
    const remaining = Math.max(0, minRequired - uploadedCount);
    const onSubmit = () => {
        dispatch(getProfile())
    };

    return (
        <AppSafeAreaView>
            <HeaderCommon title={"Edit Profile"} preview={true} PreviewOnpress={onSubmit} />
            <View style={styles.singleLine} />
            <ScrollView contentContainerStyle={{
                paddingHorizontal: metrics.hp2,
                paddingBottom: metrics.hp5
            }} showsVerticalScrollIndicator={false}>
                <AppText style={{ marginTop: metrics.hp2 }} type={TWELVE} weight={INTER_SEMI_BOLD}>
                    Profile Strength
                </AppText>
                <TouchableOpacityView onPress={() => NavigationService.navigate(NAVIGATION_PROFILE_STRENGTH_SCREEN)} style={styles.persentageContainer}>
                    <AppText color={PURPLE} weight={INTER_EXTRA_BOLD} type={EIGHTEEN}>
                        0%
                    </AppText>
                    <FastImage source={keywordRightArrow} resizeMode="contain" style={styles.keywordRightArrow} />
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
                <AppText color={RED} weight={INTER_MEDIUM} type={TWELVE}>
                    Add {remaining} of your best photos.
                </AppText>
                <View style={styles.singleLine} />
                <HeadLineContiner
                    redText={"Important"}
                    setting={false}
                    circle={bio}
                    secondLine={"Tell about yourself fun and interesting thing."}
                    Icons={aboutIcon} headLines={"My Bio"} />
                <View style={styles.inputContainer}>
                    <TextInput
                        allowFontScaling={false}
                        placeholder="Write about you..."
                        placeholderTextColor={colors.opecity}
                        numberOfLines={5}
                        multiline={true}
                        maxLength={200}
                        onChangeText={(item) => setBio(item)}
                        value={bio}
                        style={{
                            fontSize: fontSize(12),
                            fontFamily: interMedium,
                            fontWeight: "500",
                            color: colors.black,
                        }}
                    />
                </View>
                <View style={styles.singleLine} />
                <HeadLineContiner
                    secondLine={"Add most specific interests you love"}
                    circle={userData?.languages}
                    Icons={personHeartIcon} headLines={"My Interests"} />
                <ButtonSheet Icons={personHeartIcon}
                    titile={"Select"} edit={true} data={userData?.languages}
                    onPress={() => NavigationService.navigate(NAVIGATION_PERSONAL_INTEREST_SCREEN, { filter: "My Interests" })} />
                <View style={styles.singleLine} />
                <HeadLineContiner
                    circle={userData?.height && userData?.pronouns?.length && userData?.zodiaSign}
                    Icons={infoIcon} headLines={"Personal Info"} />
                <EditButtonCommon
                    first={true} Icons={pronounIcon}
                    title={"Pronoun"}
                    filluptext={userData?.pronouns?.map((item: any) => { return `${item},` })}
                    onPress={() => NavigationService.navigate(NAVIGATION_PRONOUN_SCREEN, { filter: "Pronoun", data: userData?.pronouns })} />
                <EditButtonCommon Icons={straightenIcon}
                    title={"Height"} filluptext={userData?.height}
                    onPress={() => NavigationService.navigate(NAVIGATION_HEIGHT_SCREEN, { filter: "Height", data: userData?.height })} />
                <EditButtonCommon Icons={moonIcon}
                    title={"Zodiac"} filluptext={userData?.zodiaSign}
                    onPress={() => NavigationService.navigate(NAVIGATION_ZODIACSING_SCREEN, { filter: "Zodiac", data: userData?.zodiaSign })} />
                <View style={styles.singleLine} />
                <HeadLineContiner
                    circle={userData?.relationsShipStatus && userData?.preferredGender && userData?.relationshipPreference}
                    secondLine={"Covers most popular thing about you"}
                    Icons={moreAboutU} headLines={"More about you"} />
                <EditButtonCommon Icons={partnerheart}
                    title={"Relationship Status"}
                    first={true}
                    filluptext={userData?.relationsShipStatus}
                    onPress={() => NavigationService.navigate(NAVIGATION_RELATION_SCREEN, {filter: "Relationship Status", data: userData?.relationsShipStatus})} />
                <EditButtonCommon Icons={dateIcon}
                    title={"Whom to date"}
                    filluptext={userData?.preferredGender}
                    onPress={() => NavigationService.navigate(NAVIGATION_DATE_SCREEN, { filter: "Whom to date", data: userData?.preferredGender })} />
                <EditButtonCommon Icons={homeIcon}
                    title={"Dating Intentions"}
                    filluptext={userData?.relationshipPreference}
                    onPress={() => NavigationService.navigate(NAVIGATION_DATING_SCREEN, { filter: "Dating Intentions",data: userData?.relationshipPreference })} />
                <View style={styles.singleLine} />
                <HeadLineContiner
                    circle={false}
                    Icons={lifeStyleIcon} headLines={"About Your Lifestyle"} />
                <EditButtonCommon Icons={smookingIcon}
                    title={"Smoke"}
                    first={true}
                    onPress={() => NavigationService.navigate(NAVIGATION_COMMONSELECT_PAGE_SCREEN, { headline: "Smoke", data: SmokeData })} />
                <EditButtonCommon Icons={drikingIcon}
                    title={"Drink"}
                    filluptext={"Always"}
                    onPress={() => NavigationService.navigate(NAVIGATION_COMMONSELECT_PAGE_SCREEN, { headline: "Drink", data: DrinkData })} />
                <EditButtonCommon Icons={workIcon}
                    title={"Workout"}
                    onPress={() => NavigationService.navigate(NAVIGATION_COMMONSELECT_PAGE_SCREEN, { headline: "Workout", data: ExerciseData })} />
                <EditButtonCommon Icons={petsIcon}
                    title={"Pets"}
                    onPress={() => NavigationService.navigate(NAVIGATION_COMMONSELECT_PAGE_SCREEN, { headline: "Pets", data: dataPets })} />
                <EditButtonCommon Icons={religiousIcon}
                    title={"Religious Beliefs"}
                    filluptext={userData?.relegiousBelief?.map((item: any) => { return `${item},` })}
                    onPress={() => NavigationService.navigate(NAVIGATION_RELIGIOUS_SCREEN, { filter: "Religious Beliefs",data: userData?.relegiousBelief })} />
                <View style={styles.singleLine} />
                <HeadLineContiner
                    circle={userData?.education && userData?.work && userData?.jobTitle}
                    Icons={bussnisIcon} headLines={"Career Call"} />
                <EditButtonCommon Icons={schoolIcon}
                    title={"Education"}
                    first={true}
                    filluptext={userData?.education}
                    onPress={() => NavigationService.navigate(NAVIGATION_EDUCATION_SCREEN, { filter: "Education" , data: userData?.education})} />
                <EditButtonCommon Icons={workIcon}
                    title={"Work"}
                    filluptext={userData?.work}
                    onPress={() => NavigationService.navigate(NAVIGATION_WORK_PLACE_SCREEN, { filter: "Work", data: userData?.work })} />
                <EditButtonCommon Icons={searchIcon}
                    title={"Job Title"}
                    filluptext={userData?.jobTitle}
                    onPress={() => NavigationService.navigate(NAVIGATION_JOB_TITLE_SCREEN, { filter: "Job Title", data: userData?.jobTitle })} />
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
                    onPress={() => NavigationService.navigate(NAVIGATION_BELONG_SCREEN, { filter: "Hometown",data: userData?.homeTown })} />
                <View style={styles.singleLine} />
                <HeadLineContiner
                    circle={userData?.children && userData?.familyPlanning}
                    Icons={familyIcon} headLines={"Family Plans"} />
                <EditButtonCommon Icons={childrenIcon}
                    title={"Children"}
                    filluptext={userData?.children}
                    first={true}
                    onPress={() => NavigationService.navigate(NAVIGATION_CHILDERN_SCREEN, { filter: "Children",data: userData?.children })} />
                <EditButtonCommon Icons={familyIcon}
                    title={"Family Planning"}
                    filluptext={userData?.familyPlanning}
                    onPress={() => NavigationService.navigate(NAVIGATION_FAMILY_PLANING_SCREEN, { filter: "Family Planning",data: userData?.familyPlanning })} />
                <View style={styles.singleLine} />
                <HeadLineContiner
                    circle={userData?.gender}
                    Icons={ganderIcon} headLines={"Gender"} />
                <ButtonSheet Icons={personHeartIcon} headLines={"What are their interests?"}
                    color={userData?.gender ? true : false}
                    titile={userData?.gender ? userData?.gender : "Add Gender"} edit={true} hidden={"Hidden"}
                    onPress={() => NavigationService.navigate(NAVIGATION_GANDER_SCREEN, { filter: "Add Gender", data: userData?.gender })} />
                <View style={styles.singleLine} />
                <HeadLineContiner
                    circle={userData?.sexualOrientation}
                    Icons={sexualityIcon} headLines={"Sexuality"} />
                <ButtonSheet Icons={personHeartIcon} headLines={"What are their interests?"}
                    titile={userData?.sexualOrientation ? userData?.sexualOrientation : "Add Sexuality"} edit={true} hidden={"Hidden"}
                    color={userData?.sexualOrientation ? true : false}
                    onPress={() => NavigationService.navigate(NAVIGATION_SEXUALITY_SCREEN, { filter: "Add Sexuality" ,data: userData?.sexualOrientation})} />
                <View style={styles.singleLine} />
                <HeadLineContiner
                    circle={userData?.languages?.length}
                    Icons={langIcon} headLines={"Language"} />
                <ButtonSheet Icons={personHeartIcon} headLines={"What are their interests?"}
                    titile={"Add Language"} edit={true} data={userData?.languages}
                    onPress={() => NavigationService.navigate(NAVIGATION_LANGUAGE_SPEAK_SCREEN, { filter: "Add Language",data: userData?.languages })} />
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
        borderWidth: metrics.hp0_2,
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
    }
})
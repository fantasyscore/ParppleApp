import React, { useEffect, useRef, useState } from "react";
import { Dimensions, ImageBackground, Platform, StyleSheet, View } from "react-native";
import { AppText, BLACK, ELEVEN, FORTEEN, INTER_BOLD, INTER_MEDIUM, INTER_SEMI_BOLD, LIGHT_BLACK, OPECITY_DARK, TWELVE, TWENTY, WHITE } from "../../common/AppText";
import FastImage from "react-native-fast-image";
import { accountcircleIcon, bioqutes, blueTikeIcon, bussnisIcon, drikingIcon, lifeStyleIcon, locationCIon, moonIcon, oneIconDating, personHeartIcon, petsIcon, pronounIcon, schoolIcon, searchIcon, smookingIcon, straightenIcon, upArrowIcon, workoutIcon } from "../../helper/ImageAssets";
import { colors } from "../../theme/colors";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import metrics from "../../assets/Metrics";
import LinearGradient from 'react-native-linear-gradient';
import { datapersonal, editProfileData, editProfilelistData } from "../../common/UiltData";
import { useSelector } from "react-redux";
import { datingIntentionsFilter } from "../../helper/utility";
import Animated, {
    Easing,
    Extrapolate,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

const { height } = Dimensions.get("window");
const FULL_IMAGE_HEIGHT = height * 0.80; // Adjust this value as needed
const COLLAPSED_IMAGE_HEIGHT = height * 0.6; // Adjust this value as needed

const ChatProfileScreen = ({ always }: any) => {
    const otherUserProfile = useSelector((state: any) => state.auth.otherUserProfile);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [updown, setupdown] = useState(false);
    // UI-thread animation progress (0 = expanded, 1 = collapsed)
    const progress = useSharedValue(0);
    const isMountedRef = useRef(true);
    const scrollViewRef = useRef<any>(null);
    
    // Ensure currentPhotoIndex is within bounds
    const gallery = otherUserProfile?.gallery || [];
    const safePhotoIndex = gallery.length > 0 ? Math.min(currentPhotoIndex, gallery.length - 1) : 0;

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Extract attributes from otherUserProfile
    const attributes = otherUserProfile?.attributes?.filter(
        (item: any) => !["smoke", "drink", "workout", "pets"].includes(item?.type)
    ) || [];
    const workout = otherUserProfile?.attributes?.find((item: any) => item.type === "workout");
    const smoke = otherUserProfile?.attributes?.find((item: any) => item.type === "smoke");
    const drink = otherUserProfile?.attributes?.find((item: any) => item.type === "drink");
    const pets = otherUserProfile?.attributes?.find((item: any) => item.type === "pets");

    // Get gallery length for progress indicators
    const galleryLength = otherUserProfile?.gallery?.length || 0;

    const mainContainerAnimatedStyle = useAnimatedStyle(() => {
        return {
            height: interpolate(
                progress.value,
                [0, 1],
                [FULL_IMAGE_HEIGHT, COLLAPSED_IMAGE_HEIGHT],
                Extrapolate.CLAMP
            ),
        };
    });
    const bottomDetailsAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(progress.value, [0, 0.5], [1, 0], Extrapolate.CLAMP),
        };
    });
    const arrowAnimatedStyle = useAnimatedStyle(() => {
        const deg = interpolate(progress.value, [0, 1], [0, 180], Extrapolate.CLAMP);
        return {
            transform: [{ rotate: `${deg}deg` }],
        };
    });
    const arrowContainerAnimatedStyle = useAnimatedStyle(() => {
        return {
            bottom: interpolate(progress.value, [0, 1], [metrics.hp12, metrics.hp2], Extrapolate.CLAMP),
        };
    });
    const scrollContentAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(progress.value, [0.5, 1], [0, 1], Extrapolate.CLAMP),
        };
    });

    const updownAction = () => {
        const goingToCollapse = !updown;
        
        // ✅ RESET SCROLL ONLY ON JS THREAD
        if (!goingToCollapse && scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: 0, animated: false });
        }
        
        progress.value = withTiming(
            goingToCollapse ? 1 : 0,
            { duration: 260, easing: Easing.out(Easing.cubic) }
        );
        
        // ✅ Update state on JS thread
        if (isMountedRef.current) {
            setupdown(goingToCollapse);
        }
    };

    const preloadAroundIndex = (gallery: any[] | undefined, idx: number) => {
        try {
            if (!gallery || !Array.isArray(gallery) || gallery.length === 0) return;
            const urls = [
                gallery?.[idx]?.url,
                idx > 0 ? gallery?.[idx - 1]?.url : null,
                idx < gallery.length - 1 ? gallery?.[idx + 1]?.url : null,
            ].filter(Boolean);
            if (urls.length === 0) return;
            FastImage.preload(
                urls.map((uri: any, i: number) => ({
                    uri: String(uri),
                    priority: i === 0 ? FastImage.priority.high : FastImage.priority.normal,
                }))
            );
        } catch (e) {
            // ignore preload errors
        }
    };

    // Preload current image + neighbors whenever index/gallery changes
    useEffect(() => {
        preloadAroundIndex(otherUserProfile?.gallery, safePhotoIndex);
    }, [safePhotoIndex, otherUserProfile?.gallery]);
    
    // Reset photo index if gallery changes and current index is out of bounds
    useEffect(() => {
        if (gallery.length > 0 && currentPhotoIndex >= gallery.length) {
            setCurrentPhotoIndex(0);
        }
    }, [gallery.length, currentPhotoIndex]);

    const nextPhoto = () => {
        if (galleryLength > 0) {
            let newIndex;
            if (safePhotoIndex < galleryLength - 1) {
                newIndex = safePhotoIndex + 1;
            } else {
                newIndex = 0;
            }

            // Preload images before changing index
            if (gallery && gallery[newIndex]?.url) {
                const targetImageUrl = gallery[newIndex].url;
                FastImage.preload([{ uri: String(targetImageUrl), priority: FastImage.priority.high }]);

                // Preload adjacent images
                if (newIndex > 0 && gallery[newIndex - 1]?.url) {
                    FastImage.preload([{ uri: String(gallery[newIndex - 1].url), priority: FastImage.priority.normal }]);
                }
                if (newIndex < galleryLength - 1 && gallery[newIndex + 1]?.url) {
                    FastImage.preload([{ uri: String(gallery[newIndex + 1].url), priority: FastImage.priority.normal }]);
                }
            }

            if (newIndex >= 0 && newIndex < galleryLength) {
                setCurrentPhotoIndex(newIndex);
            }
        }
    };

    const prevPhoto = () => {
        if (galleryLength > 0) {
            let newIndex;
            if (safePhotoIndex > 0) {
                newIndex = safePhotoIndex - 1;
            } else {
                newIndex = galleryLength - 1;
            }

            // Preload images before changing index
            if (gallery && gallery[newIndex]?.url) {
                const targetImageUrl = gallery[newIndex].url;
                FastImage.preload([{ uri: String(targetImageUrl), priority: FastImage.priority.high }]);

                // Preload adjacent images
                if (newIndex > 0 && gallery[newIndex - 1]?.url) {
                    FastImage.preload([{ uri: String(gallery[newIndex - 1].url), priority: FastImage.priority.normal }]);
                }
                if (newIndex < galleryLength - 1 && gallery[newIndex + 1]?.url) {
                    FastImage.preload([{ uri: String(gallery[newIndex + 1].url), priority: FastImage.priority.normal }]);
                }
            }

            if (newIndex >= 0 && newIndex < galleryLength) {
                setCurrentPhotoIndex(newIndex);
            }
        }
    };

    const renderProgressLine = (white: any) => {
        if (!galleryLength) return null;
        return (
            <View
                style={[
                    styles.progressContainer,
                    { flexDirection: "row", justifyContent: "space-between" },
                ]}>
                {Array.from({ length: galleryLength }).map((_, i) => {
                    const isFilled = i <= safePhotoIndex;
                    return (
                        <View
                            key={i}
                            style={[
                                styles.progressSegment,
                                {
                                    flex: 1,
                                    marginHorizontal: metrics.hp0_2,
                                    backgroundColor: isFilled
                                        ? white
                                            ? colors.white
                                            : colors.black
                                        : white
                                            ? colors.lightWhite
                                            : colors.nanoOpecity,
                                    borderRadius: metrics.hp0_3,
                                },
                            ]}
                        />
                    );
                })}
            </View>
        );
    };
    return (
            <Animated.ScrollView
                ref={scrollViewRef}
                style={[
                    styles.scrollContainer,
                    Platform.OS === "ios" ? { opacity: 1 } : {
                        opacity: 1,
                        pointerEvents: updown ? 'auto' : 'none',
                    },
                ]}
                contentContainerStyle={{ paddingBottom: metrics.hp10 }}
                showsVerticalScrollIndicator={false}
                scrollEnabled={updown}>
                <Animated.View style={[styles.mainContainer, mainContainerAnimatedStyle]}>
                    <ImageBackground
                        source={{ uri: gallery?.[safePhotoIndex]?.url || gallery?.[0]?.url || "" }}
                        style={styles.imageBackground}
                        imageStyle={{ borderRadius: 20 }}>
                        <View >{renderProgressLine(true)}</View>
                        <View style={{ flex: 1 }} />
                        <Animated.View style={bottomDetailsAnimatedStyle}>
                            <LinearGradient start={{ x: 1, y: 1 }}
                                end={{ x: 1, y: 0 }} colors={["#000000", "#00000099", "#00000000"]} style={styles.bottomDetails}>
                                <View style={{ marginTop: metrics.hp8, paddingHorizontal: Platform.OS === "ios" ? metrics.hp2 : metrics.hp0 }}>
                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        <AppText style={{ textTransform: "capitalize" }} type={TWENTY} color={WHITE} weight={INTER_BOLD}>
                                            {String(otherUserProfile?.firstName || "")}, {String(otherUserProfile?.age || "")}{" "}
                                        </AppText>
                                        {otherUserProfile?.faceVerified && Platform.OS==="ios" ? (
                                            <FastImage
                                                source={blueTikeIcon}
                                                resizeMode="contain"
                                                style={styles.blueTikIcon}
                                            />
                                        ):
                                        <FastImage
                                        source={blueTikeIcon}
                                        resizeMode="contain"
                                        style={styles.blueTikIcon}
                                    />
                                        }
                                    </View>
                                    {otherUserProfile?.work && (
                                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                                            <FastImage
                                                source={bussnisIcon}
                                                tintColor={colors.white}
                                                resizeMode="contain"
                                                style={styles.loctionIcon}
                                            />
                                            <AppText type={ELEVEN} color={WHITE} weight={INTER_MEDIUM}>
                                                {" "}
                                                {String(otherUserProfile?.work || "")}
                                            </AppText>
                                        </View>
                                    )}
                                </View>
                            </LinearGradient>
                            <View style={styles.wrapContainer}>
                                {otherUserProfile?.zodiaSign && (
                                    <View style={styles.listContainer}>
                                        <FastImage
                                            tintColor={colors.white}
                                            source={moonIcon}
                                            resizeMode="contain"
                                            style={styles.icons}
                                        />
                                        <AppText color={WHITE} weight={INTER_MEDIUM} type={ELEVEN}>
                                            {"  "}
                                            {String(otherUserProfile?.zodiaSign || "")}
                                        </AppText>
                                    </View>
                                )}
                                {smoke && (
                                    <View style={styles.listContainer}>
                                        <FastImage
                                            tintColor={colors.white}
                                            source={smookingIcon}
                                            resizeMode="contain"
                                            style={styles.icons}
                                        />
                                        <AppText color={WHITE} weight={INTER_MEDIUM} type={ELEVEN}>
                                            {"  "}
                                            {String(smoke?.displayLabel || "")}
                                        </AppText>
                                    </View>
                                )}
                                {otherUserProfile?.city && (
                                    <View style={styles.listContainer}>
                                        <FastImage
                                            tintColor={colors.white}
                                            source={locationCIon}
                                            resizeMode="contain"
                                            style={styles.icons}
                                        />
                                        <AppText color={WHITE} weight={INTER_MEDIUM} type={ELEVEN}>
                                            {"  "}
                                            {String(otherUserProfile?.city || "")}
                                        </AppText>
                                    </View>
                                )}
                            </View>
                        </Animated.View>
                        <TouchableOpacityView
                            onPress={prevPhoto}
                            style={styles.touchableAreaLeft}
                        />
                        <TouchableOpacityView
                            onPress={nextPhoto}
                            style={styles.touchableAreaRight}
                        />

                        <Animated.View
                            style={[styles.upArrowContainer, arrowContainerAnimatedStyle]}>
                            <TouchableOpacityView style={styles.upArrowContainerTwo} onPress={updownAction}>
                                <Animated.View
                                    style={arrowAnimatedStyle}>
                                    <FastImage
                                        source={upArrowIcon}
                                        resizeMode="contain"
                                        style={styles.uparrowIcon}
                                    />
                                </Animated.View>
                            </TouchableOpacityView>
                        </Animated.View>

                    </ImageBackground>
                </Animated.View>
                <Animated.View style={scrollContentAnimatedStyle}>
                    {otherUserProfile?.relationshipPreference && (
                        <View style={styles.longContainer}>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <FastImage source={searchIcon} tintColor={colors.darkOpecity} resizeMode="contain" style={styles.searchIcon} />
                                <AppText type={ELEVEN} weight={INTER_SEMI_BOLD} color={OPECITY_DARK}>
                                    {"   "}Dating Intentions
                                </AppText>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", marginTop: metrics.hp1, marginLeft: metrics.hp3 }}>
                                <FastImage source={oneIconDating} resizeMode="contain" style={styles.searchIcon} />
                                <AppText type={FORTEEN} weight={INTER_BOLD} color={BLACK}>
                                    {"   "}{String(datingIntentionsFilter(otherUserProfile?.relationshipPreference) || "")}
                                </AppText>
                            </View>
                        </View>
                    )}
                    {otherUserProfile?.bio && (
                        <View style={styles.bioContinaer}>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <FastImage source={bioqutes} resizeMode="contain" style={styles.bioIcon} />
                                <AppText type={ELEVEN} weight={INTER_SEMI_BOLD} color={OPECITY_DARK}>
                                    {" "}My bio
                                </AppText>
                            </View>
                            <AppText style={{ paddingVertical: metrics.hp1, }} type={ELEVEN} weight={INTER_SEMI_BOLD} color={OPECITY_DARK}>
                                {String(otherUserProfile?.bio || "")}
                            </AppText>
                        </View>
                    )}
                    {/* My Vitals Section */}
                    {(otherUserProfile?.education || otherUserProfile?.jobTitle || otherUserProfile?.homeTown) && (
                        <View style={styles.bioContinaer}>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <FastImage tintColor={colors.darkOpecity} source={accountcircleIcon} resizeMode="contain" style={styles.iconsFrom} />
                                <AppText type={ELEVEN} weight={INTER_BOLD} color={OPECITY_DARK}>
                                    {"  "}My Vitals
                                </AppText>
                            </View>
                            {otherUserProfile?.education && (
                                <View style={[styles.insideContainer, { marginTop: metrics.hp1 }]}>
                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        <FastImage tintColor={colors.darkOpecity} source={schoolIcon} resizeMode="contain" style={styles.bioIcon} />
                                        <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                            {"    "}Education
                                        </AppText>
                                    </View>
                                    <AppText style={{ marginTop: metrics.hp0_5 }} type={ELEVEN} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                                        {String(otherUserProfile?.education || "")}
                                    </AppText>
                                </View>
                            )}
                            {otherUserProfile?.jobTitle && (
                                <View style={[styles.insideContainer, { marginTop: metrics.hp0_5 }]}>
                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        <FastImage tintColor={colors.darkOpecity} source={searchIcon} resizeMode="contain" style={styles.bioIcon} />
                                        <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                            {"    "}Job
                                        </AppText>
                                    </View>
                                    <AppText style={{ marginTop: metrics.hp0_5 }} type={ELEVEN} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                                        {String(otherUserProfile?.jobTitle || "")}
                                    </AppText>
                                </View>
                            )}
                            {otherUserProfile?.homeTown && (
                                <View style={[styles.insideContainer, { marginTop: metrics.hp0_5 }]}>
                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        <FastImage tintColor={colors.darkOpecity} source={locationCIon} resizeMode="contain" style={styles.bioIcon} />
                                        <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                            {"    "}Location
                                        </AppText>
                                    </View>
                                    <AppText style={{ marginTop: metrics.hp0_5 }} type={ELEVEN} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                                        {String(otherUserProfile?.homeTown || "")}
                                    </AppText>
                                </View>
                            )}
                        </View>
                    )}
                    {/* About Me Section */}
                    {(otherUserProfile?.pronouns?.length > 0 || otherUserProfile?.height || otherUserProfile?.zodiaSign) && (
                        <View style={styles.bioContinaer}>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <FastImage tintColor={colors.darkOpecity} source={accountcircleIcon} resizeMode="contain" style={styles.iconsFrom} />
                                <AppText type={ELEVEN} weight={INTER_BOLD} color={OPECITY_DARK}>
                                    {"  "}About me
                                </AppText>
                            </View>
                            {otherUserProfile?.pronouns?.length > 0 && (
                                <View style={[styles.insideContainer, { marginTop: metrics.hp1 }]}>
                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        <FastImage tintColor={colors.darkOpecity} source={pronounIcon} resizeMode="contain" style={styles.bioIcon} />
                                        <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                            {"    "}Pronoun
                                        </AppText>
                                    </View>
                                    <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", marginTop: metrics.hp0_5 }}>
                                        {otherUserProfile?.pronouns && Array.isArray(otherUserProfile.pronouns) && otherUserProfile.pronouns.map((value: any, index: any) => (
                                            <AppText key={index} style={{ marginRight: metrics.hp0_5 }} type={ELEVEN} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                                                {String(value || "")}
                                            </AppText>
                                        ))}
                                    </View>
                                </View>
                            )}
                            {otherUserProfile?.height && (
                                <View style={[styles.insideContainer, { marginTop: metrics.hp0_5 }]}>
                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        <FastImage tintColor={colors.darkOpecity} source={straightenIcon} resizeMode="contain" style={styles.bioIcon} />
                                        <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                            {"    "}Height
                                        </AppText>
                                    </View>
                                    <AppText style={{ marginTop: metrics.hp0_5 }} type={ELEVEN} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                                        {String(otherUserProfile?.height || "")}
                                    </AppText>
                                </View>
                            )}
                            {otherUserProfile?.zodiaSign && (
                                <View style={[styles.insideContainer, { marginTop: metrics.hp0_5 }]}>
                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        <FastImage tintColor={colors.darkOpecity} source={moonIcon} resizeMode="contain" style={styles.bioIcon} />
                                        <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                            {"    "}Zodiac
                                        </AppText>
                                    </View>
                                    <AppText style={{ marginTop: metrics.hp0_5 }} type={ELEVEN} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                                        {String(otherUserProfile?.zodiaSign || "")}
                                    </AppText>
                                </View>
                            )}
                        </View>
                    )}
                    {/* Lifestyle Section */}
                    {(smoke || drink || workout || pets) && (
                        <View style={styles.bioContinaer}>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <FastImage tintColor={colors.darkOpecity} source={lifeStyleIcon} resizeMode="contain" style={styles.iconsFrom} />
                                <AppText type={ELEVEN} weight={INTER_BOLD} color={OPECITY_DARK}>
                                    {"  "}Lifestyle
                                </AppText>
                            </View>
                            {smoke && (
                                <View style={[styles.insideContainer, { marginTop: metrics.hp1 }]}>
                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        <FastImage tintColor={colors.darkOpecity} source={smookingIcon} resizeMode="contain" style={styles.bioIcon} />
                                        <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                            {"    "}Smoke
                                        </AppText>
                                    </View>
                                    <AppText style={{ marginTop: metrics.hp0_5 }} type={ELEVEN} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                                        {String(smoke?.displayLabel || "")}
                                    </AppText>
                                </View>
                            )}
                            {drink && (
                                <View style={[styles.insideContainer, { marginTop: metrics.hp0_5 }]}>
                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        <FastImage tintColor={colors.darkOpecity} source={drikingIcon} resizeMode="contain" style={styles.bioIcon} />
                                        <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                            {"    "}Drink
                                        </AppText>
                                    </View>
                                    <AppText style={{ marginTop: metrics.hp0_5 }} type={ELEVEN} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                                        {String(drink?.displayLabel || "")}
                                    </AppText>
                                </View>
                            )}
                            {workout && (
                                <View style={[styles.insideContainer, { marginTop: metrics.hp0_5 }]}>
                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        <FastImage tintColor={colors.darkOpecity} source={workoutIcon} resizeMode="contain" style={styles.bioIcon} />
                                        <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                            {"    "}Workout
                                        </AppText>
                                    </View>
                                    <AppText style={{ marginTop: metrics.hp0_5 }} type={ELEVEN} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                                        {String(workout?.displayLabel || "")}
                                    </AppText>
                                </View>
                            )}
                            {pets && (
                                <View style={[styles.insideContainer, { marginTop: metrics.hp0_5 }]}>
                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        <FastImage tintColor={colors.darkOpecity} source={petsIcon} resizeMode="contain" style={styles.bioIcon} />
                                        <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                            {"    "}Pets
                                        </AppText>
                                    </View>
                                    <AppText style={{ marginTop: metrics.hp0_5 }} type={ELEVEN} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                                        {String(pets?.displayLabel || "")}
                                    </AppText>
                                </View>
                            )}
                        </View>
                    )}
                    {/* Interests Section */}
                    {attributes && attributes.length > 0 && (
                        <View style={styles.bioContinaer}>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <FastImage tintColor={colors.darkOpecity} source={personHeartIcon} resizeMode="contain" style={styles.iconsFrom} />
                                <AppText type={ELEVEN} weight={INTER_BOLD} color={OPECITY_DARK}>
                                    {"  "}Interests
                                </AppText>
                            </View>
                            <View style={styles.wrapContainerTwo}>
                                {attributes && Array.isArray(attributes) && attributes.map((item: any, index: any) => {
                                    return (
                                        <View key={item?._id || index} style={styles.containerSelect}>
                                            <AppText type={TWELVE} weight={INTER_MEDIUM}>
                                                {String(item?.displayLabel || "")}
                                            </AppText>
                                        </View>
                                    )
                                })}
                            </View>
                        </View>
                    )}
                </Animated.View>
            </Animated.ScrollView>
    )
};
export default ChatProfileScreen;
const styles = StyleSheet.create({
    mainContainer: {
        marginHorizontal: metrics.hp1,
        marginVertical: metrics.hp2,
    },
    imageBackground: {
        flex: 1,
        borderRadius: 20,
    },
    singleLine: {
        height: metrics.hp0_2,
        backgroundColor: colors.nanoOpecity,
        marginTop: metrics.hp1,
    },
    progressContainer: {
        height: metrics.hp0_5,
        marginHorizontal: metrics.hp2,
        marginTop: metrics.hp1,
    },
    progressSegment: {
        height: "100%",
    },
    blueTikIcon: {
        height: metrics.hp2_5,
        width: metrics.hp2_5,
        marginTop: metrics.hp0_5,
    },
    loctionIcon: {
        height: metrics.hp2,
        width: metrics.hp2,
    },
    bottomDetails: {
        position: "absolute",
        bottom: Platform.OS === "ios" ? metrics.hp0 : -metrics.hp2,
        width: "100%",
        height: metrics.hp25,
        paddingHorizontal: Platform.OS === "ios" ? 0 : metrics.hp2,
        borderBottomLeftRadius: metrics.hp2,
        borderBottomRightRadius: metrics.hp2,
    },
    upArrowContainer: {
        height: metrics.hp5,
        width: metrics.hp5,
        borderRadius: metrics.hp50,
        borderWidth: metrics.hp0_1,
        borderColor: "#FFFFFF4D",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#00000033",
        marginRight: metrics.hp2,
        position: "absolute",
        right: 0,
    },
    upArrowContainerTwo: {
        height: metrics.hp5,
        width: metrics.hp5,
        alignItems: "center",
        justifyContent: "center",
    },
    uparrowIcon: {
        height: metrics.hp2_3,
        width: metrics.hp1_9,
    },
    wrapContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: metrics.hp1_3,
        // marginTop: -metrics.hp1_5,
        marginBottom: metrics.hp5,
        paddingHorizontal: metrics.hp2,
    },
    wrapContainerTwo: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: metrics.hp1,
        marginTop: metrics.hp1,
    },
    listContainer: {
        height: metrics.hp3,
        paddingHorizontal: metrics.hp1_6,
        borderRadius: metrics.hp4,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.brownBack,
        flexDirection: "row",
    },
    icons: {
        height: metrics.hp1_6,
        width: metrics.hp1_6,
    },
    headLinesContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    longContainer: {
        backgroundColor: colors.lightBack,
        borderRadius: metrics.hp1_5,
        paddingHorizontal: metrics.hp1,
        paddingVertical: metrics.hp1,
        height: metrics.hp9,
        marginHorizontal: metrics.hp2
    },
    searchIcon: {
        height: metrics.hp2_5,
        width: metrics.hp2_5,
    },
    scrollContainer: {
        flex: 1,
    },
    touchableAreaLeft: {
        width: "50%",
        height: "80%",
        position: "absolute",
        top: 0,
        zIndex: 10,
    },
    touchableAreaRight: {
        width: "50%",
        height: "80%",
        position: "absolute",
        right: 0,
        top: 0,
        zIndex: 10,
    },
    bioContinaer: {
        paddingVertical: metrics.hp1,
        paddingHorizontal: metrics.hp1,
        backgroundColor: colors.lightBack,
        borderRadius: metrics.hp1_5,
        marginTop: metrics.hp1,
        marginHorizontal: metrics.hp2
    },
    bioIcon: {
        height: metrics.hp2,
        width: metrics.hp2
    },
    iconsFrom: {
        height: metrics.hp2_5,
        width: metrics.hp2_5
    },
    insideContainer: {
        paddingHorizontal: metrics.hp2,
        paddingVertical: metrics.hp1,
        backgroundColor: colors.white,
        borderRadius: metrics.hp1
    },
    containerSelect: {
        height: metrics.hp3,
        paddingHorizontal: metrics.hp1_6,
        borderRadius: metrics.hp4,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.green,
    }
});
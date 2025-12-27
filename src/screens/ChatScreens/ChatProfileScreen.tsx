import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, ImageBackground, StyleSheet, View } from "react-native";
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

const { height } = Dimensions.get("window");
const FULL_IMAGE_HEIGHT = height * 0.80; // Adjust this value as needed
const COLLAPSED_IMAGE_HEIGHT = height * 0.4; // Adjust this value as needed

const ChatProfileScreen = ({ always }: any) => {
    const otherUserProfile = useSelector((state: any) => state.auth.otherUserProfile);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [updown, setupdown] = useState(false);
    const animationValue = useRef(new Animated.Value(0)).current;

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

    // We use a single Animated.Value to drive all animations
    const animatedHeight = animationValue.interpolate({
        inputRange: [0, 1],
        outputRange: [FULL_IMAGE_HEIGHT, COLLAPSED_IMAGE_HEIGHT],
        extrapolate: 'clamp',
    });
    const bottomDetailsOpacity = animationValue.interpolate({
        inputRange: [0, 0.5],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });
    const topTextOpacity = animationValue.interpolate({
        inputRange: [0.5, 1],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });
    const topTextOpacityon = animationValue.interpolate({
        inputRange: [0.5, 1],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });
    const arrowRotation = animationValue.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "180deg"],
    });
    const bottomPosition = animationValue.interpolate({
        inputRange: [0, 1],
        outputRange: [metrics.hp12, metrics.hp2],
        extrapolate: 'clamp',
    });
    const scrollContentOpacity = animationValue.interpolate({
        inputRange: [0.5, 1],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    const updownAction = () => {
        const toValue = updown ? 0 : 1;
        Animated.timing(animationValue, {
            toValue,
            duration: 300,
            useNativeDriver: false, // height animation needs this set to false
        }).start(() => {
            setupdown(!updown);
        });
    };

    // Preload images when otherUserProfile changes
    useEffect(() => {
        if (otherUserProfile?.gallery && otherUserProfile.gallery.length > 0) {
            const currentIndex = currentPhotoIndex;
            const gallery = otherUserProfile.gallery;

            const imagesToPreload = [
                gallery[currentIndex]?.url,
                currentIndex > 0 ? gallery[currentIndex - 1]?.url : null,
                currentIndex < gallery.length - 1 ? gallery[currentIndex + 1]?.url : null,
            ].filter(Boolean);

            imagesToPreload.forEach((url: string) => {
                if (url) {
                    FastImage.preload([{ uri: url, priority: FastImage.priority.normal }]);
                }
            });
        }
    }, [otherUserProfile]);

    // Preload images when currentPhotoIndex changes
    useEffect(() => {
        if (otherUserProfile?.gallery && otherUserProfile.gallery.length > 0) {
            const currentIndex = currentPhotoIndex;
            const gallery = otherUserProfile.gallery;

            // Preload current image with high priority
            if (gallery[currentIndex]?.url) {
                FastImage.preload([{ uri: gallery[currentIndex].url, priority: FastImage.priority.high }]);
            }

            // Preload adjacent images with normal priority
            if (currentIndex > 0 && gallery[currentIndex - 1]?.url) {
                FastImage.preload([{ uri: gallery[currentIndex - 1].url, priority: FastImage.priority.normal }]);
            }
            if (currentIndex < gallery.length - 1 && gallery[currentIndex + 1]?.url) {
                FastImage.preload([{ uri: gallery[currentIndex + 1].url, priority: FastImage.priority.normal }]);
            }
        }
    }, [currentPhotoIndex, otherUserProfile?.gallery]);

    const nextPhoto = () => {
        if (galleryLength > 0) {
            let newIndex;
            if (currentPhotoIndex < galleryLength - 1) {
                newIndex = currentPhotoIndex + 1;
            } else {
                newIndex = 0;
            }

            // Preload images before changing index
            if (otherUserProfile?.gallery && otherUserProfile.gallery[newIndex]?.url) {
                const targetImageUrl = otherUserProfile.gallery[newIndex].url;
                FastImage.preload([{ uri: targetImageUrl, priority: FastImage.priority.high }]);

                // Preload adjacent images
                if (newIndex > 0 && otherUserProfile.gallery[newIndex - 1]?.url) {
                    FastImage.preload([{ uri: otherUserProfile.gallery[newIndex - 1].url, priority: FastImage.priority.normal }]);
                }
                if (newIndex < galleryLength - 1 && otherUserProfile.gallery[newIndex + 1]?.url) {
                    FastImage.preload([{ uri: otherUserProfile.gallery[newIndex + 1].url, priority: FastImage.priority.normal }]);
                }
            }

            setCurrentPhotoIndex(newIndex);
        }
    };

    const prevPhoto = () => {
        if (galleryLength > 0) {
            let newIndex;
            if (currentPhotoIndex > 0) {
                newIndex = currentPhotoIndex - 1;
            } else {
                newIndex = galleryLength - 1;
            }

            // Preload images before changing index
            if (otherUserProfile?.gallery && otherUserProfile.gallery[newIndex]?.url) {
                const targetImageUrl = otherUserProfile.gallery[newIndex].url;
                FastImage.preload([{ uri: targetImageUrl, priority: FastImage.priority.high }]);

                // Preload adjacent images
                if (newIndex > 0 && otherUserProfile.gallery[newIndex - 1]?.url) {
                    FastImage.preload([{ uri: otherUserProfile.gallery[newIndex - 1].url, priority: FastImage.priority.normal }]);
                }
                if (newIndex < galleryLength - 1 && otherUserProfile.gallery[newIndex + 1]?.url) {
                    FastImage.preload([{ uri: otherUserProfile.gallery[newIndex + 1].url, priority: FastImage.priority.normal }]);
                }
            }

            setCurrentPhotoIndex(newIndex);
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
                    const isFilled = i <= currentPhotoIndex;
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
        <View style={{ flex: 1 }}>
            {/* {!updown && <Animated.View style={{ opacity: topTextOpacityon }}>{renderProgressLine(false)}</Animated.View>} */}
            <Animated.ScrollView
                style={[
                    styles.scrollContainer,
                    {
                        opacity: 1,
                        pointerEvents: updown ? 'auto' : 'none',
                    },
                ]}
                contentContainerStyle={{ paddingBottom: metrics.hp10 }}
                showsVerticalScrollIndicator={false}
                scrollEnabled={updown}>
                <Animated.View style={[styles.mainContainer, { height: animatedHeight }]}>
                    <ImageBackground
                        source={{ uri: otherUserProfile?.gallery?.[currentPhotoIndex]?.url || otherUserProfile?.gallery?.[0]?.url }}
                        style={styles.imageBackground}
                        imageStyle={{ borderRadius: 20 }}>
                        <View >{renderProgressLine(true)}</View>
                        <View style={{ flex: 1 }} />
                        <Animated.View style={{ opacity: bottomDetailsOpacity }}>
                            <LinearGradient start={{ x: 1, y: 1 }}
                                end={{ x: 1, y: 0 }} colors={["#000000", "#00000099", "#00000000"]} style={styles.bottomDetails}>
                                <View style={{ marginTop: metrics.hp8 }}>
                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        <AppText type={TWENTY} color={WHITE} weight={INTER_BOLD}>
                                            {otherUserProfile?.firstName || ''}, {otherUserProfile?.age || ''}{" "}
                                        </AppText>
                                        {otherUserProfile?.isVerified && (
                                            <FastImage
                                                source={blueTikeIcon}
                                                resizeMode="contain"
                                                style={styles.blueTikIcon}
                                            />
                                        )}
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
                                                {otherUserProfile?.work}
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
                                            {otherUserProfile?.zodiaSign}
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
                                            {smoke?.displayLabel || 'Smoker'}
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
                                            {otherUserProfile?.city}
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
                            style={[styles.upArrowContainer, { bottom: bottomPosition }]}>
                            <TouchableOpacityView onPress={updownAction}>
                                <Animated.View
                                    style={{ transform: [{ rotate: arrowRotation }] }}>
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
                <Animated.View style={{ opacity: scrollContentOpacity }}>
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
                                    {"   "}{datingIntentionsFilter(otherUserProfile?.relationshipPreference) || 'Not specified'}
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
                                {otherUserProfile?.bio}
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
                                        {otherUserProfile?.education}
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
                                        {otherUserProfile?.jobTitle}
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
                                        {otherUserProfile?.homeTown}
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
                                        {otherUserProfile?.pronouns?.map((value: any, index: any) => (
                                            <AppText key={index} style={{ marginRight: metrics.hp0_5 }} type={ELEVEN} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                                                {value}
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
                                        {otherUserProfile?.height}
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
                                        {otherUserProfile?.zodiaSign}
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
                                        {smoke?.displayLabel}
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
                                        {drink?.displayLabel}
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
                                        {workout?.displayLabel}
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
                                        {pets?.displayLabel}
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
                                {attributes?.map((item: any, index: any) => {
                                    return (
                                        <View key={item._id || index} style={styles.containerSelect}>
                                            <AppText type={TWELVE} weight={INTER_MEDIUM}>
                                                {item?.displayLabel}
                                            </AppText>
                                        </View>
                                    )
                                })}
                            </View>
                        </View>
                    )}
                </Animated.View>
            </Animated.ScrollView>
        </View>
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
        bottom: -metrics.hp2,
        width: "100%",
        height: metrics.hp25,
        paddingHorizontal: metrics.hp2,
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
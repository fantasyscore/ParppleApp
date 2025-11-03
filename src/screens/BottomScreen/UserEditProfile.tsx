import React, { useState, useRef } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import {
    ImageBackground,
    StyleSheet,
    View,
    Animated,
    Dimensions,
    ScrollView,
} from "react-native";
import HeaderCommon from "../../common/HeaderCommon";
import metrics from "../../assets/Metrics";
import { colors } from "../../theme/colors";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import { Screen } from "../../theme/dimens";
import {
    AppText,
    BLACK,
    ELEVEN,
    FORTEEN,
    INTER_BOLD,
    INTER_MEDIUM,
    INTER_SEMI_BOLD,
    LIGHT_BLACK,
    OPECITY_DARK,
    TWELVE,
    TWENTY,
    WHITE,
} from "../../common/AppText";
import FastImage from "react-native-fast-image";
import {
    accountcircleIcon,
    bioqutes,
    blueTikeIcon,
    bussnisIcon,
    drikingIcon,
    lifeStyleIcon,
    locationCIon,
    moonIcon,
    oneIconDating,
    personHeartIcon,
    petsIcon,
    pronounIcon,
    schoolIcon,
    searchIcon,
    shareRedIcon,
    smookingIcon,
    straightenIcon,
    upArrowIcon,
    workoutIcon,
} from "../../helper/ImageAssets";
import { datapersonal, editProfileData, editProfilelistData } from "../../common/UiltData";
import NavigationService from "../../navigation/NavigationService";
import { useSelector } from "react-redux";
import { datingIntentionsFilter } from "../../helper/utility";
import LinearGradient from "react-native-linear-gradient";

const { height } = Dimensions.get("window");
const FULL_IMAGE_HEIGHT = height * 0.85; // Adjust this value as needed
const COLLAPSED_IMAGE_HEIGHT = height * 0.4; // Adjust this value as needed

const UserEditProfile = (props: any) => {
    const otherCome = props?.route?.params?.other ?? "";
    const otherUserProfile = useSelector((state: any) => state.auth.otherUserProfile);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [updown, setupdown] = useState(false);
    const animationValue = useRef(new Animated.Value(0)).current;
    const cardWidthRef = useRef(0);
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

    const handleTap = (evt: any) => {
        if (!evt?.nativeEvent?.locationX || !cardWidthRef.current) return;
        const x = evt.nativeEvent.locationX;
        if (x > cardWidthRef.current / 2) {
            setCurrentPhotoIndex((prev) =>
                prev < otherUserProfile?.gallery?.length - 1 ? prev + 1 : prev
            );
        } else {
            setCurrentPhotoIndex((prev) =>
                prev > 0 ? prev - 1 : prev
            );
        }
    };

    const renderProgressLine = (white: any) => {
        return (
            <View
                style={[
                    styles.progressContainer,
                    { flexDirection: "row", justifyContent: "space-between" },
                ]}>
                {Array.from({ length: otherUserProfile?.gallery?.length }).map((_, i) => {
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
        <AppSafeAreaView>
            <HeaderCommon title={otherCome ? "" : "Edit Profile"} edit={otherCome ? false : true} editOnPress={() => NavigationService.goBack()} />
            <View style={styles.singleLine} />
            {!updown && <Animated.View style={{ opacity: topTextOpacityon }}>{renderProgressLine(false)}</Animated.View>}
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
                    <TouchableOpacityView activeOpacity={1} onPress={handleTap}
                        onLayout={(e) => {
                            const layout = e?.nativeEvent?.layout;
                            if (layout?.width) cardWidthRef.current = layout.width;
                        }} style={{ flex: 1 }}>
                        <ImageBackground
                            source={{ uri: otherUserProfile?.gallery[currentPhotoIndex]?.url }}
                            style={styles.imageBackground}
                            imageStyle={{ borderRadius: 20 }}>
                            {updown && <Animated.View style={{ opacity: topTextOpacity }}>{renderProgressLine(true)}</Animated.View>}
                            <View style={{ flex: 1 }} />
                            <Animated.View style={{ opacity: bottomDetailsOpacity }}>
                                <LinearGradient start={{ x: 1, y: 1 }}
                                    end={{ x: 1, y: 0 }} colors={["#000000", "#00000099", "#00000000"]} style={styles.bottomDetails}>
                                        <View style={{marginLeft:metrics.hp2, marginTop:metrics.hp10}}>
                                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                <AppText type={TWENTY} color={WHITE} weight={INTER_BOLD}>
                                                    {otherUserProfile?.firstName}, 21{" "}
                                                </AppText>
                                                <FastImage
                                                    source={blueTikeIcon}
                                                    resizeMode="contain"
                                                    style={styles.blueTikIcon}
                                                />
                                            </View>
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
                                        </View>
                                </LinearGradient>
                                <View style={styles.wrapContainer}>
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
                                </View>
                            </Animated.View>
                            <Animated.View
                                style={[styles.upArrowContainer, { bottom: bottomPosition }]}>
                                <TouchableOpacityView style={{
                                    height: metrics.hp5,
                                    width: metrics.hp5,
                                    alignItems: "center",
                                    justifyContent: "center"
                                }} onPress={updownAction}>
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
                    </TouchableOpacityView>
                </Animated.View>
                <Animated.View style={{ opacity: scrollContentOpacity }}>
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
                                {"   "}{datingIntentionsFilter(otherUserProfile?.relationshipPreference)}
                            </AppText>
                        </View>
                    </View>
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
                    <View style={styles.bioContinaer}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <FastImage tintColor={colors.darkOpecity} source={accountcircleIcon} resizeMode="contain" style={styles.iconsFrom} />
                            <AppText type={ELEVEN} weight={INTER_BOLD} color={OPECITY_DARK}>
                                {"  "} My Vitals
                            </AppText>
                        </View>
                        {otherUserProfile?.education !== "" &&
                            <View style={[styles.insideContainer, { marginTop: metrics.hp1 }]}>
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <FastImage tintColor={colors.darkOpecity} source={schoolIcon} resizeMode="contain" style={styles.bioIcon} />
                                    <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                        {"    "}
                                        Education
                                    </AppText>
                                </View>
                                <AppText style={{ marginTop: metrics.hp0_5 }} type={ELEVEN} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                                    {otherUserProfile?.education}
                                </AppText>
                            </View>
                        }
                        {otherUserProfile?.jobTitle !== "" &&
                            <View style={[styles.insideContainer, { marginTop: metrics.hp0_5 }]}>
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <FastImage tintColor={colors.darkOpecity} source={searchIcon} resizeMode="contain" style={styles.bioIcon} />
                                    <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                        {"    "}
                                        Job
                                    </AppText>
                                </View>
                                <AppText style={{ marginTop: metrics.hp0_5 }} type={ELEVEN} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                                    {otherUserProfile?.jobTitle}
                                </AppText>
                            </View>}
                        <View style={[styles.insideContainer, { marginTop: metrics.hp0_5 }]}>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <FastImage tintColor={colors.darkOpecity} source={locationCIon} resizeMode="contain" style={styles.bioIcon} />
                                <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                    {"    "}
                                    Location
                                </AppText>
                            </View>
                            <AppText style={{ marginTop: metrics.hp0_5 }} type={ELEVEN} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                                {otherUserProfile?.homeTown}
                            </AppText>
                        </View>
                    </View>
                    <View style={styles.bioContinaer}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <FastImage tintColor={colors.darkOpecity} source={accountcircleIcon} resizeMode="contain" style={styles.iconsFrom} />
                            <AppText type={ELEVEN} weight={INTER_BOLD} color={OPECITY_DARK}>
                                {"  "} About me
                            </AppText>
                        </View>
                        {otherUserProfile?.pronouns?.length !== 0 &&
                            <View style={[styles.insideContainer, { marginTop: metrics.hp1 }]}>
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <FastImage tintColor={colors.darkOpecity} source={pronounIcon} resizeMode="contain" style={styles.bioIcon} />
                                    <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                        {"    "}
                                        Pronoun
                                    </AppText>
                                </View>
                                {otherUserProfile?.pronouns?.map((value: any, index: any) =>
                                    <View key={index} style={{ flexDirection: "row", alignItems: "center" }}>
                                        <AppText style={{ marginTop: metrics.hp0_5, marginRight: metrics.hp0_5 }} type={ELEVEN} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                                            {value}
                                        </AppText>
                                    </View>
                                )}
                            </View>}
                        <View style={[styles.insideContainer, { marginTop: metrics.hp0_5 }]}>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <FastImage tintColor={colors.darkOpecity} source={straightenIcon} resizeMode="contain" style={styles.bioIcon} />
                                <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                    {"    "}
                                    Height
                                </AppText>
                            </View>
                            <AppText style={{ marginTop: metrics.hp0_5 }} type={ELEVEN} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                                {otherUserProfile?.height}
                            </AppText>
                        </View>
                        {otherUserProfile?.zodiaSign !== "" &&
                            <View style={[styles.insideContainer, { marginTop: metrics.hp0_5 }]}>
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <FastImage tintColor={colors.darkOpecity} source={moonIcon} resizeMode="contain" style={styles.bioIcon} />
                                    <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                        {"    "}
                                        Zodiac
                                    </AppText>
                                </View>
                                <AppText style={{ marginTop: metrics.hp0_5 }} type={ELEVEN} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                                    {otherUserProfile?.zodiaSign}
                                </AppText>
                            </View>}
                    </View>
                    <View style={styles.bioContinaer}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <FastImage tintColor={colors.darkOpecity} source={lifeStyleIcon} resizeMode="contain" style={styles.iconsFrom} />
                            <AppText type={ELEVEN} weight={INTER_BOLD} color={OPECITY_DARK}>
                                {"  "} Lifestyle
                            </AppText>
                        </View>
                        <View style={[styles.insideContainer, { marginTop: metrics.hp1 }]}>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <FastImage tintColor={colors.darkOpecity} source={smookingIcon} resizeMode="contain" style={styles.bioIcon} />
                                <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                    {"    "}
                                    Smoke
                                </AppText>
                            </View>
                            {otherUserProfile?.pronouns?.map((value: any, index: any) =>
                                <View key={index} style={{ flexDirection: "row", alignItems: "center" }}>
                                    <AppText style={{ marginTop: metrics.hp0_5, marginRight: metrics.hp0_5 }} type={ELEVEN} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                                        {value}
                                    </AppText>
                                </View>
                            )}
                        </View>
                        <View style={[styles.insideContainer, { marginTop: metrics.hp0_5 }]}>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <FastImage tintColor={colors.darkOpecity} source={drikingIcon} resizeMode="contain" style={styles.bioIcon} />
                                <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                    {"    "}
                                    Drink
                                </AppText>
                            </View>
                            <AppText style={{ marginTop: metrics.hp0_5 }} type={ELEVEN} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                                {otherUserProfile?.height}
                            </AppText>
                        </View>
                        <View style={[styles.insideContainer, { marginTop: metrics.hp0_5 }]}>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <FastImage tintColor={colors.darkOpecity} source={workoutIcon} resizeMode="contain" style={styles.bioIcon} />
                                <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                    {"    "}
                                    Workout
                                </AppText>
                            </View>
                            <AppText style={{ marginTop: metrics.hp0_5 }} type={ELEVEN} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                                {otherUserProfile?.zodiaSign}
                            </AppText>
                        </View>
                        <View style={[styles.insideContainer, { marginTop: metrics.hp0_5 }]}>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <FastImage tintColor={colors.darkOpecity} source={petsIcon} resizeMode="contain" style={styles.bioIcon} />
                                <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                    {"    "}
                                    Pets
                                </AppText>
                            </View>
                            <AppText style={{ marginTop: metrics.hp0_5 }} type={ELEVEN} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                                {otherUserProfile?.zodiaSign}
                            </AppText>
                        </View>
                    </View>


                    <View style={styles.bioContinaer}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <FastImage tintColor={colors.darkOpecity} source={personHeartIcon} resizeMode="contain" style={styles.iconsFrom} />
                            <AppText type={ELEVEN} weight={INTER_BOLD} color={OPECITY_DARK}>
                                {"  "}
                                Interests
                            </AppText>
                        </View>
                        <View style={styles.wrapContainerTwo}>
                            {datapersonal?.map((item: any, idx: number) => (
                                <View key={item.id} style={styles.containerSelect}>
                                    <AppText type={TWELVE} weight={INTER_MEDIUM}>
                                        {item?.title}
                                    </AppText>
                                </View>
                            ))}
                        </View>
                    </View>
                </Animated.View>
            </Animated.ScrollView>
        </AppSafeAreaView>
    );
};

export default UserEditProfile;

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
        marginBottom: -metrics.hp9,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width:"100%",
        height:metrics.hp40,
        borderRadius:metrics.hp2
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
        marginTop: -metrics.hp1_5,
        marginBottom: metrics.hp7,
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
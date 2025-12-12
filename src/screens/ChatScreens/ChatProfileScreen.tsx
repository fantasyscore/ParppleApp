import React, { useRef, useState } from "react";
import { Animated, Dimensions, ImageBackground, StyleSheet, View } from "react-native";
import { AppText, BLACK, ELEVEN, FORTEEN, INTER_BOLD, INTER_MEDIUM, INTER_SEMI_BOLD, LIGHT_BLACK, OPECITY_DARK, TWELVE, TWENTY, WHITE } from "../../common/AppText";
import FastImage from "react-native-fast-image";
import { bioqutes, blueTikeIcon, bussnisIcon, oneIconDating, personHeartIcon, searchIcon, upArrowIcon } from "../../helper/ImageAssets";
import { colors } from "../../theme/colors";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import metrics from "../../assets/Metrics";
import { datapersonal, editProfileData, editProfilelistData } from "../../common/UiltData";
const { height } = Dimensions.get("window");
const FULL_IMAGE_HEIGHT = height * 0.80; // Adjust this value as needed
const COLLAPSED_IMAGE_HEIGHT = height * 0.4; // Adjust this value as needed

const profiles = [
    { id: "1", name: "Sophia, 24", image: "https://picsum.photos/600/900?1", photos: 5 },
    { id: "2", name: "Olivia, 22", image: "https://picsum.photos/600/900?2", photos: 3 },
    { id: "3", name: "Emma, 25", image: "https://picsum.photos/600/900?3", photos: 4 },
];

const ChatProfileScreen = () => {
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [updown, setupdown] = useState(false);
    const animationValue = useRef(new Animated.Value(0)).current;

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

    const nextPhoto = () => {
        if (currentPhotoIndex < profiles[0]?.photos - 1) {
            setCurrentPhotoIndex((prev) => prev + 1);
        } else {
            setCurrentPhotoIndex(0);
        }
    };

    const prevPhoto = () => {
        if (currentPhotoIndex > 0) {
            setCurrentPhotoIndex((prev) => prev - 1);
        } else {
            setCurrentPhotoIndex(profiles[0]?.photos - 1);
        }
    };

    const renderProgressLine = (white: any) => {
        return (
            <View
                style={[
                    styles.progressContainer,
                    { flexDirection: "row", justifyContent: "space-between" },
                ]}>
                {Array.from({ length: profiles[0]?.photos }).map((_, i) => {
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
        <View style={{flex:1}}>
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
                        source={{ uri: "https://picsum.photos/600/900?1" }}
                        style={styles.imageBackground}
                        imageStyle={{ borderRadius: 20 }}>
                       <View >{renderProgressLine(true)}</View>
                        <View style={{ flex: 1 }} />
                        <Animated.View style={{ opacity: bottomDetailsOpacity }}>
                            <View style={styles.bottomDetails}>
                                <View>
                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        <AppText type={TWENTY} color={WHITE} weight={INTER_BOLD}>
                                            Dikhsha, 21{" "}
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
                                            React Native Developer
                                        </AppText>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.wrapContainer}>
                                {editProfileData.map((item, index) => {
                                    return (
                                        <View style={styles.listContainer} key={index}>
                                            <FastImage
                                                tintColor={colors.white}
                                                source={item.image}
                                                resizeMode="contain"
                                                style={styles.icons}
                                            />
                                            <AppText color={WHITE} weight={INTER_MEDIUM} type={ELEVEN}>
                                                {"  "}
                                                {item.title}
                                            </AppText>
                                        </View>
                                    );
                                })}
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
                <Animated.View style={{opacity:scrollContentOpacity}}> 
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
                            {"   "}Long-term partner
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
                        This is the end, hold your breath and count to 10.
                    </AppText>
                </View>
                {editProfilelistData?.map((item, index) => {
                    return (
                        <View key={index} style={styles.bioContinaer}>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <FastImage tintColor={colors.darkOpecity} source={item.headIcon} resizeMode="contain" style={styles.iconsFrom} />
                                <AppText type={ELEVEN} weight={INTER_BOLD} color={OPECITY_DARK}>
                                    {"  "}{item.title}
                                </AppText>
                            </View>
                            {item.details?.map((value, index) => {
                                return (
                                    <View key={index} style={[styles.insideContainer, { marginTop: index == 0 ? metrics.hp1 : metrics.hp0_5 }]}>
                                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                                            <FastImage tintColor={colors.darkOpecity} source={value.icons} resizeMode="contain" style={styles.bioIcon} />
                                            <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                                {"    "}{value.valueTitle}
                                            </AppText>
                                        </View>
                                        <AppText style={{ marginTop: metrics.hp0_5 }} type={ELEVEN} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                                            {value.line}
                                        </AppText>
                                    </View>
                                )
                            })}
                        </View>
                    )
                })}
                <View style={styles.bioContinaer}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <FastImage tintColor={colors.darkOpecity} source={personHeartIcon} resizeMode="contain" style={styles.iconsFrom} />
                        <AppText type={ELEVEN} weight={INTER_BOLD} color={OPECITY_DARK}>
                            {"  "}Interests
                        </AppText>
                    </View>
                    <View style={styles.wrapContainerTwo}>
                        {datapersonal?.map((item: any, index: any) => {
                            return (
                                <View key={index} style={styles.containerSelect}>
                                    <AppText type={TWELVE} weight={INTER_MEDIUM}>
                                        {item.title}
                                    </AppText>
                                </View>
                            )
                        })}
                    </View>
                </View>
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
        marginLeft: metrics.hp2,
        marginBottom: metrics.hp3,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
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
        marginHorizontal:metrics.hp2
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
        marginHorizontal:metrics.hp2
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
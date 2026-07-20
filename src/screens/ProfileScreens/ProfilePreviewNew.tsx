import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import NavigationService from "../../navigation/NavigationService";

import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { Animated, FlatList, Image, ImageBackground, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { colors, newColor } from "../../theme/colors";
import NewHeader from "../../common/NewHeader";
import metrics from "../../assets/Metrics";
import FastImage from "react-native-fast-image";
import { bioBackground, biosToggla, directChatIcon, dobIcon, forProfileDetailsBack, heightIconWhiteNew, locationIconWhiteNew, locIcon, lockIconWhite, newCloseIcon, newLikeIcon, partnerheart, pronounIcon, straightenIcon, trunOnIcon, beingWatchIcon, bitingIcon, blinedFlodedIcon, BottomLayer, dirtyTalks, fantasiesIcon, fotFetiesIcon, hairIcon, hugsIcon, massageIcon, musicIcons, oralIcon, rightSelectTrunOns, roomServiceIcon, scentsIcon, sextingIcon, smooheshIcon, TattosIcon, trunOnBackground, dummyMaleProfile, danceNewIcon, rolePlayImageNew, choclateImageNew, touchNewIcon, dummyfemaleProfile } from "../../helper/ImageAssets";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import { AppText, EIGHTEEN, ELEVEN, FORTEEN, INTER_BOLD, SCHEHERAZADE_BOLD, SIXTEEN, TWELVE, TWENTY, WHITE } from "../../common/AppText";
const ITEM_WIDTH = metrics.hp34;
const SPACING = metrics.hp1;
const DATA = [
    {
        id: "1",
        title: "Smooches",
        discription: "Steal a kiss worth remembering.",
        image: smooheshIcon
    },
    {
        id: "2",
        title: "Hugs",
        discription: "Hold me a little longer.",
        image: hugsIcon
    },
    {
        id: "3",
        title: "Massage",
        discription: "Where every touch melts away the distance.",
        image: massageIcon
    },
    {
        id: "4",
        title: "Oral",
        discription: "Open to deeper intimacy.",
        image: oralIcon
    },
    {
        id: "5",
        title: "Dirty Talk",
        discription: "Whisper what you're really thinking.",
        image: dirtyTalks
    },
    {
        id: "6",
        title: "Fantasies",
        discription: "Every secret deserves a safe place.",
        image: fantasiesIcon
    },
    {
        id: "7",
        title: "Music",
        discription: "Set the mood, let the sparks follow.",
        image: musicIcons
    },
    {
        id: "8",
        title: "Foot Fetish",
        discription: "A little obsession, a lot of chemistry.",
        image: fotFetiesIcon
    },
    {
        id: "9",
        title: "Scents",
        discription: "Irresistible starts with a signature scent.",
        image: scentsIcon
    },
    {
        id: "10",
        title: "Biting",
        discription: "A playful tease with a wild side.",
        image: bitingIcon
    },
    {
        id: "11",
        title: "Hair",
        discription: "Lost in every strand.",
        image: hairIcon
    },
    {
        id: "12",
        title: "Being Watched",
        discription: "The thrill of every lingering glance.",
        image: beingWatchIcon
    },
    {
        id: "13",
        title: "Sexting",
        discription: "Turn texts into irresistible tension.",
        image: sextingIcon
    },
    {
        id: "14",
        title: "Room Service",
        discription: "Luxury nights, unforgettable memories.",
        image: roomServiceIcon
    },
    {
        id: "15",
        title: "Blindfolded",
        discription: "Trust the moment, embrace the mystery.",
        image: blinedFlodedIcon
    },
    {
        id: "16",
        title: "Tattoos",
        discription: "Every ink tells a tempting story.",
        image: TattosIcon
    },
    {
        id: "17",
        title: "Dance",
        discription: "Let your bodies find the rhythm.",
        image: danceNewIcon
    },
    {
        id: "18",
        title: "Role-Play",
        discription: "Become whoever the night desires.",
        image: rolePlayImageNew
    },
    {
        id: "19",
        title: "Chocolate",
        discription: "Sweet enough to crave again.",
        image: choclateImageNew
    },
    {
        id: "20",
        title: "Touch",
        discription: "One touch can change everything.",
        image: touchNewIcon
    },

]
const ProfilePreviewNew = () => {
    const scrollX = useRef(new Animated.Value(0)).current;
    const userData = useSelector((state: any) => state?.auth?.userData);
    const selectedIds = userData?.turnOn || userData?.turnOns || [];

    const renderItem = ({ item, index }: any) => {
        const inputRange = [
            (index - 1) * (ITEM_WIDTH + SPACING),
            index * (ITEM_WIDTH + SPACING),
            (index + 1) * (ITEM_WIDTH + SPACING),
        ];
        const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.95, 1, 0.95],
            extrapolate: "clamp",
        });

        const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.9, 1, 0.9],
            extrapolate: "clamp",
        });
        return (
            <Animated.View
                style={{
                    transform: [{ scale }],
                    opacity,
                    marginLeft: index === 0 ? metrics.hp2_5 : 0,
                    marginRight: SPACING,
                    height: metrics.hp45,
                    width: metrics.hp34
                }}>
                <Image source={{ uri: item.url }} resizeMode="cover" style={styles.imageMain} />
                <View style={styles.galleryDim} />

            </Animated.View>
        )
    };

    const handleSelect = (id: any) => {
        // Not selectable in preview
    };
    const renderItemTurns_ons = ({ item }: any) => {
        const isSelected = selectedIds.includes(item.id);
        return (
            <TouchableOpacity activeOpacity={1} onPress={() => { }}>
                <ImageBackground source={trunOnBackground} tintColor={isSelected ? "#E6B7A8" : "#555359"} resizeMode="cover" style={styles.trunback}>
                    <FastImage source={item.image} resizeMode="contain" style={styles.imagesIcon} />
                    <View style={{ alignItems: "center", justifyContent: "center", paddingHorizontal: metrics.hp2 }}>
                        <AppText style={{ color: isSelected ? newColor.blackNew : "#E6B7A8" }} type={EIGHTEEN} weight={SCHEHERAZADE_BOLD}>
                            {item.title}
                        </AppText>
                        <AppText type={ELEVEN} style={{ textAlign: "center", marginTop: -metrics.hp1, color: isSelected ? newColor.blackNew : colors.white, opacity: isSelected ? 0.8 : 1 }}>
                            {item.discription}
                        </AppText>
                    </View>
                    {isSelected ?
                        <FastImage source={rightSelectTrunOns} resizeMode="contain" style={{ height: metrics.hp3, width: metrics.hp3, position: "absolute", right: metrics.hp2, bottom: metrics.hp2 }} /> : <></>}
                </ImageBackground>
            </TouchableOpacity>
        )
    };

    return (
        <AppSafeAreaView color={newColor.blackNew}>
            <NewHeader title={userData?.username ? userData?.username : userData?.firstName || userData?.name || "Profile Preview"} onPress={() => NavigationService.goBack()} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: metrics.hp10, marginTop: metrics.hp2 }}
            >
                <Animated.FlatList
                    data={(userData?.gallery || [])}
                    renderItem={renderItem}
                    horizontal
                    scrollEnabled
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={ITEM_WIDTH + SPACING}
                    decelerationRate="fast"
                    bounces={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: true }
                    )}
                    scrollEventThrottle={16}
                />

                <View
                    style={{
                        marginTop: userData?.gallery?.length === 0 ? 0 : -metrics.hp3, // overlap with FlatList
                        paddingHorizontal: metrics.hp2,
                        zIndex: 10,
                    }}>
                    <ImageBackground
                        source={forProfileDetailsBack}
                        resizeMode="contain"
                        style={styles.detailsContainer}>
                        <View style={{ paddingHorizontal: metrics.hp2 }}>
                            <View style={{ flexDirection: "row" }}>
                                <FastImage source={userData?.gallery?.length === 0 ? userData?.gender === "male" ? dummyMaleProfile : dummyfemaleProfile : { uri: (userData?.gallery?.[0]?.url || userData?.gallery?.[0]?.uri) }} resizeMode="cover" style={{ height: metrics.hp10, width: metrics.hp10, borderRadius: metrics.hp50, borderWidth: metrics.hp0_1, borderColor: "#E6B7A8", marginTop: -metrics.hp2 }} />
                                <AppText type={TWENTY} weight={SCHEHERAZADE_BOLD} style={{ color: "#E6B7A8", marginTop: metrics.hp0_8 }}>
                                    {"   "}{(userData?.username ? userData?.username : userData?.firstName || userData?.name || "User")}
                                </AppText>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", marginTop: metrics.hp2 }}>
                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: metrics.hp1_5, paddingVertical: metrics.hp0_5, borderRadius: metrics.hp4, backgroundColor: "#5B6168", marginRight: metrics.hp1 }}>
                                    <FastImage source={pronounIcon} resizeMode="contain" style={{ height: metrics.hp2, width: metrics.hp2 }} tintColor={colors.white} />
                                    <AppText color={WHITE} weight={INTER_BOLD} type={ELEVEN}>
                                        {"  "}{(userData?.gender || userData?.sexualOrientation || "")}
                                    </AppText>
                                </View>
                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: metrics.hp1_5, paddingVertical: metrics.hp0_5, borderRadius: metrics.hp4, backgroundColor: "#5B6168", marginRight: metrics.hp1 }}>
                                    <FastImage source={dobIcon} resizeMode="contain" style={{ height: metrics.hp2, width: metrics.hp2 }} tintColor={colors.white} />
                                    <AppText color={WHITE} weight={INTER_BOLD} type={ELEVEN}>
                                        {"  "}{(userData?.age || "")} years
                                    </AppText>
                                </View>
                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: metrics.hp1_5, paddingVertical: metrics.hp0_5, borderRadius: metrics.hp4, backgroundColor: "#5B6168", marginRight: metrics.hp1 }}>
                                    <FastImage source={heightIconWhiteNew} resizeMode="contain" style={{ height: metrics.hp2, width: metrics.hp2 }} tintColor={colors.white} />
                                    <AppText color={WHITE} weight={INTER_BOLD} type={ELEVEN}>
                                        {"  "}{(userData?.height || "")} ft
                                    </AppText>
                                </View>
                                {/* <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: metrics.hp1_5, paddingVertical: metrics.hp0_5, borderRadius: metrics.hp4, backgroundColor: "#5B6168" }}>
                                    <FastImage source={partnerheart} resizeMode="contain" style={{ height: metrics.hp2, width: metrics.hp2 }} tintColor={colors.white} />
                                    <AppText color={WHITE} weight={INTER_BOLD} type={ELEVEN}>
                                        {"  "}{("0")} Km
                                    </AppText>
                                </View> */}
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", marginTop: metrics.hp1 }}>
                                {/* <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: metrics.hp1_5, paddingVertical: metrics.hp0_5, borderRadius: metrics.hp4, backgroundColor: "#5B6168", marginRight: metrics.hp1 }}>
                                    <FastImage source={heightIconWhiteNew} resizeMode="contain" style={{ height: metrics.hp2, width: metrics.hp2 }} tintColor={colors.white} />
                                    <AppText color={WHITE} weight={INTER_BOLD} type={ELEVEN}>
                                        {"  "}{(userData?.height || "")} ft
                                    </AppText>
                                </View> */}
                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: metrics.hp1_5, paddingVertical: metrics.hp0_5, borderRadius: metrics.hp4, backgroundColor: "#5B6168", marginRight: metrics.hp1 }}>
                                    <FastImage source={locationIconWhiteNew} resizeMode="contain" style={{ height: metrics.hp2, width: metrics.hp2 }} tintColor={colors.white} />
                                    <AppText color={WHITE} weight={INTER_BOLD} type={ELEVEN}>
                                        {"  "}{(userData?.city || userData?.homeTown || "")}
                                    </AppText>
                                </View>
                            </View>
                            <ImageBackground source={bioBackground} resizeMode="stretch" style={{ height: metrics.hp9, width: "100%", marginTop: metrics.hp6, }}>
                                <ImageBackground source={biosToggla} resizeMode="contain" style={{ height: metrics.hp4, width: metrics.hp13, alignSelf: "center", marginTop: -metrics.hp2 }} >
                                    <AppText style={{ textAlign: "center" }} type={FORTEEN} weight={SCHEHERAZADE_BOLD} color={WHITE}>
                                        " My bio
                                    </AppText>
                                </ImageBackground>
                                <AppText style={{ marginHorizontal: metrics.hp2, textAlign: "center", marginVertical: metrics.hp1 }} type={TWELVE} color={WHITE}>
                                    {(userData?.bio || "No bio available.")}
                                </AppText>
                            </ImageBackground>
                        </View>
                    </ImageBackground>
                </View>


                <View style={{ paddingHorizontal: metrics.hp2 }}>
                    <View style={{ height: metrics.hp0_1, backgroundColor: "#524440", width: "100%", marginTop: metrics.hp4 }} />
                    <ImageBackground source={biosToggla} resizeMode="contain" style={{ height: metrics.hp7, width: metrics.hp18, alignSelf: "center", marginTop: -metrics.hp3, alignItems: "center", justifyContent: "center", flexDirection: "row", }} >
                        <FastImage source={trunOnIcon} resizeMode="contain" style={{ height: metrics.hp4, width: metrics.hp4 }} />
                        <AppText type={FORTEEN} weight={SCHEHERAZADE_BOLD} color={WHITE}>
                            {"  "}Turn-On
                        </AppText>
                    </ImageBackground>
                </View>
                <FlatList
                    data={DATA}
                    renderItem={renderItemTurns_ons}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    contentContainerStyle={{ paddingHorizontal: metrics.hp2, alignItems: "center", marginTop: metrics.hp0, paddingBottom: metrics.hp5 }}
                    columnWrapperStyle={{ columnGap: metrics.hp2, marginTop: metrics.hp6 }} />
            </ScrollView>

        </AppSafeAreaView>
    )
};
export default ProfilePreviewNew;
const styles = StyleSheet.create({
    imageMain: {
        height: metrics.hp45,
        width: metrics.hp34
    },
    galleryDim: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.2)",
    },
    lockOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
    },
    lockIcon: {
        height: metrics.hp3,
        width: metrics.hp3,
    },
    detailsContainer: {
        height: metrics.hp37,
        width: "100%",
    },
    actionsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: -metrics.hp3,
        position: "absolute",
        bottom: metrics.hp2,
        zIndex: 999,
        alignSelf: "center"
    },
    dislikeButton: {
        height: metrics.hp8,
        width: metrics.hp8,
        marginRight: metrics.hp1_5,
    },
    likeButton: {
        height: metrics.hp9,
        width: metrics.hp9,
    },
    chatButton: {
        height: metrics.hp8,
        width: metrics.hp8,
        marginLeft: metrics.hp1_5,
    },
    trunback: {
        height: metrics.hp21,
        width: metrics.hp20,
        marginBottom: metrics.hp2,
        alignItems: "center",
        justifyContent: "center",
    },
    imagesIcon: {
        height: metrics.hp17,
        width: metrics.hp17,
        position: "absolute",
        top: -metrics.hp8
    },
})
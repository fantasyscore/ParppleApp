import React, { useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { FlatList, ImageBackground, StyleSheet, TouchableOpacity, View } from "react-native";
import { colors, newColor } from "../../theme/colors";
import FastImage from "react-native-fast-image";
import { applogo, beingWatchIcon, bitingIcon, blinedFlodedIcon, BottomLayer, choclateImageNew, danceNewIcon, dirtyTalks, fantasiesIcon, fotFetiesIcon, hairIcon, hugsIcon, massageIcon, musicIcons, oralIcon, rightSelectTrunOns, rolePlayImageNew, roomServiceIcon, scentsIcon, sextingIcon, smooheshIcon, TattosIcon, touchNewIcon, trunOnBackground, trunOnIcon } from "../../helper/ImageAssets";
import metrics from "../../assets/Metrics";
import { AppText, EIGHTEEN, ELEVEN, fontSize, FORTEEN, SCHEHERAZADE_BOLD, SCHEHERAZADE_SEMI_BOLD, TWELVE, TWENTY, TWENTY_FOUR, WHITE } from "../../common/AppText";
import { opacity } from "react-native-reanimated/lib/typescript/Colors";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_ADD_PHOTOS_SCREEN } from "../../navigation/routes";
import { useDispatch, useSelector } from "react-redux";
import { setAddProfile } from "../../slices/loginServices/authSlice";

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

];
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
const TrunOnScreen = () => {
    const dispatch = useDispatch();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const turnOnData = useSelector((state: any) => state?.auth?.turnOnData);
    const addProfileData = useSelector((state: any) => state?.auth?.addProfileData);


    const handleSelect = (id: any) => {
        setSelectedIds((prev: any) =>
            prev.includes(id)
                ? prev.filter((item: any) => item !== id) // Remove
                : [...prev, id] // Add
        );
    };

    const renderItem = ({ item }: any) => {
        const isSelected = selectedIds.includes(item._id);

        return (
            <TouchableOpacity
                activeOpacity={1}
                onPress={() => handleSelect(item._id)}
            >
                <ImageBackground
                    source={trunOnBackground}
                    tintColor={isSelected ? "#E6B7A8" : "#555359"}
                    resizeMode="cover"
                    style={styles.trunback}
                >
                    <FastImage
                        source={TURN_ON_IMAGES[item.value]}
                        resizeMode="contain"
                        style={styles.imagesIcon}
                    />

                    <View
                        style={{
                            alignItems: "center",
                            justifyContent: "center",
                            paddingHorizontal: metrics.hp2,
                        }}
                    >
                        <AppText
                            style={{
                                color: isSelected ? newColor.blackNew : "#E6B7A8",
                            }}
                            type={EIGHTEEN}
                            weight={SCHEHERAZADE_BOLD}
                        >
                            {item.value}
                        </AppText>

                        <AppText
                            type={ELEVEN}
                            style={{
                                textAlign: "center",
                                marginTop: -metrics.hp1,
                                color: isSelected
                                    ? newColor.blackNew
                                    : colors.white,
                                opacity: isSelected ? 0.8 : 1,
                            }}
                        >
                            {item.message}
                        </AppText>
                    </View>

                    {isSelected && (
                        <FastImage
                            source={rightSelectTrunOns}
                            resizeMode="contain"
                            style={{
                                height: metrics.hp3,
                                width: metrics.hp3,
                                position: "absolute",
                                right: metrics.hp2,
                                bottom: metrics.hp2,
                            }}
                        />
                    )}
                </ImageBackground>
            </TouchableOpacity>
        );
    };
    const onSubmit = () => {
        if (selectedIds?.length === 0) return;
        const selectedTurnOns = turnOnData
            .filter((item: any) => selectedIds.includes(item._id))
            .map((item: any) => item._id);
        const data = {
            ...addProfileData,
            attribute: selectedTurnOns,
            fieldVisibility: { ...addProfileData?.fieldVisibility }
        };
        dispatch(setAddProfile(data))
        NavigationService.navigate(NAVIGATION_ADD_PHOTOS_SCREEN)
    }
    return (
        <AppSafeAreaView color={newColor.blackNew}>
            <FastImage source={applogo} resizeMode="contain" style={styles.logo} />
            <AppText style={{ textAlign: "center", fontSize: fontSize(26), marginTop: metrics.hp1 }} weight={SCHEHERAZADE_SEMI_BOLD} color={WHITE}>
                What makes you Turn on?
            </AppText>

            <FlatList
                data={turnOnData}
                renderItem={renderItem}
                keyExtractor={(item) => item._id.toString()}
                numColumns={2}
                ListHeaderComponent={() => <FastImage source={trunOnIcon} resizeMode="contain" style={{ height: metrics.hp15, width: metrics.hp15, alignSelf: "center" }} />}
                contentContainerStyle={{ paddingHorizontal: metrics.hp2, alignItems: "center", marginTop: metrics.hp0, paddingBottom: metrics.hp5 }}
                columnWrapperStyle={{ columnGap: metrics.hp2, marginTop: metrics.hp6 }} />
            <ImageBackground source={BottomLayer} resizeMode="stretch" style={styles.bottomLayer}>
                <TouchableOpacity activeOpacity={0.5} onPress={onSubmit} style={[styles.phoneContainer, { opacity: selectedIds?.length ? 1 : 0.5 }]}>
                    <AppText weight={SCHEHERAZADE_BOLD} color={WHITE} type={TWENTY}>
                        Next
                    </AppText>
                </TouchableOpacity>
            </ImageBackground>
        </AppSafeAreaView>
    )
};
export default TrunOnScreen;
const styles = StyleSheet.create({
    logo: {
        height: metrics.hp7,
        width: metrics.hp25,
        alignSelf: "center",
        marginTop: metrics.hp8,
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
    bottomLayer: {
        height: metrics.hp15,
        width: "100%",
        paddingVertical: metrics.hp2,
        alignItems: "center"
    },
    phoneContainer: {
        height: metrics.hp7,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: metrics.hp0_1,
        borderColor: colors.white,
        marginHorizontal: metrics.hp2,
        marginTop: metrics.hp2,
        width: "90%"
    },
})
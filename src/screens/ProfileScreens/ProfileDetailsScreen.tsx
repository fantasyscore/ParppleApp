import React, { useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { Dimensions, ImageBackground, ScrollView, StyleSheet, View } from "react-native";
import PeopleHeader from "../../common/PeopleHeader";
import metrics from "../../assets/Metrics";
import { colors } from "../../theme/colors";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import FastImage from "react-native-fast-image";
import { accountcircleIcon, bioqutes, blackIcon, CloseBlueIcon, dateIcon, drikingIcon, heartGreen, heartRed, moonIcon, oneIconDating, personHeartIcon, pronounIcon, reportIcon, searchIcon, sexualityIcon, shareIcon, shareRedIcon, smookingIcon, straightenIcon, upArrowIcon } from "../../helper/ImageAssets";
import { AppText, BLACK, DARKGREEN, ELEVEN, FORTEEN, INTER_BOLD, INTER_MEDIUM, INTER_SEMI_BOLD, LIGHT_BLACK, OPECITY, OPECITY_DARK, RED, TEN, TWELVE } from "../../common/AppText";
import { datapersonal, editProfilelistData } from "../../common/UiltData";
import NavigationService from "../../navigation/NavigationService";

const ProfileDetailsScreen = () => {
    const dataaboutme = [{ id: 1, name: "She/her", image: pronounIcon }, { id: 2, name: "Women", image: accountcircleIcon }, { id: 3, name: "Straight", image: sexualityIcon }, { id: 4, name: "Men", image: dateIcon }, { id: 5, name: "5’4”", image: straightenIcon }, { id: 6, name: "No", image: smookingIcon }, { id: 7, name: "Sometimes", image: drikingIcon }, { id: 8, name: "Leo", image: moonIcon }]
    const profiles: any = [
        { id: "1", name: "Sophia, 24", image: "https://picsum.photos/600/900?1", photos: 5 },
        { id: "2", name: "Olivia, 22", image: "https://picsum.photos/600/900?2", photos: 3 },
        { id: "3", name: "Emma, 25", image: "https://picsum.photos/600/900?3", photos: 4 },
    ];
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [positions, setPositions] = useState<{ [key: number]: number }>({});

    const handleLayout = (event: any, index: number) => {
        const { x } = event.nativeEvent.layout;
        setPositions(prev => ({ ...prev, [index]: x }));
    };

    const nextPhoto = () => {
        if (currentPhotoIndex < profiles[0]?.photos - 1) {
            setCurrentPhotoIndex(prev => prev + 1);
        } else {
            setCurrentPhotoIndex(0);
        }
    };
    const prevPhoto = () => {
        if (currentPhotoIndex > 0) {
            setCurrentPhotoIndex(prev => prev - 1);
        } else {
            setCurrentPhotoIndex(profiles[0]?.photos - 1); // last photo pe chala jaayega
        }
    };
    const renderProgressLine = () => {
        return (
            <View style={[styles.progressContainer, { flexDirection: "row", justifyContent: "space-between" }]}>
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
                                    backgroundColor: isFilled ? colors.white : colors.lightWhite,
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
            <PeopleHeader userName={true} />
            <ScrollView style={{ paddingHorizontal: metrics.hp1, marginTop: metrics.hp1 }}>
                <ImageBackground
                    source={{ uri: "https://picsum.photos/600/900?1" }}
                    style={styles.image}
                    imageStyle={{ borderRadius: 20 }}>
                    {renderProgressLine()}
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <View style={styles.flasContaier}>
                            <FastImage source={shareRedIcon} resizeMode="contain" style={styles.flasIcon} />
                        </View>
                        <TouchableOpacityView onPress={prevPhoto} style={{ width: "50%", height: metrics.hp37 }} />
                        <TouchableOpacityView onPress={nextPhoto} style={{ width: "50%", height: metrics.hp37 }} />
                        <TouchableOpacityView onPress={() => NavigationService.goBack()} style={styles.upArrowContainer}>
                            <FastImage
                                source={upArrowIcon}
                                resizeMode="contain"
                                style={styles.uparrowIcon}
                            />
                        </TouchableOpacityView>
                    </View>
                </ImageBackground>
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
                        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
                    </AppText>
                    <View style={styles.replyContainer}>
                        <FastImage source={shareRedIcon} resizeMode="contain" style={styles.flasIconSmall} />
                        <AppText type={TWELVE} weight={INTER_SEMI_BOLD} color={BLACK}>
                            {"  "}Reply
                        </AppText>
                    </View>
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
                <View style={styles.shareDetailsContaier}>
                    <FastImage source={shareIcon} resizeMode="contain" style={styles.shareIcon} />
                    <AppText color={DARKGREEN} weight={INTER_BOLD} type={TWELVE}>
                        {"  "}Share Diksha Profile
                    </AppText>
                </View>
                <View style={styles.shareDetailsContaier}>
                    <FastImage source={blackIcon} resizeMode="contain" style={styles.shareIcon} />
                    <AppText color={BLACK} weight={INTER_BOLD} type={TWELVE}>
                        {"  "}Block Diksha Profile
                    </AppText>
                </View>
                <View style={styles.shareDetailsContaier}>
                    <FastImage source={reportIcon} resizeMode="contain" style={styles.shareIcon} />
                    <AppText color={RED} weight={INTER_BOLD} type={TWELVE}>
                        {"  "}Report
                    </AppText>
                </View>
                <View style={{ height: metrics.hp20 }} />
            </ScrollView>
            <View style={styles.likeUnLikeCOntainer}>

                <TouchableOpacityView /* onPress={() => unlike()}  */ style={styles.unlickContainer}>
                    <FastImage source={CloseBlueIcon} resizeMode="contain" style={styles.flasIconClose} />
                </TouchableOpacityView>
                <View style={[styles.flasContaierTwo, { marginHorizontal: metrics.hp1_5 }]}>
                    <FastImage source={heartRed} resizeMode="contain" style={styles.flasIconTwo} />
                </View>
                <TouchableOpacityView /* onPress={() => like()} */ style={styles.unlickContainer}>
                    <FastImage source={heartGreen} resizeMode="contain" style={styles.flasIconClose} />
                </TouchableOpacityView>
            </View>
        </AppSafeAreaView>
    )
};
export default ProfileDetailsScreen;
const styles = StyleSheet.create({
    image: {
        height: metrics.hp40
    },
    progressContainer: {
        height: metrics.hp0_5,
        marginHorizontal: metrics.hp2,
        marginTop: metrics.hp2,
    },
    progressSegment: {
        height: "100%",
    },
    flasContaier: {
        height: metrics.hp6_5,
        width: metrics.hp6_5,
        backgroundColor: colors.white,
        borderRadius: metrics.hp50,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: metrics.hp1,
        elevation: metrics.hp0_5,
        position: "absolute",
        bottom: metrics.hp1,
        left: metrics.hp1
    },
    flasIcon: {
        height: metrics.hp3_5,
        width: metrics.hp3_5
    },
    longContainer: {
        marginHorizontal: metrics.hp1,
        backgroundColor: colors.lightBack,
        borderRadius: metrics.hp1_5,
        paddingVertical: metrics.hp1,
        paddingHorizontal: metrics.hp1,
        marginTop: metrics.hp1,
        height: metrics.hp9
    },
    searchIcon: {
        height: metrics.hp2_5,
        width: metrics.hp2_5
    },
    bioContinaer: {
        paddingVertical: metrics.hp1,
        paddingHorizontal: metrics.hp1,
        backgroundColor: colors.lightBack,
        borderRadius: metrics.hp1_5,
        marginTop: metrics.hp1,
        marginHorizontal: metrics.hp1,
    },
    bioIcon: {
        height: metrics.hp2,
        width: metrics.hp2
    },
    flasIconSmall: {
        height: metrics.hp2_5,
        width: metrics.hp2_5
    },
    replyContainer: {
        flexDirection: "row",
        alignItems: "center",
        height: metrics.hp5,
        paddingHorizontal: metrics.hp1_5,
        borderWidth: metrics.hp0_1,
        borderColor: colors.nanoOpecity,
        borderRadius: metrics.hp3,
        alignSelf: "flex-end"
    },
    shareDetailsContaier: {
        height: metrics.hp5,
        borderRadius: metrics.hp1_5,
        backgroundColor: colors.lightBack,
        marginTop: metrics.hp1,
        marginHorizontal: metrics.hp1,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row"
    },
    shareIcon: {
        height: metrics.hp2,
        width: metrics.hp2
    },
    flasContaierTwo: {
        height: metrics.hp6_5,
        width: metrics.hp6_5,
        backgroundColor: colors.white,
        borderRadius: metrics.hp50,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: metrics.hp1,
        elevation: metrics.hp0_5,
        borderWidth: metrics.hp0_1,
        borderColor: colors.darkBorder
    },
    unlickContainer: {
        height: metrics.hp7_2,
        width: metrics.hp7_2,
        backgroundColor: colors.white,
        borderRadius: metrics.hp50,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: metrics.hp1,
        elevation: metrics.hp0_5,
        borderWidth: metrics.hp0_1,
        borderColor: colors.darkBorder
    },
    likeUnLikeCOntainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-evenly",
        position: "absolute",
        bottom: metrics.hp2,
        alignSelf: "center",
        // marginBottom: -metrics.hp2
    },

    flasIconTwo: {
        height: metrics.hp3_5,
        width: metrics.hp3_5,
    },
    flasIconClose: {
        height: metrics.hp4,
        width: metrics.hp4,
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
    wrapContainerTwo: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: metrics.hp1,
        marginTop: metrics.hp1,
    },
    containerSelect: {
        height: metrics.hp3,
        paddingHorizontal: metrics.hp1_6,
        borderRadius: metrics.hp4,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.green,
    },
    uparrowIcon: {
        height: metrics.hp2_3,
        width: metrics.hp1_9,
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
        bottom: metrics.hp2,
    },
})
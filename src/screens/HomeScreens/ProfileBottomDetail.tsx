import React, { useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { Animated, Modal, StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import { AppText, BLACK, DARKGREEN, ELEVEN, FORTEEN, INTER_BOLD, INTER_MEDIUM, INTER_SEMI_BOLD, LIGHT_BLACK, OPECITY_DARK, RED, SCHEHERAZADE_BOLD, TWELVE, TWENTY_FOUR, WHITE } from "../../common/AppText";
import { accountcircleIcon, bioqutes, blackIcon, blockModalImage, drikingIcon, lifeStyleIcon, locationCIon, moonIcon, oneIconDating, personHeartIcon, petsIcon, pronounIcon, reportIcon, schoolIcon, searchIcon, shareIcon, smookingIcon, straightenIcon, unmatchModalImage, workoutIcon } from "../../helper/ImageAssets";
import { colors } from "../../theme/colors";
import metrics from "../../assets/Metrics";
import { datapersonal } from "../../common/UiltData";
import { datingIntentionsFilter } from "../../helper/utility";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import { useDispatch } from "react-redux";
import { blockByIdAPIUser, reportUserAPI, userBlockAPI } from "../../actions/authActions";
import { Screen } from "../../theme/dimens";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_REPORT_SCREEN } from "../../navigation/routes";


const ProfileBottomDetails = ({ topTextOpacity, visibleCards, discover, share, setModalVisibleHome, setSwipeLeft, scrollViewRef, inUnderFunction }: any) => {
    const dispatch = useDispatch();
    const [modalVisible, setModalVisible] = useState(false);

    const attributesRemove = visibleCards?.attributes?.filter((item: any) =>
        ["smoke", "drink", "workout", "pets"].includes(item?.type)
    );
    const attributes = visibleCards?.attributes?.filter(
        (item: any) => !["smoke", "drink", "workout", "pets"].includes(item?.type)
    );

    const workout = attributesRemove?.find((item: any) => item.type === "workout");
    const smoke = attributesRemove?.find((item: any) => item.type === "smoke");
    const drink = attributesRemove?.find((item: any) => item.type === "drink");
    const pets = attributesRemove?.find((item: any) => item.type === "pets");
    // const blockUser = () => {
    //     setModalVisible(false);
    //     const data = {
    //         blockedId: visibleCards?._id
    //         // matchId: visibleCards?._id,
    //         // blockedId:visibleCards?._id
    //     }
    //     dispatch(blockByIdAPIUser(data));
    //     // scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    //     // setSwipeLeft?.(true);

    //     inUnderFunction()
    //     // setModalVisibleHome(false);
    //     // setSwipeLeft(true);

    // };

    const blockUser = async () => {
        if (!visibleCards?._id) return;
        setModalVisible(false);
        const data = {
            blockedId: visibleCards._id,
        };
        try {
            await dispatch(blockByIdAPIUser(data));
            if (inUnderFunction) {
                inUnderFunction();
            } else {
                setModalVisibleHome?.(false);
                setSwipeLeft?.(true);
            }
        } catch (error) {
            console.log("Block failed", error);
        }
    };
    const reportUser = async () => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: false });
        setModalVisibleHome(false)
        NavigationService.navigate(NAVIGATION_REPORT_SCREEN, { reportedUserId: visibleCards?._id });
    }

    return (
        <View>
            <View style={styles.longContainer}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <FastImage source={searchIcon} tintColor={colors.darkOpecity} resizeMode="contain" style={styles.searchIcon} />
                    <AppText type={ELEVEN} weight={INTER_SEMI_BOLD} color={OPECITY_DARK}>
                        {"   "}
                        Dating Intentions
                    </AppText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: metrics.hp1, marginLeft: metrics.hp3 }}>
                    <FastImage source={oneIconDating} resizeMode="contain" style={styles.searchIcon} />
                    <AppText type={FORTEEN} weight={INTER_BOLD} color={BLACK}>
                        {"   "}
                        {datingIntentionsFilter(visibleCards?.relationshipPreference)}
                    </AppText>
                </View>
            </View>
            <View style={styles.bioContinaer}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <FastImage source={bioqutes} resizeMode="contain" style={styles.bioIcon} />
                    <AppText type={ELEVEN} weight={INTER_SEMI_BOLD} color={OPECITY_DARK}>
                        {" "}
                        My bio
                    </AppText>
                </View>
                <AppText style={{ paddingVertical: metrics.hp1 }} type={ELEVEN} weight={INTER_SEMI_BOLD} color={OPECITY_DARK}>
                    {visibleCards?.bio}
                </AppText>
            </View>
            <View style={styles.bioContinaer}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <FastImage tintColor={colors.darkOpecity} source={accountcircleIcon} resizeMode="contain" style={styles.iconsFrom} />
                    <AppText type={ELEVEN} weight={INTER_BOLD} color={OPECITY_DARK}>
                        {"  "} My Vitals
                    </AppText>
                </View>
                {visibleCards?.education !== "" &&
                    <View style={[styles.insideContainer, { marginTop: metrics.hp1 }]}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <FastImage tintColor={colors.darkOpecity} source={schoolIcon} resizeMode="contain" style={styles.bioIcon} />
                            <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                {"    "}
                                Education
                            </AppText>
                        </View>
                        <AppText style={{ marginTop: metrics.hp0_5 }} type={ELEVEN} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                            {visibleCards?.education}
                        </AppText>
                    </View>
                }
                {visibleCards?.jobTitle !== "" &&
                    <View style={[styles.insideContainer, { marginTop: metrics.hp0_5 }]}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <FastImage tintColor={colors.darkOpecity} source={searchIcon} resizeMode="contain" style={styles.bioIcon} />
                            <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                {"    "}
                                Job
                            </AppText>
                        </View>
                        <AppText style={{ marginTop: metrics.hp0_5 }} type={ELEVEN} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                            {visibleCards?.jobTitle}
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
                        {visibleCards?.homeTown}
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
                {visibleCards?.pronouns?.length !== 0 &&
                    <View style={[styles.insideContainer, { marginTop: metrics.hp1 }]}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <FastImage tintColor={colors.darkOpecity} source={pronounIcon} resizeMode="contain" style={styles.bioIcon} />
                            <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                {"    "}
                                Pronoun
                            </AppText>
                        </View>
                        {visibleCards?.pronouns?.map((value: any, index: any) =>
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
                        {visibleCards?.height}
                    </AppText>
                </View>
                {visibleCards?.zodiaSign !== "" &&
                    <View style={[styles.insideContainer, { marginTop: metrics.hp0_5 }]}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <FastImage tintColor={colors.darkOpecity} source={moonIcon} resizeMode="contain" style={styles.bioIcon} />
                            <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                {"    "}
                                Zodiac
                            </AppText>
                        </View>
                        <AppText style={{ marginTop: metrics.hp0_5 }} type={ELEVEN} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                            {visibleCards?.zodiaSign}
                        </AppText>
                    </View>}
            </View>
            {(smoke || drink || workout || pets) ? (
                <View style={styles.bioContinaer}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <FastImage tintColor={colors.darkOpecity} source={lifeStyleIcon} resizeMode="contain" style={styles.iconsFrom} />
                        <AppText type={ELEVEN} weight={INTER_BOLD} color={OPECITY_DARK}>
                            {"  "} Lifestyle
                        </AppText>
                    </View>
                    {smoke ?
                        <View style={[styles.insideContainer, { marginTop: metrics.hp1 }]}>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <FastImage tintColor={colors.darkOpecity} source={smookingIcon} resizeMode="contain" style={styles.bioIcon} />
                                <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                    {"    "}
                                    Smoke
                                </AppText>
                            </View>
                            <AppText style={{ marginTop: metrics.hp0_5, marginRight: metrics.hp0_5 }} type={ELEVEN} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                                {smoke?.displayLabel}
                            </AppText>
                        </View> : <></>
                    }
                    {drink ?
                        <View style={[styles.insideContainer, { marginTop: metrics.hp0_5 }]}>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <FastImage tintColor={colors.darkOpecity} source={drikingIcon} resizeMode="contain" style={styles.bioIcon} />
                                <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                    {"    "}
                                    Drink
                                </AppText>
                            </View>
                            <AppText style={{ marginTop: metrics.hp0_5 }} type={ELEVEN} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                                {drink?.displayLabel}
                            </AppText>
                        </View> : <></>
                    }
                    {workout ?
                        <View style={[styles.insideContainer, { marginTop: metrics.hp0_5 }]}>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <FastImage tintColor={colors.darkOpecity} source={workoutIcon} resizeMode="contain" style={styles.bioIcon} />
                                <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                    {"    "}
                                    Workout
                                </AppText>
                            </View>
                            <AppText style={{ marginTop: metrics.hp0_5 }} type={ELEVEN} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                                {workout?.displayLabel}
                            </AppText>
                        </View> : <></>
                    }
                    {pets ?
                        <View style={[styles.insideContainer, { marginTop: metrics.hp0_5 }]}>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <FastImage tintColor={colors.darkOpecity} source={petsIcon} resizeMode="contain" style={styles.bioIcon} />
                                <AppText type={ELEVEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                    {"    "}
                                    Pets
                                </AppText>
                            </View>
                            <AppText style={{ marginTop: metrics.hp0_5 }} type={ELEVEN} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                                {pets?.displayLabel}
                            </AppText>
                        </View> : <></>
                    }
                </View>
            ) : <></>}
            {attributes?.length ?
                <View style={styles.bioContinaer}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <FastImage tintColor={colors.darkOpecity} source={personHeartIcon} resizeMode="contain" style={styles.iconsFrom} />
                        <AppText type={ELEVEN} weight={INTER_BOLD} color={OPECITY_DARK}>
                            {"  "}
                            Interests
                        </AppText>
                    </View>
                    <View style={styles.wrapContainerTwo}>
                        {attributes?.map((item: any, idx: number) => (
                            <View key={item?.id || `${item?.displayLabel}-${idx}`} style={styles.containerSelect}>
                                <AppText type={TWELVE} weight={INTER_MEDIUM}>
                                    {item?.displayLabel}
                                </AppText>
                            </View>
                        ))}
                    </View>
                </View> : <></>
            }
            {!share ?
                <>
                    {/* <View style={styles.shareDetailsContaier}>
                        <FastImage source={shareIcon} resizeMode="contain" style={styles.shareIcon} />
                        <AppText color={DARKGREEN} weight={INTER_BOLD} type={TWELVE}>
                            {"  "}
                            Share {discover ? visibleCards?.firstName : visibleCards?.name} Profile
                        </AppText>
                    </View> */}
                    <TouchableOpacityView onPress={() => setModalVisible(true)} style={styles.shareDetailsContaier}>
                        <FastImage source={blackIcon} resizeMode="contain" style={styles.shareIcon} />
                        <AppText color={BLACK} weight={INTER_BOLD} type={TWELVE}>
                            {"  "}
                            Block {discover ? visibleCards?.firstName : visibleCards?.name} Profile
                        </AppText>
                    </TouchableOpacityView>
                    {/* <TouchableOpacityView onPress={reportUser} style={styles.shareDetailsContaier}>
                        <FastImage source={reportIcon} resizeMode="contain" style={styles.shareIcon} />
                        <AppText color={RED} weight={INTER_BOLD} type={TWELVE}>
                            {"  "}
                            Report
                        </AppText>
                    </TouchableOpacityView> */}
                </> : <></>
            }
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}>
                <View style={styles.centeredView}>
                    <View style={[styles.confirmContainer, { height: metrics.hp42, }]}>
                        <FastImage source={blockModalImage} resizeMode="stretch" style={[styles.bdyBack, { height: metrics.hp18 }]} />
                        <AppText style={{ textAlign: "center" }} type={TWENTY_FOUR} weight={SCHEHERAZADE_BOLD} color={LIGHT_BLACK}>
                            Block {visibleCards?.name}?
                        </AppText>
                        <AppText style={{ marginTop: -metrics.hp2, textAlign: "center" }} type={TWELVE} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                            You won’t be able to undo this. You sure{'\n'} to continue?
                        </AppText>
                        <TouchableOpacityView onPress={() => blockUser()} style={[styles.ediButton, { backgroundColor: colors.purple, marginTop: metrics.hp2 }]}>
                            <AppText color={WHITE} weight={INTER_SEMI_BOLD} type={TWELVE}>
                                Yes, Block
                            </AppText>
                        </TouchableOpacityView>
                        <AppText onPress={() => setModalVisible(false)} weight={INTER_SEMI_BOLD} type={TWELVE} style={{ textAlign: "center", marginTop: metrics.hp2 }} color={LIGHT_BLACK}>
                            No, cancel
                        </AppText>
                    </View>
                </View>
            </Modal>
        </View>
    )
};
export default ProfileBottomDetails;
const styles = StyleSheet.create({
    longContainer: {
        marginHorizontal: metrics.hp1,
        backgroundColor: colors.lightBack,
        borderRadius: metrics.hp1_5,
        paddingVertical: metrics.hp1,
        paddingHorizontal: metrics.hp1,
        marginTop: metrics.hp1,
        height: metrics.hp9,
    },
    searchIcon: {
        height: metrics.hp2_5,
        width: metrics.hp2_5,
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
        width: metrics.hp2,
    },

    iconsFrom: {
        height: metrics.hp2_5,
        width: metrics.hp2_5,
    },
    insideContainer: {
        paddingHorizontal: metrics.hp2,
        paddingVertical: metrics.hp1,
        backgroundColor: colors.white,
        borderRadius: metrics.hp1,
    },
    containerSelect: {
        height: metrics.hp3,
        paddingHorizontal: metrics.hp1_6,
        borderRadius: metrics.hp4,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.green,
    },
    wrapContainerTwo: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: metrics.hp1,
        marginTop: metrics.hp1,
    },
    shareDetailsContaier: {
        height: metrics.hp5,
        borderRadius: metrics.hp1_5,
        backgroundColor: colors.lightBack,
        marginTop: metrics.hp1,
        marginHorizontal: metrics.hp1,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
    },
    shareIcon: {
        height: metrics.hp2,
        width: metrics.hp2,
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.transparentBlack,
        paddingHorizontal: metrics.hp2
    },
    confirmContainer: {
        height: metrics.hp40,
        backgroundColor: colors.white,
        width: Screen.Width / 1.20,
        borderRadius: metrics.hp2,
    },
    bdyBack: {
        height: metrics.hp17,
        borderTopRightRadius: metrics.hp2,
        borderTopLeftRadius: metrics.hp2,

    },
    ediButton: {
        height: metrics.hp5,
        borderWidth: 1,
        borderColor: colors.purple,
        borderRadius: metrics.hp4,
        alignItems: "center",
        justifyContent: "center",
        width: "40%",
        alignSelf: "center",
    },
})

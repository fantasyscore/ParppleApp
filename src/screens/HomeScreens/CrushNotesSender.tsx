import React, { useEffect, useRef, useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { Animated, Dimensions, FlatList, Image, ImageBackground, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import PeopleHeader from "../../common/PeopleHeader";
import CrushNotesHeader from "../../common/CrushNotesHeader";
import metrics from "../../assets/Metrics";
import FastImage from "react-native-fast-image";
import { AppText, EIGHTEEN, ELEVEN, fontSize, FORTEEN, INTER_BOLD, SCHEHERAZADE_BOLD, SCHEHERAZADE_SEMI_BOLD, SIXTEEN, TWELVE, TWENTY, WHITE } from "../../common/AppText";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import { colors, newColor } from "../../theme/colors";
import { useDispatch, useSelector } from "react-redux";
import { setListProfiles } from "../../slices/loginServices/authSlice";
import { interMedium } from "../../theme/typography";
const { width, height } = Dimensions.get("window");
const COLLAPSED_IMAGE_HEIGHT = height * 0.45;
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { getProfile, sendCrushNotesAPI } from "../../actions/authActions";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_CRUSH_PURCHESE_SCREEN, NAVIGATION_SUBSCRIPTION_SCREEN } from "../../navigation/routes";
import { toastAlert } from "../../actions/UploadImageActions";
import { beingWatchIcon, bioBackground, biosToggla, bitingIcon, blinedFlodedIcon, BottomLayer, choclateImageNew, danceNewIcon, dirtyTalks, dobIcon, dummyfemaleProfile, dummyMaleProfile, fantasiesIcon, forProfileDetailsBack, fotFetiesIcon, hairIcon, heightIconWhiteNew, hugsIcon, locationIconWhiteNew, lockIconWhite, massageIcon, musicIcons, oralIcon, partnerheart, pronounIcon, rolePlayImageNew, roomServiceIcon, scentsIcon, sendMessageNewIcon, sendMessageText, sextingIcon, smooheshIcon, TattosIcon, touchNewIcon, trunOnBackground, trunOnIcon, unMatchProfileIcon } from "../../helper/ImageAssets";
const ITEM_WIDTH = metrics.hp34;
const SPACING = metrics.hp1;
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
const CrushNotesSender = ({ setCrushNoteVisible, crushNoteVisible, currentProfileData, handleCrushNotes }: any) => {
    console.log(currentProfileData, "currentProfileDatacurrentProfileDatacurrentProfileData");

    const dispatch = useDispatch();
    const cardWidthRef = useRef(0);
    const [inputText, setInputText] = useState('');
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const userData = useSelector((state: any) => state.auth.userData);
    const turnOnData = useSelector((state: any) => state?.auth?.turnOnData);
    const scrollX = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                setKeyboardHeight(e.endCoordinates.height);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardHeight(0);
            }
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);
    const selectedTurnOnList = React.useMemo(() => {
        if (!turnOnData?.length || !currentProfileData?.attributes?.length) {
            return [];
        }

        return turnOnData.filter((item: any) =>
            currentProfileData.attributes.includes(item._id)
        );
    }, [turnOnData, currentProfileData?.attributes]);
    const sendCrushNote = async () => {
        if (!inputText.trim()) return;
        const remaining = Number(userData?.crushNotesRemaining);
        if (Number.isFinite(remaining) && remaining <= 0) {
            if (setCrushNoteVisible) setCrushNoteVisible(false);
            NavigationService.navigate(NAVIGATION_CRUSH_PURCHESE_SCREEN);
            return;
        }
        const datasend = {
            receiverId: currentProfileData?._id,
            message: inputText
        };
        try {
            const response = await dispatch(sendCrushNotesAPI(datasend));

            if (response?.statusCode === 200) {
                if (crushNoteVisible) {
                    setCrushNoteVisible(false);
                    handleCrushNotes(currentProfileData)
                }
                dispatch(getProfile(true));
            }
        } catch (error) {
            toastAlert.showToastError("You can only send one crush note to this user per 24 hours")
            console.log("Error sending crush note:", error);
        }
    };
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
            </Animated.View>
        )
    };
    const renderItemTurns_ons = ({ item }: any) => {

        return (
            <TouchableOpacity activeOpacity={1} >
                <ImageBackground source={trunOnBackground} tintColor={"#E6B7A8"} resizeMode="cover" style={styles.trunback}>
                    <FastImage source={TURN_ON_IMAGES[item.value]} resizeMode="contain" style={styles.imagesIcon} />
                    <View style={{ alignItems: "center", justifyContent: "center", paddingHorizontal: metrics.hp2 }}>
                        <AppText style={{ color: newColor.blackNew }} type={EIGHTEEN} weight={SCHEHERAZADE_BOLD}>
                            {item.value}
                        </AppText>
                        <AppText type={ELEVEN} style={{ textAlign: "center", marginTop: -metrics.hp1, color: newColor.blackNew, opacity: 0.8 }}>
                            {item.message}
                        </AppText>
                    </View>
                </ImageBackground>
            </TouchableOpacity>
        )
    };
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? undefined : undefined}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
            <AppSafeAreaView color={newColor.blackNew}>
                <TouchableOpacityView onPress={() => setCrushNoteVisible(false)} style={{
                    height: metrics.hp13,
                    width: "100%",
                    paddingVertical: metrics.hp2,
                    paddingHorizontal: metrics.hp2,
                    alignItems: "flex-end"
                }}>
                    <FastImage source={unMatchProfileIcon} resizeMode="contain" tintColor={colors.white} style={{ height: metrics.hp4, width: metrics.hp4, marginTop: metrics.hp4_5, }} />
                </TouchableOpacityView>
                <KeyboardAwareScrollView
                    enableOnAndroid={true}
                    extraScrollHeight={Platform.OS === "ios" ? 40 : metrics.hp20}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingBottom: metrics.hp20, flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={{ paddingHorizontal: metrics.hp2, paddingVertical: metrics.hp2 }}>
                        <FastImage source={sendMessageText} resizeMode="contain" style={{ height: metrics.hp6, width: metrics.hp20 }} />
                        <View style={{ alignItems: "center", justifyContent: "center" }}>
                            <AppText weight={SCHEHERAZADE_BOLD} color={WHITE} type={TWENTY}>
                                {"Turn Every Crush into a Real"}
                            </AppText>
                            <AppText style={{ marginTop: -metrics.hp2_5 }} color={WHITE} weight={SCHEHERAZADE_BOLD} type={TWENTY}>{"Chance — 4x More Connections!"}</AppText>
                        </View>
                        {currentProfileData?.profilePicture?.length || currentProfileData?.gallery?.length ?
                            <Animated.FlatList
                                data={currentProfileData?.profilePicture ? currentProfileData?.profilePicture : currentProfileData?.gallery}
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
                            /> : <></>
                        }
                        <View
                            style={{
                                marginTop: currentProfileData?.profilePicture?.length || currentProfileData?.gallery?.length ? -metrics.hp5 : metrics.hp3, // overlap with FlatList
                                paddingHorizontal: metrics.hp2,
                                zIndex: 10,
                            }}>
                            <ImageBackground
                                source={forProfileDetailsBack}
                                resizeMode="contain"
                                style={styles.detailsContainer}>
                                <View style={{ paddingHorizontal: metrics.hp2 }}>
                                    <View style={{ flexDirection: "row" }}>
                                        <FastImage source={currentProfileData?.profilePicture?.legnth || currentProfileData?.gallery?.length ? { uri: currentProfileData?.profilePicture ? currentProfileData?.profilePicture[0]?.url : currentProfileData?.gallery[0]?.url } : currentProfileData?.gender === "male" ? dummyMaleProfile : dummyfemaleProfile} resizeMode="cover" style={{ height: metrics.hp10, width: metrics.hp10, borderRadius: metrics.hp50, borderWidth: metrics.hp0_1, borderColor: "#E6B7A8", marginTop: -metrics.hp2 }} />
                                        <AppText type={TWENTY} weight={SCHEHERAZADE_BOLD} style={{ color: "#E6B7A8", marginTop: metrics.hp2 }}>
                                            {"   "}{currentProfileData?.username ? currentProfileData?.username : currentProfileData?.name}
                                        </AppText>
                                    </View>
                                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: metrics.hp2 }}>
                                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: metrics.hp1_5, paddingVertical: metrics.hp0_5, borderRadius: metrics.hp4, backgroundColor: "#5B6168", marginRight: metrics.hp1 }}>
                                            <FastImage source={pronounIcon} resizeMode="contain" style={{ height: metrics.hp2, width: metrics.hp2 }} tintColor={colors.white} />
                                            <AppText color={WHITE} weight={INTER_BOLD} type={ELEVEN}>
                                                {"  "}{currentProfileData?.gender}
                                            </AppText>
                                        </View>
                                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: metrics.hp1_5, paddingVertical: metrics.hp0_5, borderRadius: metrics.hp4, backgroundColor: "#5B6168", marginRight: metrics.hp1 }}>
                                            <FastImage source={dobIcon} resizeMode="contain" style={{ height: metrics.hp2, width: metrics.hp2 }} tintColor={colors.white} />
                                            <AppText color={WHITE} weight={INTER_BOLD} type={ELEVEN}>
                                                {"  "}{currentProfileData?.age} years
                                            </AppText>
                                        </View>
                                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: metrics.hp1_5, paddingVertical: metrics.hp0_5, borderRadius: metrics.hp4, backgroundColor: "#5B6168" }}>
                                            <FastImage source={partnerheart} resizeMode="contain" style={{ height: metrics.hp2, width: metrics.hp2 }} tintColor={colors.white} />
                                            <AppText color={WHITE} weight={INTER_BOLD} type={ELEVEN}>
                                                {"  "}{currentProfileData?.distanceInKm < 10 ? "Near You" : `${currentProfileData?.distanceInKm} Km`}
                                            </AppText>
                                        </View>
                                    </View>
                                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: metrics.hp1 }}>
                                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: metrics.hp1_5, paddingVertical: metrics.hp0_5, borderRadius: metrics.hp4, backgroundColor: "#5B6168", marginRight: metrics.hp1 }}>
                                            <FastImage source={heightIconWhiteNew} resizeMode="contain" style={{ height: metrics.hp2, width: metrics.hp2 }} tintColor={colors.white} />
                                            <AppText color={WHITE} weight={INTER_BOLD} type={ELEVEN}>
                                                {"  "}{currentProfileData?.height} ft
                                            </AppText>
                                        </View>
                                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: metrics.hp1_5, paddingVertical: metrics.hp0_5, borderRadius: metrics.hp4, backgroundColor: "#5B6168", marginRight: metrics.hp1 }}>
                                            <FastImage source={locationIconWhiteNew} resizeMode="contain" style={{ height: metrics.hp2, width: metrics.hp2 }} tintColor={colors.white} />
                                            <AppText color={WHITE} weight={INTER_BOLD} type={ELEVEN}>
                                                {"  "}{currentProfileData?.city}
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
                                            {currentProfileData.bio}
                                        </AppText>
                                    </ImageBackground>
                                </View>
                            </ImageBackground>
                        </View>

                        {selectedTurnOnList?.length ?
                            <View style={{ paddingHorizontal: metrics.hp2 }}>
                                <View style={{ height: metrics.hp0_1, backgroundColor: "#524440", width: "100%", marginTop: metrics.hp4 }} />
                                <ImageBackground source={biosToggla} resizeMode="contain" style={{ height: metrics.hp7, width: metrics.hp18, alignSelf: "center", marginTop: -metrics.hp3, alignItems: "center", justifyContent: "center", flexDirection: "row", }} >
                                    <FastImage source={trunOnIcon} resizeMode="contain" style={{ height: metrics.hp4, width: metrics.hp4 }} />
                                    <AppText type={FORTEEN} weight={SCHEHERAZADE_BOLD} color={WHITE}>
                                        {"  "}Turn-On
                                    </AppText>
                                </ImageBackground>
                            </View> : <></>}
                        <FlatList
                            data={selectedTurnOnList}
                            renderItem={renderItemTurns_ons}
                            keyExtractor={(item) => item._id.toString()}
                            numColumns={2}
                            contentContainerStyle={{ paddingHorizontal: metrics.hp2, alignItems: "center", marginTop: metrics.hp0, paddingBottom: metrics.hp5 }}
                            columnWrapperStyle={{ columnGap: metrics.hp2, marginTop: metrics.hp6 }} />
                    </View>
                </KeyboardAwareScrollView>
                <ImageBackground source={BottomLayer} resizeMode="stretch" style={[styles.inputContainer, { bottom: keyboardHeight }]}>
                    <View style={styles.inputContainerType}>
                        <TextInput
                            style={styles.textInput}
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder="Type a message..."
                            multiline
                            placeholderTextColor={colors.white}
                        />
                    </View>
                    <TouchableOpacityView
                        onPress={sendCrushNote}
                        style={styles.sendButton}>
                        <FastImage source={sendMessageNewIcon} resizeMode='contain' style={{ height: metrics.hp5_5, width: metrics.hp5_5 }} />
                    </TouchableOpacityView>
                </ImageBackground>
            </AppSafeAreaView>
        </KeyboardAvoidingView>
    )
};
export default CrushNotesSender;
const styles = StyleSheet.create({
    detailsContainer: {
        height: metrics.hp37,
        width: "100%",
    },
    container: {
        flex: 1,
    },
    imageContainer: {
        flex: 1, marginTop: metrics.hp1,

    },
    shareIcon: {
        height: metrics.hp4,
        width: metrics.hp4
    },
    image: {
        borderRadius: metrics.hp2,
        width: "100%",
    },
    paginationContainer: {
        position: 'absolute',
        top: metrics.hp1,
        left: 0,
        right: 0,
        height: 4,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: metrics.hp1,
        gap: metrics.hp0_5,
    },
    paginationBar: {
        height: metrics.hp0_3,
        width: metrics.hp5,
        flex: 1,
        borderRadius: metrics.hp10
    },
    imageMain: {
        height: metrics.hp45,
        width: metrics.hp34
    },
    inputContainer: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: metrics.hp2, backgroundColor: newColor.blackNew, paddingVertical: metrics.hp3 },
    inputContainerType: { borderWidth: metrics.hp0_1, borderColor: "#C4C4C447", backgroundColor: "#212123", borderRadius: metrics.hp5, paddingHorizontal: metrics.hp1, alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingVertical: metrics.hp0_5 },
    textInput: { color: colors.white, minHeight: metrics.hp4, maxHeight: metrics.hp8, fontSize: fontSize(13), width: "83%", fontFamily: interMedium, marginLeft: metrics.hp1, marginTop: Platform.OS === "ios" ? metrics.hp1 : 0 },
    sendButton: { marginLeft: metrics.hp0_6, justifyContent: 'center', alignItems: 'center', },
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
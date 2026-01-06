import React, { useEffect, useRef, useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { Dimensions, ImageBackground, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from "react-native";
import PeopleHeader from "../../common/PeopleHeader";
import CrushNotesHeader from "../../common/CrushNotesHeader";
import { crushNoteBack, sendButton, shareRedIcon, upArrowIcon } from "../../helper/ImageAssets";
import metrics from "../../assets/Metrics";
import FastImage from "react-native-fast-image";
import { AppText, fontSize, SCHEHERAZADE_BOLD, SCHEHERAZADE_SEMI_BOLD, SIXTEEN, TWENTY } from "../../common/AppText";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import ProfileBottomDetails from "./ProfileBottomDetail";
import { colors } from "../../theme/colors";
import { useDispatch, useSelector } from "react-redux";
import { setListProfiles } from "../../slices/loginServices/authSlice";
import { interMedium } from "../../theme/typography";
const { width, height } = Dimensions.get("window");
const COLLAPSED_IMAGE_HEIGHT = height * 0.45;
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { getProfile, sendCrushNotesAPI } from "../../actions/authActions";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_CRUSH_PURCHESE_SCREEN } from "../../navigation/routes";
import { toastAlert } from "../../actions/UploadImageActions";

const CrushNotesSender = ({ data, setModalVisible, setSwipeRight, setSwipeUp, setSwipeLeft, setProfileData, discover, setSuperLikeVisible, canSuperLike }: any) => {
    const dispatch = useDispatch();
    const cardWidthRef = useRef(0);
    const [inputText, setInputText] = useState('');
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    const listProfilesData = useSelector((state: any) => state.auth.listProfiles);
    const userData = useSelector((state: any) => state.auth.userData);
    const handleTap = (evt: any, profile: any) => {
        const totalImages = profile?.gallery?.length || 0;
        if (!evt?.nativeEvent?.locationX || !cardWidthRef.current) return;
        const x = evt.nativeEvent.locationX;
        if (discover) {
            let newIndex = profile.index || 0;
            if (x > cardWidthRef.current / 2) {
                newIndex = newIndex < totalImages - 1 ? newIndex + 1 : newIndex;
            } else {
                newIndex = newIndex > 0 ? newIndex - 1 : newIndex;
            }
            const updatedObject = { ...profile, index: newIndex };
            setProfileData(updatedObject);
        } else {
            const updatedProfiles = listProfilesData.map((p: any) => {
                if (p._id === profile._id) {
                    let newIndex = p.index || 0;
                    if (x > cardWidthRef.current / 2) {
                        newIndex = newIndex < totalImages - 1 ? newIndex + 1 : newIndex;
                    } else {
                        newIndex = newIndex > 0 ? newIndex - 1 : newIndex;
                    }
                    return { ...p, index: newIndex };
                }
                return p;
            });
            dispatch(setListProfiles(updatedProfiles));
        }
    };
    const scrollViewRef: any = useRef(null);

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
    const sendCrushNote = async () => {
        if (!inputText.trim()) return;

        const remaining = Number(userData?.crushNotesRemaining);
        if (Number.isFinite(remaining) && remaining <= 0) {
            if (setModalVisible) setModalVisible(false);
            NavigationService.navigate(NAVIGATION_CRUSH_PURCHESE_SCREEN);
            return;
        }
        
        const datasend = {
            receiverId: data?._id,
            message: inputText
        };
        
        try {
            const response = await dispatch(sendCrushNotesAPI(datasend));
            
            if (response?.statusCode === 200) {
                // First set swipeRight to true (this will trigger the swipe animation and like action when modal closes)
                if (setSwipeRight) {
                    setSwipeRight(true);
                }
                
                // Close modal - the HomeScreen's useEffect will handle the swipe animation and like action
                if (setModalVisible) {
                    setModalVisible(false);
                }
                dispatch(getProfile(true));
            }
        } catch (error) {
            toastAlert.showToastError("You can only send one crush note to this user per 24 hours")
            console.log("Error sending crush note:", error);
        }
    }
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
            <AppSafeAreaView>
                <CrushNotesHeader
                    name={discover ? data?.firstName : data?.name}
                    age={data?.age}
                    setModalVisible={setModalVisible}
                    remainingCount={userData?.crushNotesRemaining}
                />
                <ImageBackground source={crushNoteBack} resizeMode={"cover"} style={styles.imageContainer}>
                    <KeyboardAwareScrollView
                        enableOnAndroid={true}
                        extraScrollHeight={Platform.OS === "ios" ? 40 : metrics.hp20}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ paddingBottom: metrics.hp20, flexGrow: 1 }}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={{ paddingHorizontal: metrics.hp2, paddingVertical: metrics.hp2 }}>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <FastImage source={shareRedIcon} resizeMode="contain" style={styles.shareIcon} />
                                <AppText type={SIXTEEN} weight={SCHEHERAZADE_SEMI_BOLD}>
                                    {"  "}Send Crush Note
                                </AppText>
                            </View>
                            <View style={{ alignItems: "center", justifyContent: "center" }}>
                                <AppText weight={SCHEHERAZADE_BOLD} type={TWENTY}>
                                    "Turn Every Crush into a Real
                                </AppText>
                                <AppText style={{ marginTop: -metrics.hp2_5 }} weight={SCHEHERAZADE_BOLD} type={TWENTY}>Chance — 4x More Connections!</AppText>
                            </View>
                            <TouchableOpacityView
                                activeOpacity={1}
                                onPress={(evt) => handleTap(evt, data)}
                                delayPressIn={0}
                                onLayout={(e) => {
                                    const layout = e?.nativeEvent?.layout;
                                    if (layout?.width) cardWidthRef.current = layout.width;
                                }}>
                                <ImageBackground
                                    imageStyle={{ borderRadius: metrics.hp2 }}
                                    source={{ uri: data?.gallery?.[data?.index]?.url }}
                                    style={[styles.image, { height: COLLAPSED_IMAGE_HEIGHT }]}
                                    resizeMode="cover">
                                    <View style={styles.paginationContainer}>
                                        {data?.gallery?.map((_: any, i: number) => (
                                            <View
                                                key={i}
                                                style={[
                                                    styles.paginationBar,
                                                    {
                                                        opacity: i === data?.index ? 1 : 0.3,
                                                        backgroundColor:
                                                            i === data?.index ? colors.white : "gray",
                                                    },
                                                ]}
                                            />
                                        ))}
                                    </View>
                                </ImageBackground>
                            </TouchableOpacityView>
                            <ProfileBottomDetails visibleCards={data} discover={discover} share={true} />
                        </View>
                    </KeyboardAwareScrollView>
                </ImageBackground>
                <View style={[styles.inputContainer, { bottom: keyboardHeight }]}>
                    <View style={styles.inputContainerType}>
                        <TextInput
                            style={styles.textInput}
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder="Type a message..."
                            multiline
                        />
                    </View>
                    <TouchableOpacityView
                    onPress={sendCrushNote}
                        style={styles.sendButton}>
                        <FastImage source={sendButton} resizeMode='contain' style={{ height: metrics.hp3, width: metrics.hp3 }} />
                    </TouchableOpacityView>
                </View>
            </AppSafeAreaView>
        </KeyboardAvoidingView>
    )
};
export default CrushNotesSender;
const styles = StyleSheet.create({
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
    inputContainer: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: metrics.hp2, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e0e0e0', paddingVertical: metrics.hp2 },
    inputContainerType: { borderWidth: metrics.hp0_1, borderColor: colors.nanoOpecity, borderRadius: metrics.hp5, paddingHorizontal: metrics.hp1, alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingVertical: metrics.hp0_5 },
    textInput: { minHeight: metrics.hp4, maxHeight: metrics.hp8, fontSize: fontSize(13), width: "83%", fontFamily: interMedium, marginLeft: metrics.hp1 },
    sendButton: { backgroundColor: '#6F13F2', borderRadius: metrics.hp50, marginLeft: 6, justifyContent: 'center', alignItems: 'center', height: metrics.hp5_5, width: metrics.hp5_5 },
})
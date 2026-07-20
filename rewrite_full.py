full_content = """import React, { useEffect, useState, useRef } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { Alert, FlatList, Platform, ScrollView, StyleSheet, View, Modal, Dimensions, ImageBackground } from "react-native";
import metrics from "../../assets/Metrics";
import { Screen } from "../../theme/dimens";
import { colors, newColor } from "../../theme/colors";
import { AppText, BLACK, EIGHTEEN, INTER_BOLD, INTER_MEDIUM, INTER_SEMI_BOLD, LIGHT_BLACK, WHITE, SCHEHERAZADE_BOLD, SIXTEEN, TWENTY_FOUR, TWELVE, OPECITY, FORTEEN } from "../../common/AppText";
import { editProfileTextInput, BottomLayer } from "../../helper/ImageAssets";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import { sexualityDATA } from "../../common/UiltData";
import NavigationService from "../../navigation/NavigationService";
import { useDispatch, useSelector } from "react-redux";
import { editProfile, getProfile } from "../../actions/authActions";
import NewHeader from "../../common/NewHeader";
import LinearGradient from "react-native-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import DOBPicker from "../../components/DOBPicker";
import { scale, verticalScale } from "react-native-size-matters";
import GoButton from "../../common/GoButton";

const heights: any = [];
for (let ft = 4; ft <= 7; ft++) {
  for (let inch = 0; inch < 12; inch++) {
    if (ft === 7 && inch === 11) {
      heights.push(`${ft}'${inch}"`);
      break;
    }
    heights.push(`${ft}'${inch}"`);
  }
}
const heightsCm: any = [];
for (let cm = 140; cm <= 210; cm++) {
  heightsCm.push(`${cm} cm`);
}
const MARK_HEIGHT = verticalScale(20);

const EditProfileScreen = () => {
    const dispatch = useDispatch();
    const userData = useSelector((state: any) => state?.auth?.userData);
    
    // New States
    const [localSexuality, setLocalSexuality] = useState(userData?.sexualOrientation || "");
    const [localDate, setLocalDate] = useState<Date | null>(null);
    const [localHeight, setLocalHeight] = useState(userData?.height || "4'0\\"");
    const [showSexualityModal, setShowSexualityModal] = useState(false);
    const [showIOSPicker, setShowIOSPicker] = useState(false);
    const [showAndroidPicker, setShowAndroidPicker] = useState(false);
    const [showHeightModal, setShowHeightModal] = useState(false);
    const [selectFtCm, setSelectFtCm] = useState("FT");
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if(userData?.dateOfBirth) {
            setLocalDate(new Date(userData.dateOfBirth));
        } else if (userData?.age) {
            const today = new Date();
            setLocalDate(new Date(today.getFullYear() - userData.age, today.getMonth(), today.getDate()));
        }
    }, [userData?.dateOfBirth, userData?.age]);

    const formattedDate = localDate ? localDate.toISOString().split("T")[0] : null;

    const currentDataSource = selectFtCm === "FT" ? heights : heightsCm;
    const centerOffset = (verticalScale(400) / 2) - (MARK_HEIGHT / 2);

    const handleHeightScroll = (event: any) => {
        const yOffset = event.nativeEvent.contentOffset.y;
        const index = Math.round(yOffset / MARK_HEIGHT);
        if (index >= 0 && index < currentDataSource.length) {
            setLocalHeight(currentDataSource[index]);
        }
    };

    const renderRulerMark = (item: any, index: any) => {
        let markStyle = styles.smallMark;
        let markWidth = scale(25);
        let markText = null;
        if (selectFtCm === "FT") {
            const inches = index % 12;
            if (inches === 0) {
                markStyle = styles.largeMark;
                markWidth = scale(60);
                markText = item;
            } else if (inches === 6) {
                markWidth = scale(45);
            } else if (inches % 2 === 0) {
                markWidth = scale(30);
            }
        } else {
            const cm = parseInt(item);
            if (cm % 10 === 0) {
                markStyle = styles.largeMark;
                markWidth = scale(60);
                markText = item;
            } else if (cm % 5 === 0) {
                markWidth = scale(40);
            }
        }
        return (
            <View key={index} style={styles.rulerMarkContainer}>
                {markText && (
                    <AppText type={TWELVE} weight={INTER_BOLD} color={WHITE} style={styles.markText}>
                        {markText}
                    </AppText>
                )}
                <View style={[styles.rulerMark, markStyle, { width: markWidth, backgroundColor: localHeight === item ? "#FDD2C1" : "#E0E0E0" }]} />
            </View>
        );
    };

    const handleUpdate = async () => {
        setIsUpdating(true);
        const payload: any = {};
        if (localSexuality !== userData?.sexualOrientation) payload.sexualOrientation = localSexuality;
        if (formattedDate && formattedDate !== userData?.dateOfBirth) payload.dateOfBirth = formattedDate;
        if (localHeight !== userData?.height) payload.height = localHeight;

        if (Object.keys(payload).length > 0) {
            await dispatch(editProfile(payload) as any);
            dispatch(getProfile());
        }
        setIsUpdating(false);
        NavigationService.goBack();
    };

    const minAgeDate = new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate());

    return (
        <AppSafeAreaView color={newColor.blackNew}>
            <NewHeader title={"Edit Profile"} onPress={() => NavigationService.goBack()} />
            
            <ScrollView contentContainerStyle={{ paddingBottom: metrics.hp10, paddingTop: metrics.hp2 }} showsVerticalScrollIndicator={false}>
                
                {/* 1. Username (Read Only) */}
                <View style={styles.fieldWrapper}>
                    <AppText type={TWELVE} weight={INTER_SEMI_BOLD} color={WHITE} style={styles.fieldLabel}>Username</AppText>
                    <ImageBackground source={editProfileTextInput} resizeMode="stretch" style={styles.inputBg}>
                        <AppText type={FORTEEN} weight={INTER_MEDIUM} color={WHITE}>{userData?.firstName || userData?.name || ""}</AppText>
                    </ImageBackground>
                </View>

                {/* 2. Sexuality */}
                <View style={styles.fieldWrapper}>
                    <AppText type={TWELVE} weight={INTER_SEMI_BOLD} color={WHITE} style={styles.fieldLabel}>Sexuality</AppText>
                    <TouchableOpacityView onPress={() => setShowSexualityModal(true)}>
                        <ImageBackground source={editProfileTextInput} resizeMode="stretch" style={styles.inputBg}>
                            <AppText type={FORTEEN} weight={INTER_MEDIUM} color={WHITE}>{localSexuality || "Select Sexuality"}</AppText>
                        </ImageBackground>
                    </TouchableOpacityView>
                </View>

                {/* 3. Age */}
                <View style={styles.fieldWrapper}>
                    <AppText type={TWELVE} weight={INTER_SEMI_BOLD} color={WHITE} style={styles.fieldLabel}>Age</AppText>
                    <TouchableOpacityView onPress={() => Platform.OS === 'ios' ? setShowIOSPicker(true) : setShowAndroidPicker(true)}>
                        <ImageBackground source={editProfileTextInput} resizeMode="stretch" style={styles.inputBg}>
                            <AppText type={FORTEEN} weight={INTER_MEDIUM} color={WHITE}>
                                {localDate ? `${new Date().getFullYear() - localDate.getFullYear()} years (${localDate.toLocaleDateString("en-GB", {day:"2-digit", month:"short", year:"numeric"})})` : "Select Age"}
                            </AppText>
                        </ImageBackground>
                    </TouchableOpacityView>
                </View>

                {/* 4. Height */}
                <View style={styles.fieldWrapper}>
                    <AppText type={TWELVE} weight={INTER_SEMI_BOLD} color={WHITE} style={styles.fieldLabel}>Height</AppText>
                    <TouchableOpacityView onPress={() => setShowHeightModal(true)}>
                        <ImageBackground source={editProfileTextInput} resizeMode="stretch" style={styles.inputBg}>
                            <AppText type={FORTEEN} weight={INTER_MEDIUM} color={WHITE}>{localHeight || "Select Height"}</AppText>
                        </ImageBackground>
                    </TouchableOpacityView>
                </View>

                {/* 5. Location (Read Only) */}
                <View style={styles.fieldWrapper}>
                    <AppText type={TWELVE} weight={INTER_SEMI_BOLD} color={WHITE} style={styles.fieldLabel}>Location</AppText>
                    <ImageBackground source={editProfileTextInput} resizeMode="stretch" style={styles.inputBg}>
                        <AppText type={FORTEEN} weight={INTER_MEDIUM} color={WHITE}>{userData?.city || userData?.homeTown || ""}</AppText>
                    </ImageBackground>
                </View>

            </ScrollView>

            <ImageBackground source={BottomLayer} resizeMode="stretch" style={styles.bottomLayer}>
                <TouchableOpacityView onPress={handleUpdate} disabled={isUpdating} style={{ width: "90%" }}>
                    <LinearGradient colors={["#D08FA9", "#FDD2C1"]} style={styles.gradientBtn}>
                        <AppText type={EIGHTEEN} weight={SCHEHERAZADE_BOLD} color={BLACK}>
                            {isUpdating ? "Updating..." : "Update Profile"}
                        </AppText>
                    </LinearGradient>
                </TouchableOpacityView>
            </ImageBackground>

            {/* Sexuality Modal */}
            <Modal visible={showSexualityModal} transparent animationType="slide">
                <TouchableOpacityView style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSexualityModal(false)}>
                    <View style={styles.modalContent}>
                        <AppText type={SIXTEEN} weight={INTER_BOLD} color={BLACK} style={{marginBottom: metrics.hp2}}>Select Sexuality</AppText>
                        <FlatList
                            data={sexualityDATA}
                            keyExtractor={(item, idx) => String(idx)}
                            renderItem={({item}) => (
                                <TouchableOpacityView style={styles.sexualityOption} onPress={() => { setLocalSexuality(item.title); setShowSexualityModal(false); }}>
                                    <AppText type={FORTEEN} color={BLACK}>{item.title}</AppText>
                                </TouchableOpacityView>
                            )}
                        />
                    </View>
                </TouchableOpacityView>
            </Modal>

            {/* Height Modal */}
            <Modal visible={showHeightModal} transparent animationType="slide">
                <View style={styles.rulerModalOverlay}>
                    <View style={styles.rulerModalContent}>
                        <View style={styles.selectCm}>
                            <TouchableOpacityView onPress={() => setSelectFtCm("FT")} style={[styles.selectedBack, { backgroundColor: selectFtCm === "FT" ? colors.green : colors.lightBack }]}>
                                <AppText type={TWELVE} color={selectFtCm === "FT" ? BLACK : OPECITY} weight={INTER_SEMI_BOLD}>FT</AppText>
                            </TouchableOpacityView>
                            <TouchableOpacityView onPress={() => setSelectFtCm("CM")} style={[styles.selectedBack, { backgroundColor: selectFtCm === "CM" ? colors.green : colors.lightBack }]}>
                                <AppText type={TWELVE} color={selectFtCm === "CM" ? BLACK : OPECITY} weight={INTER_SEMI_BOLD}>CM</AppText>
                            </TouchableOpacityView>
                        </View>
                        
                        <View style={{height: verticalScale(300), width: '100%', marginTop: metrics.hp2}}>
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                snapToInterval={MARK_HEIGHT}
                                decelerationRate="fast"
                                onScroll={handleHeightScroll}
                                scrollEventThrottle={16}
                                contentContainerStyle={{ paddingTop: centerOffset, paddingBottom: centerOffset }}
                            >
                                {currentDataSource.map(renderRulerMark)}
                            </ScrollView>
                        </View>
                        
                        <AppText type={TWENTY_FOUR} weight={INTER_BOLD} color={WHITE} style={{marginVertical: metrics.hp2}}>{localHeight}</AppText>
                        
                        <TouchableOpacityView onPress={() => setShowHeightModal(false)} style={styles.confirmHeightBtn}>
                            <AppText type={SIXTEEN} weight={INTER_BOLD} color={BLACK}>Confirm Height</AppText>
                        </TouchableOpacityView>
                    </View>
                </View>
            </Modal>

            {/* Age Picker Modals */}
            {Platform.OS === "android" && showAndroidPicker && (
                <DOBPicker
                    visible={showAndroidPicker}
                    onClose={() => setShowAndroidPicker(false)}
                    initialDate={localDate || new Date(1998, 6, 17)}
                    onConfirm={(d) => { setLocalDate(d); setShowAndroidPicker(false); }}
                />
            )}
            <Modal transparent animationType="slide" visible={showIOSPicker}>
                <TouchableOpacityView onPress={() => setShowIOSPicker(false)} style={styles.iosOverlay}>
                    <TouchableOpacityView activeOpacity={1} style={styles.iosContainer}>
                        <DateTimePicker
                            value={localDate || minAgeDate}
                            mode="date"
                            display="spinner"
                            textColor="black"
                            themeVariant="light"
                            maximumDate={minAgeDate}
                            onChange={(e, d) => { if (d) setLocalDate(d); }}
                        />
                        <View style={{ position: "absolute", right: metrics.hp2, bottom: metrics.hp2 }}>
                            <GoButton colortrue={localDate} onPress={() => setShowIOSPicker(false)} />
                        </View>
                    </TouchableOpacityView>
                </TouchableOpacityView>
            </Modal>

        </AppSafeAreaView>
    );
};
export default EditProfileScreen;

const styles = StyleSheet.create({
    fieldWrapper: {
        marginHorizontal: metrics.hp2,
        marginBottom: metrics.hp2,
    },
    fieldLabel: {
        marginBottom: metrics.hp1,
        marginLeft: metrics.hp1,
    },
    inputBg: {
        height: metrics.hp7,
        width: "100%",
        justifyContent: "center",
        paddingHorizontal: metrics.hp2,
    },
    bottomLayer: {
        width: "100%",
        paddingVertical: metrics.hp2,
        alignItems: "center",
        backgroundColor:"#212123",
        position: 'absolute',
        bottom: 0,
    },
    gradientBtn: {
        height: metrics.hp7,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: metrics.hp4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: colors.transparentBlack,
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: metrics.hp3,
        borderTopRightRadius: metrics.hp3,
        padding: metrics.hp3,
        maxHeight: "50%",
    },
    sexualityOption: {
        paddingVertical: metrics.hp2,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightBack,
    },
    iosOverlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.3)",
    },
    iosContainer: {
        backgroundColor: colors.white,
        paddingBottom: metrics.hp10,
        alignItems: "center",
    },
    rulerModalOverlay: {
        flex: 1,
        backgroundColor: colors.transparentBlack,
        justifyContent: "center",
        alignItems: "center",
    },
    rulerModalContent: {
        backgroundColor: "#2C2C2E",
        width: "90%",
        borderRadius: metrics.hp2,
        padding: metrics.hp2,
        alignItems: "center",
    },
    selectCm: {
        height: metrics.hp5,
        backgroundColor: colors.lightBack,
        width: metrics.hp15,
        borderRadius: metrics.hp4,
        padding: metrics.hp0_2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    selectedBack: {
        height: metrics.hp4_5,
        width: "48%",
        borderRadius: metrics.hp50,
        alignItems: "center",
        justifyContent: "center",
    },
    rulerMarkContainer: {
        height: MARK_HEIGHT,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    rulerMark: {
        height: verticalScale(2),
    },
    smallMark: {
        width: scale(25),
    },
    largeMark: {
        width: scale(60),
    },
    markText: {
        marginRight: scale(10),
        minWidth: scale(40),
        textAlign: "right",
    },
    confirmHeightBtn: {
        backgroundColor: "#FDD2C1",
        paddingVertical: metrics.hp1_5,
        paddingHorizontal: metrics.hp4,
        borderRadius: metrics.hp4,
        marginTop: metrics.hp1,
    }
});
"""

with open('src/screens/ProfileScreens/EditProfileScreen.tsx', 'w') as f:
    f.write(full_content)

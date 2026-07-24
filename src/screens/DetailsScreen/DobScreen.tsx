import React, { useState } from "react";
import {
    Modal,
    StyleSheet,
    View,
    Platform,
    ImageBackground,
} from "react-native";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import HeaderCommon from "../../common/HeaderCommon";
import TopCommonLine from "../../common/TopCommonLine";
import metrics from "../../assets/Metrics";
import {
    AppText,
    EIGHTEEN,
    ELEVEN,
    fontSize,
    INTER_MEDIUM,
    INTER_REGULAR,
    INTER_SEMI_BOLD,
    LIGHT_BLACK,
    OPECITY,
    SCHEHERAZADE_BOLD,
    SCHEHERAZADE_SEMI_BOLD,
    SIXTEEN,
    THIRTEEN,
    TWELVE,
    TWENTY_FOUR,
    WHITE,
} from "../../common/AppText";
import { colors, newColor } from "../../theme/colors";
import FastImage from "react-native-fast-image";
import GoButton from "../../common/GoButton";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import { Screen } from "../../theme/dimens";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_HEIGHT_SCREEN, NAVIGATION_LOCATION_SCREEN } from "../../navigation/routes";
import { toastAlert } from "../../actions/UploadImageActions";
import { useDispatch, useSelector } from "react-redux";
import { setAddProfile } from "../../slices/loginServices/authSlice";
import LinearGradient from "react-native-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import { applogo, bdyBack, BottomLayer, calendarIcon, dobIcon, dobImage } from "../../helper/ImageAssets";
import DOBPicker from "../../components/DOBPicker";
import { BlurView } from "@react-native-community/blur";

const DobScreen = () => {
    const dispatch = useDispatch();
    const datalist = new Array(12).fill(null).map((_, index) => ({ id: String(index) }));
    const addProfileData = useSelector((state: any) => state?.auth?.addProfileData);
    const todaynew = new Date();
    const [date, setDate] = useState<Date | null>(null);
    const [showAndroidPicker, setShowAndroidPicker] = useState(false);
    const [showIOSPicker, setShowIOSPicker] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const today = new Date();
    const minAgeDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

    const getDateDigits = (d: Date) => {
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = String(d.getFullYear());
        return `${day}${month}${year}`.split("");
    };

    const dateDigits = date
        ? getDateDigits(date)
        : ["D", "D", "M", "M", "Y", "Y", "Y", "Y"];

    const formattedDate = date?.toISOString().split("T")[0];

    const formatDate = (d: Date | null) => {
        if (!d) return "";
        return d.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const calculateAge = (dob: Date) => {
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        return age;
    };

    const onSubmit = () => {
        dispatch(
            setAddProfile({
                ...addProfileData,
                dateOfBirth: formattedDate,
            })
        );
        setModalVisible(false);
        NavigationService.navigate(NAVIGATION_HEIGHT_SCREEN);
    };

    const openPicker = () => {
        if (Platform.OS === "ios") {
            setShowIOSPicker(true);
        } else {
            setShowAndroidPicker(true);
        }
    };

    return (
        <AppSafeAreaView color={newColor.blackNew}>
            <FastImage source={applogo} resizeMode="contain" style={styles.logo} />
            <FastImage source={dobImage} resizeMode="contain" style={styles.homeLandImage} />

            <View style={{ position: "absolute", bottom: metrics.hp0, width: Screen.Width, }}>
                <View style={{
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: metrics.hp5

                }}>
                    <AppText style={{ textAlign: "center" }} weight={SCHEHERAZADE_SEMI_BOLD} type={TWENTY_FOUR} color={WHITE}>
                        When do you celebrate your
                    </AppText>
                    <AppText style={{ textAlign: "center", marginTop: -metrics.hp3 }} weight={SCHEHERAZADE_SEMI_BOLD} type={TWENTY_FOUR} color={WHITE}>
                        birthday?
                    </AppText>
                    <AppText style={{ textAlign: "center", marginBottom: -metrics.hp2 }} type={THIRTEEN} weight={INTER_REGULAR} color={WHITE}>
                        Choose you date of birth
                    </AppText>
                </View>
                <ImageBackground source={BottomLayer} resizeMode="stretch" style={styles.bottomLayer}>
                    <View style={{ marginHorizontal: metrics.hp2 }}>
                        <TouchableOpacityView onPress={openPicker} style={styles.dobContainer}>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                {dateDigits.map((digit, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.ddContainer,
                                            {
                                                marginLeft:
                                                    index === 0
                                                        ? 0
                                                        : index === 2 || index === 4
                                                            ? metrics.hp1_5
                                                            : metrics.hp1,
                                            },
                                        ]}
                                    >
                                        <AppText
                                            type={SIXTEEN}
                                            weight={INTER_MEDIUM}
                                            color={date ? WHITE : OPECITY}
                                        >
                                            {digit}
                                        </AppText>
                                        <View style={styles.ddLine} />
                                    </View>
                                ))}
                            </View>

                            <FastImage
                                source={calendarIcon}
                                resizeMode="contain"
                                tintColor={colors.white}
                                style={{ height: metrics.hp2_5, width: metrics.hp2_5, marginTop: metrics.hp0_5, marginLeft: metrics.hp2 }}
                            />
                        </TouchableOpacityView>

                        <AppText
                            style={{ marginTop: metrics.hp1, textAlign: "center", opacity: 0.5 }}
                            color={OPECITY}
                            weight={INTER_MEDIUM}
                            type={TWELVE}
                        >
                            We’ll use this to calculate your age.
                        </AppText>
                    </View>
                </ImageBackground>
            </View>

            {Platform.OS === "android" && (
                <DOBPicker
                    visible={showAndroidPicker}
                    onClose={() => setShowAndroidPicker(false)}
                    initialDate={date || todaynew}
                    onConfirm={(selectedDate) => {
                        setDate(selectedDate);
                        setTimeout(() => {
                            setModalVisible(true);
                        }, 500);
                    }}
                />
            )}

            <Modal transparent animationType="slide" visible={showIOSPicker}>
                <TouchableOpacityView onPress={() => setShowIOSPicker(false)} style={styles.iosOverlay}>
                    <TouchableOpacityView activeOpacity={0} onPress={() => console.log("")} style={styles.iosContainer}>
                        <DateTimePicker
                            value={date || minAgeDate}
                            mode="date"
                            display="spinner"
                            textColor="black"
                            themeVariant="light"
                            maximumDate={minAgeDate}
                            onChange={(e, selectedDate) => {
                                if (selectedDate) setDate(selectedDate);
                            }}
                        />

                        <LinearGradient
                            style={{ position: "absolute", right: metrics.hp1, bottom: metrics.hp2 }}
                            colors={["#ffffff50", colors.white, colors.white]}
                        >
                            <View style={{ marginTop: metrics.hp0 }}>
                                <GoButton
                                    colortrue={date}
                                    onPress={() => {
                                        if (!formattedDate) {
                                            toastAlert.showToastError("Please add your DOB")
                                        } else {
                                            setShowIOSPicker(false)
                                            setModalVisible(true)
                                        }
                                        // !formattedDate
                                        //     ? toastAlert.showToastError("Please add your DOB")
                                        //     : setShowIOSPicker(false)
                                    }
                                    }
                                />
                            </View>
                        </LinearGradient>
                    </TouchableOpacityView>
                </TouchableOpacityView>
            </Modal>
            <Modal transparent animationType="fade" visible={modalVisible}>
                <BlurView
                   style={StyleSheet.absoluteFillObject}
                   blurType="dark"
                   blurAmount={0.2}
                />
                <View style={styles.centeredView}>
                    <View style={styles.confirmContainer}>
                        <FastImage source={bdyBack} style={styles.bdyBack} />

                        <AppText
                            weight={SCHEHERAZADE_BOLD}
                            style={{ fontSize: fontSize(30), textAlign: "center", color: "#FDD2C1", marginTop: -metrics.hp1 }}
                        >
                            {date ? `You’re ${calculateAge(date)}` : ""}
                        </AppText>

                        <AppText color={WHITE} style={{ textAlign: "center", marginTop: -metrics.hp2 }} type={TWELVE}>
                            Born {formatDate(date)}
                        </AppText>
                        <AppText color={WHITE} style={{ textAlign: "center", marginTop: metrics.hp1 }} type={ELEVEN} weight={INTER_REGULAR}>
                            Can’t change later. Confirm it now.
                        </AppText>
                        <TouchableOpacityView activeOpacity={1} onPress={onSubmit} style={{ height: metrics.hp5, width: "90%", backgroundColor: "#212123", alignSelf: "center", justifyContent: "center", alignItems: "center", marginBottom: metrics.hp2, marginTop: metrics.hp2 }}>
                            <AppText color={WHITE} type={SIXTEEN} weight={INTER_SEMI_BOLD}>
                                Confirm
                            </AppText>
                        </TouchableOpacityView>
                    </View>
                    <TouchableOpacityView style={{ width: "90%", paddingVertical: metrics.hp2, alignItems: "center", justifyContent: "center" }} onPress={() => setModalVisible(false)}>
                        <AppText color={WHITE} type={SIXTEEN} weight={INTER_SEMI_BOLD}>No, Edit</AppText>
                    </TouchableOpacityView>
                </View>

            </Modal>


            {/* <HeaderCommon />

            <View style={styles.container}>
                <TopCommonLine icon={dobIcon} datalist={datalist} />

                <View style={{ paddingHorizontal: metrics.hp2 }}>
                    <DubleTextLine
                        firstText="When do you celebrate"
                        secondText="your birthday?"
                    />

                    <TouchableOpacityView onPress={openPicker} style={styles.dobContainer}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            {dateDigits.map((digit, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.ddContainer,
                                        {
                                            marginLeft:
                                                index === 0
                                                    ? 0
                                                    : index === 2 || index === 4
                                                        ? metrics.hp1_5
                                                        : metrics.hp1,
                                        },
                                    ]}
                                >
                                    <AppText
                                        type={SIXTEEN}
                                        weight={INTER_MEDIUM}
                                        color={date ? LIGHT_BLACK : OPECITY}
                                    >
                                        {digit}
                                    </AppText>
                                    <View style={styles.ddLine} />
                                </View>
                            ))}
                        </View>

                        <FastImage
                            source={calendarIcon}
                            resizeMode="contain"
                            style={{ height: metrics.hp2_5, width: metrics.hp2_5 }}
                        />
                    </TouchableOpacityView>

                    <AppText
                        style={{ marginTop: metrics.hp1 }}
                        color={OPECITY}
                        weight={INTER_MEDIUM}
                        type={TWELVE}
                    >
                        We’ll use this to calculate your age.
                    </AppText>
                </View>
            </View>

            {showAndroidPicker && Platform.OS === "android" && (
                <DateTimePicker
                    value={date || minAgeDate}
                    mode="date"
                    maximumDate={minAgeDate}
                    display="default"
                    // style={{}}
                    onChange={(event, selectedDate) => {
                        setShowAndroidPicker(false);
                        if (selectedDate) setDate(selectedDate);
                    }}
                />
            )}

            <Modal transparent animationType="slide" visible={showIOSPicker}>
                <TouchableOpacityView onPress={() => setShowIOSPicker(false)} style={styles.iosOverlay}>
                    <TouchableOpacityView activeOpacity={0} onPress={()=>console.log("")} style={styles.iosContainer}>
                        <DateTimePicker
                            value={date || minAgeDate}
                            mode="date"
                            display="spinner"
                            textColor="black"
                            themeVariant="light" 
                            maximumDate={minAgeDate}
                            onChange={(e, selectedDate) => {
                                if (selectedDate) setDate(selectedDate);
                            }}
                        />

                        <LinearGradient
                            style={{ position:"absolute", right:metrics.hp1, bottom:metrics.hp2 }}
                            colors={["#ffffff50", colors.white, colors.white]}
                        >
                            <View style={{ marginTop: metrics.hp0 }}>
                                <GoButton
                                    colortrue={date}
                                    onPress={() => {
                                        if(!formattedDate){
                                            toastAlert.showToastError("Please add your DOB")
                                        }else{
                                            setShowIOSPicker(false)
                                            setModalVisible(true)
                                        }
                                        // !formattedDate
                                        //     ? toastAlert.showToastError("Please add your DOB")
                                        //     : setShowIOSPicker(false)
                                    }
                                    }
                                />
                            </View>
                        </LinearGradient>
                    </TouchableOpacityView>
                </TouchableOpacityView>
            </Modal>

            <LinearGradient
                style={{ height: metrics.hp19 }}
                colors={["#ffffff50", colors.white, colors.white]}
            >
                <View style={{ marginTop: metrics.hp9 }}>
                    <GoButton
                        colortrue={date}
                        onPress={() =>
                            !formattedDate
                                ? toastAlert.showToastError("Please add your DOB")
                                : setModalVisible(true)
                        }
                    />
                </View>
            </LinearGradient>

            <Modal transparent animationType="fade" visible={modalVisible}>
                <View style={styles.centeredView}>
                    <View style={styles.confirmContainer}>
                        <FastImage source={bdyBack} style={styles.bdyBack} />

                        <AppText
                            weight={SCHEHERAZADE_BOLD}
                            style={{ fontSize: fontSize(30), textAlign: "center" }}
                        >
                            {date ? `You’re ${calculateAge(date)}` : ""}
                        </AppText>

                        <AppText style={{ textAlign: "center" }} type={TWELVE}>
                            Born {formatDate(date)}
                        </AppText>

                        <View style={styles.actionRow}>
                            <TouchableOpacityView
                                style={styles.editButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <AppText weight={INTER_SEMI_BOLD}>Edit</AppText>
                            </TouchableOpacityView>

                            <TouchableOpacityView
                                style={[styles.editButton, { backgroundColor: colors.purple }]}
                                onPress={onSubmit}
                            >
                                <AppText color={WHITE} weight={INTER_SEMI_BOLD}>
                                    Confirm
                                </AppText>
                            </TouchableOpacityView>
                        </View>
                    </View>
                </View>
            </Modal> */}
        </AppSafeAreaView>
    );
};

export default DobScreen;

const styles = StyleSheet.create({
    logo: {
        height: metrics.hp7,
        width: metrics.hp25,
        alignSelf: "center",
        marginTop: metrics.hp8,

    },
    homeLandImage: {
        height: metrics.hp40, width: metrics.hp40,
        alignSelf: "center",
        marginTop: metrics.hp8,
        marginLeft: -metrics.hp2
    },
    bottomLayer: {
        height: metrics.hp20,
        width: "100%",
        paddingVertical: metrics.hp2,
        alignItems: "center"
    },

    container: { flex: 1, marginTop: metrics.hp3 },
    dobContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: metrics.hp5,
    },
    ddContainer: { alignItems: "center" },
    ddLine: {
        width: metrics.hp3_5,
        height: metrics.hp0_1,
        backgroundColor: colors.white,
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
    doneButton: {
        alignSelf: "flex-end",
        padding: metrics.hp2,
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#00000095",
    },
    confirmContainer: {
        width: Screen.Width / 1.2,
        backgroundColor: "#555359",
    },
    bdyBack: {
        width: Screen.Width / 1.2,
        height: metrics.hp16,
    },
    actionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: metrics.hp2,
    },
    editButton: {
        width: "47%",
        height: metrics.hp5,
        borderRadius: metrics.hp4,
        borderWidth: 1,
        borderColor: colors.purple,
        alignItems: "center",
        justifyContent: "center",

    },
});

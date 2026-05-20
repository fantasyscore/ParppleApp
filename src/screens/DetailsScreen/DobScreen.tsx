import React, { useState } from "react";
import {
    Modal,
    StyleSheet,
    View,
    Platform,
} from "react-native";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import HeaderCommon from "../../common/HeaderCommon";
import TopCommonLine from "../../common/TopCommonLine";
import metrics from "../../assets/Metrics";
import {
    AppText,
    fontSize,
    INTER_MEDIUM,
    INTER_SEMI_BOLD,
    LIGHT_BLACK,
    OPECITY,
    SCHEHERAZADE_BOLD,
    SIXTEEN,
    TWELVE,
    WHITE,
} from "../../common/AppText";
import { colors } from "../../theme/colors";
import FastImage from "react-native-fast-image";
import GoButton from "../../common/GoButton";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import { Screen } from "../../theme/dimens";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_LOCATION_SCREEN } from "../../navigation/routes";
import { toastAlert } from "../../actions/UploadImageActions";
import { useDispatch, useSelector } from "react-redux";
import { setAddProfile } from "../../slices/loginServices/authSlice";
import LinearGradient from "react-native-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import { bdyBack, calendarIcon, dobIcon } from "../../helper/ImageAssets";
import DubleTextLine from "../../common/DubleTextLine";

const DobScreen = () => {
    const dispatch = useDispatch();
    const datalist = new Array(12).fill(null).map((_, index) => ({ id: String(index) }));
    const addProfileData = useSelector((state: any) => state?.auth?.addProfileData);

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
        NavigationService.navigate(NAVIGATION_LOCATION_SCREEN);
    };

    const openPicker = () => {
        if (Platform.OS === "ios") {
            setShowIOSPicker(true);
        } else {
            setShowAndroidPicker(true);
        }
    };

    return (
        <AppSafeAreaView>
            <HeaderCommon />

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

            {/* Android Picker */}
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

            {/* iOS Picker (Modal – REQUIRED) */}
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

            {/* Confirmation Modal */}
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
            </Modal>
        </AppSafeAreaView>
    );
};

export default DobScreen;

const styles = StyleSheet.create({
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
        backgroundColor: colors.black,
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
        backgroundColor: colors.transparentBlack,
    },
    confirmContainer: {
        width: Screen.Width / 1.2,
        backgroundColor: colors.white,
        borderRadius: metrics.hp2,
    },
    bdyBack: {
        width: Screen.Width / 1.2,
        height: metrics.hp16,
        borderTopLeftRadius: metrics.hp2,
        borderTopRightRadius: metrics.hp2,
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

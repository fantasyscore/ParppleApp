import React, { useState } from "react";
import { Modal, StyleSheet, View, Platform } from "react-native";
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

    const [modalVisible, setModalVisible] = useState(false);
    const [showPicker, setShowPicker] = useState(false);

    const today = new Date();
    const minAgeDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const [date, setDate] = useState<Date | null>(null);

    const getDateDigits = (d: Date) => {
        let day = String(d.getDate()).padStart(2, "0");
        let month = String(d.getMonth() + 1).padStart(2, "0");
        let year = String(d.getFullYear());
        return `${day}${month}${year}`.split("");
    };

    const dateDigits = date ? getDateDigits(date) : ["D", "D", "M", "M", "Y", "Y", "Y", "Y"];

    const formatDate = (date: any) => {
        const options: Intl.DateTimeFormatOptions = {
            day: "2-digit",
            month: "short",
            year: "numeric",
        };
        return date
            ?.toLocaleDateString("en-GB", options)
            .replace(" ", " ")
            .replace(/(\d{2}\s\w{3})\s(\d{4})/, "$1, $2");
    };

    const formattedDate = date?.toISOString().split("T")[0];

    const onSubmit = () => {
        const data = {
            ...addProfileData,
            dateOfBirth: formattedDate,
        };

        dispatch(setAddProfile(data));
        setModalVisible(false);
        NavigationService.navigate(NAVIGATION_LOCATION_SCREEN);
    };

    const calculateAge = (dob: Date) => {
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        const dayDiff = today.getDate() - dob.getDate();

        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age--;
        }
        return age;
    };

    return (
        <AppSafeAreaView>
            <HeaderCommon />
            <View style={styles.container}>
                <TopCommonLine icon={dobIcon} datalist={datalist} />

                <View style={{ paddingHorizontal: metrics.hp2 }}>
                    <DubleTextLine firstText={"When do you celebrate"} secondText={"your birthday?"} />

                    <TouchableOpacityView
                        onPress={() => setShowPicker(true)}
                        style={styles.dobContainer}
                    >
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
                                        style={{ marginBottom: metrics.hp0_5 }}
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

            <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
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

            {/* Native Date Picker */}
            {showPicker && (
                <DateTimePicker
                    value={date || minAgeDate}
                    mode="date"
                    maximumDate={minAgeDate}
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(event, selectedDate) => {
                        if (Platform.OS === "android") {
                            setShowPicker(false);
                        }
                        if (selectedDate) {
                            setDate(selectedDate);
                        }
                    }}
                />
            )}

            {/* Confirmation Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.confirmContainer}>
                        <FastImage source={bdyBack} resizeMode="contain" style={styles.bdyBack} />

                        <AppText
                            weight={SCHEHERAZADE_BOLD}
                            style={{ fontSize: fontSize(30), textAlign: "center" }}
                        >
                            {date ? `You’re ${calculateAge(date)}` : ""}
                        </AppText>

                        <AppText
                            style={{ textAlign: "center", marginTop: -metrics.hp2 }}
                            type={TWELVE}
                            color={LIGHT_BLACK}
                        >
                            Born {formatDate(date)}
                        </AppText>

                        <AppText style={{ textAlign: "center" }} type={TWELVE} color={LIGHT_BLACK}>
                            Can’t change later. Confirm it now.
                        </AppText>

                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                paddingHorizontal: metrics.hp2,
                                marginTop: metrics.hp3,
                            }}
                        >
                            <TouchableOpacityView
                                onPress={() => setModalVisible(false)}
                                style={styles.ediButton}
                            >
                                <AppText color={LIGHT_BLACK} weight={INTER_SEMI_BOLD} type={TWELVE}>
                                    Edit
                                </AppText>
                            </TouchableOpacityView>

                            <TouchableOpacityView
                                onPress={() => onSubmit()}
                                style={[styles.ediButton, { backgroundColor: colors.purple }]}
                            >
                                <AppText color={WHITE} weight={INTER_SEMI_BOLD} type={TWELVE}>
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
    container: {
        marginTop: metrics.hp3,
        flex: 1,
    },
    dobContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: metrics.hp5,
    },
    ddContainer: {
        alignItems: "center",
    },
    ddLine: {
        width: metrics.hp3_5,
        backgroundColor: colors.black,
        height: metrics.hp0_1,
    },
    confirmContainer: {
        height: metrics.hp38,
        backgroundColor: colors.white,
        width: Screen.Width / 1.2,
        borderRadius: metrics.hp2,
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.transparentBlack,
        paddingHorizontal: metrics.hp2,
    },
    bdyBack: {
        width: Screen.Width / 1.2,
        height: metrics.hp16_2,
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
        width: "47%",
    },
});

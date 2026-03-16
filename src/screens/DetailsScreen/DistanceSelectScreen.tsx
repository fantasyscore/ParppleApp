import React, { useState, useEffect } from "react";
import { ImageBackground, Platform, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import LinearGradient from "react-native-linear-gradient";
import metrics from "../../assets/Metrics";
import HeaderCommon from "../../common/HeaderCommon";
import TopCommonLine from "../../common/TopCommonLine";
import { nochLoationICon, social_distanceIcon } from "../../helper/ImageAssets";
import DubleTextLine from "../../common/DubleTextLine";
import {
    AppText,
    ELEVEN,
    INTER_LIGHT,
    INTER_MEDIUM,
    INTER_REGULAR,
    INTER_SEMI_BOLD,
    LIGHT_BLACK,
    OPECITY,
    OPECITY_DARK,
    PURPLE,
    TEN,
    THIRTEEN,
    TWELVE,
    WHITE
} from "../../common/AppText";
import { colors } from "../../theme/colors";
import GoButton from "../../common/GoButton";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_PROCCED_SCREEN } from "../../navigation/routes";
import { useDispatch, useSelector } from "react-redux";
import { setAddProfile } from "../../slices/loginServices/authSlice";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { Screen } from "../../theme/dimens";
import EditButtonCommon from "../../common/EditButtonCommon";

const labels = ["25km", "50km", "100km", "150km", "200km"];
const min = 1;
const max = 201

const DispatchSelectScreen = () => {

    const dispatch = useDispatch();
    const navigation = useNavigation();
    const addProfileData = useSelector((state: any) => state?.auth?.addProfileData);
    const [range, setRange] = useState([1]);
    const [toggleGlobel, setToggleGlobel] = useState(true);
    const sliderValue = range[0];

    // Prevent iOS edge-swipe back from stealing touches when dragging the slider from the left.
    useEffect(() => {
        if (Platform.OS === "ios") {
            navigation.setOptions({ gestureEnabled: false });
        }
    }, [navigation]);

    const onSubmit = () => {
        const data = {
            ...addProfileData,
            preferredDistanceKm: sliderValue,
            bio: "Please tell me about your self",
            globalSearch: toggleGlobel,
            fieldVisibility: { ...addProfileData?.fieldVisibility }
        };

        dispatch(setAddProfile(data));
        NavigationService.navigate(NAVIGATION_PROCCED_SCREEN, { comming: "About" });
    };

    return (
        <AppSafeAreaView>
            <HeaderCommon />
            <View style={styles.container}>
                <TopCommonLine icon={social_distanceIcon} datalist={[{ id: "0" }, { id: "1" }]} />
                <View style={{ paddingHorizontal: metrics.hp2 }}>
                    <DubleTextLine firstText={"Your distance preference?"} />
                    <AppText
                        style={{ marginTop: -metrics.hp2 }}
                        type={TWELVE}
                        weight={INTER_MEDIUM}
                        color={OPECITY}
                    >
                        Point the slider to set the distance you want to match with other profiles.
                    </AppText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: metrics.hp2, marginTop: metrics.hp5 }}>
                    <AppText type={TWELVE} weight={INTER_SEMI_BOLD} color={OPECITY_DARK}>
                        Distance preferences
                    </AppText>
                    <AppText type={TWELVE} weight={INTER_SEMI_BOLD} color={PURPLE}>
                        {range[0]} Km
                    </AppText>
                </View>
                <View style={{ marginHorizontal: metrics.hp2, marginTop: metrics.hp0 }}>
                    <MultiSlider
                        values={range}
                        sliderLength={Screen.Width / 1.10}
                        min={min}
                        max={max}
                        step={1}
                        onValuesChange={setRange}
                        selectedStyle={{
                            backgroundColor: "#7F3DFF",
                            height: metrics.hp0_7,
                            borderRadius: metrics.hp20
                        }}
                        unselectedStyle={{
                            backgroundColor: "#ECECEC",
                            height: metrics.hp0_7,
                            borderRadius: metrics.hp20
                        }}
                        customMarker={(props) => (
                            <View
                                {...props}
                                style={[
                                    styles.markerStyle,
                                    props.pressed && { transform: [{ scale: 1.2 }] },
                                ]}
                            />
                        )}
                    />

                </View>
                <EditButtonCommon
                    style={{ backgroundColor: colors.transparent }}
                    setting={true}
                    title={"Search Globel"}
                    togleShow={toggleGlobel}
                    setToggleShow={setToggleGlobel}
                    toggle={true}
                />
                <AppText
                    style={{ textAlign: "center", marginTop: metrics.hp2 }}
                    type={TWELVE}
                    weight={INTER_MEDIUM}
                    color={OPECITY}
                >
                    You can change preferences in settings.
                </AppText>
            </View>

            <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={{ height: metrics.hp19 }}
                colors={["#ffffff50", colors.white, colors.white]}
            >
                <View style={{ marginTop: metrics.hp9 }}>
                    <GoButton colortrue={sliderValue} onPress={onSubmit} />
                </View>
            </LinearGradient>
        </AppSafeAreaView>
    );
};

export default DispatchSelectScreen;

const styles = StyleSheet.create({
    container: {
        marginTop: metrics.hp3,
        flex: 1,
    },
    nocIcon: {
        height: metrics.hp6,
        width: metrics.hp6,
        alignItems: "center",
        justifyContent: "center",
    },
    markerStyle: {
        backgroundColor: colors.purple,
        height: metrics.hp2,
        width: metrics.hp2,
        borderRadius: metrics.hp50,
        marginTop: metrics.hp0_8
    }
});

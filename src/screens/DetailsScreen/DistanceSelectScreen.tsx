import React, { useState } from "react";
import { ImageBackground, StyleSheet, Text, View } from "react-native";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import LinearGradient from "react-native-linear-gradient";
import { Slider } from "@react-native-assets/slider";
import metrics from "../../assets/Metrics";
import HeaderCommon from "../../common/HeaderCommon";
import TopCommonLine from "../../common/TopCommonLine";
import { nochLoationICon, social_distanceIcon } from "../../helper/ImageAssets";
import DubleTextLine from "../../common/DubleTextLine";
import { AppText, EIGHT, ELEVEN, INTER_LIGHT, INTER_MEDIUM, INTER_REGULAR, INTER_SEMI_BOLD, LIGHT_BLACK, NINE, OPECITY, TEN, TWELVE, WHITE } from "../../common/AppText";
import { colors } from "../../theme/colors";
import GoButton from "../../common/GoButton";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_ABOUT_SCREEN, NAVIGATION_HEIGHT_SCREEN } from "../../navigation/routes";
import { useDispatch, useSelector } from "react-redux";
import { setAddProfile } from "../../slices/loginServices/authSlice";

const labels = ["1km", "25km", "50km", "100km"];
const min = 1;
const max = 100;

const DispatchSelectScreen = () => {
    const dispatch = useDispatch();
    const addProfileData = useSelector((state: any) => state?.auth?.addProfileData);
    const datalistnew = new Array(2).fill(null).map((_, index) => ({ id: String(index), }))
    const [sliderValue, setSliderValue] = useState(1);
    const handleSliderChange = React.useCallback((val: any) => {
        setSliderValue(Math.round(val));
    }, []);
    const onSubmit = () => {
        const data = {
            ...addProfileData,
            preferredDistanceKm: sliderValue,
            fieldVisibility: { ...addProfileData?.fieldVisibility }
        };
        dispatch(setAddProfile(data))
        NavigationService.navigate(NAVIGATION_ABOUT_SCREEN)
    }
    return (
        <AppSafeAreaView>
            <HeaderCommon />
            <View style={styles.container}>
                <TopCommonLine icon={social_distanceIcon} datalist={datalistnew} />
                <View style={{ paddingHorizontal: metrics.hp2 }}>
                    <DubleTextLine firstText={"Your distance preference?"} />
                    <AppText style={{ marginTop: -metrics.hp2 }} type={TWELVE} weight={INTER_MEDIUM} color={OPECITY}>
                        Point the slider to set the distance you to want to match with other profiles.
                    </AppText>
                </View>
                <View style={{ marginHorizontal: metrics.hp2, marginTop: metrics.hp12 }}>
                    <View
                        style={{
                            position: "absolute",
                            left: `${((sliderValue - min) / (max - min)) * 100}%`,
                            bottom: metrics.hp4,
                            transform: [{ translateX: -30 }],
                        }}>
                        <ImageBackground source={nochLoationICon} resizeMode="contain" style={[styles.nocIcon, {
                            marginLeft: sliderValue === 1 ? metrics.hp1_4 : metrics.hp0,
                            right: sliderValue === 100 ? metrics.hp1 : metrics.hp0,
                        }]}>
                            <AppText style={{ marginTop: -metrics.hp0_6 }} type={TWELVE} weight={INTER_SEMI_BOLD} color={WHITE}>
                                {sliderValue}
                            </AppText>
                            <AppText style={{ marginTop: -metrics.hp0_2 }} type={TEN} weight={INTER_REGULAR} color={WHITE}>Km</AppText>
                        </ImageBackground>
                    </View>
                    <Slider
                        minimumValue={min}
                        maximumValue={max}
                        step={0}
                        value={sliderValue}
                        onValueChange={handleSliderChange}
                        thumbSize={32}
                        trackHeight={8}
                        minimumTrackTintColor="#7F3DFF"
                        maximumTrackTintColor="#ECECEC"
                        thumbStyle={{
                            borderWidth: metrics.hp1,
                            borderColor: "#6F13F2",
                            backgroundColor: colors.white,
                            marginLeft: sliderValue == 1 ? metrics.hp2_3 : metrics.hp0,
                            marginRight: sliderValue == 100 ? metrics.hp2_3 : metrics.hp0,
                        }}
                    />
                </View>
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginHorizontal: metrics.hp2,
                        marginTop: metrics.hp1,
                    }}>
                    {labels.map((label, i) => (
                        <AppText key={i} type={TEN} weight={INTER_LIGHT} color={LIGHT_BLACK}>
                            {label}
                        </AppText>
                    ))}
                </View>
                <AppText style={{ textAlign: "center", marginTop: metrics.hp4 }} type={TWELVE} weight={INTER_MEDIUM} color={OPECITY}>
                    You can change preferences in settings.
                </AppText>
            </View>
            <LinearGradient start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }} style={{ height: metrics.hp19 }} colors={["#ffffff50", colors.white, colors.white]}>
                <View style={{ marginTop: metrics.hp9 }}>
                    <GoButton colortrue={sliderValue} onPress={() => onSubmit()} />
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
        height: metrics.hp6, width: metrics.hp6,
        alignItems: "center",
        justifyContent: "center",

    }
});

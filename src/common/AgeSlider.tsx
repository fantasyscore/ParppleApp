import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import metrics from '../assets/Metrics';
import FastImage from 'react-native-fast-image';
import { AppText, BLACK, INTER_BOLD, INTER_MEDIUM, INTER_SEMI_BOLD, LIGHT_BLACK, NINE, OPECITY, OPECITY_DARK, TWELVE } from './AppText';
import { colors } from '../theme/colors';
import { Screen } from '../theme/dimens';
import { TouchableOpacityView } from './TouchableOpacityView';


const AgeSlider = ({ Icons, headLines, range, setRange, innerUpertitle, underTitle, togleShow, setToggleShow, singleSilde, height, min, max }: any) => {
    const [selectFtCm, setSelectFtCm] = useState("FT");
    const [selectedIndex, setSelectedIndex] = useState(12);
    const onSwitch = (type: any) => {
        if (type === "FT") {
            setSelectFtCm("FT");
            setSelectedIndex(12);
        } else {
            setSelectFtCm("CM");
            setSelectedIndex(20);
        }
    };

    return (
        <View style={styles.headConatiner}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                <FastImage source={Icons} resizeMode="contain" style={styles.icons} />
                <AppText type={TWELVE} weight={INTER_BOLD}>
                    {"   "}{headLines}
                </AppText>
            </View>
            <View style={styles.container}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    {height ?
                        <View style={styles.selectCm}>
                            <TouchableOpacityView
                                onPress={() => onSwitch("FT")}
                                style={[
                                    styles.selectedBack,
                                    { backgroundColor: selectFtCm === "FT" ? colors.green : colors.nanoOpecity },
                                ]}>
                                <AppText type={NINE} color={selectFtCm === "FT" ? BLACK : OPECITY} weight={INTER_SEMI_BOLD}>
                                    FT
                                </AppText>
                            </TouchableOpacityView>
                            <TouchableOpacityView
                                onPress={() => onSwitch("CM")}
                                style={[
                                    styles.selectedBack,
                                    { backgroundColor: selectFtCm === "CM" ? colors.green : colors.nanoOpecity },
                                ]}>
                                <AppText type={NINE} color={selectFtCm === "CM" ? BLACK : OPECITY} weight={INTER_SEMI_BOLD}>
                                    CM
                                </AppText>
                            </TouchableOpacityView>
                        </View>
                        : <></>}
                    {height ?
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                            <AppText type={TWELVE} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                {innerUpertitle}
                            </AppText>
                            <AppText type={TWELVE} weight={INTER_BOLD} color={LIGHT_BLACK}>
                                {"  "}{range[1] ? `${range[0]} - ${range[1]}` : `${range[0]} Km`}
                            </AppText>
                        </View> :
                        <>
                            <AppText type={TWELVE} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                {innerUpertitle}
                            </AppText>
                            <AppText type={TWELVE} weight={INTER_BOLD} color={LIGHT_BLACK}>
                                {range[1] ? `${range[0]} - ${range[1]}` : `${range[0]} Km`}
                            </AppText>
                        </>
                    }
                </View>
                <View style={{ alignItems: "center" }}>
                    <MultiSlider
                        values={range}
                        sliderLength={Screen.Width / 1.25}
                        min={min !== undefined ? min : 1}
                        max={max !== undefined ? max : 201}
                        step={1}
                        onValuesChange={setRange}
                        selectedStyle={{
                            backgroundColor: colors.purple,
                            height: metrics.hp0_4,
                            borderRadius: metrics.hp1,
                        }}
                        unselectedStyle={{
                            backgroundColor: colors.nanoOpecity,
                            height: metrics.hp0_4,
                            borderRadius: metrics.hp1,
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
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <AppText type={TWELVE} color={OPECITY_DARK} weight={INTER_MEDIUM}>
                        {underTitle}
                    </AppText>
                    <TouchableOpacityView onPress={() => setToggleShow(!togleShow)} style={[styles.slideContainer, { backgroundColor: togleShow ? colors.green : colors.nanoOpecity }]}>
                        {togleShow ?
                            <View style={styles.slideUnSelect} /> :
                            <View style={styles.slider} />
                        }
                        {togleShow ?
                            <View style={styles.sliderSelect} /> :
                            <View style={styles.slideUnSelect} />
                        }
                    </TouchableOpacityView>
                </View>
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    headConatiner: {
        paddingHorizontal: metrics.hp2,
        marginTop: metrics.hp2
    },
    icons: {
        height: metrics.hp2,
        width: metrics.hp2
    },
    container: {
        paddingHorizontal: metrics.hp1_5,
        paddingVertical: metrics.hp1_5,
        backgroundColor: colors.lightBack,
        borderRadius: metrics.hp1_5,
        marginTop: metrics.hp1,
        // shadowColor: colors.black,
        // shadowOpacity: 0.07,
        // shadowOffset: { width: 0, height: 1 },
        // shadowRadius: 6,
        // elevation: 2,
    },
    markerStyle: {
        backgroundColor: colors.purple,
        height: metrics.hp2,
        width: metrics.hp2,
        borderRadius: metrics.hp50,
        marginTop: metrics.hp0_2
    },
    slideContainer: {
        borderRadius: metrics.hp3,
        paddingHorizontal: metrics.hp0_2,
        paddingVertical: metrics.hp0_2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: colors.nanoOpecity
    },
    slider: {
        height: metrics.hp2_7,
        width: metrics.hp2_7,
        backgroundColor: colors.opecity,
        borderRadius: metrics.hp3
    },
    slideUnSelect: {
        height: metrics.hp2_7,
        width: metrics.hp2_7,
    },
    sliderSelect: {
        height: metrics.hp2_7,
        width: metrics.hp2_7,
        backgroundColor: colors.white,
        borderRadius: metrics.hp3
    },
    selectCm: {
        backgroundColor: colors.nanoOpecity,
        borderRadius: metrics.hp4,
        padding: metrics.hp0_2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: metrics.hp0_2,
        paddingVertical: metrics.hp0_2
    },
    selectedBack: {
        borderRadius: metrics.hp50,
        alignItems: "center",
        justifyContent: "center",
        height: metrics.hp2_5,
        width: metrics.hp2_5
    },
});

export default AgeSlider;

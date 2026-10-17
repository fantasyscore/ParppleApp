import React, { useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { FlatList, ImageBackground, StyleSheet, TouchableOpacity, View } from "react-native";
import { colors, newColor } from "../../theme/colors";
import FastImage from "react-native-fast-image";
import OnboardingLogo from "../../components/Onboarding/OnboardingLogo";
import OnboardingButton from "../../components/Onboarding/OnboardingButton";
import { BottomLayer, rightSelectTrunOns, trunOnBackground, trunOnIcon } from "../../helper/ImageAssets";
import metrics from "../../assets/Metrics";
import { AppText, EIGHTEEN, ELEVEN, fontSize, SCHEHERAZADE_BOLD, SCHEHERAZADE_SEMI_BOLD, WHITE } from "../../common/AppText";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_ADD_PHOTOS_SCREEN } from "../../navigation/routes";
import { useDispatch, useSelector } from "react-redux";
import { setAddProfile } from "../../slices/loginServices/authSlice";
import { TURN_ON_IMAGES } from "../../helper/turnOnImages";

const TrunOnScreen = () => {
    const dispatch = useDispatch();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const turnOnData = useSelector((state: any) => state?.auth?.turnOnData);
    const addProfileData = useSelector((state: any) => state?.auth?.addProfileData);


    const handleSelect = (id: any) => {
        setSelectedIds((prev: any) =>
            prev.includes(id)
                ? prev.filter((item: any) => item !== id) // Remove
                : [...prev, id] // Add
        );
    };

    const renderItem = ({ item }: any) => {
        const isSelected = selectedIds.includes(item._id);

        return (
            <TouchableOpacity
                activeOpacity={1}
                onPress={() => handleSelect(item._id)}
            >
                <ImageBackground
                    source={trunOnBackground}
                    tintColor={isSelected ? "#E6B7A8" : "#555359"}
                    resizeMode="cover"
                    style={styles.trunback}
                >
                    <FastImage
                        source={TURN_ON_IMAGES[item.value]}
                        resizeMode="contain"
                        style={styles.imagesIcon}
                    />

                    <View
                        style={{
                            alignItems: "center",
                            justifyContent: "center",
                            paddingHorizontal: metrics.hp2,
                        }}
                    >
                        <AppText
                            style={{
                                color: isSelected ? newColor.blackNew : "#E6B7A8",
                            }}
                            type={EIGHTEEN}
                            weight={SCHEHERAZADE_BOLD}
                        >
                            {item.value}
                        </AppText>

                        <AppText
                            type={ELEVEN}
                            style={{
                                textAlign: "center",
                                marginTop: -metrics.hp1,
                                color: isSelected
                                    ? newColor.blackNew
                                    : colors.white,
                                opacity: isSelected ? 0.8 : 1,
                            }}
                        >
                            {item.message}
                        </AppText>
                    </View>

                    {isSelected && (
                        <FastImage
                            source={rightSelectTrunOns}
                            resizeMode="contain"
                            style={{
                                height: metrics.hp3,
                                width: metrics.hp3,
                                position: "absolute",
                                right: metrics.hp2,
                                bottom: metrics.hp2,
                            }}
                        />
                    )}
                </ImageBackground>
            </TouchableOpacity>
        );
    };
    const onSubmit = () => {
        if (selectedIds?.length === 0) return;
        const selectedTurnOns = turnOnData
            .filter((item: any) => selectedIds.includes(item._id))
            .map((item: any) => item._id);
        const data = {
            ...addProfileData,
            attributes: selectedTurnOns,
            fieldVisibility: { ...addProfileData?.fieldVisibility }
        };
        dispatch(setAddProfile(data))
        NavigationService.navigate(NAVIGATION_ADD_PHOTOS_SCREEN)
    }
    return (
        <AppSafeAreaView color={newColor.blackNew}>
            <OnboardingLogo />
            <AppText style={{ textAlign: "center", fontSize: fontSize(26), marginTop: metrics.hp1 }} weight={SCHEHERAZADE_SEMI_BOLD} color={WHITE}>
                What makes you Turn on?
            </AppText>

            <FlatList
                data={turnOnData}
                renderItem={renderItem}
                keyExtractor={(item) => item._id.toString()}
                numColumns={2}
                ListHeaderComponent={() => <FastImage source={trunOnIcon} resizeMode="contain" style={{ height: metrics.hp15, width: metrics.hp15, alignSelf: "center" }} />}
                contentContainerStyle={{ paddingHorizontal: metrics.hp2, alignItems: "center", marginTop: metrics.hp0, paddingBottom: metrics.hp5 }}
                columnWrapperStyle={{ columnGap: metrics.hp2, marginTop: metrics.hp6 }} />
            <ImageBackground source={BottomLayer} resizeMode="stretch" style={styles.bottomLayer}>
                <OnboardingButton label="Next" onPress={onSubmit} dimmed={!selectedIds?.length} />
            </ImageBackground>
        </AppSafeAreaView>
    )
};
export default TrunOnScreen;
const styles = StyleSheet.create({
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
    bottomLayer: {
        height: metrics.hp15,
        width: "100%",
        paddingVertical: metrics.hp2,
        alignItems: "center"
    },
})
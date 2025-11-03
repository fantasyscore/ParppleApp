import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import { StyleSheet, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { colors } from "../theme/colors";
import metrics from "../assets/Metrics";
import { TouchableOpacityView } from "./TouchableOpacityView";
import FastImage from "react-native-fast-image";
import { AppText, BLACK, ELEVEN, INTER_MEDIUM, OPECITY, PURPLE, TEN, TWELVE } from "./AppText";
import NavigationService from "../navigation/NavigationService";
import { NAVIGATION_CHATS_SCREEN, NAVIGATION_DISCOVER_SCREEN, NAVIGATION_LIKES_YOU_SCREEN, NAVIGATION_PEOPLE_SCREEN, NAVIGATION_PROFILE_SCREEN } from "../navigation/routes";
import { chats, chatTab, explore, explorTab, likeTab, likeyou, people, peopleColourTab, pepoleTab, profile, profileTab } from "../helper/ImageAssets";
import { useSelector } from "react-redux";


const CustomTabBar = ({ state }: BottomTabBarProps) => {
    const bottomRemove = useSelector((state: any) => state.auth.bottomRemove);


    const navigate = (route: any) => {
        if (route === 'NAVIGATION_PEOPLE_SCREEN') return NavigationService.navigate(NAVIGATION_PEOPLE_SCREEN)
        if (route === 'NAVIGATION_DISCOVER_SCREEN') return NavigationService.navigate(NAVIGATION_DISCOVER_SCREEN)
        if (route === 'NAVIGATION_CHATS_SCREEN') return NavigationService.navigate(NAVIGATION_CHATS_SCREEN)
        if (route === 'NAVIGATION_LIKES_YOU_SCREEN') return NavigationService.navigate(NAVIGATION_LIKES_YOU_SCREEN)
        if (route === 'NAVIGATION_PROFILE_SCREEN') return NavigationService.navigate(NAVIGATION_PROFILE_SCREEN)

    }

    const getIcon = (route: string, isFocused: boolean, index: number) => {
        return (
            <TouchableOpacityView key={index} onPress={() => navigate(route)}>
                {route === "NAVIGATION_PEOPLE_SCREEN" ? (
                    <View style={{ alignItems: "center", justifyContent: "center" }}>
                        <FastImage source={isFocused ? people : pepoleTab} resizeMode="contain" style={styles.icons} />
                        <AppText type={ELEVEN} weight={INTER_MEDIUM} color={isFocused ? PURPLE: OPECITY}>
                            People
                        </AppText>
                    </View>
                ) : route === "NAVIGATION_DISCOVER_SCREEN" ? (
                    <View style={{ alignItems: "center", justifyContent: "center" }}>
                        <FastImage source={isFocused ? explore : explorTab} resizeMode="contain" style={styles.icons} />
                        <AppText type={ELEVEN} weight={INTER_MEDIUM} color={isFocused ? PURPLE: OPECITY}>
                            Discover
                        </AppText>
                    </View>
                ) : route === "NAVIGATION_CHATS_SCREEN" ? (
                    <View style={{ alignItems: "center", justifyContent: "center" }}>
                        <FastImage source={isFocused ? chats : chatTab} resizeMode="contain" style={styles.icons} />
                        <AppText type={ELEVEN} weight={INTER_MEDIUM} color={isFocused ? PURPLE: OPECITY}>
                            Chats
                        </AppText>
                    </View>
                ) : route === "NAVIGATION_LIKES_YOU_SCREEN" ? (
                    <View style={{ alignItems: "center", justifyContent: "center" }}>
                        <FastImage source={isFocused ? likeyou : likeTab} resizeMode="contain" style={styles.icons} />
                        <AppText type={ELEVEN} weight={INTER_MEDIUM} color={isFocused ? PURPLE: OPECITY}>
                            Likes You
                        </AppText>
                    </View>
                ) : (
                    <View style={{ alignItems: "center", justifyContent: "center" }}>
                        <FastImage source={isFocused ? profile : profileTab} resizeMode="contain" style={styles.icons} />
                        <AppText type={ELEVEN} weight={INTER_MEDIUM} color={isFocused ? PURPLE: OPECITY}>
                            Profile
                        </AppText>
                    </View>
                )}
            </TouchableOpacityView>
        );
    };

    return bottomRemove ? (<></>) : (
        <View style={styles.buttonContainer}>
            <View style={styles.flowContainer}>
                {state?.routes?.map((route, index) => {
                    const isFocused = state.index === index;
                    return (
                        <View key={route.key}>
                            {getIcon(route.name, isFocused, index)}
                        </View>
                    );
                })}
            </View>
        </View>

    )
};
export default CustomTabBar;
const styles = StyleSheet.create({
    buttonContainer: {
        backgroundColor: colors.white,
        height: metrics.hp8
    },
    flowContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        paddingHorizontal: metrics.hp2,
        marginTop: metrics.hp1
    },
    icons: {
        height: metrics.hp3_5,
        width: metrics.hp3_5,
    }
})
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../theme/colors";
import metrics from "../assets/Metrics";
import { TouchableOpacityView } from "./TouchableOpacityView";
import FastImage from "react-native-fast-image";
import { AppText, THIRTEEN, INTER_MEDIUM, OPECITY, PURPLE, TWELVE} from "./AppText";
import NavigationService from "../navigation/NavigationService";
import { NAVIGATION_CHATS_SCREEN, NAVIGATION_DISCOVER_SCREEN, NAVIGATION_LIKES_YOU_SCREEN, NAVIGATION_PEOPLE_SCREEN, NAVIGATION_PROFILE_SCREEN } from "../navigation/routes";
import { chats, chatTab, explore, explorTab, likeTab, likeyou, people, pepoleTab, profile, profileTab } from "../helper/ImageAssets";
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
            <TouchableOpacityView style={styles.tabItem} key={index} onPress={() => navigate(route)}>
                {route === "NAVIGATION_PEOPLE_SCREEN" ? (
                    <View style={styles.tabInner}>
                        <FastImage source={isFocused ? people : pepoleTab} resizeMode="contain" style={styles.icons} />
                        <AppText style={styles.label} type={TWELVE} weight={INTER_MEDIUM} color={isFocused ? PURPLE: OPECITY}>
                            Home
                        </AppText>
                    </View>
                ) : route === "NAVIGATION_DISCOVER_SCREEN" ? (
                    <View style={styles.tabInner}>
                        <FastImage source={isFocused ? explore : explorTab} resizeMode="contain" style={styles.icons} />
                        <AppText style={styles.label} type={TWELVE} weight={INTER_MEDIUM} color={isFocused ? PURPLE: OPECITY}>
                            Discover
                        </AppText>
                    </View>
                ) : route === "NAVIGATION_CHATS_SCREEN" ? (
                    <View style={styles.tabInner}>
                        <FastImage source={isFocused ? chats : chatTab} resizeMode="contain" style={styles.icons} />
                        <AppText style={styles.label} type={TWELVE} weight={INTER_MEDIUM} color={isFocused ? PURPLE: OPECITY}>
                            Chats
                        </AppText>
                    </View>
                ) : route === "NAVIGATION_LIKES_YOU_SCREEN" ? (
                    <View style={styles.tabInner}>
                        <FastImage source={isFocused ? likeyou : likeTab} resizeMode="contain" style={styles.icons} />
                        <AppText style={styles.label} type={TWELVE} weight={INTER_MEDIUM} color={isFocused ? PURPLE: OPECITY}>
                            Likes You
                        </AppText>
                    </View>
                ) : (
                    <View style={styles.tabInner}>
                        <FastImage source={isFocused ? profile : profileTab} resizeMode="contain" style={styles.icons} />
                        <AppText style={styles.label} type={TWELVE} weight={INTER_MEDIUM} color={isFocused ? PURPLE: OPECITY}>
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
                        <View key={route.key} style={styles.routeWrapper}>
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
        height: metrics.hp9,
        // Top shadow (tab bar floating effect)
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation:20,
    },
    flowContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        height: "100%",
    },
    routeWrapper: {
        flex: 1, // 5 tabs => each is exactly 20% width
        height: "100%",
    },
    tabItem: {
        flex: 1,
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    tabInner: {
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    },
    icons: {
        height: metrics.hp3_5,
        width: metrics.hp3_5,
    }
    ,
    label: {
        marginTop: metrics.hp0_3,
    },
})
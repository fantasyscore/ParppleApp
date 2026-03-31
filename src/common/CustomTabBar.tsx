import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { colors } from "../theme/colors";
import metrics from "../assets/Metrics";
import { TouchableOpacityView } from "./TouchableOpacityView";
import FastImage from "react-native-fast-image";
import { AppText, THIRTEEN, INTER_MEDIUM, OPECITY, PURPLE, TWELVE } from "./AppText";
import NavigationService from "../navigation/NavigationService";
import { NAVIGATION_CHATS_SCREEN, NAVIGATION_DISCOVER_SCREEN, NAVIGATION_LIKES_YOU_SCREEN, NAVIGATION_PEOPLE_SCREEN, NAVIGATION_PROFILE_SCREEN } from "../navigation/routes";
import { chats, chatTab, explore, explorTab, likeTab, likeyou, people, pepoleTab, profile, profileTab } from "../helper/ImageAssets";
import { useSelector } from "react-redux";
import { BlurView } from "@react-native-community/blur";


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
                <BlurView
                    style={StyleSheet.absoluteFillObject}
                    blurType="light"
                    blurAmount={1}
                    reducedTransparencyFallbackColor={colors.white}
                />
                <View
                    style={{
                        ...StyleSheet.absoluteFillObject,
                        backgroundColor: colors.white,
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.25)',
                    }}
                />
                {route === "NAVIGATION_PEOPLE_SCREEN" ? (
                    <View style={styles.tabInner}>
                        <FastImage source={isFocused ? people : pepoleTab} resizeMode="contain" style={styles.icons} />
                        {/* <AppText style={styles.label} type={TWELVE} weight={INTER_MEDIUM} color={isFocused ? PURPLE : OPECITY}>
                            Home
                        </AppText> */}
                    </View>
                ) : route === "NAVIGATION_DISCOVER_SCREEN" ? (
                    <View style={styles.tabInner}>
                        <FastImage source={isFocused ? explore : explorTab} resizeMode="contain" style={styles.icons} />
                        {/* <AppText style={styles.label} type={TWELVE} weight={INTER_MEDIUM} color={isFocused ? PURPLE : OPECITY}>
                            Discover
                        </AppText> */}
                    </View>
                ) : route === "NAVIGATION_CHATS_SCREEN" ? (
                    <View style={styles.tabInner}>
                        <FastImage source={isFocused ? chats : chatTab} resizeMode="contain" style={styles.icons} />
                        {/* <AppText style={styles.label} type={TWELVE} weight={INTER_MEDIUM} color={isFocused ? PURPLE : OPECITY}>
                            Chats
                        </AppText> */}
                    </View>
                ) : route === "NAVIGATION_LIKES_YOU_SCREEN" ? (
                    <View style={styles.tabInner}>
                        <FastImage source={isFocused ? likeyou : likeTab} resizeMode="contain" style={styles.icons} />
                        {/* <AppText style={styles.label} type={TWELVE} weight={INTER_MEDIUM} color={isFocused ? PURPLE : OPECITY}>
                            Likes You
                        </AppText> */}
                    </View>
                ) : (
                    <View style={styles.tabInner}>
                        <FastImage source={isFocused ? profile : profileTab} resizeMode="contain" style={styles.icons} />
                        {/* <AppText style={styles.label} type={TWELVE} weight={INTER_MEDIUM} color={isFocused ? PURPLE : OPECITY}>
                            Profile
                        </AppText> */}
                    </View>
                )}
            </TouchableOpacityView>
        );
    };

    return bottomRemove ? (<></>) : (
        <View style={{ backgroundColor: colors.white }}>
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
        </View>

    )
};
export default CustomTabBar;
const styles = StyleSheet.create({
    buttonContainer: {
        backgroundColor: "#F7F7F733",
        height: metrics.hp9,
        // Top shadow (tab bar floating effect)
        // shadowColor: "#000",
        // shadowOffset: { width: 0, height: -5 },
        // shadowOpacity: Platform.OS === "ios" ? 0.2 : 1,
        // shadowRadius: 10,
        // elevation: Platform.OS === "ios" ? 10 : 20,
        paddingHorizontal: Platform.OS === "ios" ? metrics.hp1 : metrics.hp0,
        marginHorizontal: metrics.hp2,
        borderWidth: metrics.hp0_1,
        borderColor: "#EDEDED99",
        borderRadius: metrics.hp5,
        marginBottom: metrics.hp2
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
        justifyContent: "center"
    },
    tabItem: {
        height: metrics.hp7, width: metrics.hp7,
        // backgroundColor:"red",
        // flex: 1,
        // height: "100%",
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        borderRadius: metrics.hp50,
        overflow: 'hidden',
        borderWidth:metrics.hp0_1,
        borderColor:"#00000010",
        backgroundColor:colors.white
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
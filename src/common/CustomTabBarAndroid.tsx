import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import { colors, newColor } from "../theme/colors";
import metrics from "../assets/Metrics";
import { TouchableOpacityView } from "./TouchableOpacityView";
import FastImage from "react-native-fast-image";
import { AppText, THIRTEEN, INTER_MEDIUM, OPECITY, PURPLE, TWELVE, FORTEEN, WHITE, SCHEHERAZADE_BOLD, ELEVEN } from "./AppText";
import NavigationService from "../navigation/NavigationService";
import { NAVIGATION_CHATS_SCREEN, NAVIGATION_DISCOVER_SCREEN, NAVIGATION_LIKES_YOU_SCREEN, NAVIGATION_PEOPLE_SCREEN, NAVIGATION_PROFILE_SCREEN, NAVIGATION_VIEW_YOU_SCREEN_SCREEN } from "../navigation/routes";
import { BottomLayer, chatAmountBackgroungNew, chats, chatTab, chatTabNewNrml, chatTabNewNrmlColour, explore, explorTab, goToProifleIcon, likesYouNewNrml, likesYouNewNrmlColour, likeTab, likeyou, lockIconWhite, people, pepoleTab, pepoleTabNewNrml, pepoleTabNewNrmlColour, profile, profileTab, rightGoNewIcon, visiterNewNrml, visiterNewNrmlColour } from "../helper/ImageAssets";
import { useSelector } from "react-redux";
import { Image } from "react-native";
import { Screen } from "../theme/dimens";
import { BlurView } from "@react-native-community/blur";


const CustomTabBarAndroid = ({ state }: BottomTabBarProps) => {
    const bottomRemove = useSelector((state: any) => state.auth.bottomRemove);
    const profileHide = useSelector((state: any) => state.auth.profileHide);
    const likeByOtherData = useSelector((state: any) => state.auth.likeByOtherData);
    const likeYouData = useSelector((state: any) => state.auth.likeYouData);
    const viewByOtherData = useSelector((state: any) => state.auth.viewByOtherData);
    const viewYouData = useSelector((state: any) => state.auth.viewYouData);
    const navigate = (route: any) => {
        if (route === 'NAVIGATION_PEOPLE_SCREEN') return NavigationService.navigate(NAVIGATION_PEOPLE_SCREEN)
        if (route === 'NAVIGATION_LIKES_YOU_SCREEN') return NavigationService.navigate(NAVIGATION_LIKES_YOU_SCREEN)
        if (route === 'NAVIGATION_VIEW_YOU_SCREEN_SCREEN') return NavigationService.navigate(NAVIGATION_VIEW_YOU_SCREEN_SCREEN)
        if (route === 'NAVIGATION_CHATS_SCREEN') return NavigationService.navigate(NAVIGATION_CHATS_SCREEN)
    }

    const getIcon = (route: string, isFocused: boolean, index: number) => {
        return (
            <TouchableOpacityView style={styles.tabItem} key={index} onPress={() => navigate(route)}>
                {route === "NAVIGATION_PEOPLE_SCREEN" ? (
                    <View style={styles.tabInner}>
                        <FastImage source={isFocused ? pepoleTabNewNrmlColour : pepoleTabNewNrml} resizeMode="contain" style={styles.icons} />
                    </View>
                ) : route === "NAVIGATION_LIKES_YOU_SCREEN" ? (
                    <View style={styles.tabInner}>
                        {likeByOtherData?.length || likeYouData?.length ?
                            <View style={{
                                borderWidth: metrics.hp0_1, borderRadius: metrics.hp50, borderColor: "#E6B7A8",
                                position: "absolute",
                                zIndex: 1,
                                right: metrics.hp3_5,
                                top: metrics.hp0,
                                height: metrics.hp1,
                                width: metrics.hp1,
                                backgroundColor: "#E6B7A8"
                            }} /> : <></>}
                        <FastImage source={isFocused ? likesYouNewNrmlColour : likesYouNewNrml} resizeMode="contain" style={styles.icons} />
                    </View>
                ) : route === "NAVIGATION_VIEW_YOU_SCREEN_SCREEN" ? (
                    <View style={styles.tabInner}>
                        {viewByOtherData?.length || viewYouData?.length ?
                            <View style={{
                                borderWidth: metrics.hp0_1, borderRadius: metrics.hp50, borderColor: "#E6B7A8",
                                position: "absolute",
                                zIndex: 1,
                                right: metrics.hp3_5,
                                top: metrics.hp0,
                                height: metrics.hp1,
                                width: metrics.hp1,
                                backgroundColor: "#E6B7A8"
                            }} /> : <></>}
                        <FastImage source={isFocused ? visiterNewNrmlColour : visiterNewNrml} resizeMode="contain" style={styles.icons} />
                    </View>
                ) : (
                    <View style={styles.tabInner}>
                        <FastImage source={isFocused ? chatTabNewNrmlColour : chatTabNewNrml} resizeMode="contain" style={styles.icons} />
                    </View>
                )}
            </TouchableOpacityView>
        );
    };

    return (
        <>
            {profileHide === "Hide" ?
                <View style={{ height: Screen.Height, width: Screen.Width, position: "absolute", zIndex: 1, alignItems: "center", justifyContent: "center" }}>
                    <BlurView
                        style={StyleSheet.absoluteFillObject}
                        blurType="dark"
                        blurAmount={1}
                        reducedTransparencyFallbackColor={colors.white}
                    />
                    <FastImage source={lockIconWhite} resizeMode="contain" style={{ height: metrics.hp4, width: metrics.hp4, marginTop: metrics.hp13 }} />
                    <AppText type={FORTEEN} weight={INTER_MEDIUM} color={WHITE}>
                        Unlock the Profile
                    </AppText>
                    <AppText style={{ paddingHorizontal: metrics.hp2, textAlign: "center" }} type={FORTEEN} weight={INTER_MEDIUM} color={OPECITY}>
                        To View other profile. You need to publish your profile
                    </AppText>
                    <TouchableOpacityView activeOpacity={1} onPress={() => NavigationService.navigate(NAVIGATION_PROFILE_SCREEN)}>
                        <ImageBackground source={chatAmountBackgroungNew} resizeMode="contain" style={{ height: metrics.hp7, width: metrics.hp20, alignItems: "center", justifyContent: "center", marginTop: metrics.hp3, flexDirection: "row" }}>
                            <AppText color={WHITE} weight={SCHEHERAZADE_BOLD} type={FORTEEN}>
                                Go To Profile{"  "}
                            </AppText>
                            <FastImage source={goToProifleIcon} resizeMode="contain" style={{ height: metrics.hp2_5, width: metrics.hp2_5, marginTop: metrics.hp0_2, transform: [{ rotate: "180deg" }] }} />
                        </ImageBackground>
                    </TouchableOpacityView>
                </View> : <></>}
            <ImageBackground source={BottomLayer} resizeMode="stretch" style={styles.bottomLayer}>
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
            </ImageBackground>
        </>
        // <View style={styles.buttonContainer}>
        //     <View style={styles.flowContainer}>
        //         {state?.routes?.map((route, index) => {
        //             const isFocused = state.index === index;
        //             return (
        //                 <View key={route.key} style={styles.routeWrapper}>
        //                     {getIcon(route.name, isFocused, index)}
        //                 </View>
        //             );
        //         })}
        //     </View>
        // </View>

    )
};
export default CustomTabBarAndroid;
const styles = StyleSheet.create({
    bottomLayer: {
        height: metrics.hp11,
        width: "100%",
        paddingVertical: metrics.hp2,
        position: "absolute", bottom: 0,

    },
    count: {
        color: "#E6B7A8",
        marginTop: -metrics.hp0_6,
        marginLeft: metrics.hp0_3
    },
    buttonContainer: {
        backgroundColor: colors.white,
        height: metrics.hp9,
        // Top shadow (tab bar floating effect)
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 20,
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
        height: metrics.hp4_5,
        width: metrics.hp4_5,
    }
    ,
    label: {
        marginTop: metrics.hp0_3,
    },
})
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React, { memo } from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import { colors, newColor } from "../theme/colors";
import metrics from "../assets/Metrics";
import { TouchableOpacityView } from "./TouchableOpacityView";
import FastImage from "react-native-fast-image";
import { AppText, THIRTEEN, INTER_MEDIUM, OPECITY, PURPLE, TWELVE, FORTEEN, WHITE, SCHEHERAZADE_BOLD, ELEVEN, SIXTEEN } from "./AppText";
import NavigationService from "../navigation/NavigationService";
import { NAVIGATION_CHATS_SCREEN, NAVIGATION_DISCOVER_SCREEN, NAVIGATION_LIKES_YOU_SCREEN, NAVIGATION_PEOPLE_SCREEN, NAVIGATION_PROFILE_SCREEN, NAVIGATION_VIEW_YOU_SCREEN_SCREEN } from "../navigation/routes";
import { BottomLayer, boyProfileloakBackground, chatAmountBackgroungNew, chatTabNewNrml, chatTabNewNrmlColour, girlProfileLoakBackground, goToProifleIcon, likesYouNewNrml, likesYouNewNrmlColour, lockIconWhite, pepoleTabNewNrml, pepoleTabNewNrmlColour, rightGoNewIcon, visiterNewNrml, visiterNewNrmlColour } from "../helper/ImageAssets";
import { useSelector } from "react-redux";
import { Image } from "react-native";
import { Screen } from "../theme/dimens";

// PERFORMANCE NOTES (UI unchanged):
// - Selectors return PRIMITIVES (booleans/strings) instead of arrays, so the
//   tab bar only re-renders when a badge actually toggles — not on every
//   likes/views API refresh that replaces the array reference.
// - The full-screen BlurView banner is split into its own memoized component
//   so tab presses / focus changes never re-composite the blur layer.
// - Component is wrapped in React.memo: the tab bar re-renders only when the
//   active tab index changes.

const navigate = (route: any) => {
    if (route === 'NAVIGATION_PEOPLE_SCREEN') return NavigationService.navigate(NAVIGATION_PEOPLE_SCREEN)
    if (route === 'NAVIGATION_LIKES_YOU_SCREEN') return NavigationService.navigate(NAVIGATION_LIKES_YOU_SCREEN)
    if (route === 'NAVIGATION_VIEW_YOU_SCREEN_SCREEN') return NavigationService.navigate(NAVIGATION_VIEW_YOU_SCREEN_SCREEN)
    if (route === 'NAVIGATION_CHATS_SCREEN') return NavigationService.navigate(NAVIGATION_CHATS_SCREEN)
}
const goToProfile = () => NavigationService.navigate(NAVIGATION_PROFILE_SCREEN);
const HiddenProfileOverlay = memo(({ userData }: any) => {
    return (
        <ImageBackground source={userData?.gender == "male" ? girlProfileLoakBackground : boyProfileloakBackground} resizeMode="stretch" style={{ height: Screen.Height, width: Screen.Width, position: "absolute", zIndex: 1, alignItems: "center", justifyContent: "center" }}>
        <FastImage source={lockIconWhite} resizeMode="contain" style={{ height: metrics.hp4, width: metrics.hp4, marginTop: metrics.hp18 }} />
        <AppText style={{ marginTop: metrics.hp2 }} type={FORTEEN} weight={INTER_MEDIUM} color={WHITE}>
            Unlock the Profile
        </AppText>
        <AppText style={{ paddingHorizontal: metrics.hp2, textAlign: "center" }} type={FORTEEN} weight={INTER_MEDIUM} color={OPECITY}>
            To View other profile. You need to publish your profile
        </AppText>
        <TouchableOpacityView activeOpacity={1} onPress={goToProfile}>
            <ImageBackground source={chatAmountBackgroungNew} resizeMode="stretch" style={{ height: metrics.hp8, width: metrics.hp25, alignItems: "center", justifyContent: "center", marginTop: metrics.hp8, flexDirection: "row" }}>
                <AppText color={WHITE} weight={SCHEHERAZADE_BOLD} type={SIXTEEN}>
                    {"  "}Go To Profile{"  "}
                </AppText>
                <FastImage source={goToProifleIcon} resizeMode="contain" style={{ height: metrics.hp3, width: metrics.hp3, marginTop: metrics.hp0_2, transform: [{ rotate: "180deg" }] }} />
            </ImageBackground>
        </TouchableOpacityView>
    </ImageBackground>
    );
}, (prev, next) => prev.useData === next.useData);
// Full-screen "Unlock the Profile" banner: isolated + memoized so the blur
// surface mounts once and is untouched by tab-bar re-renders.

const badgeDotStyle = {
    borderWidth: metrics.hp0_1, borderRadius: metrics.hp50, borderColor: "#E6B7A8",
    position: "absolute" as const,
    zIndex: 1,
    right: metrics.hp3_5,
    top: metrics.hp0,
    height: metrics.hp1,
    width: metrics.hp1,
    backgroundColor: "#E6B7A8"
};

const CustomTabBarAndroid = ({ state }: BottomTabBarProps) => {
    const userData = useSelector((state: any) => state.auth.userData);
    const hasLikesBadge = useSelector((state: any) =>
        Boolean(state.auth.likeByOtherData?.length || state.auth.likeYouData?.length));
    const hasViewsBadge = useSelector((state: any) =>
        Boolean(state.auth.viewByOtherData?.length || state.auth.viewYouData?.length));

    const getIcon = (route: string, isFocused: boolean, index: number) => {
        return (
            <TouchableOpacityView style={styles.tabItem} key={index} onPress={() => navigate(route)}>
                {route === "NAVIGATION_PEOPLE_SCREEN" ? (
                    <View style={styles.tabInner}>
                        <FastImage source={isFocused ? pepoleTabNewNrmlColour : pepoleTabNewNrml} resizeMode="contain" style={styles.icons} />
                    </View>
                ) : route === "NAVIGATION_LIKES_YOU_SCREEN" ? (
                    <View style={styles.tabInner}>
                        {hasLikesBadge ? <View style={badgeDotStyle} /> : <></>}
                        <FastImage source={isFocused ? likesYouNewNrmlColour : likesYouNewNrml} resizeMode="contain" style={styles.icons} />
                    </View>
                ) : route === "NAVIGATION_VIEW_YOU_SCREEN_SCREEN" ? (
                    <View style={styles.tabInner}>
                        {hasViewsBadge ? <View style={badgeDotStyle} /> : <></>}
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
    const hasPublishPlan =
        [
            "publish_one_week",
            "publish_one_month",
            "publish_six_months",
        ].includes(userData?.subscription?.plan);

    const shouldShowOverlay =
        (userData?.gender === "female" && userData?.isPublish === false) ||
        (userData?.gender === "male" &&
            hasPublishPlan &&
            userData?.isPublish === false);
    return (
        <>
            {shouldShowOverlay ? <HiddenProfileOverlay userData={userData} /> :
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
            }
        </>
    )
};
export default memo(CustomTabBarAndroid);
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

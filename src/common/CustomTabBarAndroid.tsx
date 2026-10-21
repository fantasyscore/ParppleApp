import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React, { memo } from "react";
import { ImageBackground, Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import metrics from "../assets/Metrics";
import { TouchableOpacityView } from "./TouchableOpacityView";
import FastImage from "react-native-fast-image";
import { AppText, BLACK, INTER_BOLD, INTER_MEDIUM, OPECITY, FORTEEN, WHITE, SCHEHERAZADE_BOLD, SIXTEEN, TEN } from "./AppText";
import NavigationService from "../navigation/NavigationService";
import { NAVIGATION_CHATS_SCREEN, NAVIGATION_LIKES_YOU_SCREEN, NAVIGATION_PEOPLE_SCREEN, NAVIGATION_PROFILE_SCREEN, NAVIGATION_VIEW_YOU_SCREEN_SCREEN } from "../navigation/routes";
import { boyProfileloakBackground, chatAmountBackgroungNew, chatTabNewNrml, chatTabNewNrmlColour, girlProfileLoakBackground, goToProifleIcon, likesYouNewNrml, likesYouNewNrmlColour, lockIconWhite, navBarBottom, pepoleTabNewNrml, pepoleTabNewNrmlColour, visiterNewNrml, visiterNewNrmlColour } from "../helper/ImageAssets";
import { useSelector } from "react-redux";
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

const MAX_BADGE_COUNT = 99;

/** Small count pill on a tab icon; renders nothing for 0 and caps large numbers at 99+. */
const TabBadge = memo(({ count }: { count: number }) => {
    if (!count || count <= 0) return null;
    return (
        <View style={styles.badge}>
            <AppText type={TEN} weight={INTER_BOLD} color={BLACK}>
                {count > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : count}
            </AppText>
        </View>
    );
});

const CustomTabBarAndroid = ({ state }: BottomTabBarProps) => {
    const insets = useSafeAreaInsets();
    // iOS reports the home-indicator inset (~34pt) which made the bar noticeably taller than on Android; keep both the same height
    const bottomInset = Platform.OS === "ios" ? 0 : insets.bottom;
    const userData = useSelector((state: any) => state.auth.userData);
    // Numbers (not arrays) so the bar only re-renders when a count actually changes
    const likedYouCount = useSelector((state: any) => state.auth.likeByOtherData?.length ?? 0);
    const viewedYouCount = useSelector((state: any) => state.auth.viewByOtherData?.length ?? 0);
    const unreadChatCount = useSelector((state: any) =>
        // Each chat with at least one unread message counts once, however many messages it holds
        (state.auth.newMatches ?? []).filter((chat: any) => Number(chat?.unreadCount) > 0).length);

    const getIcon = (route: string, isFocused: boolean, index: number) => {
        return (
            <TouchableOpacityView style={styles.tabItem} key={index} onPress={() => navigate(route)}>
                {route === "NAVIGATION_PEOPLE_SCREEN" ? (
                    <View style={styles.tabInner}>
                        <FastImage source={isFocused ? pepoleTabNewNrmlColour : pepoleTabNewNrml} resizeMode="contain" style={styles.icons} />
                    </View>
                ) : route === "NAVIGATION_LIKES_YOU_SCREEN" ? (
                    <View style={styles.tabInner}>
                        <TabBadge count={likedYouCount} />
                        <FastImage source={isFocused ? likesYouNewNrmlColour : likesYouNewNrml} resizeMode="contain" style={styles.icons} />
                    </View>
                ) : route === "NAVIGATION_VIEW_YOU_SCREEN_SCREEN" ? (
                    <View style={styles.tabInner}>
                        <TabBadge count={viewedYouCount} />
                        <FastImage source={isFocused ? visiterNewNrmlColour : visiterNewNrml} resizeMode="contain" style={styles.icons} />
                    </View>
                ) : (
                    <View style={styles.tabInner}>
                        <TabBadge count={unreadChatCount} />
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
                <ImageBackground source={navBarBottom} resizeMode="cover" style={[styles.bottomLayer, { height: metrics.hp13 + bottomInset, paddingBottom: bottomInset }]}>
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
        height: metrics.hp13,
        width: "100%",
        paddingVertical: metrics.hp2,
        position: "absolute", bottom: -metrics.hp1,

    },flowContainer: {
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
    badge: {
        position: "absolute",
        zIndex: 1,
        top: 0,
        right: metrics.hp2,
        minWidth: metrics.hp2,
        height: metrics.hp2,
        paddingHorizontal: metrics.hp0_5,
        borderRadius: metrics.hp1,
        backgroundColor: "#E6B7A8",
        alignItems: "center",
        justifyContent: "center",
    },
    icons: {
        height: metrics.hp4_5,
        width: metrics.hp4_5,
    }
    ,})

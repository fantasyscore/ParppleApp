import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React, { useEffect, useState } from "react";
import { Animated, Easing, Platform, StyleSheet, View } from "react-native";
import { colors } from "../theme/colors";
import metrics from "../assets/Metrics";
import { TouchableOpacityView } from "./TouchableOpacityView";
import FastImage from "react-native-fast-image";
import { AppText, THIRTEEN, INTER_MEDIUM, OPECITY, PURPLE, TWELVE, TEN, INTER_BOLD, WHITE, fontSize } from "./AppText";
import NavigationService from "../navigation/NavigationService";
import { NAVIGATION_CHATS_SCREEN, NAVIGATION_DISCOVER_SCREEN, NAVIGATION_LIKES_YOU_SCREEN, NAVIGATION_PEOPLE_SCREEN, NAVIGATION_PROFILE_SCREEN } from "../navigation/routes";
import { chats, chatTab, explore, explorTab, likeTab, likeyou, people, pepoleTab, profile, profileTab } from "../helper/ImageAssets";
import { useSelector } from "react-redux";
import { BlurView } from "@react-native-community/blur";
import { Circle, Svg } from "react-native-svg";


const TabIconButton = ({
    route,
    isFocused,
    onPress,
    strokeWidth,
    radius,
    circumference,
    safePct,
    progress,
    size,
    userData,
    percentage
}: {
    route: string;
    isFocused: boolean;
    onPress: () => void;
    strokeWidth:any;
    radius:any;
    circumference:any;
    safePct:any;
    progress:any;
    size:any;
    percentage:any;
    userData:any
}) => {
    const bounceY = React.useRef(new Animated.Value(0)).current;

    const runBounce = React.useCallback(() => {
        Animated.sequence([
            Animated.timing(bounceY, {
                toValue: -6,
                duration: 50,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
            Animated.spring(bounceY, {
                toValue: 0,
                speed: 40,
                bounciness: 15,
                useNativeDriver: true,
            }),
        ]).start();
    }, [bounceY]);

    const handlePress = React.useCallback(() => {
        runBounce();
        onPress();
    }, [onPress, runBounce]);

    return (
        <TouchableOpacityView style={styles.tabItem} onPress={handlePress}>
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
            <Animated.View style={[styles.tabInner, { transform: [{ translateY: bounceY }] }]}>
                {route === "NAVIGATION_PEOPLE_SCREEN" ? (
                    <FastImage source={isFocused ? people : pepoleTab} resizeMode="contain" style={styles.icons} />
                ) : route === "NAVIGATION_DISCOVER_SCREEN" ? (
                    <FastImage source={isFocused ? explore : explorTab} resizeMode="contain" style={styles.icons} />
                ) : route === "NAVIGATION_CHATS_SCREEN" ? (
                    <FastImage source={isFocused ? chats : chatTab} resizeMode="contain" style={styles.icons} />
                ) : route === "NAVIGATION_LIKES_YOU_SCREEN" ? (
                    <FastImage source={isFocused ? likeyou : likeTab} resizeMode="contain" style={styles.icons} />
                ) : (
                    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
                        <Svg height={size} width={size}>
                            <Circle
                                stroke={colors.persentageBorder}
                                fill="none"
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                strokeWidth={strokeWidth}
                            />
                            <Circle
                                stroke={colors.purple}
                                fill="none"
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                strokeWidth={strokeWidth}
                                strokeDasharray={circumference}
                                strokeDashoffset={circumference - progress}
                                strokeLinecap="round"
                                rotation="90"
                                originX={size / 2}
                                originY={size / 2}
                            />
                        </Svg>
                        <FastImage
                            source={{ uri: userData?.gallery[0]?.url }}
                            resizeMode="cover"
                            style={styles.imageContainer}
                        />
                        <View style={styles.persentageContainer}>
                            <AppText style={{fontSize:fontSize(7.5)}} weight={INTER_BOLD} color={WHITE}>
                                {Math.trunc(percentage)}%
                            </AppText>
                        </View>
                    </View>
                    // <FastImage source={isFocused ? profile : profileTab} resizeMode="contain" style={styles.icons} />
                )}
            </Animated.View>
        </TouchableOpacityView>
    );
};
const CustomTabBar = ({ state }: BottomTabBarProps) => {
    const bottomRemove = useSelector((state: any) => state.auth.bottomRemove);
    const userData = useSelector((state: any) => state.auth.userData);
    const [percentage, setPercentage] = useState(25);
    useEffect(() => {
        const n = Number(userData?.profileCompletion);
        setPercentage(Number.isFinite(n) ? n : 0);
    }, [userData?.profileCompletion])
    const size = metrics.hp4_5;
    const strokeWidth = metrics.hp0_2;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const safePct = Number.isFinite(Number(percentage)) ? Math.max(0, Math.min(100, Number(percentage))) : 0;
    const progress = (safePct / 100) * circumference;

    const navigate = (route: any) => {
        if (route === 'NAVIGATION_PEOPLE_SCREEN') return NavigationService.navigate(NAVIGATION_PEOPLE_SCREEN)
        if (route === 'NAVIGATION_DISCOVER_SCREEN') return NavigationService.navigate(NAVIGATION_DISCOVER_SCREEN)
        if (route === 'NAVIGATION_CHATS_SCREEN') return NavigationService.navigate(NAVIGATION_CHATS_SCREEN)
        if (route === 'NAVIGATION_LIKES_YOU_SCREEN') return NavigationService.navigate(NAVIGATION_LIKES_YOU_SCREEN)
        if (route === 'NAVIGATION_PROFILE_SCREEN') return NavigationService.navigate(NAVIGATION_PROFILE_SCREEN)

    }

   
    const getIcon = (route: string, isFocused: boolean, index: number) => {
        return (
            <TabIconButton
                key={index}
                route={route}
                isFocused={isFocused}
                onPress={() => navigate(route)}
                size={size}
                strokeWidth={strokeWidth}
                radius={radius}
                circumference={circumference}
                safePct={safePct}
                progress={progress}
                userData={userData}
                percentage={percentage}
            />
        );
    };

    return (
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
        marginBottom: metrics.hp2,
        marginTop:metrics.hp1
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
        backgroundColor:colors.white,
         // Top shadow (tab bar floating effect)
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: Platform.OS === "ios" ? 0.2 : 1,
        shadowRadius: 10,
        elevation: Platform.OS === "ios" ? 10 : 20,
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
    imageContainer: {
        position: "absolute",
        height: metrics.hp3_5,
        width: metrics.hp3_5,
        borderRadius: metrics.hp50,
    },
    persentageContainer: {
        width:metrics.hp4,
        // paddingHorizontal: metrics.hp1,
        paddingVertical: metrics.hp0_5,
        borderRadius: metrics.hp3,
        borderWidth: metrics.hp0_1,
        borderColor: colors.white,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.black,
        position: "absolute",
        bottom: -metrics.hp0_2
    },
})
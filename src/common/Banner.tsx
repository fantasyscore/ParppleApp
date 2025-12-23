import React, { useContext, useState } from "react";
import { Dimensions, Linking, StyleSheet, View, TouchableOpacity } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import FastImage from "react-native-fast-image";
import metrics from "../assets/Metrics";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { colors } from "../theme/colors";
import { useSelector } from "react-redux";

const BannerLounge = React.memo(({ iternalAdsList }: any) => {
    const bannersList = useSelector((state: any) => state.auth.bannersList);

    const width = Dimensions.get('screen').width;
    const [activeIndex, setActiveIndex] = useState(0);

    const openLink = async (url?: string) => {
        if (!url) return;
        try {
            Linking.openURL(url);
        } catch (error) {
            console.log("Banner link error:", error);
        }
    };
    return (
        <>
            <Carousel
                width={width}
                height={metrics.hp11_2}
                autoPlay
                autoPlayInterval={4000}
                defaultIndex={0}
                mode="parallax"
                data={bannersList || []}
                scrollAnimationDuration={1000}
                onProgressChange={(offsetProgress, absoluteProgress) => {
                    setActiveIndex(Math.round(absoluteProgress));
                }}
                modeConfig={{
                    parallaxScrollingScale: 0.9,
                    parallaxAdjacentItemScale: 0.8,  // REQUIRED
                    parallaxScrollingOffset: Math.round(width / 10) + 7,
                }}
                style={{ height: metrics.hp11, marginTop: metrics.hp2 }}
                renderItem={({ item, index }: any) => (
                    <TouchableOpacity activeOpacity={item?.link ? 0.8 : 1} onPress={() => openLink(item?.link)}>
                        <View style={styles.itemContainer} key={index}>
                            <FastImage
                                source={{ uri: "https://backend.forexpaisa.com/" + item?.image }}
                                style={styles.imageBanner}
                                resizeMode="contain"
                            />
                        </View>
                    </TouchableOpacity>
                )}
            />
            <View style={styles.dotContainer}>
                {bannersList?.map((_: any, index: any) => {
                    const isActive = index === activeIndex;
                    return (
                        <Animated.View
                            key={index}
                            style={[
                                styles.dotTwo,
                                isActive && styles.activeDotWhite
                            ]}
                        />
                    );
                })}
            </View>
        </>
    )
});
const styles = StyleSheet.create({
    itemContainer: {
        height: metrics.hp11,
        justifyContent: 'center',
        borderRadius: metrics.hp1_2,
    },
    imageBanner: {
        width: Dimensions.get('screen').width,
        height: metrics.hp13,
        borderRadius: metrics.hp2,
    },
    dotContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 8,
    },
    dot: {
        width: 8,
        height: 8,
        backgroundColor: "#FFFFFF59",
        borderRadius: 4,
        marginHorizontal: 4,
    },
    activeDot: {
        width: 20,
        height: 8,
        backgroundColor: colors.white,
        borderRadius: 5,
    },
    activeDotWhite: {
        width: 20,
        height: 8,
        backgroundColor: colors.purpleBlue,
        borderRadius: 5,
    },
    dotTwo: {
        width: 8,
        height: 8,
        backgroundColor: "#00000059",
        borderRadius: 4,
        marginHorizontal: 4,
    }
})
export default BannerLounge;

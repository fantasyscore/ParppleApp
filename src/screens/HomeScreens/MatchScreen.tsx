import React, { useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, StatusBar, ImageBackground } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, withSpring, withSequence, withRepeat } from 'react-native-reanimated';
import { bigHeart, dummyfemaleProfile, dummyMaleProfile, heartEight, heartFive, heartFour, heartOne, heartSeven, heartSix, heartTwo, matchbackground, matchText, seeMoreBackground, trunOnBackground } from '../../helper/ImageAssets';
import metrics from '../../assets/Metrics';
import { AppText, EIGHTEEN, FORTEEN, INTER_MEDIUM, INTER_SEMI_BOLD, SCHEHERAZADE_BOLD, SIXTEEN, WHITE } from '../../common/AppText';
import { colors } from '../../theme/colors';
import NavigationService from '../../navigation/NavigationService';
import { TouchableOpacityView } from '../../common/TouchableOpacityView';
import { AppSafeAreaView } from '../../common/AppSafeAreaView';

const createGlowingHeartAnimation = (delay: number, startY: number, finalY: number) => {
    const translateY = useSharedValue(startY);
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.5);
    useEffect(() => {
        opacity.value = withDelay(
            delay,
            withTiming(1, { duration: 500 })
        );
        translateY.value = withDelay(
            delay,
            withSpring(finalY, { damping: 10, stiffness: 80 })
        );
        scale.value = withDelay(
            delay + 1000,
            withRepeat(
                withSequence(
                    withTiming(0.8, { duration: 1500 }),
                    withTiming(1, { duration: 1500 })
                ),
                -1,
                true
            )
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [
                { translateY: translateY.value },
                { scale: scale.value }
            ],
        };
    });

    return animatedStyle;
};

const MatchScreen = ({ matchData, setMatchVisible }: any) => {
    const profile1TranslateX = useSharedValue(-200);
    const profile2TranslateX = useSharedValue(200);
    const profilesOpacity = useSharedValue(0);
    const profilesScale = useSharedValue(0.5);
    const matchTextOpacity = useSharedValue(0);
    const matchTextTranslateY = useSharedValue(50);
    const bigHeartAnim = createGlowingHeartAnimation(500, -20, 0);
    const heartOneAnim = createGlowingHeartAnimation(1500, -20, 0);
    const heartTwoAnim = createGlowingHeartAnimation(1600, -10, 10);
    const heartFourAnim = createGlowingHeartAnimation(1800, 0, 15);
    const heartFiveAnim = createGlowingHeartAnimation(1900, -5, -5);
    const heartSixAnim = createGlowingHeartAnimation(2000, 20, 25);
    const heartSevenAnim = createGlowingHeartAnimation(2100, -15, -10);
    const heartEightAnim = createGlowingHeartAnimation(2200, 10, 5);

    useEffect(() => {
        profilesOpacity.value = withTiming(1, { duration: 700 });
        profilesScale.value = withTiming(1, { duration: 700 });
        profile1TranslateX.value = withTiming(-20, { duration: 700 });
        profile2TranslateX.value = withTiming(20, { duration: 700 });
        matchTextOpacity.value = withDelay(1200, withTiming(1, { duration: 600 }));
        matchTextTranslateY.value = withDelay(1200, withTiming(0, { duration: 600 }));
    }, []);

    const animatedProfile1Style = useAnimatedStyle(() => ({
        opacity: profilesOpacity.value,
        transform: [
            { translateX: profile1TranslateX.value },
            { scale: profilesScale.value },
            { rotate: '-15deg' }
        ],
    }));

    const animatedProfile2Style = useAnimatedStyle(() => ({
        opacity: profilesOpacity.value,
        transform: [
            { translateX: profile2TranslateX.value },
            { scale: profilesScale.value },
            { rotate: '15deg' }
        ],
    }));

    const animatedMatchTextStyle = useAnimatedStyle(() => ({
        opacity: matchTextOpacity.value,
        transform: [{ translateY: matchTextTranslateY.value }],
    }));

    return (
        <AppSafeAreaView>
            <ImageBackground source={matchbackground} resizeMode='cover' style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#A020F0" />
                {/* <Animated.Image source={heartEight} resizeMode='contain' style={[styles.cascadingHeart, { top: metrics.hp17, left: metrics.hp10, width: metrics.hp4, height: metrics.hp4 }, heartEightAnim]} />
                <Animated.Image source={heartTwo} resizeMode='contain' style={[styles.cascadingHeart, { top: metrics.hp20, left: metrics.hp15, width: metrics.hp5, height: metrics.hp5 }, heartTwoAnim]} />
                <Animated.Image source={heartSeven} resizeMode='contain' style={[styles.cascadingHeart, { top: metrics.hp14, left: metrics.hp25, width: metrics.hp6, height: metrics.hp6 }, heartSevenAnim]} />
                <Animated.Image source={heartSix} resizeMode='contain' style={[styles.cascadingHeart, { top: metrics.hp18, left: metrics.hp28, width: metrics.hp7, height: metrics.hp7 }, heartSixAnim]} />
                <Animated.Image source={heartFive} resizeMode='contain' style={[styles.cascadingHeart, { top: metrics.hp10, right: metrics.hp25, width: metrics.hp8, height: metrics.hp8 }, heartFiveAnim]} />
                <Animated.Image source={heartFour} resizeMode='contain' style={[styles.cascadingHeart, { top: metrics.hp20, right: metrics.hp20, width: metrics.hp5, height: metrics.hp5 }, heartFourAnim]} />
                <Animated.Image source={heartOne} resizeMode='contain' style={[styles.cascadingHeart, { top: metrics.hp15, right: metrics.hp20, width: metrics.hp7, height: metrics.hp7 }, heartOneAnim]} /> */}
                <View style={styles.profilesWrapper}>
                    <Animated.Image
                        source={matchData[0]?.profilePicture[0]?.url ? { uri: matchData[0]?.profilePicture[0]?.url } : matchData?.gender === "male"? dummyMaleProfile : dummyfemaleProfile}
                        style={[styles.profileImage, animatedProfile1Style, styles.profile1Position]}
                    />
                    <Animated.Image
                        source={matchData[1]?.profilePicture[0]?.url ? { uri: matchData[1]?.profilePicture[0]?.url } : matchData?.gender === "female"? dummyfemaleProfile : dummyMaleProfile}
                        style={[styles.profileImage, animatedProfile2Style, styles.profile2Position]}
                    />
                    {/* <Animated.Image source={bigHeart} style={[styles.centralHeartWrapper, bigHeartAnim]} /> */}
                </View>
                <View style={styles.textContainer}>
                    <Animated.Image source={matchText} resizeMode={'contain'} style={[styles.matchText, animatedMatchTextStyle]} />
                </View>
                <View style={styles.buttonsContainer}>
                    <AppText type={EIGHTEEN} color={WHITE} weight={INTER_MEDIUM}>Start a conversation now!</AppText>
                    <TouchableOpacity onPress={() => setMatchVisible(false)}>
                        <ImageBackground source={seeMoreBackground} resizeMode='stretch' style={{ height: metrics.hp6, width: metrics.hp20, alignItems: "center", justifyContent: "center", marginTop: metrics.hp4 }}>
                            <AppText type={SIXTEEN} weight={SCHEHERAZADE_BOLD}>Go Back</AppText>
                        </ImageBackground>
                    </TouchableOpacity>

                </View>
            </ImageBackground>
        </AppSafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    profilesWrapper: {
        position: 'relative',
        width: metrics.hp35,
        marginTop: metrics.hp40,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    profileImage: {
        width: metrics.hp18,
        height: metrics.hp25,
        // borderRadius: 20,
        position: 'absolute',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 10,
    },
    profile1Position: {
        left: '10%',
        zIndex: 1,
    },
    profile2Position: {
        right: '10%',
        zIndex: 2,
    },
    centralHeartWrapper: {
        position: 'absolute',
        zIndex: 3,
        width: metrics.hp12,
        height: metrics.hp10,
        bottom: -metrics.hp14
    },
    textContainer: {
        marginTop: metrics.hp12,
        alignItems: 'center',
        zIndex: 4,
    },
    matchText: {
        height: metrics.hp20,
        width: metrics.hp28
    },
    buttonsContainer: {
        marginTop: metrics.hp1,
        alignItems: 'center',
    },
    startButton: {
        backgroundColor: colors.singleButtonGreen,
        height: metrics.hp5,
        width: metrics.hp16,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: metrics.hp3,
        marginTop: metrics.hp2
    },
    notNowButtonText: {
        marginTop: metrics.hp2
    },
    cascadingHeart: {
        position: 'absolute',
        zIndex: 0,
    }
});

export default MatchScreen;
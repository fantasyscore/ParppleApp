import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path, Rect } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSpring,
    Easing,
} from 'react-native-reanimated';


const ParppleLoader = ({ size = 120 }) => {
    // Main P bounce animation (scale: 1 → 1.08 → 1)
    const pScale = useSharedValue(1);
    
    // Border wave animation (scale: 1 → 1.15, opacity: 1 → 0)
    const borderScale = useSharedValue(1);
    const borderOpacity = useSharedValue(1);
    
    // Fold animation (subtle Y-axis scale/rotation)
    const foldScaleY = useSharedValue(1);
    const foldRotation = useSharedValue(0);

    useEffect(() => {
        // Main P bounce animation - soft spring-like scale (1 → 1.08 → 1)
        // Duration ~1600ms for full cycle (expand + contract)
        pScale.value = withRepeat(
            withSpring(1.08, {
                damping: 8,
                stiffness: 100,
                mass: 1,
            }),
            -1,
            true
        );

        // Border wave animation - synced with P bounce
        // Wave scales from 1 → 1.15 and fades from 1 → 0, then resets
        // Duration matches P bounce cycle for perfect sync
        borderScale.value = withRepeat(
            withTiming(1.15, {
                duration: 800,
                easing: Easing.out(Easing.ease),
            }),
            -1,
            true
        );

        borderOpacity.value = withRepeat(
            withTiming(0, {
                duration: 800,
                easing: Easing.out(Easing.ease),
            }),
            -1,
            true
        );

        // Fold animation - subtle folding/unfolding during P expansion
        // Scale Y from 1 → 0.96 (folds in) and rotate slightly
        foldScaleY.value = withRepeat(
            withTiming(0.96, {
                duration: 800,
                easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true
        );

        foldRotation.value = withRepeat(
            withTiming(4, {
                duration: 800,
                easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true
        );
    }, []);

    // Animated styles for P
    const pAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: pScale.value }],
        };
    });

    // Animated style for border
    const borderAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: borderScale.value }],
            opacity: borderOpacity.value,
        };
    });

    // Animated style for fold
    const foldAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scaleY: foldScaleY.value },
                { rotate: `${foldRotation.value}deg` },
            ],
        };
    });

    // Calculate dimensions based on size prop
    const svgWidth = size;
    const svgHeight = (size * 220) / 194; // Maintain aspect ratio from original SVG
    const borderSize = size * 2; // Border is larger than P
    const foldWidth = (size * 63) / 194;
    const foldHeight = (size * 55) / 194;

    // P SVG path (from mainp.svg)
    const pPath = "M35.6265 0.069538C61.6476 0.0159089 87.6845 -0.204534 113.687 0.578327C145.363 1.532 169.989 15.4262 185.59 43.4045C192.999 56.6907 194.873 71.3421 193.659 86.4777C191.755 110.217 181.381 129.427 162.794 144.113C151.257 153.228 138.124 158.915 123.331 160.555C119.098 161.024 114.888 161.004 110.663 161.075C97.2447 161.301 83.8249 161.458 70.4078 161.722C59.2869 161.941 49.4552 171.631 48.3316 182.586C47.6671 189.066 48.3343 195.559 47.399 202.013C46.1011 210.968 41.1221 217.001 32.2808 218.904C23.8255 220.723 15.4246 220.761 7.99177 215.243C3.02003 211.552 0.458749 206.495 0.391184 200.394C0.247487 187.404 0.353944 174.412 0.315012 161.421C0.216784 128.641 0.0764368 95.8605 0.000559232 63.0803C-0.0125478 57.4138 0.207992 51.7467 0.320872 45.7707C0.514577 37.1201 0.0191742 28.7734 0.698801 20.4318C1.50474 10.5415 9.88429 3.18064 18.9898 1.06466C24.4636 -0.20733 30.0981 0.0809198 35.6265 0.069538ZM134.298 44.4436C122.969 40.4866 112.102 46.1122 102.577 52.4895C99.4318 54.5952 96.686 57.4932 93.9996 57.3967C91.2122 57.2964 88.4885 54.1244 85.4488 52.1184C73.8173 44.4423 61.4104 40.4057 48.3355 46.759C38.2165 52.807 34.9454 62.1758 34.9136 73.0002L67.2222 127.251C73.5737 126.741 79.9751 126.792 86.3551 126.634C97.1914 126.365 108.132 126.585 118.623 123.565C138.923 117.72 157.952 99.9173 156.517 74.7619C155.729 60.947 147.797 49.158 134.298 44.4436Z";

    // Fold SVG path (from fold.svg)
    const foldPath = "M59.9121 32.5268C39.9566 21.6566 20.0009 10.7864 -0.000194955 -0.000225338L32.3582 54.2215C37.7594 46.0065 45.4708 40.9354 54.7348 38.1712C57.449 37.3613 60.3758 37.0067 62.7023 35.1754C62.5828 33.3563 61.1188 33.1841 60.117 32.6384L59.9121 32.5268Z";

    return (
        <View style={[styles.container, { width: borderSize, height: borderSize }]}>
            <View style={styles.svgContainer}>
                {/* Border SVG - Wave effect */}
                <Animated.View style={[styles.borderContainer, borderAnimatedStyle]}>
                    <Svg
                        width={borderSize}
                        height={borderSize}
                        viewBox="0 0 400 400"
                        style={styles.borderSvg}
                    >
                        <Rect
                            x="5"
                            y="5"
                            width="390"
                            height="390"
                            rx="115"
                            stroke="#6F13F2"
                            strokeWidth="10"
                        />
                    </Svg>
                </Animated.View>

                {/* Main P SVG - Bounce animation */}
                <Animated.View style={[styles.pContainer, pAnimatedStyle]}>
                    <Svg
                        width={svgWidth}
                        height={svgHeight}
                        viewBox="0 0 194 220"
                        style={styles.pSvg}
                    >
                        <Defs>
                            <LinearGradient
                                id="paint0_linear_2138_1238"
                                x1="97"
                                y1="0"
                                x2="97"
                                y2="220"
                                gradientUnits="userSpaceOnUse"
                            >
                                <Stop stopColor="#6F13F2" />
                                <Stop offset="1" stopColor="#400B8C" />
                            </LinearGradient>
                        </Defs>
                        <Path
                            d={pPath}
                            fill="url(#paint0_linear_2138_1238)"
                        />
                    </Svg>
                </Animated.View>

                {/* Fold SVG - Folding animation */}
                <Animated.View 
                    style={[
                        styles.foldContainer, 
                        {
                            top: svgHeight * 0.5 - foldHeight / 2,
                            left: svgWidth * 0.5 - foldWidth / 2,
                        },
                        foldAnimatedStyle
                    ]}
                >
                    <Svg
                        width={foldWidth}
                        height={foldHeight}
                        viewBox="0 0 63 55"
                        style={styles.foldSvg}
                    >
                        <Path
                            d={foldPath}
                            fill="#110029"
                        />
                    </Svg>
                </Animated.View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    svgContainer: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    borderContainer: {
        position: 'absolute',
    },
    borderSvg: {
        position: 'relative',
    },
    pContainer: {
        position: 'relative',
        zIndex: 2,
    },
    pSvg: {
        position: 'relative',
    },
    foldContainer: {
        position: 'absolute',
        zIndex: 3,
        // Position fold inside P (centered within P based on mainPLogo.png reference)
        // Will be adjusted via transform in animated style
    },
    foldSvg: {
        position: 'relative',
    },
});

export default ParppleLoader;


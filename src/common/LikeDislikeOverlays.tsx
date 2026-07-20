import React from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import { colors, newColor } from '../theme/colors';
import metrics from '../assets/Metrics';
import { likeNewICon, disLikeNewIcon, newLikeIcon, newCloseIcon } from '../helper/ImageAssets';

interface LikeDislikeOverlaysProps {
    likeOverlayStyle: any;
    likeIconAnimatedStyle: any;
    dislikeOverlayStyle: any;
    dislikeIconAnimatedStyle: any;
}

export const LikeDislikeOverlays = ({
    likeOverlayStyle,
    likeIconAnimatedStyle,
    dislikeOverlayStyle,
    dislikeIconAnimatedStyle,
}: LikeDislikeOverlaysProps) => {
    return (
        <>
            <Animated.View pointerEvents="none" style={[styles.dislikeFxOverlay, dislikeOverlayStyle]}>
                <Animated.View style={dislikeIconAnimatedStyle}>
                    <FastImage source={newCloseIcon} resizeMode="contain" style={styles.dislikeFxIcon} />
                </Animated.View>
            </Animated.View>

            <Animated.View pointerEvents="none" style={[styles.likeFxOverlay, likeOverlayStyle]}>
                <Animated.View style={likeIconAnimatedStyle}>
                    <FastImage source={newLikeIcon} resizeMode="contain" style={styles.likeFxIcon} />
                </Animated.View>
            </Animated.View>
        </>
    );
};

const styles = StyleSheet.create({
    dislikeFxOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: newColor.blackNew,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
    },
    dislikeFxIcon: {
        height: metrics.hp11,
        width: metrics.hp11,
    },
    likeFxOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: newColor.blackNew,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
    },
    likeFxIcon: {
        height: metrics.hp11,
        width: metrics.hp11,
    },
});

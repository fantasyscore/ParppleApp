import React, { useState } from "react";
import { Image, Platform, StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";

interface SafeGifImageProps {
    source: any;
    style?: any;
    resizeMode?: "contain" | "cover" | "stretch" | "center";
    fallbackSource?: any;
}

export const SafeGifImage = ({ source, style, resizeMode = "contain", fallbackSource }: SafeGifImageProps) => {
    const [hasError, setHasError] = useState(false);

    if (!source) {
        return <View style={[style, { backgroundColor: "#F0F0F0" }]} />;
    }

    const imageSource = hasError && fallbackSource ? fallbackSource : source;

    const handleLoadError = () => {
        console.warn("[SafeGifImage] Failed to load/decode GIF image.");
        setHasError(true);
    };

    if (Platform.OS === "ios") {
        // SDWebImage on iOS has known crashes and high memory consumption when decoding animated GIFs.
        // We use the standard React Native Image component on iOS, which uses native UIKit image loading
        // (ImageIO / UIImage.animatedImage) which natively manages memory safely and does not crash.
        return (
            <Image
                source={imageSource}
                style={style}
                resizeMode={resizeMode}
                onError={handleLoadError}
            />
        );
    }

    // On Android, FastImage handles animated GIFs very efficiently.
    const fastImageResizeMode =
        resizeMode === "cover" ? FastImage.resizeMode.cover :
        resizeMode === "stretch" ? FastImage.resizeMode.stretch :
        resizeMode === "center" ? FastImage.resizeMode.center :
        FastImage.resizeMode.contain;

    return (
        <FastImage
            source={imageSource}
            style={style}
            resizeMode={fastImageResizeMode}
            onError={handleLoadError}
        />
    );
};

export default SafeGifImage;

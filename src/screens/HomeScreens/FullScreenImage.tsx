import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    ImageBackground,
    StyleSheet,
    View,
    FlatList,
    Dimensions,
    Animated,
    Text
} from "react-native";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { newColor } from "../../theme/colors";
import metrics from "../../assets/Metrics";
import { AppText, fontSize, INTER_BOLD, THIRTEEN, TWELVE, WHITE } from "../../common/AppText";
import FastImage from "react-native-fast-image";
import { closeNewWhiteIcon } from "../../helper/ImageAssets";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import { Screen } from "../../theme/dimens";
import { Zoomable } from "@likashefqet/react-native-image-zoom";
import { GestureHandlerRootView } from "react-native-gesture-handler";
const { width } = Dimensions.get("window");

interface GalleryItem {
    url: string;
    [key: string]: any;
}

interface FullScreenImageProps {
    gallaryData?: any;
    setFullImage?: any;
    initialIndex?: number;
}

const FullScreenImage = ({ gallaryData = [], setFullImage, initialIndex = 0 }: FullScreenImageProps) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);
    const slideAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (!gallaryData || gallaryData?.length <= 1) return;

        // Subtle swipe hint animation
        const hintAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(slideAnim, {
                    toValue: -30,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                })
            ])
        );

        hintAnimation.start();

        // Stop after 1 second
        const timer = setTimeout(() => {
            hintAnimation.stop();
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }, 1000);

        return () => {
            clearTimeout(timer);
            hintAnimation.stop();
        };
    }, [gallaryData, slideAnim, fadeAnim]);

    const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
        if (viewableItems && viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }, []);

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50
    }).current;

    const getItemLayout = useCallback(
        (data: any, index: number) => ({
            length: width,
            offset: width * index,
            index,
        }),
        []
    );

    const renderItem = ({ item }: { item: GalleryItem }) => {
        return (
            <View style={styles.imageSlide}>
                 <Zoomable
                minScale={1}
                maxScale={4}
                doubleTapScale={2.5}
                isPanEnabled={true}
                isPinchEnabled={true}
                isDoubleTapEnabled={true}
                style={styles.zoomContainer}
            >
                <FastImage
                    source={{
                        uri: item?.url,
                        priority: FastImage.priority.high,
                        cache: FastImage.cacheControl.immutable,
                    }}
                    resizeMode={FastImage.resizeMode.cover}
                    style={styles.fullImage}
                />
                </Zoomable>
            </View>
        );
    };

    if (!gallaryData || gallaryData?.length === 0) {
        return (
            <AppSafeAreaView style={{ flexGrow: 1 }} color={newColor.blackNew}>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No images available</Text>
                </View>
            </AppSafeAreaView>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
        <AppSafeAreaView style={{ flexGrow: 1 }} color={newColor.blackNew}>

            <View style={styles.container}>
                <FlatList
                    data={gallaryData}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderItem}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                    initialScrollIndex={initialIndex || 0}
                    getItemLayout={getItemLayout}
                    bounces={false}
                />
                <TouchableOpacityView onPress={() => setFullImage(false)} style={{ position: "absolute", top: metrics.hp7, right: metrics.hp1, height: metrics.hp5, width: metrics.hp5 }}>
                    <FastImage source={closeNewWhiteIcon} resizeMode="contain" style={{
                        height: metrics.hp3, width: metrics.hp3
                    }} />
                </TouchableOpacityView>
                {/* Counter */}
                <View style={styles.counterContainer}>
                    <AppText type={THIRTEEN} weight={INTER_BOLD} color={WHITE}>
                        {currentIndex + 1} / {gallaryData?.length}
                    </AppText>
                </View>

                {/* Hint Animation */}
                {gallaryData?.length > 1 && (
                    <Animated.View
                        style={[
                            styles.hintContainer,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateX: slideAnim }]
                            }
                        ]}
                        pointerEvents="none"
                    >
                        <View style={styles.hintBox}>
                            <AppText type={TWELVE} weight={INTER_BOLD} color={WHITE}>Swipe</AppText>
                        </View>
                    </Animated.View>
                )}
            </View>
        </AppSafeAreaView>
        </GestureHandlerRootView>
    );
};

export default FullScreenImage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: newColor.blackNew,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: newColor.blackNew,
    },
    emptyText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    counterContainer: {
        position: 'absolute',
        bottom: metrics.hp2,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: metrics.hp1_2,
        paddingVertical: metrics.hp0_6,
        borderRadius: metrics.hp2,
    },

    hintContainer: {
        position: 'absolute',
        top: '50%',
        right: metrics.hp1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    hintBox: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: metrics.hp1_5,
        paddingVertical: metrics.hp0_8,
        borderRadius: metrics.hp2,
    },
    imageSlide: {
        width: width,
        height: metrics.hp50,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: newColor.blackNew,
        alignSelf:"center"
    },

    fullImage: {
        width: "100%",
        height: "100%",
    },
    zoomContainer: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    image: {
        width: width,
        height: metrics.hp50,
    },
});
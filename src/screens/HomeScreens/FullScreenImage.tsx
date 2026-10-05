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

const { width } = Dimensions.get("window");

interface GalleryItem {
    url: string;
    [key: string]: any;
}

interface FullScreenImageProps {
    gallaryData?: any;
    setFullImage?:any
}

const FullScreenImage = ({ gallaryData = [], setFullImage }: FullScreenImageProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const slideAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (!gallaryData|| gallaryData?.length <= 1) return;

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

    const renderItem = ({ item }: { item: GalleryItem }) => {
        return (
            <View style={{ width, flex: 1, backgroundColor: newColor.blackNew }}>
                <ImageBackground
                    source={{ uri: item?.url }}
                    resizeMode="cover"
                    style={{ flex:1 }}
                />
            </View>
        );
    };

    if (!gallaryData|| gallaryData?.length === 0) {
        return (
            <AppSafeAreaView style={{ flexGrow: 1 }} color={newColor.blackNew}>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No images available</Text>
                </View>
            </AppSafeAreaView>
        );
    }

    return (
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
                    bounces={false}
                />
                <TouchableOpacityView onPress={()=>setFullImage(false)} style={{ position: "absolute", top: metrics.hp7, right: metrics.hp1, height: metrics.hp5, width: metrics.hp5 }}>
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

});
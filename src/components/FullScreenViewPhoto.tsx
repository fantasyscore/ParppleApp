import React, { useEffect, useRef, useState } from "react";
import { Animated, FlatList, Image, ImageBackground, Modal, StyleSheet, View } from "react-native";
import metrics from "../assets/Metrics";
import { closeNewWhiteIcon, modalBackground } from "../helper/ImageAssets";
import { TouchableOpacityView } from "../common/TouchableOpacityView";
import FastImage from "react-native-fast-image";
import { useSelector } from "react-redux";
const PremiumAnimatedModal = ({ visible, onClose, children }: any) => {
    const [show, setShow] = useState(visible);
    const translateY = useRef(new Animated.Value(metrics.hp5)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            setShow(true);
            Animated.parallel([
                Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.spring(translateY, { toValue: 0, friction: 8, tension: 50, useNativeDriver: true })
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
                Animated.timing(translateY, { toValue: metrics.hp2, duration: 250, useNativeDriver: true })
            ]).start(() => setShow(false));
        }
    }, [visible]);

    if (!show) return null;

    return (
        <Modal transparent visible={show} onRequestClose={onClose} animationType="none">
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", paddingHorizontal: metrics.hp2 }}>
                <Animated.View style={{ opacity, transform: [{ translateY }], width: "100%" }}>
                    <ImageBackground style={{ width: "100%", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 15 }} source={modalBackground} resizeMode="stretch">
                        <View style={{ padding: metrics.hp2 }}>
                            {children}
                        </View>
                    </ImageBackground>
                </Animated.View>
            </View>
        </Modal>
    );
};
const FullScreenViewPhoto = ({ fullProfileShow, setFullProfileShow, fullProfileShowCurrentData }: any) => {
    const [activeIndex, setActiveIndex] = useState(0);

    // Ye track karega ki screen par kaunsi image visible hai
    const onViewRef = useRef(({ viewableItems }: any) => {
        if (viewableItems?.length > 0) {
            setActiveIndex(viewableItems[0].index || 0);
        }
    });
    const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });
    return (
        <PremiumAnimatedModal
            visible={fullProfileShow}
            onClose={() => setFullProfileShow(false)}>
            <TouchableOpacityView style={{ position: "absolute", zIndex: 1, right: metrics.hp3, top: metrics.hp3 }} activeOpacity={1} onPress={() => setFullProfileShow(false)}>
                <FastImage source={closeNewWhiteIcon} resizeMode="contain" style={{ height: metrics.hp4, width: metrics.hp4, }} />
            </TouchableOpacityView>
            <View style={{ height: metrics.hp70, width: metrics.hp37, alignItems: "center", justifyContent: "center" }}>
                <FlatList
                    data={fullProfileShowCurrentData?.profilePicture ? fullProfileShowCurrentData?.profilePicture : fullProfileShowCurrentData?.gallery || []}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item: any, index: number) => item?.url ?? index.toString()}
                    onViewableItemsChanged={onViewRef.current}
                    viewabilityConfig={viewConfigRef.current}
                    renderItem={({ item }) => (
                        <View style={{ height: metrics.hp70, width: metrics.hp37 }}>
                            <Image
                                source={{ uri: item.url }}
                                style={{ height: "100%", width: "100%", resizeMode: 'cover' }}
                            />
                        </View>
                    )}
                />
                <View style={styles.paginationContainer}>
                    {fullProfileShowCurrentData?.profilePicture ? fullProfileShowCurrentData?.profilePicture?.map((_: any, idx: number) => (
                        <View
                            key={idx.toString()}
                            style={[
                                styles.dot,
                                activeIndex === idx ? styles.activeDot : styles.inactiveDot
                            ]}
                        />
                    )) : fullProfileShowCurrentData?.gallery?.map((_: any, idx: number) => (
                        <View
                            key={idx.toString()}
                            style={[
                                styles.dot,
                                activeIndex === idx ? styles.activeDot : styles.inactiveDot
                            ]}
                        />
                    ))}
                </View>
            </View>
        </PremiumAnimatedModal>
    )
};
export default FullScreenViewPhoto;
const styles = StyleSheet.create({
    paginationContainer: {
        position: 'absolute',
        bottom: 15, // Image ke bottom se thoda upar
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    activeDot: {
        width: 20, // Active dot thoda lamba dikhega
        backgroundColor: '#FFFFFF',
    },
    inactiveDot: {
        width: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.5)', // Inactive dot transparent
    }
})
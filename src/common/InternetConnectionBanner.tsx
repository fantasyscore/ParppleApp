import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Animated, Modal } from 'react-native';
import { AppText, INTER_SEMI_BOLD, INTER_MEDIUM, TWELVE, FORTEEN, EIGHTEEN, FORTY, BLACK, WHITE } from './AppText';
import { colors } from '../theme/colors';
import metrics from '../assets/Metrics';
import NetInfo from '@react-native-community/netinfo';
import { TouchableOpacityView } from './TouchableOpacityView';

const InternetConnectionBanner: React.FC = () => {
    const [isConnected, setIsConnected] = useState<boolean | null>(true);
    const [showModal, setShowModal] = useState(false);
    const scale = useRef(new Animated.Value(0.96)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Subscribe to network state updates
        const unsubscribe = NetInfo.addEventListener(state => {
            const connected = state.isConnected && state.isInternetReachable;
            setIsConnected(connected);
            
            if (!connected) {
                setShowModal(true);
            } else {
                setShowModal(false);
            }
        });

        // Check initial network state
        NetInfo.fetch().then(state => {
            const connected = state.isConnected && state.isInternetReachable;
            setIsConnected(connected);
            if (!connected) {
                setShowModal(true);
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (!showModal) return;
        opacity.setValue(0);
        scale.setValue(0.96);
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
            Animated.timing(scale, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();
    }, [showModal, opacity, scale]);

    const handleRetry = () => {
        NetInfo.fetch().then(state => {
            const connected = state.isConnected && state.isInternetReachable;
            if (connected) {
                setIsConnected(true);
                setShowModal(false);
            }
        });
    };

    return (
        <Modal
            visible={showModal}
            transparent
            animationType="fade"
            statusBarTranslucent
            hardwareAccelerated
            onRequestClose={() => {}} // Prevent closing by back button
        >
            <View style={styles.backdrop}>
                <Animated.View style={[styles.modalContent, { opacity, transform: [{ scale }] }]}>
                    <View style={styles.iconContainer}>
                        <View style={styles.iconCircle}>
                            <AppText type={FORTY} weight={INTER_SEMI_BOLD} color={WHITE}>
                                ⚠️
                            </AppText>
                        </View>
                    </View>
                    
                    <AppText type={EIGHTEEN} weight={INTER_SEMI_BOLD} color={BLACK} style={styles.title}>
                        No Internet Connection
                    </AppText>
                    
                    <AppText 
                        type={TWELVE} 
                        weight={INTER_MEDIUM} 
                        color={colors.darkOpecity}
                        style={styles.message}
                    >
                        Please check your network settings and try again
                    </AppText>

                    <TouchableOpacityView onPress={handleRetry} style={styles.retryButton}>
                        <AppText type={FORTEEN} weight={INTER_SEMI_BOLD} color={WHITE}>
                            Retry
                        </AppText>
                    </TouchableOpacityView>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: '#00000080',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: metrics.hp2,
    },
    modalContent: {
        backgroundColor: colors.white,
        borderRadius: metrics.hp2,
        padding: metrics.hp2_5,
        width: '100%',
        maxWidth: 320,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    iconContainer: {
        marginBottom: metrics.hp1_5,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.red,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        marginBottom: metrics.hp1,
        textAlign: 'center',
    },
    message: {
        textAlign: 'center',
        marginBottom: metrics.hp2,
        lineHeight: 18,
    },
    retryButton: {
        backgroundColor: colors.purple,
        paddingVertical: metrics.hp1_5,
        paddingHorizontal: metrics.hp3,
        borderRadius: metrics.hp4,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default InternetConnectionBanner;


import React from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    StyleProp,
    View,
    ViewStyle,
} from "react-native";
import metrics from "../assets/Metrics";

export interface BottomSheetProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Reusable bottom sheet rendered inside a transparent Modal.
 * Tapping the dimmed backdrop dismisses it.
 */
const BottomSheet = ({
    visible,
    onClose,
    children,
    containerStyle,
}: BottomSheetProps) => {
    return (
        <Modal
            transparent
            statusBarTranslucent
            animationType="slide"
            visible={visible}
            onRequestClose={onClose}
            
        >
            <Pressable style={styles.backdrop} onPress={onClose} />
            <View style={[styles.sheet, containerStyle]}>{children}</View>
        </Modal>
    );
};

export default BottomSheet;

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.1)",
    },
    sheet: {
        backgroundColor: "#151517",
        borderTopLeftRadius: metrics.hp2_7,
        borderTopRightRadius: metrics.hp2_7,
        paddingHorizontal: metrics.hp2,
        paddingTop: metrics.hp2,
        paddingBottom: metrics.hp2_7,
    },
});

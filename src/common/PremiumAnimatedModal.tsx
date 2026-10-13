import React, { useEffect, useRef, useState } from "react";
import { Animated, ImageBackground, Modal, View } from "react-native";
import metrics from "../assets/Metrics";
import { modalBackground } from "../helper/ImageAssets";

interface PremiumAnimatedModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/** Centered card modal that fades and slides in/out; stays mounted until the exit animation ends. */
const PremiumAnimatedModal = ({ visible, onClose, children }: PremiumAnimatedModalProps) => {
  const [show, setShow] = useState(visible);
  const translateY = useRef(new Animated.Value(metrics.hp5)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setShow(true);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, friction: 8, tension: 50, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: metrics.hp2, duration: 250, useNativeDriver: true }),
      ]).start(() => setShow(false));
    }
  }, [visible, opacity, translateY]);

  if (!show) return null;

  return (
    <Modal transparent visible={show} onRequestClose={onClose} animationType="none">
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", paddingHorizontal: metrics.hp2 }}>
        <Animated.View style={{ opacity, transform: [{ translateY }], width: "100%" }}>
          <ImageBackground
            style={{ width: "100%", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 15 }}
            source={modalBackground}
            resizeMode="stretch"
          >
            <View style={{ padding: metrics.hp2 }}>{children}</View>
          </ImageBackground>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default PremiumAnimatedModal;

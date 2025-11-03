import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  ViewStyle,
  Dimensions,
  StyleSheet,
} from "react-native";
import metrics from "../../assets/Metrics";

const { width } = Dimensions.get("window");

function DefaultCard({
  item,
  cardStyle,
}: {
  item: any;
  cardStyle?: ViewStyle;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = item?.gallery?.map((img) => img.url) || [];
  const [animating, setAnimating] = useState(false);

  const translateX = useRef(new Animated.Value(0)).current;
  const scaleNext = useRef(new Animated.Value(0.9)).current;

  // Derived scale value for smooth parallax transition
  const animatedScaleNext = translateX.interpolate({
    inputRange: [-width, 0, width],
    outputRange: [1, 0.9, 1],
    extrapolate: "clamp",
  });

  const animateTransition = (direction: "next" | "prev") => {
    if (animating) return;

    const newIndex =
      direction === "next"
        ? Math.min(currentIndex + 1, images.length - 1)
        : Math.max(currentIndex - 1, 0);

    if (newIndex === currentIndex) return;

    setAnimating(true);

    const toValue = direction === "next" ? -width : width;

    // Reset scale for next image
    scaleNext.setValue(0.85);

    // Animate translation and scale together
    Animated.parallel([
      Animated.timing(translateX, {
        toValue,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(scaleNext, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      translateX.setValue(0);
      scaleNext.setValue(0.9);
      setCurrentIndex(newIndex);
      setAnimating(false);
    });
  };

  const handleNext = () => animateTransition("next");
  const handlePrev = () => animateTransition("prev");

  return (
    <View style={[styles.card, cardStyle]}>
      {/* Progress Bar */}
      <View style={styles.renderBarContainer}>
        {images.map((_: any, i: number) => (
          <View
            key={i}
            style={[
              styles.renderBar,
              {
                backgroundColor:
                  i === currentIndex ? "black" : "rgba(0,0,0,0.3)",
              },
            ]}
          />
        ))}
      </View>

      {/* Tap Zones */}
      <TouchableOpacity
        style={styles.leftTouch}
        onPress={handlePrev}
        activeOpacity={1}
      />
      <TouchableOpacity
        style={styles.rightTouch}
        onPress={handleNext}
        activeOpacity={1}
      />

      {/* Image Layer */}
      <View style={styles.imageContainer}>
        {/* Next image behind */}
        {images[currentIndex + 1] && (
          <Animated.Image
            source={{ uri: images[currentIndex + 1] }}
            style={[
              styles.image,
              {
                position: "absolute",
                transform: [{ scale: animatedScaleNext }],
                opacity: 0.85,
              },
            ]}
            resizeMode="cover"
          />
        )}

        {/* Current image in front */}
        <Animated.Image
          source={{ uri: images[currentIndex] }}
          style={[
            styles.image,
            {
              transform: [{ translateX }],
            },
          ]}
          resizeMode="cover"
        />
      </View>

      {/* Name & Age */}
      <Text style={styles.title}>
        {`${item?.name ?? "Unknown"}, ${item?.age ?? ""}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 0.8,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  imageContainer: {
    flex: 1,
    width: "100%",
    marginTop: metrics.hp10,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "85%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginTop: 8,
  },
  renderBarContainer: {
    flexDirection: "row",
    position: "absolute",
    top: 50,
    alignSelf: "center",
  },
  renderBar: {
    width: 30,
    height: 3,
    marginHorizontal: 2,
    borderRadius: 2,
  },
  leftTouch: {
    height: metrics.hp50,
    width: "50%",
    position: "absolute",
    left: 0,
    zIndex: 2,
  },
  rightTouch: {
    height: metrics.hp50,
    width: "50%",
    position: "absolute",
    right: 0,
    zIndex: 2,
  },
});

export default DefaultCard;

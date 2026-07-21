import React, { useCallback, useRef } from "react";
import { Platform, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { AppSafeAreaViewProps } from "../types/common";
import { useFocusEffect } from "@react-navigation/native";

const AppSafeAreaView = ({
  children,
  style,
  statusColor,
  color,
}: AppSafeAreaViewProps) => {
  // Run the StatusBar mutation only once per mount (not on every focus):
  // repeated native StatusBar calls during a navigation transition force a
  // layout pass mid-animation and cause visible jank.
  const hasConfiguredStatusBarRef = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android' && !hasConfiguredStatusBarRef.current) {
        hasConfiguredStatusBarRef.current = true;
        StatusBar.setBackgroundColor('transparent');
        StatusBar.setTranslucent(true);
      }
    }, [])
  )
  return Platform.OS === "ios" ? (
    <View style={[{ flex: 1, backgroundColor: color ? color : colors.white }, style]}>
      {/* <SafeAreaView
        style={{
          flex: 0,
          backgroundColor: statusColor ? statusColor : colors.white,
        }}
      />
      <SafeAreaView
        edges={["right", "left"]}
        style={{
          flex: 1,
        }}>
        {children}
      </SafeAreaView> */}
      <StatusBar
        backgroundColor={'black'}
        barStyle="dark-content"
      />
      {children}
    </View>
  ) : (
    <View style={[{ flex: 1, backgroundColor: color ? color : colors.white }, style]}>
      {/* Transparent + translucent from the first frame: previously this was
          backgroundColor 'white' and the focus effect flipped it to
          transparent ~100ms later — a visible white strip on every screen
          transition. The final rendered state is identical. */}
      <StatusBar
        translucent
        backgroundColor={'transparent'}
        barStyle="light-content"
      />
      {children}
    </View>
  );
};

export { AppSafeAreaView };

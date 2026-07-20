import React, { useCallback } from "react";
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
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android') {
        setTimeout(() => {
          StatusBar.setBackgroundColor('transparent')
          StatusBar.setTranslucent(true)
        }, 100)
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
      <StatusBar
        backgroundColor={'white'}
        barStyle="light-content"
      />
      {children}
    </View>
  );
};

export { AppSafeAreaView };

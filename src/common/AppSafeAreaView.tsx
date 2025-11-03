import React from "react";
import { Platform, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { AppSafeAreaViewProps } from "../types/common";

const AppSafeAreaView = ({
  children,
  style,
  statusColor,
  color,
}: AppSafeAreaViewProps) => {
  return Platform.OS === "ios" ? (
    <View style={[{ flex: 1 }, style]}>
      <SafeAreaView
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
      </SafeAreaView>
    </View>
  ) : (
    <View style={[{ flex: 1, backgroundColor: color ? color : colors.white }, style]}>
      <StatusBar
        backgroundColor={'black'}
        barStyle="dark-content"
      />
      {children}
    </View>
  );
};

export { AppSafeAreaView };

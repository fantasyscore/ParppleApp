import React, { ReactNode } from "react";
import {
  TouchableOpacity as TouchableOpacityBase,
  Platform,
} from "react-native";
import { TouchableOpacity as TouchableOpacityGesture } from "react-native-gesture-handler";
import { TouchableOpacityViewProps } from "../types/common";

const TouchableOpacityView = ({
  children,
  isGesture,
  ...props
}: TouchableOpacityViewProps) => {
  const isIos = Platform.OS === "ios";
  if (isGesture && !isIos) {
    return (
      <TouchableOpacityGesture {...props}>{children}</TouchableOpacityGesture>
    );
  } else {
    return <TouchableOpacityBase activeOpacity={0.8} {...props}>{children}</TouchableOpacityBase>;
  }
};

export { TouchableOpacityView };

import {
  GestureResponderEvent,
  StyleProp,
  TextInputProps,
  TextProps,
  TextStyle,
  TouchableOpacityProps,
  ViewStyle,
} from "react-native";
import { LegacyRef, ReactNode } from "react";
import { Source } from "react-native-fast-image";

export interface CheckboxProps {
  onPress: ((event: GestureResponderEvent) => void) | undefined;
  value: boolean;
  checkbox?: boolean;
  style?: StyleProp<ViewStyle> | undefined;
  disabled?: boolean;
}

export interface TextPropsTemp extends TextProps {
  type?: any;
  weight?: any;
  color?: any;
  children?: any;
  line?: any;
  numberOfLines?: any
  style?: any;
}

export interface AppSafeAreaViewProps {
  children?: any;
  style?: StyleProp<ViewStyle> | undefined;
  statusColor?: string;
  color?:any;
}

export interface BProps extends TouchableOpacityProps {
  activeOpacity?: number;
  children: string;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  disabled?: boolean;
  onPress?: ((event: GestureResponderEvent) => void) | undefined;
  isSecond?: boolean;
}

export interface SpinnerProps {
  style?: ViewStyle;
}

export interface TouchableOpacityViewProps extends TouchableOpacityProps {
  children?: ReactNode;
  isGesture?: boolean;
}

export interface ToolbarProps {
  title: string;
  subtitle?: string;
}
export interface ToolbarImageProps {
  title: string;
  subtitle?: string;
  icon: Source | number;
}

// export interface InputProps extends TextInputProps {
//   label?: string;
//   value: string;
//   containerStyle?: ViewStyle;
//   labelStyle?: TextStyle;
//   inputStyle?: ViewStyle;
//   isError?: boolean;
//   assignRef?: ;
//   showHidePress?: ((event: GestureResponderEvent) => void) | undefined;
//   errorText?: string;
//   isRequired?: boolean;
//   placeholder?: Object;
//   onFocus?: any;
//   onBlur?: any;
//   onChangeText?: any;
//   onEndEditing?: any;
//   keyboardType?: any;
//   onSubmitEditing?: any;
//   secureTextEntry?: any;

// }
export interface CountryInputProps extends TextInputProps {
  label?: string;
  value: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: ViewStyle;
  isError?: boolean;
  assignRef?: any;
  showHidePress?: ((event: GestureResponderEvent) => void) | undefined;
  errorText?: string;
  visible?: boolean;
  onSelectCountry?:any;
  isPhoneNotValid?: any;
}



export interface ButtonValidationProps {
  isFocused: boolean;
  title: string;
  onPress?: ((event: GestureResponderEvent) => void) | undefined;
  disabled?: boolean;
  bottomText?: string;
  isTextDisabled?: boolean;
}

export interface ToolbarValidationProps {
  isFocused: boolean;
  title: string;
  subtitle: string;
  icon?: Source | number;
}

export interface ToolbarBottomSheetProps {
  title: string;
  onPressClose: ((event: GestureResponderEvent) => void) | undefined;
}

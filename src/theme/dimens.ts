import { Dimensions } from "react-native";

export const Screen = {
  Width: Dimensions.get("window").width,
  Height: Dimensions.get("window").height,
};

export const sheetOpenDuration = 200;
export const sheetCloseDuration = 200;
export const sheetHeightFull = Screen.Height * 0.8;
export const sheetHeightHalf = Screen.Height * 0.3;

export const initialLayout = { width: Dimensions.get("window").width };

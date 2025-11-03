import { StyleSheet } from "react-native";
import { colors } from "./colors";
export const commonStyles = StyleSheet.create({
  whiteBackground: {
    flex: 1,
    backgroundColor: colors.white,
  },
  whiteBackgroundWithPadding: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 18,
  },
  flexGrow: {
    flexGrow: 1,
  },
  flexDirectionRow: {
    flexDirection: "row",
  },
  center: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});

import React from "react";
import { Text, StyleSheet, TextStyle, Platform, PixelRatio, Dimensions } from "react-native";
import { colors } from "../theme/colors";
import { interBold, interExtraBold, interLight, interMedium, interRegular, interSemiBold, interThin, ScheherazadeNewBold, ScheherazadeNewMedium, ScheherazadeNewRegular, ScheherazadeNewSemiBold } from "../theme/typography";
import { TextPropsTemp } from "../types/common";

export const NINE = "NINE";
export const THIRTEEN = "THIRTEEN";
export const FIFTEEN = "FIFTEEN";
export const SIXTEEN = "SIXTEEN";
export const TWENTY = "TWENTY";
export const TWENTY_FOUR = "TWENTY_FOUR";
export const FORTEEN = "FORTEEN";
export const EIGHTEEN = "EIGHTEEN";
export const NINETEEN = "NINETEEN";
export const TWELVE = "TWELVE";
export const FORTY = "FORTY";
export const TWENTY_TWO = "TWENTY_TWO";
export const TEN = "TEN";
export const EIGHT = "EIGHT";
export const FORTY_FIVE = "FORTY_FIVE";
export const ELEVEN = "ELEVEN";
export const THIRTY = "THIRTY";

export const INTER_MEDIUM = "INTER_MEDIUM";
export const INTER_LIGHT = "INTER_LIGHT";
export const INTER_EXTRA_BOLD = "INTER_EXTRA_BOLD";
export const INTER_REGULAR = "INTER_REGULAR";
export const INTER_SEMI_BOLD = "INTER_SEMI_BOLD";
export const INTER_THIN = "INTER_THIN";
export const INTER_BOLD = "INTER_BOLD";
export const SCHEHERAZADE_BOLD = "SCHEHERAZADE_BOLD";
export const SCHEHERAZADE_MEDIUM = "SCHEHERAZADE_MEDIUM";
export const SCHEHERAZADE_REGULAR = "SCHEHERAZADE_REGULAR";
export const SCHEHERAZADE_SEMI_BOLD = "SCHEHERAZADE_SEMI_BOLD";




export const WHITE = "WHITE";
export const BLACK = "BLACK";
export const OPECITY = "OPECITY";
export const OPECITY_DARK = "OPECITY_DARK";
export const PURPLE = "PURPLE";
export const LIGHT_BLACK = "LIGHT_BLACK"
export const RED = "RED"
export const DARKGREEN = "DARKGREEN"
export const SKYBLUE = "SKYBLUE"
export const DARK_GREEN = "DARK_GREEN"
export const LIGHT_GREEN = "LIGHT_GREEN"
export const BLACK_EIGHTY = "BLACK_EIGHTY"


export const TWENTY_ONE_L = "TWENTY_ONE_L";
export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
export const scale = SCREEN_WIDTH / 320;
export function fontSize(size: number) {
  const newSize = size * scale
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize))
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2
  }
}
const AppText = ({
  type,
  weight,
  style,
  numberOfLines,
  color,
  line,
  ...props
}: TextPropsTemp) => {
  return (
    <Text
      allowFontScaling={false}
      numberOfLines={numberOfLines}
      style={StyleSheet.flatten([
        styles.text(type, weight, color, line),
        style,
      ])}
      {...props}
    />
  );
};

const getTextStyle = (
  type: string,
  weight: string,
  color: string,
  line: string,
) => {
  var style: TextStyle = {
    fontFamily: interRegular,
  };
  switch (type) {
    case NINE:
      style["fontSize"] = fontSize(9);
      break;
    case THIRTEEN:
      style["fontSize"] = fontSize(13);
      break;
    case FIFTEEN:
      style["fontSize"] = fontSize(15);
      break;
    case TWENTY:
      style["fontSize"] = fontSize(20);
      break;
    case TWENTY_FOUR:
      style["fontSize"] = fontSize(24);
      break;
    case FORTEEN:
      style["fontSize"] = fontSize(14);
      break;
    case EIGHTEEN:
      style["fontSize"] = fontSize(18);
      break;
    case TWELVE:
      style["fontSize"] = fontSize(12);
      break;
    case NINETEEN:
      style["fontSize"] = fontSize(19);
      break;
    case FORTY:
      style["fontSize"] = fontSize(40);
    case FORTY_FIVE:
      style["fontSize"] = fontSize(45);
      break;
    case SIXTEEN:
      style["fontSize"] = fontSize(16);
      break;
    case TWENTY_TWO:
      style["fontSize"] = fontSize(22);
      break;
    case TEN:
      style["fontSize"] = fontSize(10);
      break;
    case ELEVEN:
      style["fontSize"] = fontSize(11);
      break;
    case THIRTY:
      style["fontSize"] = fontSize(35);
      break;
    case EIGHT:
      style["fontSize"] = fontSize(8);
      break;

    default:
      style["fontSize"] = fontSize(10);
  }

  switch (weight) {
    case INTER_MEDIUM:
      style["fontFamily"] = interMedium;
      break;
    case INTER_LIGHT:
      style["fontFamily"] = interLight;
      break;
    case INTER_BOLD:
      style["fontFamily"] = interBold;
      break;
    case INTER_REGULAR:
      style["fontFamily"] = interRegular;
      break;
    case INTER_SEMI_BOLD:
      style["fontFamily"] = interSemiBold;
      break;
    case INTER_THIN:
      style["fontFamily"] = interThin;
      break;
    case INTER_EXTRA_BOLD:
      style["fontFamily"] = interExtraBold;
      break;
    case SCHEHERAZADE_BOLD:
      style["fontFamily"] = ScheherazadeNewBold;
      break;
    case SCHEHERAZADE_MEDIUM:
      style["fontFamily"] = ScheherazadeNewMedium;
      break;
    case SCHEHERAZADE_REGULAR:
      style["fontFamily"] = ScheherazadeNewRegular;
      break;
    case SCHEHERAZADE_SEMI_BOLD:
      style["fontFamily"] = ScheherazadeNewSemiBold;
      break;
    default:
      style["fontFamily"] = interMedium;
  }
  switch (line) {
    case TWENTY_ONE_L:
      style["lineHeight"] = 21;
      break;
  }

  switch (color) {
    case WHITE:
      style["color"] = colors.white;
      break;
    case BLACK:
      style["color"] = colors.black;
      break;
    case OPECITY:
      style["color"] = colors.opecity;
      break;
    case OPECITY_DARK:
      style["color"] = colors.darkOpecity;
      break;
    case PURPLE:
      style["color"] = colors.purple;
      break;
    case LIGHT_BLACK:
      style["color"] = colors.lightBlack;
      break;
    case RED:
      style["color"] = colors.red;
      break;
    case DARKGREEN:
      style["color"] = colors.darkGreen;
      break;
    case SKYBLUE:
      style["color"] = colors.skyBlue;
      break;
    case LIGHT_GREEN:
      style["color"] = colors.singleButtonGreen;
      break;
      case DARK_GREEN:
        style["color"] = colors.darGreen;
        break;
        case BLACK_EIGHTY:
          style["color"] = colors.blackEighty;
          break;
    default:
      style["color"] = colors.black;
      break;
  }

  return style;
};

const styles = {
  text: (type: string, weight: string, color: string, line: string) => ({
    ...getTextStyle(type, weight, color, line),
  }),
};

export { AppText };

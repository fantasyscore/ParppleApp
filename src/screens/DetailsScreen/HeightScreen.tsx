import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, View, ScrollView, Dimensions, ImageBackground, TouchableOpacity } from "react-native";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import HeaderCommon from "../../common/HeaderCommon";
import TopCommonLine from "../../common/TopCommonLine";
import DubleTextLine from "../../common/DubleTextLine";
import metrics from "../../assets/Metrics";
import { applogo, BananaHeight, BottomLayer, straightenIcon } from "../../helper/ImageAssets";
import {
  AppText,
  BLACK,
  EIGHTEEN,
  INTER_BOLD,
  INTER_SEMI_BOLD,
  OPECITY_DARK,
  SCHEHERAZADE_BOLD,
  TWELVE,
  TWENTY,
  TWENTY_FOUR,
  WHITE,
} from "../../common/AppText";
import { colors, newColor } from "../../theme/colors";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import GoButton from "../../common/GoButton";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_EDUCATION_SCREEN, NAVIGATION_LANGUAGE_SPEAK_SCREEN, NAVIGATION_TRUN_ON_SCREEN } from "../../navigation/routes";
import { Screen } from "../../theme/dimens";
import { scale, verticalScale } from "react-native-size-matters";
import { useDispatch, useSelector } from "react-redux";
import { setAddProfile, setfilterData } from "../../slices/loginServices/authSlice";
import { editProfile, turnOn } from "../../actions/authActions";
import LinearGradient from "react-native-linear-gradient";
import FastImage from "react-native-fast-image";

// --- NO CHANGES IN THIS SECTION ---
const heights: any = [];
for (let ft = 4; ft <= 7; ft++) {
  for (let inch = 0; inch < 12; inch++) {
    if (ft === 7 && inch === 11) {
      heights.push(`${ft}'${inch}"`);
      break;
    }
    heights.push(`${ft}'${inch}"`);
  }
}

const heightsCm: any = [];
for (let cm = 140; cm <= 210; cm++) {
  heightsCm.push(`${cm} cm`);
}

const MARK_HEIGHT = verticalScale(20);
// --- END NO CHANGES ---

const HeightScreen = ({ route }: any) => {
  const dispatch = useDispatch();
  const addProfileData = useSelector((state: any) => state?.auth?.addProfileData);
  const filterData = useSelector((state: any) => state?.auth?.filterData);
  const filter = route?.params?.filter ?? "";
  const dataFilter = route?.params?.data ?? "";
  const onlyFt = route?.params?.onlyFt ?? false;
  const isAdvanceFilter = route?.params?.isAdvanceFilter ?? false;
  const datalist = new Array(7).fill(null).map((_, index) => ({ id: String(index) }));

  // --- FIX 1: Correctly determine initial state from dataFilter ---
  const getInitialState = () => {
    const defaultFt = "4'0\"";
    const defaultCm = "170 cm";

    if (!dataFilter) {
      return { unit: "FT", height: defaultFt };
    }

    if (dataFilter.includes("cm")) {
      // Check if the CM value is valid
      if (heightsCm.indexOf(dataFilter) !== -1) {
        return { unit: "CM", height: dataFilter };
      }
      return { unit: "CM", height: defaultCm }; // Fallback for invalid CM
    } else {
      // Assume FT
      if (heights.indexOf(dataFilter) !== -1) {
        return { unit: "FT", height: dataFilter };
      }
      return { unit: "FT", height: defaultFt }; // Fallback for invalid FT
    }
  };

  const initialState = getInitialState();
  const [selectFtCm, setSelectFtCm] = useState(onlyFt ? "FT" : initialState.unit);
  const [selectedHeight, setSelectedHeight] = useState(initialState.height);
  // --- END FIX 1 ---

  const scrollViewRef = useRef<ScrollView>(null);
  const centerOffset = (verticalScale(400) / 2) - (MARK_HEIGHT / 2);
  const currentDataSource = (onlyFt || selectFtCm === "FT") ? heights : heightsCm;

  // This logic is now simpler because the initial state is correct
  const INITIAL_INDEX = currentDataSource.indexOf(selectedHeight) !== -1
    ? currentDataSource.indexOf(selectedHeight)
    : (selectFtCm === "FT" ? heights.indexOf("4'0\"") : heightsCm.indexOf("170 cm"));


  useEffect(() => {
    if (scrollViewRef.current) {
      // --- FIX 2: Correct offset calculation for initial scroll ---
      // We need to scroll so the item at INITIAL_INDEX is at the top of the scroll view
      // The padding will then move it to the center.
      const offset = INITIAL_INDEX * MARK_HEIGHT;
      // --- END FIX 2 ---
      scrollViewRef.current.scrollTo({ y: offset, animated: false });
    }
  }, [selectFtCm]); // This dependency is correct

  const onSwitch = (type: any) => {
    if (onlyFt) return;
    if (type === "FT") {
      setSelectFtCm("FT");
      // Reset to original dataFilter or default 'FT'
      const ftHeight = (dataFilter && !dataFilter.includes("cm") && heights.indexOf(dataFilter) !== -1) ? dataFilter : "4'0\"";
      setSelectedHeight(ftHeight);
    } else {
      setSelectFtCm("CM");
      // Reset to original dataFilter or default 'CM'
      const cmHeight = (dataFilter && dataFilter.includes("cm") && heightsCm.indexOf(dataFilter) !== -1) ? dataFilter : "170 cm";
      setSelectedHeight(cmHeight);
    }
  };

  // --- FIX 3: Correct scroll handling logic ---
  const handleScroll = (event: any) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    // The index is simply the scroll offset divided by the height of each item
    const index = Math.round(yOffset / MARK_HEIGHT);

    if (index >= 0 && index < currentDataSource.length) {
      setSelectedHeight(currentDataSource[index]);
    }
  };
  // --- END FIX 3 ---

  const renderRulerMark = (item: any, index: any) => {
    // ... (No changes in this function)
    let markStyle = styles.smallMark;
    let markWidth = scale(25);
    let markText = null;
    if (selectFtCm === "FT") {
      const inches = index % 12;
      if (inches === 0) {
        markStyle = styles.largeMark;
        markWidth = scale(60);
        markText = item;
      } else if (inches === 6) {
        markWidth = scale(45);
      } else if (inches % 2 === 0) {
        markWidth = scale(30);
      }
    } else {
      const cm = parseInt(item);
      if (cm % 10 === 0) {
        markStyle = styles.largeMark;
        markWidth = scale(60);
        markText = item;
      } else if (cm % 5 === 0) {
        markWidth = scale(40);
      }
    }
    return (
      <View key={index} style={styles.rulerMarkContainer}>
        {markText && (
          <AppText
            type={TWELVE}
            weight={INTER_BOLD}
            color={WHITE}
            style={styles.markText}>
            {markText}
          </AppText>
        )}
        <View
          style={[
            styles.rulerMark,
            markStyle,
            {
              width: markWidth,
              backgroundColor:
                selectedHeight === item ? "#FDD2C1" : "#E0E0E0",
            },
          ]}
        />

      </View>
    );
  };
  const onSubmit = () => {
    if (filter) {
      if (isAdvanceFilter) {
        const dataToSave = {
          ...filterData,
          prefferredHeights: selectedHeight,
        };
        dispatch(setfilterData(dataToSave));
        NavigationService.goBack();
      } else {
        const data = {
          height: selectedHeight,
          fieldVisibility: { ...addProfileData?.fieldVisibility }
        };
        dispatch(editProfile(data))
      }
    } else {
      const data = {
        ...addProfileData,
        height: selectedHeight,
        fieldVisibility: { ...addProfileData?.fieldVisibility }
      };
      dispatch(setAddProfile(data))
      dispatch(turnOn({}))
      NavigationService.navigate(NAVIGATION_TRUN_ON_SCREEN)
      // NavigationService.navigate(NAVIGATION_EDUCATION_SCREEN)
    }
  }

  return (
    // ... (No changes in the JSX return)
    <AppSafeAreaView color={newColor.blackNew}>
      <FastImage source={applogo} resizeMode="contain" style={styles.logo} />
      <View style={styles.container}>
        <FastImage source={BananaHeight} resizeMode="cover" style={{ height: metrics.hp45, width: metrics.hp45, marginTop: metrics.hp10 }} />
        <View style={styles.rulerContainer}>
          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            snapToInterval={MARK_HEIGHT}
            decelerationRate="fast"
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{
              paddingTop: centerOffset,
              paddingBottom: centerOffset,
            }}
          >
            {currentDataSource.map(renderRulerMark)}
          </ScrollView>
        </View>
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <AppText type={EIGHTEEN} weight={SCHEHERAZADE_BOLD} color={WHITE}>
            How tall are you?
          </AppText>
          <AppText style={{ marginTop: -metrics.hp2 }} type={TWENTY_FOUR} weight={SCHEHERAZADE_BOLD} color={WHITE}>
            {selectedHeight}
          </AppText>
        </View>
      </View>
      <ImageBackground source={BottomLayer} resizeMode="stretch" style={styles.bottomLayer}>
        <TouchableOpacity activeOpacity={0.5} onPress={onSubmit} style={styles.phoneContainer}>
          <AppText weight={SCHEHERAZADE_BOLD} color={WHITE} type={TWENTY}>
            Next
          </AppText>
        </TouchableOpacity>
      </ImageBackground>
      {/* <HeaderCommon title={filter} />
      {filter ? <View style={styles.singleLine} /> : <></>}
      <View style={styles.container}>
        {filter ? <></> : <TopCommonLine icon={straightenIcon} datalist={datalist} />}
        <View style={{ paddingHorizontal: metrics.hp2 }}>
          {filter ? <></> : <DubleTextLine firstText={"How tall are you?"} />}
          <View style={styles.selectCm}>
            <TouchableOpacityView
              onPress={() => onSwitch("FT")}
              style={[
                styles.selectedBack,
                {
                  backgroundColor:
                    selectFtCm === "FT" ? colors.green : colors.lightBack,
                },
              ]}>
              <AppText
                type={TWELVE}
                color={selectFtCm === "FT" ? BLACK : OPECITY_DARK}
                weight={INTER_SEMI_BOLD}>
                FT
              </AppText>
            </TouchableOpacityView>
            {onlyFt ? null : (
              <TouchableOpacityView
                onPress={() => onSwitch("CM")}
                style={[
                  styles.selectedBack,
                  {
                    backgroundColor:
                      selectFtCm === "CM" ? colors.green : colors.lightBack,
                  },
                ]}>
                <AppText
                  type={TWELVE}
                  color={selectFtCm === "CM" ? BLACK : OPECITY_DARK}
                  weight={INTER_SEMI_BOLD}>
                  CM
                </AppText>
              </TouchableOpacityView>
            )}
          </View>
          <View style={styles.rulerContainer}>
            <ScrollView
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
              snapToInterval={MARK_HEIGHT}
              decelerationRate="fast"
              onScroll={handleScroll}
              scrollEventThrottle={16}
              contentContainerStyle={{
                paddingTop: centerOffset,
                paddingBottom: centerOffset,
              }}
            >
              {currentDataSource.map(renderRulerMark)}
            </ScrollView>
          </View>
          <AppText
            type={TWENTY_FOUR}
            weight={INTER_BOLD}
            color={BLACK}
            style={[
              styles.heightText,
              { top: filter ? metrics.hp8 : metrics.hp18 },
            ]}>
            {selectedHeight}
          </AppText>
        </View>
      </View>
      <LinearGradient start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }} style={{ height: metrics.hp19 }} colors={["#ffffff50", colors.white, colors.white]}>
        <View style={{ marginTop: metrics.hp9 }}>
          <GoButton
            onPress={() => onSubmit()}
            colortrue={selectedHeight}
            defaultVisible={true}
          />
        </View>
      </LinearGradient> */}
    </AppSafeAreaView>
  );
};

export default HeightScreen;

const styles = StyleSheet.create({
  // ... (No changes in styles)
  container: {
    marginTop: metrics.hp3,
    flex: 1,
  },
  selectCm: {
    height: metrics.hp5,
    backgroundColor: colors.lightBack,
    width: metrics.hp10,
    borderRadius: metrics.hp4,
    padding: metrics.hp0_2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectedBack: {
    height: metrics.hp5,
    width: metrics.hp5,
    borderRadius: metrics.hp50,
    alignItems: "center",
    justifyContent: "center",
  },
  heightText: {
    position: "absolute",
    top: metrics.hp18,
    left: metrics.hp2,
  },
  singleLine: {
    height: metrics.hp0_2,
    width: Screen.Width,
    backgroundColor: colors.nanoOpecity,
    marginTop: metrics.hp2,
  },
  rulerContainer: {
    position: "absolute",
    right: scale(0),
    top: verticalScale(50),
    height: verticalScale(400),
  },
  rulerMarkContainer: {
    height: MARK_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  rulerMark: {
    height: verticalScale(2),
  },
  smallMark: {
    width: scale(25),
  },
  largeMark: {
    width: scale(60),
  },
  markText: {
    marginLeft: scale(10),
    minWidth: scale(40),
    textAlign: "left",
  },
  logo: {
    height: metrics.hp7,
    width: metrics.hp25,
    alignSelf: "center",
    marginTop: metrics.hp8,

  },
  bottomLayer: {
    height: metrics.hp15,
    width: "100%",
    paddingVertical: metrics.hp2,
    alignItems: "center"
  },
  phoneContainer: {
    height: metrics.hp7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: metrics.hp0_1,
    borderColor: colors.white,
    marginHorizontal: metrics.hp2,
    marginTop: metrics.hp2,
    width:"90%"
  },
});
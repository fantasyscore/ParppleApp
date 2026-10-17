import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, View, ScrollView, ImageBackground } from "react-native";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import metrics from "../../assets/Metrics";
import { BananaHeight, BottomLayer } from "../../helper/ImageAssets";
import {
  AppText,
  EIGHTEEN,
  INTER_BOLD,
  SCHEHERAZADE_BOLD,
  TWELVE,
  TWENTY_FOUR,
  WHITE,
} from "../../common/AppText";
import { newColor } from "../../theme/colors";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_TRUN_ON_SCREEN } from "../../navigation/routes";
import { scale, verticalScale } from "react-native-size-matters";
import { useDispatch, useSelector } from "react-redux";
import { setAddProfile, setfilterData } from "../../slices/loginServices/authSlice";
import { editProfile, turnOn } from "../../actions/authActions";
import FastImage from "react-native-fast-image";
import { HEIGHTS_CM, HEIGHTS_FT } from "../../helper/heights";
import OnboardingLogo from "../../components/Onboarding/OnboardingLogo";
import OnboardingButton from "../../components/Onboarding/OnboardingButton";

const MARK_HEIGHT = verticalScale(20);

const HeightScreen = ({ route }: any) => {
  const dispatch = useDispatch();
  const addProfileData = useSelector((state: any) => state?.auth?.addProfileData);
  const filterData = useSelector((state: any) => state?.auth?.filterData);
  const filter = route?.params?.filter ?? "";
  const dataFilter = route?.params?.data ?? "";
  const onlyFt = route?.params?.onlyFt ?? false;
  const isAdvanceFilter = route?.params?.isAdvanceFilter ?? false;

  const getInitialState = () => {
    const defaultFt = "4'0\"";
    const defaultCm = "170 cm";

    if (!dataFilter) {
      return { unit: "FT", height: defaultFt };
    }

    if (dataFilter.includes("cm")) {
      // Check if the CM value is valid
      if (HEIGHTS_CM.indexOf(dataFilter) !== -1) {
        return { unit: "CM", height: dataFilter };
      }
      return { unit: "CM", height: defaultCm }; // Fallback for invalid CM
    } else {
      // Assume FT
      if (HEIGHTS_FT.indexOf(dataFilter) !== -1) {
        return { unit: "FT", height: dataFilter };
      }
      return { unit: "FT", height: defaultFt }; // Fallback for invalid FT
    }
  };

  const initialState = getInitialState();
  const [selectFtCm, setSelectFtCm] = useState(onlyFt ? "FT" : initialState.unit);
  const [selectedHeight, setSelectedHeight] = useState(initialState.height);

  const scrollViewRef = useRef<ScrollView>(null);
  const centerOffset = (verticalScale(400) / 2) - (MARK_HEIGHT / 2);
  const currentDataSource = (onlyFt || selectFtCm === "FT") ? HEIGHTS_FT : HEIGHTS_CM;

  // This logic is now simpler because the initial state is correct
  const INITIAL_INDEX = currentDataSource.indexOf(selectedHeight) !== -1
    ? currentDataSource.indexOf(selectedHeight)
    : (selectFtCm === "FT" ? HEIGHTS_FT.indexOf("4'0\"") : HEIGHTS_CM.indexOf("170 cm"));


  useEffect(() => {
    if (scrollViewRef.current) {
      // We need to scroll so the item at INITIAL_INDEX is at the top of the scroll view
      // The padding will then move it to the center.
      const offset = INITIAL_INDEX * MARK_HEIGHT;
      scrollViewRef.current.scrollTo({ y: offset, animated: false });
    }
  }, [selectFtCm]);

  const handleScroll = (event: any) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    // The index is simply the scroll offset divided by the height of each item
    const index = Math.round(yOffset / MARK_HEIGHT);

    if (index >= 0 && index < currentDataSource.length) {
      setSelectedHeight(currentDataSource[index]);
    }
  };

  const renderRulerMark = (item: any, index: any) => {
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
    <AppSafeAreaView color={newColor.blackNew}>
      <OnboardingLogo />
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
        <OnboardingButton label="Next" onPress={onSubmit} />
      </ImageBackground>
    </AppSafeAreaView>
  );
};

export default HeightScreen;

const styles = StyleSheet.create({
  container: {
    marginTop: metrics.hp3,
    flex: 1,
  },rulerContainer: {
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
  },  bottomLayer: {
    height: metrics.hp15,
    width: "100%",
    paddingVertical: metrics.hp2,
    alignItems: "center"
  },
});
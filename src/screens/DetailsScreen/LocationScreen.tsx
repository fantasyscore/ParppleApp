import React, { useEffect, useRef, useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { ImageBackground, StyleSheet, View } from "react-native";
import metrics from "../../assets/Metrics";
import { BottomLayer, mapIcon } from "../../helper/ImageAssets";
import { AppText, ELEVEN, fontSize, INTER_MEDIUM, OPECITY, SCHEHERAZADE_SEMI_BOLD, TWELVE, WHITE } from "../../common/AppText";
import FastImage from "react-native-fast-image";
import OnboardingLogo from "../../components/Onboarding/OnboardingLogo";
import OnboardingButton from "../../components/Onboarding/OnboardingButton";
import { colors, newColor } from "../../theme/colors";
import { useDispatch, useSelector } from "react-redux";
import { addProfile, loadSessionData } from "../../actions/authActions";
import { checkLocationPermission, EMPTY_LOCATION, fetchIpLocationPayload, fetchLocationPayload, LocationPayload, requestLocationPermission } from "../../services/locationService";

const LocationScreen = () => {
  const dispatch = useDispatch();
  const addProfileData = useSelector((state: any) => state?.auth?.addProfileData);
  const [submitting, setSubmitting] = useState(false);
  // Warm-start cache: if permission is already granted, fetch in the
  // background while the user reads the screen so Continue is instant.
  const prefetchedLocation = useRef<Promise<LocationPayload> | null>(null);

  useEffect(() => {
    console.log("[Location] Screen mounted, checking existing permission");
    (async () => {
      try {
        const granted = await checkLocationPermission();
        console.log("[Location] Existing permission granted:", granted);
        if (granted) {
          const promise = fetchLocationPayload();
          promise.catch((e) => {
            console.warn("[Location] Prefetch failed:", e);
            prefetchedLocation.current = null;
          });
          prefetchedLocation.current = promise;
        }
      } catch (error) {
        console.warn("[Location] Permission check error:", error);
      }
    })();
  }, []);

  const submitProfile = async (location: LocationPayload) => {
    const data = {
      ...addProfileData,
      ...location,
      fieldVisibility: { ...addProfileData?.fieldVisibility },
    };
    console.log("[Location] Final payload before addProfile():", data);
    const res: any = await (dispatch as any)(addProfile(data));
    // console.log(res,"resresresresres");
    
    // console.log("[Location] addProfile() responded, statusCode:", res?.statusCode);
    if (res?.statusCode == 200) {
      dispatch(loadSessionData());
    }
  };

  const onContinue = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      let location = EMPTY_LOCATION;
      console.log("[Location] Requesting location permission");
      const granted = await requestLocationPermission();
      console.log("[Location] Permission granted:", granted);
      if (granted) {
        try {
          location = await (prefetchedLocation.current ?? fetchLocationPayload());
        } catch (error) {
          console.warn("[Location] Exact location error:", error);
          location = await fetchIpLocationPayload();
        }
      } else {
        location = await fetchIpLocationPayload();
      }
      await submitProfile(location);
    } catch (error) {
      console.warn("[Location] Submit error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppSafeAreaView color={newColor.blackNew}>
      <OnboardingLogo />
      <AppText style={{ textAlign: "center", fontSize: fontSize(26), marginTop: metrics.hp1 }} weight={SCHEHERAZADE_SEMI_BOLD} color={WHITE}>
        So do you live around?
      </AppText>
      <AppText
        style={{ marginTop: -metrics.hp2, textAlign: "center", }}
        type={TWELVE}
        weight={INTER_MEDIUM}
        color={OPECITY}
      >
        Set your location so that other people around you{"\n"}
        could match with your profile.
      </AppText>
      <View style={{ paddingHorizontal: metrics.hp2 }}>
        <FastImage
          source={mapIcon}
          tintColor={colors.white}
          resizeMode="contain"
          style={styles.mapIcon}
        />
      </View>
      <ImageBackground source={BottomLayer} resizeMode="stretch" style={[styles.bottomLayer]}>
        <AppText style={{ textAlign: "center", marginTop: metrics.hp1_2, marginHorizontal: metrics.hp3 }} type={ELEVEN} color={OPECITY} weight={INTER_MEDIUM}>
          Want to find more people around you? Allow access to your location
        </AppText>
        <OnboardingButton label="Continue" onPress={onContinue} loading={submitting} />
      </ImageBackground>
    </AppSafeAreaView>
  );
};

export default LocationScreen;

const styles = StyleSheet.create({
  mapIcon: {
    height: metrics.hp20,
    width: metrics.hp20,
    alignSelf: "center",
    marginTop: metrics.hp20,
  },
  bottomLayer: {
    height: metrics.hp20,
    width: "100%",
    paddingVertical: metrics.hp2,
    alignItems: "center",
    position: "absolute",
    bottom: 0
  },
});

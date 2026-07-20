import React, { useEffect, useRef, useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { ActivityIndicator, ImageBackground, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import metrics from "../../assets/Metrics";
import { applogo, BottomLayer, mapIcon } from "../../helper/ImageAssets";
import { AppText, ELEVEN, fontSize, INTER_MEDIUM, OPECITY, SCHEHERAZADE_BOLD, SCHEHERAZADE_SEMI_BOLD, TWELVE, TWENTY, WHITE } from "../../common/AppText";
import FastImage from "react-native-fast-image";
import { colors, newColor } from "../../theme/colors";
import { check, checkMultiple, request, requestMultiple, PERMISSIONS, RESULTS } from "react-native-permissions";
import Geolocation, { GeoPosition } from "react-native-geolocation-service";
import { useDispatch, useSelector } from "react-redux";
import { toastAlert } from "../../actions/UploadImageActions";
import { addProfile, discoverProfile, getNewMatches, getProfile, likeByOther, likeYou, listProfiles, viewProfileByOther, youView } from "../../actions/authActions";

const GEOCODE_API_KEY = "AIzaSyAuzRbXX8dWA2n4QGD0ja-609e1wXMkHjI";

// Request BOTH fine and coarse on Android. With coarse-only, Android 12+
// throttles approximate fixes to roughly once every few minutes, so a
// getCurrentPosition call with a 10s timeout almost always times out
// unless a cached fix happens to exist. Fine permission lets the fused
// provider return a fresh network-based fix in a couple of seconds
// (the user can still downgrade to "Approximate" in the system dialog).
const ANDROID_LOCATION_PERMISSIONS = [
  PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
];

const checkLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === "ios") {
    return (await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)) === RESULTS.GRANTED;
  }
  const statuses = await checkMultiple(ANDROID_LOCATION_PERMISSIONS);
  return Object.values(statuses).some((s) => s === RESULTS.GRANTED);
};

const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === "ios") {
    return (await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)) === RESULTS.GRANTED;
  }
  const statuses = await requestMultiple(ANDROID_LOCATION_PERMISSIONS);
  // Either grant is enough — "Approximate" grants COARSE only.
  return Object.values(statuses).some((s) => s === RESULTS.GRANTED);
};

interface LocationPayload {
  coordinates: { long: number | string; lat: number | string };
  city: string;
  state: string;
  country: string;
}

const EMPTY_LOCATION: LocationPayload = {
  coordinates: { long: "", lat: "" },
  city: "",
  state: "",
  country: "",
};

const getPositionOnce = (options: object) =>
  new Promise<GeoPosition>((resolve, reject) =>
    Geolocation.getCurrentPosition(resolve, reject, options)
  );

// Balanced (network/fused) first — resolves in 1-3s when Play Services has
// a fix. On timeout (code 3) or unavailable (code 2), retry once with high
// accuracy and a longer window to let GPS warm up.
const getPosition = async (): Promise<GeoPosition> => {
  try {
    return await getPositionOnce({
      enableHighAccuracy: false,
      timeout: 20000,
      maximumAge: 10000,
      forceRequestLocation: true,
      showLocationDialog: true, // prompt to enable location services if off
    });
  } catch (error: any) {
    if (error?.code === 3 || error?.code === 2) {
      console.warn("[Location] Balanced fix failed (code", error?.code, ") — retrying with high accuracy");
      return await getPositionOnce({
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 30000,
        forceRequestLocation: true,
        showLocationDialog: true,
      });
    }
    throw error;
  }
};

const reverseGeocode = async (latitude: number, longitude: number) => {
  console.log("[Location] Reverse geocoding started for", latitude, longitude);
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GEOCODE_API_KEY}`
  );

  const data = await response.json();
  if (!data.results?.length) {
    console.warn("[Location] Geocode returned no results, status:", data.status);
    return { city: "", state: "", country: "" };
  }

  const components = data.results[0].address_components;
  const getComponent = (type: string) =>
    components.find((c: any) => c.types.includes(type))?.long_name ?? "";

  return {
    city:
      getComponent("locality")?.trim().toLowerCase() ||
      getComponent("administrative_area_level_2")?.trim().toLowerCase() ||
      "",
    state: getComponent("administrative_area_level_1")?.trim().toLowerCase() || "",
    country: getComponent("country")?.trim().toLowerCase() || "",
  };
};

const fetchLocationPayload = async (): Promise<LocationPayload> => {
  console.log("[Location] Starting location fetch");
  const position = await getPosition();
  const { latitude, longitude } = position.coords;
  console.log("[Location] Coordinates received:", latitude, longitude);

  let address = { city: "", state: "", country: "" };
  try {
    address = await reverseGeocode(latitude, longitude);
    console.log("[Location] City/State/Country received:", address);
  } catch (error) {
    console.warn("[Location] Geocoding error:", error);
  }
  return {
    coordinates: { long: longitude, lat: latitude },
    ...address,
  };
};

const fetchIpLocationPayload = async (): Promise<LocationPayload> => {
  console.log("[Location] Starting IP location fallback fetch");
  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();
    
    if (data.error) {
      console.warn("[Location] IP Location API returned error:", data.reason);
      return EMPTY_LOCATION;
    }

    console.log("[Location] IP Location fallback received:", data.city, data.region, data.country_name);
    return {
      coordinates: { long: "", lat: "" },
      city: data.city?.trim().toLowerCase() || "",
      state: data.region?.trim().toLowerCase() || "",
      country: data.country_name?.trim().toLowerCase() || "",
    };
  } catch (error) {
    console.warn("[Location] IP Location fetch failed:", error);
    return EMPTY_LOCATION;
  }
};


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
      dispatch(getProfile(true));
      dispatch(discoverProfile());
      dispatch(getNewMatches());
      dispatch(listProfiles());
      dispatch(discoverProfile());
      dispatch(likeByOther());
      dispatch(likeYou());
      dispatch(viewProfileByOther());
      dispatch(youView());
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
      <FastImage source={applogo} resizeMode="contain" style={styles.logo} />
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
          resizeMode="contain"
          style={styles.mapIcon}
        />
      </View>
      <ImageBackground source={BottomLayer} resizeMode="stretch" style={[styles.bottomLayer]}>
        <AppText style={{ textAlign: "center", marginTop: metrics.hp1_2, marginHorizontal: metrics.hp3 }} type={ELEVEN} color={OPECITY} weight={INTER_MEDIUM}>
          Want to find more people around you? Allow access to your location
        </AppText>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={onContinue}
          disabled={submitting}
          style={[styles.phoneContainer, submitting && { opacity: 0.6 }]}
        >
          {submitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <AppText weight={SCHEHERAZADE_BOLD} color={WHITE} type={TWENTY}>
              Continue
            </AppText>
          )}
        </TouchableOpacity>
      </ImageBackground>
    </AppSafeAreaView>
  );
};

export default LocationScreen;

const styles = StyleSheet.create({
  logo: {
    height: metrics.hp7,
    width: metrics.hp25,
    alignSelf: "center",
    marginTop: metrics.hp8,
  },
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
  phoneContainer: {
    height: metrics.hp7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: metrics.hp0_1,
    borderColor: colors.white,
    marginHorizontal: metrics.hp2,
    marginTop: metrics.hp2,
    width: "90%"
  },
});

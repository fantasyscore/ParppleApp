import { Platform } from "react-native";
import { check, checkMultiple, request, requestMultiple, PERMISSIONS, RESULTS } from "react-native-permissions";
import Geolocation, { GeoPosition } from "react-native-geolocation-service";

// Reverse geocoding during onboarding. Restrict this key to the app's package / bundle id in Google Cloud.
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

export const checkLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === "ios") {
    return (await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)) === RESULTS.GRANTED;
  }
  const statuses = await checkMultiple(ANDROID_LOCATION_PERMISSIONS);
  return Object.values(statuses).some((s) => s === RESULTS.GRANTED);
};

export const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === "ios") {
    return (await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)) === RESULTS.GRANTED;
  }
  const statuses = await requestMultiple(ANDROID_LOCATION_PERMISSIONS);
  // Either grant is enough — "Approximate" grants COARSE only.
  return Object.values(statuses).some((s) => s === RESULTS.GRANTED);
};

export interface LocationPayload {
  coordinates: { long: number | string; lat: number | string };
  city: string;
  state: string;
  country: string;
}

export const EMPTY_LOCATION: LocationPayload = {
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

export const reverseGeocode = async (latitude: number, longitude: number) => {
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

export const fetchLocationPayload = async (): Promise<LocationPayload> => {
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

export const fetchIpLocationPayload = async (): Promise<LocationPayload> => {
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

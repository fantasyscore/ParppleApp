import React, { useEffect, useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { Alert, Platform, StyleSheet, View } from "react-native";
import DubleTextLine from "../../common/DubleTextLine";
import TopCommonLine from "../../common/TopCommonLine";
import HeaderCommon from "../../common/HeaderCommon";
import metrics from "../../assets/Metrics";
import { locIcon, mapIcon, mockLocationIcon } from "../../helper/ImageAssets";
import { AppText, FORTEEN, INTER_BOLD, INTER_MEDIUM, INTER_SEMI_BOLD, OPECITY, SIXTEEN, TWELVE } from "../../common/AppText";
import FastImage from "react-native-fast-image";
import { colors } from "../../theme/colors";
import { check, request, PERMISSIONS, RESULTS, openSettings } from "react-native-permissions";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import MapView, { MapPressEvent, Marker } from "react-native-maps";
import Geolocation, { GeoPosition } from "react-native-geolocation-service";
import { useDispatch, useSelector } from "react-redux";
import { setAddProfile } from "../../slices/loginServices/authSlice";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_PRONOUN_SCREEN } from "../../navigation/routes";
import { getAddressFromCoordinates } from "../../helper/utility";
import { Screen } from "../../theme/dimens";
import LinearGradient from "react-native-linear-gradient";
import GoButton from "../../common/GoButton";
import { toastAlert } from "../../actions/UploadImageActions";

const LocationScreen = () => {
  const dispatch = useDispatch();
  const addProfileData = useSelector((state: any) => state?.auth?.addProfileData);
  const datalist = new Array(11).fill(null).map((_, index) => ({ id: String(index) }));
  const [region, setRegion] = useState({
    latitude: 28.6139, // default Delhi
    longitude: 77.2090,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [markerCoords, setMarkerCoords] = useState<{ latitude: number; longitude: number, latitudeDelta:Number, longitudeDelta:Number }>({
    latitude: region?.latitude, // default Delhi
    longitude: region?.longitude,
    latitudeDelta: region?.latitudeDelta,
    longitudeDelta: region?.longitudeDelta,
  });
  const [permissionAllow, setPermissionAllow] = useState(false);
  const [addressName, setAddressName] = useState("")
  const requestLocationPermission = async () => {
    try {
      let permission;
      if (Platform.OS === "ios") {
        permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
      } else {
        permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
      }
      const result = await request(permission);
      if (result === RESULTS.GRANTED) {
        setPermissionAllow(true);
      } else if (result === RESULTS.BLOCKED) {
        Alert.alert(
          "Permission Required",
          "Please enable location permission from settings."
        );
      } else {
        setPermissionAllow(false);
      }
    } catch (error) {
      console.warn("Permission error:", error);
    }
  };
  useEffect(() => {
    if (permissionAllow) {
      getCurrentLocation();
    }
  }, [permissionAllow]);
  const getCurrentLocation = async () => {
    try {
      if (!permissionAllow) return;

      Geolocation.getCurrentPosition(
        async (position: GeoPosition) => {
          const { latitude, longitude } = position.coords;
          setRegion((prev) => ({
            ...prev,
            latitude,
            longitude,
          }));
          const apiKey = "AIzaSyCRmGVNKRyXVUc1gAzuns3zZ7wKJpZUM78";
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
          );
          const data = await response.json();
          console.log(data,"datadatadata");
          
          if (data.results && data.results.length > 0) {
            const addressComponents = data.results[0].address_components;
            const getComponent = (type: string) => {
              const comp = addressComponents.find((c: any) =>
                c.types.includes(type)
              );
              return comp ? comp.long_name : "";
            };
            const city =
              getComponent("locality")?.trim().toLowerCase() ||
              getComponent("administrative_area_level_2")?.trim().toLowerCase() ||
              "";
            const state = getComponent("administrative_area_level_1")?.trim().toLowerCase() || "";
            const country = getComponent("country")?.trim().toLowerCase() || "";
            const formattedAddress = data.results[0].formatted_address?.trim().toLowerCase();
            setAddressName(formattedAddress);
            const dataToSave = {
              ...addProfileData,
              coordinates: { long: longitude, lat: latitude },
              city,
              state,
              country,
            };
            dispatch(setAddProfile(dataToSave));
            console.log("📍 Location data:", dataToSave);
          } else {
            Alert.alert("Error", "Unable to fetch address. Try again later.");
          }
        },
        (error) => {
          console.warn("Location error:", error);
          Alert.alert("Error", "Unable to get location. Please try again.");
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 10000,
          forceRequestLocation: true,
        }
      );
    } catch (err) {
      console.error("getCurrentLocation crash:", err);
    }
  };
  const requestLocationPermissionCheck = async () => {
    try {
      let permission;
      if (Platform.OS === "ios") {
        permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
      } else {
        permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
      }
      const result = await check(permission);
      if (result === RESULTS.GRANTED) {
        setPermissionAllow(true);
      } else {
        setPermissionAllow(false);
      }
    } catch (error) {
      console.warn("Permission check error:", error);
    }
  };
  
  useEffect(() => {
    requestLocationPermissionCheck();
  }, []);

  const onSubmit = () => {
    // if (!addressName) return toastAlert.showToastError("Please wait to fetch location")
    NavigationService.navigate(NAVIGATION_PRONOUN_SCREEN)
  };
  const handleMapPress = async (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarkerCoords((prev) => ({
      ...prev,
      latitude,
      longitude,
    }));
    const apiKey = "AIzaSyCRmGVNKRyXVUc1gAzuns3zZ7wKJpZUM78";
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
    );
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const addressComponents = data.results[0].address_components;
      const getComponent = (type: string) => {
        const comp = addressComponents.find((c: any) =>
          c.types.includes(type)
        );
        return comp ? comp.long_name : "";
      };
      const city =
        getComponent("locality")?.trim().toLowerCase() ||
        getComponent("administrative_area_level_2")?.trim().toLowerCase() ||
        "";
      const state = getComponent("administrative_area_level_1")?.trim().toLowerCase() || "";
      const country = getComponent("country")?.trim().toLowerCase() || "";
      const formattedAddress = data.results[0].formatted_address?.trim().toLowerCase();
      setAddressName(formattedAddress);
      const dataToSave = {
        ...addProfileData,
        coordinates: { long: longitude, lat: latitude },
        city,
        state,
        country,
      };
      dispatch(setAddProfile(dataToSave));
      console.log("📍 Location data:", dataToSave);
    } else {
      Alert.alert("Error", "Unable to fetch address. Try again later.");
    }
  };
  return (
    <AppSafeAreaView>
      <HeaderCommon />
      <View style={styles.container}>
        <TopCommonLine icon={locIcon} datalist={datalist} />

        <View>
          <View style={{ paddingHorizontal: metrics.hp2 }}>
            <DubleTextLine firstText={"So do you live around?"} />
            <AppText
              style={{ marginTop: -metrics.hp2 }}
              type={TWELVE}
              weight={INTER_MEDIUM}
              color={OPECITY}
            >
              Set your location so that other people around you{"\n"}
              could match with your profile.
            </AppText>
          </View>
          {permissionAllow ? (
            <>
              <MapView
                style={styles.map}
                region={region}
                showsUserLocation={true}
                onPress={handleMapPress}>
                <Marker
                  coordinate={markerCoords} />
              </MapView>

              <View style={{ flexDirection: "row", alignItems: "center", marginTop: metrics.hp2, borderBottomWidth: metrics.hp0_1, borderBottomColor: colors.lightBlack, marginHorizontal: metrics.hp2 }}>
                <AppText numberOfLines={2} style={{ marginBottom: metrics.hp1 }} type={SIXTEEN} weight={INTER_BOLD}>
                  {addressName}
                </AppText>
              </View>
              <LinearGradient style={{ marginTop: metrics.hp3 }} start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }} colors={["#FFFFFF00", colors.white, colors.white]}>
                <GoButton colortrue={addressName} onPress={() => onSubmit()} />
              </LinearGradient>
            </>
          ) : (
            <View style={{ paddingHorizontal: metrics.hp2 }}>
              <FastImage
                source={mapIcon}
                resizeMode="contain"
                style={styles.mapIcon}
              />
              <TouchableOpacityView
                onPress={requestLocationPermission}
                style={styles.allowButton}>
                <AppText type={FORTEEN} weight={INTER_SEMI_BOLD}>
                  Allow device location
                </AppText>
              </TouchableOpacityView>
            </View>
          )}

        </View>
      </View>
    </AppSafeAreaView>
  );
};

export default LocationScreen;

const styles = StyleSheet.create({
  container: {
    marginTop: metrics.hp3,
    flex: 1,
  },
  map: {
    height: Screen.Height / 2,
    borderRadius: metrics.hp2,
    marginTop: metrics.hp4,
  },
  mapIcon: {
    height: metrics.hp20,
    width: metrics.hp20,
    alignSelf: "center",
    marginTop: metrics.hp20,
  },
  allowButton: {
    height: metrics.hp5,
    width: metrics.hp25,
    borderWidth: 1,
    borderColor: colors.lightBlack,
    borderRadius: metrics.hp3,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: metrics.hp6,
  },
});

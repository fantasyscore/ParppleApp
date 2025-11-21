import React, { useEffect } from "react";
import { AppSafeAreaView } from "../common/AppSafeAreaView";
import { useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { USER_TOKEN_KEY } from "../helper/Constants";
import { discoverProfile, getProfile, listProfiles } from "../actions/authActions";
import NavigationService from "../navigation/NavigationService";
import { NAVIGATION_WELCOME_SCREEN } from "../navigation/routes";
import FastImage from "react-native-fast-image";
import { DatingAuthLoding } from "../helper/ImageAssets";
import metrics from "../assets/Metrics";
import { SafeAreaView } from "react-native";
import HourglassLoader from "./LoaderAnimation";

const AuthLoding = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    bootstrapAsync();
  }, []);
  const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem(USER_TOKEN_KEY);
        if (token) {
          dispatch(listProfiles());
          dispatch(getProfile(true));
          dispatch(discoverProfile())
        } else {
          NavigationService.navigate(NAVIGATION_WELCOME_SCREEN);
        }
      } catch (e) {
        console.log(e);
      }
    };

  return (
    <AppSafeAreaView style={{alignItems:"center", justifyContent:"center"}}>
      {/* <HourglassLoader/> */}
    </AppSafeAreaView>
  )
};
export default AuthLoding;
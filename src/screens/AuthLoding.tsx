import React, { useEffect } from "react";
import { AppSafeAreaView } from "../common/AppSafeAreaView";
import { useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { USER_TOKEN_KEY } from "../helper/Constants";
import { discoverProfile, getNewMatches, getProfile, likeByOther, likeYou, listProfiles, turnOn, viewProfileByOther, youView } from "../actions/authActions";
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
        // Dispatch actions safely - they should handle their own errors
        try {
          dispatch(listProfiles());
          dispatch(getProfile(true));
          dispatch(discoverProfile());
          dispatch(getNewMatches());
          dispatch(likeByOther());
          dispatch(likeYou());
          dispatch(viewProfileByOther());
          dispatch(youView());
          dispatch(turnOn({}))
        } catch (dispatchError) {
          console.error('[AuthLoading] Error dispatching actions:', dispatchError);
          // Don't crash - continue with navigation if token exists
        }
      } else {
        // Ensure navigation is ready before navigating
        // NavigationService will queue if not ready, but add extra safety
        const navigateToWelcome = () => {
          try {
            if (NavigationService.isNavigationReady()) {
              NavigationService.reset(NAVIGATION_WELCOME_SCREEN);
            } else {
              // Retry after a short delay if navigation not ready
              console.log('[AuthLoading] Navigation not ready, retrying in 300ms');
              setTimeout(() => {
                if (NavigationService.isNavigationReady()) {
                  NavigationService.reset(NAVIGATION_WELCOME_SCREEN);
                } else {
                  // NavigationService will queue it, so this is safe
                  NavigationService.reset(NAVIGATION_WELCOME_SCREEN);
                }
              }, 300);
            }
          } catch (navError) {
            console.error('[AuthLoading] Navigation error:', navError);
            // Retry once more after delay
            setTimeout(() => {
              try {
                NavigationService.reset(NAVIGATION_WELCOME_SCREEN);
              } catch (retryError) {
                console.error('[AuthLoading] Navigation retry failed:', retryError);
                // NavigationService should have queued it, so app won't crash
              }
            }, 1000);
          }
        };
        navigateToWelcome();
      }
    } catch (e) {
      console.error('[AuthLoading] Bootstrap error:', e);
      // On error, try to reset to welcome screen as fallback
      try {
        NavigationService.reset(NAVIGATION_WELCOME_SCREEN);
      } catch (navError) {
        console.error('[AuthLoading] Fallback navigation failed:', navError);
        // Don't crash - NavigationService will queue it
      }
    }
  };

  return (
    <AppSafeAreaView style={{ alignItems: "center", justifyContent: "center" }}>
      {/* <HourglassLoader/> */}
    </AppSafeAreaView>
  )
};
export default AuthLoding;
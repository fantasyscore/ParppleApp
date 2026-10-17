import React, { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { USER_TOKEN_KEY } from "../helper/Constants";
import { appOperation } from "../appOperation";
import { loadSessionData } from "../actions/authActions";
import NavigationService from "../navigation/NavigationService";
import { NAVIGATION_WELCOME_SCREEN } from "../navigation/routes";
import { ActivityIndicator, ImageBackground, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import SplashScreen from "react-native-splash-screen";
import { config } from "../config/config";
import { newColor } from "../theme/colors";
import { INTER_MEDIUM } from "../common/AppText";
import { splashImage } from "../helper/ImageAssets";

const REACHABILITY_TIMEOUT_MS = 10000;
const NAVIGATION_READY_POLL_MS = 25;
const NAVIGATION_READY_TIMEOUT_MS = 5000;
// If the splash image is slow to load, don't keep the native splash up forever
const SPLASH_HIDE_FALLBACK_MS = 1000;

const AuthLoding = () => {
  const dispatch = useDispatch();
  const [loadingState, setLoadingState] = useState<'checking' | 'error' | 'no-internet'>('checking');
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const splashHiddenRef = useRef(false);
  // Set once a logged-out user has been sent to Welcome (that needs no network, so a failed probe is moot)
  const navigatedRef = useRef(false);

  // The native splash stays up until this screen has drawn the same artwork, so the hand-over is invisible
  const hideNativeSplash = () => {
    if (splashHiddenRef.current) return;
    splashHiddenRef.current = true;
    try {
      SplashScreen.hide();
    } catch {
      // The splash screen may already be gone
    }
  };

  useEffect(() => {
    const timer = setTimeout(hideNativeSplash, SPLASH_HIDE_FALLBACK_MS);
    return () => {
      clearTimeout(timer);
      // This screen can be replaced (e.g. straight to Welcome) before the image has loaded or the fallback
      // timer fires; without this the native splash would never be dismissed and covers the app forever.
      hideNativeSplash();
    };
  }, []);

  useEffect(() => {
    checkAndBootstrap();
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  const checkBackendReachability = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REACHABILITY_TIMEOUT_MS);
      try {
        await fetch(config.BASE_URL, { method: 'HEAD', signal: controller.signal });
      } finally {
        clearTimeout(timeoutId);
      }
      // As long as we get any response, the backend is reachable
      return true;
    } catch (e) {
      // Network error, DNS failure, or timeout
      return false;
    }
  };

  const listenForConnection = () => {
    if (!unsubscribeRef.current) {
      unsubscribeRef.current = NetInfo.addEventListener(state => {
        if (state.isConnected && state.isInternetReachable !== false) {
          if (unsubscribeRef.current) {
            unsubscribeRef.current();
            unsubscribeRef.current = null;
          }
          checkAndBootstrap();
        }
      });
    }
  };

  const checkAndBootstrap = async () => {
    setLoadingState('checking');
    navigatedRef.current = false;
    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        setLoadingState('no-internet');
        listenForConnection();
        return;
      }

      // The reachability probe and the session bootstrap run side by side: the probe only decides whether
      // to show the error screen, so it no longer delays loading the user's data.
      const reachability = checkBackendReachability();
      const bootstrap = bootstrapAsync();
      if (!(await reachability)) {
        if (!navigatedRef.current) {
          setLoadingState('error');
          listenForConnection(); // Also listen for network changes if backend is down (e.g. captive portal)
        }
        return;
      }
      await bootstrap;
    } catch (e) {
      setLoadingState('error');
    }
  };

  // Navigation actions fired before the navigator is ready are dropped (see NavigationService), so on a
  // cold start wait for it before navigating or loading data that navigates when it arrives.
  const waitForNavigationReady = async () => {
    const startedAt = Date.now();
    while (!NavigationService.isNavigationReady() && Date.now() - startedAt < NAVIGATION_READY_TIMEOUT_MS) {
      await new Promise((resolve) => setTimeout(resolve, NAVIGATION_READY_POLL_MS));
    }
  };

  const goToWelcome = () => {
    navigatedRef.current = true;
    NavigationService.reset(NAVIGATION_WELCOME_SCREEN);
  };

  const bootstrapAsync = async () => {
    try {
      const [token] = await Promise.all([AsyncStorage.getItem(USER_TOKEN_KEY), waitForNavigationReady()]);
      if (token) {
        // Make sure requests carry the token even if the startup hook has not applied it yet
        appOperation.setCustomerToken(token);
        // Fetching the feed also moves the user into the main tabs
        dispatch(loadSessionData());
      } else {
        goToWelcome();
      }
    } catch (e) {
      setLoadingState('error');
    }
  };

  return (
    // Same artwork as the native launch screen, so the loader appears on top of the splash
    <ImageBackground source={splashImage} resizeMode="stretch" style={styles.container} onLoadEnd={hideNativeSplash}>
      {loadingState === 'checking' && (
        <ActivityIndicator size="large" color="#FFFFFF" />
      )}
      
      {loadingState === 'no-internet' && (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#FFFFFF" style={{ marginBottom: 20 }} />
          <Text style={styles.errorText}>Waiting for network...</Text>
        </View>
      )}

      {loadingState === 'error' && (
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>Unable to connect to the server.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={checkAndBootstrap}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: newColor.blackNew,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: INTER_MEDIUM,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#333333',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#555555',
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: INTER_MEDIUM,
  },
});

export default AuthLoding;
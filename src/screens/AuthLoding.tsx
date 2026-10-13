import React, { useEffect, useState, useRef } from "react";
import { AppSafeAreaView } from "../common/AppSafeAreaView";
import { useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { USER_TOKEN_KEY } from "../helper/Constants";
import { discoverProfile, getNewMatches, getProfile, getRecentMatches, likeByOther, likeYou, listProfiles, turnOn, viewProfileByOther, youView } from "../actions/authActions";
import NavigationService from "../navigation/NavigationService";
import { NAVIGATION_WELCOME_SCREEN } from "../navigation/routes";
import { ActivityIndicator, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { config } from "../config/config";
import { newColor } from "../theme/colors";
import { INTER_MEDIUM } from "../common/AppText";

const AuthLoding = () => {
  const dispatch = useDispatch();
  const [loadingState, setLoadingState] = useState<'checking' | 'error' | 'no-internet'>('checking');
  const unsubscribeRef = useRef<(() => void) | null>(null);

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
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      const response = await fetch(config.BASE_URL, {
        method: 'HEAD',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
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
    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        setLoadingState('no-internet');
        listenForConnection();
        return;
      }

      // Check if backend is actually reachable before dispatching API actions
      const isReachable = await checkBackendReachability();
      if (!isReachable) {
        setLoadingState('error');
        listenForConnection(); // Also listen for network changes if backend is down (e.g. captive portal)
        return;
      }

      await bootstrapAsync();
    } catch (e) {
      setLoadingState('error');
    }
  };

  const bootstrapAsync = async () => {
    try {
      const token = await AsyncStorage.getItem(USER_TOKEN_KEY);
      if (token) {
        try {
          dispatch(listProfiles());
          dispatch(getProfile(true));
          dispatch(discoverProfile());
          dispatch(getNewMatches());
          dispatch(getRecentMatches());
          dispatch(likeByOther());
          dispatch(likeYou());
          dispatch(viewProfileByOther());
          dispatch(youView());
          dispatch(turnOn({}))
        } catch (dispatchError) {
          console.error('[AuthLoading] Error dispatching actions:', dispatchError);
        }
      } else {
        const navigateToWelcome = () => {
          try {
            if (NavigationService.isNavigationReady()) {
              NavigationService.reset(NAVIGATION_WELCOME_SCREEN);
            } else {
              setTimeout(() => {
                if (NavigationService.isNavigationReady()) {
                  NavigationService.reset(NAVIGATION_WELCOME_SCREEN);
                } else {
                  NavigationService.reset(NAVIGATION_WELCOME_SCREEN);
                }
              }, 300);
            }
          } catch (navError) {
            setTimeout(() => {
              try {
                NavigationService.reset(NAVIGATION_WELCOME_SCREEN);
              } catch (retryError) {}
            }, 1000);
          }
        };
        navigateToWelcome();
      }
    } catch (e) {
      setLoadingState('error');
    }
  };

  return (
    <View style={styles.container}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: newColor.blackNew || '#000000',
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
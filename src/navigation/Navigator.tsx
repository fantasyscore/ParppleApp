import { createNativeStackNavigator, NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { DarkTheme, NavigationContainer, Theme } from "@react-navigation/native";
import "react-native-gesture-handler";
import NavigationService from "./NavigationService";
import * as routes from "./routes";
import * as React from "react";
import { logScreenView } from "../services/analyticsService";
import { BottomTabBarProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import WelcomeScreen from "../screens/SigninScreen/WelcomeScreen";
import DobScreen from "../screens/DetailsScreen/DobScreen";
import LocationScreen from "../screens/DetailsScreen/LocationScreen";
import GanderScreen from "../screens/DetailsScreen/GanderScreen";
import AddPhotoScreen from "../screens/DetailsScreen/AddPhotosScreen";
import ChatsScreen from "../screens/ChatScreens/ChatsScreen";
import LikesYouScreen from "../screens/LikesYouScreens/LikesYouScreen";
import MatchScreen from "../screens/HomeScreens/MatchScreen";
import EditProfileScreen from "../screens/ProfileScreens/EditProfileScreen";
import SubscriptionScreen from "../screens/ProfileScreens/SubscriptionScreen";
import SettingScreen from "../screens/ProfileScreens/SettingScreen";
import TakingScreen from "../screens/ChatScreens/TakingScreen";
import ReportScreen from "../screens/ProfileScreens/ReportScreen";
import ReportCommonScreen from "../screens/ProfileScreens/ReportCommonScreen";
import OtherReport from "../screens/ProfileScreens/OtherReport";
import SuceesReporting from "../screens/ProfileScreens/SuceesReporting";
import ToastMessage from "../common/ToastMessage";
import GlobalNotificationManager from "../common/GlobalNotificationManager";
import InternetConnectionBanner from "../common/InternetConnectionBanner";
import AuthLoding from "../screens/AuthLoding";
import PeopleScreen from "../screens/HomeScreens/HomeScreen";
import CrushNotePurchase from "../screens/ProfileScreens/CrushNotePurchase";
import AllMatchesScreen from "../screens/ChatScreens/AllMatchesScreen";
import BotChatScreen from "../screens/ChatScreens/BotChatScreen";
import ProfileScreenAndroid from "../screens/ProfileScreens/ProfileScreenAndroid";
import CustomTabBarAndroid from "../common/CustomTabBarAndroid";
import TrunOnScreen from "../screens/DetailsScreen/TrunOnScreen";
import ViewYouScreen from "../screens/LikesYouScreens/ViewYouScreen";
import ProfilePreviewNew from "../screens/ProfileScreens/ProfilePreviewNew";
import { newColor } from "../theme/colors";
import HeightScreen from "../screens/DetailsScreen/HeightScreen";
import CrushNotesSender from "../screens/HomeScreens/CrushNotesSender";

// ─────────────────────────────────────────────────────────────────────────────
// PERFORMANCE: everything below is created ONCE at module scope.
// Previously the navigators + screen components were re-created inside the
// Navigator component body, so any re-render rebuilt the whole navigation
// tree (full screen remounts → white flash + lag).
// ─────────────────────────────────────────────────────────────────────────────

const Stack = createNativeStackNavigator();
const BottomTab = createBottomTabNavigator();

// Dark navigation theme: react-navigation's DEFAULT theme paints every
// scene/container WHITE. During a card transition the (partially transparent)
// incoming/outgoing cards reveal that white background — that is the white
// flash. Painting the whole navigation tree with the app color removes it.
const AppNavigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: newColor.blackNew, // #212123 behind every screen
    card: newColor.blackNew,       // #212123 behind every stack card
    border: newColor.blackNew,
  },
};

// Shared stack options:
// - cardStyle: opaque #212123 card so no underlying surface is ever visible
// - forHorizontalIOS: smooth right-to-left slide, fully native-driver
//   (Instagram/WhatsApp-style push), instead of the platform default
//   scale/fade which reveals the background under the card
// - detachPreviousScreen (default true) keeps memory low after transition
const defaultStackScreenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: newColor.blackNew },
  animation: 'slide_from_right',
};

const renderTabBar = (props: BottomTabBarProps) => <CustomTabBarAndroid {...props} />;

const tabScreenOptions = {
  headerShown: false,
  // Opaque app-colored scene container: prevents white flash when switching tabs
  sceneStyle: { backgroundColor: newColor.blackNew },
  // Keep already-visited tabs mounted (default) but render them lazily on
  // first visit so the initial tab mount stays cheap.
  lazy: true,
};

const BottomMainTab = () => {
  return (
    <BottomTab.Navigator id={undefined} initialRouteName={routes.NAVIGATION_PEOPLE_SCREEN}
      backBehavior="initialRoute"
      screenOptions={tabScreenOptions}
      tabBar={renderTabBar}>
      <BottomTab.Screen name={routes.NAVIGATION_PEOPLE_SCREEN} component={PeopleScreen} />
      <BottomTab.Screen name={routes.NAVIGATION_LIKES_YOU_SCREEN} component={LikesYouScreen} />
      <BottomTab.Screen name={routes.NAVIGATION_VIEW_YOU_SCREEN_SCREEN} component={ViewYouScreen} />
      <BottomTab.Screen name={routes.NAVIGATION_CHATS_SCREEN} component={ChatsScreen} />
    </BottomTab.Navigator>
  );
};

const MyAuthLoadingStack = () => (
  <Stack.Navigator id={undefined}
    initialRouteName={routes.NAVIGATION_AUTH_LOADING_STACK}
    screenOptions={defaultStackScreenOptions}>
    {/* <Stack.Screen name={routes.NAVIGATION_IN_APP_PURCHASE_SCREEN} component={InAppPurchaseScreen} /> */}
    {/* <Stack.Screen name={routes.NAVIGATION_LOCATION_SCREEN} component={LocationScreen} /> */}

    {/* <Stack.Screen name={routes.NAVIGATION_FACE_LIVENESS_TEST_SCREEN} component={FaceLivenessTestScreen} /> */}
    <Stack.Screen name={routes.NAVIGATION_AUTH_LOADING_STACK} component={AuthLoding} />
    <Stack.Screen name={routes.NAVIGATION_WELCOME_SCREEN} component={WelcomeScreen} />
    <Stack.Screen name={routes.NAVIGATION_DOB_SCREEN} component={DobScreen} />
    <Stack.Screen name={routes.NAVIGATION_LOCATION_SCREEN} component={LocationScreen} />
    <Stack.Screen name={routes.NAVIGATION_GANDER_SCREEN} component={GanderScreen} />
    <Stack.Screen name={routes.NAVIGATION_HEIGHT_SCREEN} component={HeightScreen} />
    <Stack.Screen name={routes.NAVIGATION_TRUN_ON_SCREEN} component={TrunOnScreen} />
    <Stack.Screen name={routes.NAVIGATION_ADD_PHOTOS_SCREEN} component={AddPhotoScreen} />
    <Stack.Screen name={routes.NAVIGATION_BOTTOMTAB_SCREEN} component={BottomMainTab} />
    <Stack.Screen name={routes.NAVIGATION_PEOPLE_SCREEN} component={PeopleScreen} />
    <Stack.Screen name={routes.NAVIGATION_PROFILE_SCREEN} component={ProfileScreenAndroid} />
    <Stack.Screen name={routes.NAVIGATION_MATCH_SCREEN} component={MatchScreen} />
    <Stack.Screen name={routes.NAVIGATION_EDIT_PROFILE_SCREEN} component={EditProfileScreen} />
    <Stack.Screen name={routes.NAVIAGATION_PROFILE_PREVIEW_NEW_SCREEN} component={ProfilePreviewNew} />
    <Stack.Screen name={routes.NAVIGATION_SUBSCRIPTION_SCREEN} component={SubscriptionScreen} />
    <Stack.Screen name={routes.NAVIGATION_SETTING_SCREEN} component={SettingScreen} />
    <Stack.Screen name={routes.NAVIGATION_TAKING_SCREEN} component={TakingScreen} />
    <Stack.Screen name={routes.NAVIGATION_ALL_MATCHES_SCREEN} component={AllMatchesScreen} />
    <Stack.Screen name={routes.NAVIGATION_BOT_CHAT_SCREEN} component={BotChatScreen} />
    <Stack.Screen name={routes.NAVIGATION_REPORT_SCREEN} component={ReportScreen} />
    <Stack.Screen name={routes.NAVIGATION_REPORT_COMMON_SCREEN} component={ReportCommonScreen} />
    <Stack.Screen name={routes.NAVIGATION_OHTER_REPORT_SCREEN} component={OtherReport} />
    <Stack.Screen name={routes.NAVIGATION_SUCCES_REPORTING_SCREEN} component={SuceesReporting} />
    <Stack.Screen name={routes.NAVIGATION_CRUSH_PURCHESE_SCREEN} component={CrushNotePurchase} />
    {/* <Stack.Screen name={routes.NAVIGATION_CRUSH_NOTE_SENDER_SCREEN} component={CrushNotesSender} /> */}


  </Stack.Navigator>
);

const RootStackScreen = () => (
  <Stack.Navigator id={undefined} screenOptions={defaultStackScreenOptions}>
    <Stack.Screen name={routes.NAVIGATION_AUTH_LOADING_STACK} component={MyAuthLoadingStack} />
  </Stack.Navigator>
);

// Stable ref callback (module scope): an inline arrow ref would be re-created
// on every render, forcing React to detach + re-attach the container ref.
const setNavigatorRef = (navigatorRef: any) => {
  try {
    NavigationService.setTopLevelNavigator(navigatorRef);
  } catch (error) {
    console.error('[Navigator] Error setting navigation ref:', error);
    // Don't crash - try to set it anyway
    if (navigatorRef) {
      NavigationService.setTopLevelNavigator(navigatorRef);
    }
  }
};

const Navigator = () => {
  const routeNameRef = React.useRef<string | undefined>(undefined);

  const onReady = React.useCallback(() => {
    try {
      NavigationService.setIsReady(true);
      const routeName = NavigationService.getCurrentRouteName();
      routeNameRef.current = routeName;
      if (routeName) {
        logScreenView(routeName).catch(() => { });
      }
    } catch (error) {
      console.error('[Navigator] Error setting navigation ready:', error);
      NavigationService.setIsReady(true);
    }
  }, []);

  const onStateChange = React.useCallback(() => {
    try {
      if (!NavigationService.isNavigationReady()) {
        return;
      }

      const currentRouteName = NavigationService.getCurrentRouteName();
      if (currentRouteName && routeNameRef.current !== currentRouteName) {
        logScreenView(currentRouteName).catch(() => { });
        routeNameRef.current = currentRouteName;
      }
    } catch {
      // Ignore errors in logging
    }
  }, []);

  return (
    <NavigationContainer
      theme={AppNavigationTheme}
      ref={setNavigatorRef}
      onReady={onReady}
      onStateChange={onStateChange}
    >
      <RootStackScreen />
      <ToastMessage />
      <GlobalNotificationManager />
      <InternetConnectionBanner />
    </NavigationContainer>
  );
};

export default Navigator;

import { CardStyleInterpolators, createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import "react-native-gesture-handler";
import NavigationService from "./NavigationService";
import * as routes from "./routes";
import * as React from "react";
import { logScreenView } from "../services/analyticsService";
import { BottomTabBarProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import LoginScreen from "../screens/SigninScreen/LoginScreen";
import OtpScreen from "../screens/SigninScreen/OtpScreen";
import WelcomeScreen from "../screens/SigninScreen/WelcomeScreen";
import ProccedScreen from "../screens/DetailsScreen/ProccedScreen";
import EmailScreen from "../screens/DetailsScreen/EmailScreen";
import EmailOtpScreen from "../screens/DetailsScreen/EmailOtpScreen";
import NameScreen from "../screens/DetailsScreen/NameScreen";
import DobScreen from "../screens/DetailsScreen/DobScreen";
import LocationScreen from "../screens/DetailsScreen/LocationScreen";
import PronounScreen from "../screens/DetailsScreen/PronounScreen";
import GanderScreen from "../screens/DetailsScreen/GanderScreen";
import SexualityScreen from "../screens/DetailsScreen/SexualityScreen";
import DateScreen from "../screens/DetailsScreen/DateScreen";
import DatingIntentionScreen from "../screens/DetailsScreen/DatingIntentionScreen";
import FamilyPlaningScreen from "../screens/DetailsScreen/FamilyPlaningScreen";
import DispatchSelectScreen from "../screens/DetailsScreen/DistanceSelectScreen";
import DistanceSelectScreen from "../screens/DetailsScreen/DistanceSelectScreen";
import HeightScreen from "../screens/DetailsScreen/HeightScreen";
import EducationScreen from "../screens/DetailsScreen/EducationScreen";
import BelongFrom from "../screens/DetailsScreen/BelongFrom";
import WorkPlace from "../screens/DetailsScreen/WorkPlace";
import JobTitle from "../screens/DetailsScreen/JobTitile";
import ReligiousScreen from "../screens/DetailsScreen/ReligiousScreen";
import PoliticalScreen from "../screens/DetailsScreen/PoliticalScreen";
import ZodiacsignScreen from "../screens/DetailsScreen/ZodiacsignScreen";
import MeetSomeOne from "../screens/DetailsScreen/MeetSomeOne";
import ChildrenScreen from "../screens/DetailsScreen/ChildrenScreen";
import AddPhotoScreen from "../screens/DetailsScreen/AddPhotosScreen";
import AllsetScreen from "../screens/DetailsScreen/AllsetScreen";
import DiscoverScreen from "../screens/DiscoverScreens/DiscoverScreen";
import ChatsScreen from "../screens/ChatScreens/ChatsScreen";
import LikesYouScreen from "../screens/LikesYouScreens/LikesYouScreen";
import ProfileScreen from "../screens/ProfileScreens/ProfileScreen";
import CustomTabBar from "../common/CustomTabBar";
import LanguageSpeak from "../screens/DetailsScreen/LanguagesSpeak";
import RelationStatus from "../screens/DetailsScreen/RelationStatus";
import LifestyleScreen from "../screens/DetailsScreen/LifestyleScreen";
import Adcenturouslife from "../screens/DetailsScreen/Adventurouslife";
import Personalinterest from "../screens/DetailsScreen/Personalinterest";
import AboutScreen from "../screens/DetailsScreen/AboutScreen";
import FilterScreen from "../screens/HomeScreens/FilterScreen";
import CommonSelectPage from "../screens/ProfileScreens/CommonSelectPage";
import MatchScreen from "../screens/HomeScreens/MatchScreen";
import EditProfileScreen from "../screens/ProfileScreens/EditProfileScreen";
import ProfileStrength from "../screens/ProfileScreens/ProfileStrength";
import UserEditProfile from "../screens/ProfileScreens/UserEditProfile";
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
import SuperLikeScreen from "../screens/HomeScreens/SuperLikeScreen";
import PeopleScreen from "../screens/HomeScreens/HomeScreen";
import PreviewDetails from "../screens/HomeScreens/PreviewDetails";
import InAppPurchaseScreen from "../screens/InAppPurchaseScreen";
import ProfileBoostPurchase from "../screens/ProfileScreens/ProfileBoostPurchase";
import SuperLikePurchese from "../screens/ProfileScreens/SuperLikePurchese";
import CrushNotePurchase from "../screens/ProfileScreens/CrushNotePurchase";
import SubscriptionAllScreen from "../screens/ProfileScreens/SubscriptionAllScreen";
import AllMatchesScreen from "../screens/ChatScreens/AllMatchesScreen";
import BotChatScreen from "../screens/ChatScreens/BotChatScreen";
import Loader from "../common/Lodaer";
import NewHomeScreen from "../screens/HomeScreens/NewHomeScreen";
import FaceLivenessTestScreen from "../screens/HomeScreens/FaceLivenessTestScreen";
import { Platform } from "react-native";
import ProfileScreenAndroid from "../screens/ProfileScreens/ProfileScreenAndroid";
import CustomTabBarAndroid from "../common/CustomTabBarAndroid";
import DiscoverScreenAndroid from "../screens/DiscoverScreens/DiscoverScreenAndroid";

const Navigator = () => {
  const Stack: any = createStackNavigator();
  const BottomTab: any = createBottomTabNavigator();
  const routeNameRef = React.useRef<string | undefined>(undefined);
  const BottomMainTab = () => {
    return (
      <BottomTab.Navigator initialRouteName={routes.NAVIGATION_PEOPLE_SCREEN}
        backBehavior="initialRoute"
        tabBar={(props: BottomTabBarProps) => Platform.OS === "ios" ? <CustomTabBar {...props} /> : <CustomTabBarAndroid {...props} />}>
        <BottomTab.Screen name={routes.NAVIGATION_PEOPLE_SCREEN} component={Platform.OS === "ios" ? NewHomeScreen : PeopleScreen} options={{ headerShown: false }} />
        <BottomTab.Screen name={routes.NAVIGATION_DISCOVER_SCREEN} component={Platform.OS === "ios" ? DiscoverScreen : DiscoverScreenAndroid} options={{ headerShown: false }} />
        <BottomTab.Screen name={routes.NAVIGATION_CHATS_SCREEN} component={ChatsScreen} options={{ headerShown: false }} />
        <BottomTab.Screen name={routes.NAVIGATION_LIKES_YOU_SCREEN} component={LikesYouScreen} options={{ headerShown: false }} />
        <BottomTab.Screen name={routes.NAVIGATION_PROFILE_SCREEN} component={Platform.OS === "ios" ? ProfileScreen : ProfileScreenAndroid} options={{ headerShown: false }} />
      </BottomTab.Navigator>
    )
  }
  const MyAuthLoadingStack = () => (
    <Stack.Navigator
      initialRouteName={routes.NAVIGATION_AUTH_LOADING_STACK}
      screenOptions={{ headerShown: false }}>
      {/* <Stack.Screen name={routes.NAVIGATION_IN_APP_PURCHASE_SCREEN} component={InAppPurchaseScreen} /> */}
      {/* <Stack.Screen name={routes.NAVIGATION_LOCATION_SCREEN} component={LocationScreen} /> */}

      {/* <Stack.Screen name={routes.NAVIGATION_FACE_LIVENESS_TEST_SCREEN} component={FaceLivenessTestScreen} /> */}
      <Stack.Screen name={routes.NAVIGATION_AUTH_LOADING_STACK} component={AuthLoding} />
      <Stack.Screen name={routes.NAVIGATION_WELCOME_SCREEN} component={WelcomeScreen} />
      <Stack.Screen name={routes.NAVIGATION_LOGIN_SCREEN} component={LoginScreen} />
      <Stack.Screen name={routes.NAVIGATION_OTP_SCREEN} component={OtpScreen} />
      <Stack.Screen name={routes.NAVIGATION_PROCCED_SCREEN} component={ProccedScreen} />
      <Stack.Screen name={routes.NAVIGATION_EMAIL_SCREEN} component={EmailScreen} />
      <Stack.Screen name={routes.NAVIGATION_EMAIL_OTP_SCREEN} component={EmailOtpScreen} />
      <Stack.Screen name={routes.NAVIGATION_NAME_SCREEN} component={NameScreen} />
      <Stack.Screen name={routes.NAVIGATION_DOB_SCREEN} component={DobScreen} />
      <Stack.Screen name={routes.NAVIGATION_LOCATION_SCREEN} component={LocationScreen} />
      <Stack.Screen name={routes.NAVIGATION_PRONOUN_SCREEN} component={PronounScreen} />
      <Stack.Screen name={routes.NAVIGATION_GANDER_SCREEN} component={GanderScreen} />
      <Stack.Screen name={routes.NAVIGATION_SEXUALITY_SCREEN} component={SexualityScreen} />
      <Stack.Screen name={routes.NAVIGATION_DATE_SCREEN} component={DateScreen} />
      <Stack.Screen name={routes.NAVIGATION_DATING_SCREEN} component={DatingIntentionScreen} />
      <Stack.Screen name={routes.NAVIGATION_CHILDERN_SCREEN} component={ChildrenScreen} />
      <Stack.Screen name={routes.NAVIGATION_FAMILY_PLANING_SCREEN} component={FamilyPlaningScreen} />
      <Stack.Screen name={routes.NAVIGATION_LIFE_STYLE_SCREEN} component={LifestyleScreen} />
      <Stack.Screen name={routes.NAVIGATION_ADCENTUOURS_SCREEN} component={Adcenturouslife} />
      <Stack.Screen name={routes.NAVIGATION_PERSONAL_INTEREST_SCREEN} component={Personalinterest} />
      <Stack.Screen name={routes.NAVIGATION_DISTANCE_SCREEN} component={DistanceSelectScreen} />
      <Stack.Screen name={routes.NAVIGATION_ABOUT_SCREEN} component={AboutScreen} />
      <Stack.Screen name={routes.NAVIGATION_HEIGHT_SCREEN} component={HeightScreen} />
      <Stack.Screen name={routes.NAVIGATION_EDUCATION_SCREEN} component={EducationScreen} />
      <Stack.Screen name={routes.NAVIGATION_BELONG_SCREEN} component={BelongFrom} />
      <Stack.Screen name={routes.NAVIGATION_WORK_PLACE_SCREEN} component={WorkPlace} />
      <Stack.Screen name={routes.NAVIGATION_JOB_TITLE_SCREEN} component={JobTitle} />
      <Stack.Screen name={routes.NAVIGATION_RELIGIOUS_SCREEN} component={ReligiousScreen} />
      <Stack.Screen name={routes.NAVIGATION_POLITICAL_SCREEN} component={PoliticalScreen} />
      <Stack.Screen name={routes.NAVIGATION_ZODIACSING_SCREEN} component={ZodiacsignScreen} />
      <Stack.Screen name={routes.NAVIGATION_LANGUAGE_SPEAK_SCREEN} component={LanguageSpeak} />
      <Stack.Screen name={routes.NAVIGATION_RELATION_SCREEN} component={RelationStatus} />
      <Stack.Screen name={routes.NAVIGATION_MEET_SOME_ONE_SCREEN} component={MeetSomeOne} />
      <Stack.Screen name={routes.NAVIGATION_ADD_PHOTOS_SCREEN} component={AddPhotoScreen} />
      <Stack.Screen name={routes.NAVIGATION_ALL_SET_SCREEN} component={AllsetScreen} />
      <Stack.Screen name={routes.NAVIGATION_BOTTOMTAB_SCREEN} component={BottomMainTab} />
      <Stack.Screen name={routes.NAVIGATION_PREVIEW_DETAILS_SCREEN} component={PreviewDetails} options={{ presentation: 'modal', cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS }} />
      <Stack.Screen name={routes.NAVIGATION_PEOPLE_SCREEN} component={PeopleScreen} />
      <Stack.Screen name={routes.NAVIGATION_FILTER_SCREEN} component={FilterScreen} />
      <Stack.Screen name={routes.NAVIGATION_COMMONSELECT_PAGE_SCREEN} component={CommonSelectPage} />
      <Stack.Screen name={routes.NAVIGATION_MATCH_SCREEN} component={MatchScreen} />
      <Stack.Screen name={routes.NAVIGATION_EDIT_PROFILE_SCREEN} component={EditProfileScreen} />
      <Stack.Screen name={routes.NAVIGATION_PROFILE_STRENGTH_SCREEN} component={ProfileStrength} />
      <Stack.Screen name={routes.NAVIGATION_USER_EDIT_PROFILE_SCREEN} component={UserEditProfile} />
      <Stack.Screen name={routes.NAVIGATION_SUBSCRIPTION_SCREEN} component={SubscriptionScreen} />
      <Stack.Screen name={routes.NAVIGATION_SETTING_SCREEN} component={SettingScreen} />
      <Stack.Screen name={routes.NAVIGATION_TAKING_SCREEN} component={TakingScreen} />
      <Stack.Screen name={routes.NAVIGATION_ALL_MATCHES_SCREEN} component={AllMatchesScreen} />
      <Stack.Screen name={routes.NAVIGATION_BOT_CHAT_SCREEN} component={BotChatScreen} />
      <Stack.Screen name={routes.NAVIGATION_REPORT_SCREEN} component={ReportScreen} />
      <Stack.Screen name={routes.NAVIGATION_REPORT_COMMON_SCREEN} component={ReportCommonScreen} />
      <Stack.Screen name={routes.NAVIGATION_OHTER_REPORT_SCREEN} component={OtherReport} />
      <Stack.Screen name={routes.NAVIGATION_SUCCES_REPORTING_SCREEN} component={SuceesReporting} />
      <Stack.Screen name={routes.NAVIGATION_PROFILE_BOOST_PURCHASE_SCREEN} component={ProfileBoostPurchase} />
      <Stack.Screen name={routes.NAVIGATION_SUPERLIKE_PURCHESE_SCREEN} component={SuperLikePurchese} />
      <Stack.Screen name={routes.NAVIGATION_CRUSH_PURCHESE_SCREEN} component={CrushNotePurchase} />
      <Stack.Screen name={routes.NAVIGATION_SUBSCRIPTION_ALL_SCREEN} component={SubscriptionAllScreen} />
      <Stack.Screen name={routes.NAVIGATION_CRUSH_NOTE_SENDER_SCREEN} component={CrushNotePurchase} />


    </Stack.Navigator>
  );

  const RootStackScreen = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={routes.NAVIGATION_AUTH_LOADING_STACK} component={MyAuthLoadingStack} />
    </Stack.Navigator>
  );

  return (
    <NavigationContainer
      ref={(navigatorRef) => {
        try {
          console.log('[Navigator] Setting navigation ref', { hasRef: !!navigatorRef });
          NavigationService.setTopLevelNavigator(navigatorRef);
        } catch (error) {
          console.error('[Navigator] Error setting navigation ref:', error);
          // Don't crash - try to set it anyway
          if (navigatorRef) {
            NavigationService.setTopLevelNavigator(navigatorRef);
          }
        }
      }}
      onReady={() => {
        try {
          console.log('[Navigator] Navigation container ready');
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
      }}
      onStateChange={() => {
        try {
          const isReady = NavigationService.isNavigationReady();
          if (!isReady) {
            console.warn('[Navigator] Navigation state changed but not ready');
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
      }}
    >
      <RootStackScreen />
      <ToastMessage />
      <GlobalNotificationManager />
      <InternetConnectionBanner />
    </NavigationContainer>
  );
};

export default Navigator;

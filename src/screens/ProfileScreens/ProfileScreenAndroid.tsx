import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, ImageBackground, LayoutChangeEvent, StyleSheet, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useIsFocused } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { AppText, BLACK, EIGHTEEN, FORTEEN, SCHEHERAZADE_BOLD, TWELVE, WHITE } from "../../common/AppText";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import metrics from "../../assets/Metrics";
import { colors } from "../../theme/colors";
import { bioBackground, biosToggla, BottomLayer, ProfileBackGroundNew } from "../../helper/ImageAssets";
import { editProfile } from "../../actions/authActions";
import PhotoEditorModal from "../../components/PhotoEditor/PhotoEditorModal";
import { useFaceVerification } from "../../hooks/useFaceVerification";
import ProfileHeader, { ProfileNavBar } from "./profile/components/ProfileHeader";
import ProfileTabs, { ProfileTab } from "./profile/components/ProfileTabs";
import ProfilePhotosTab from "./profile/components/ProfilePhotosTab";
import TurnOnTab from "./profile/components/TurnOnTab";
import EditBioModal from "./profile/components/EditBioModal";
import ProfileVerifyModal from "./profile/components/ProfileVerifyModal";
import { usePublishToggle } from "./profile/hooks/usePublishToggle";
import { useProfilePhotos } from "./profile/hooks/useProfilePhotos";
import { useTurnOnSelection } from "./profile/hooks/useTurnOnSelection";

const BIO_PLACEHOLDER = "Write something about yourself...";
// The pinned tabs tuck this far under the "Profile" bar (which stays drawn above them), so no gap shows between them
const STICKY_TABS_OVERLAP = metrics.hp0_7;

const ProfileScreenAndroid = () => {
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const userData = useSelector((state: any) => state.auth.userData);
  const turnOnData = useSelector((state: any) => state?.auth?.turnOnData);

  const [selectedTab, setSelectedTab] = useState<ProfileTab>("My Bio");
  const [bioModalVisible, setBioModalVisible] = useState(false);
  const [verifyVisible, setVerifyVisible] = useState(false);

  // The "Profile" bar stays pinned at the top while the rest scrolls. Once the tabs reach the bar, a copy of them is
  // shown pinned right under it (fading in exactly where the scrolling ones are); it goes away when scrolling back.
  const scrollY = useRef(new Animated.Value(0)).current;
  const [navBarHeight, setNavBarHeight] = useState(0);
  const [tabsTop, setTabsTop] = useState<number | null>(null);
  const [tabsStuck, setTabsStuck] = useState(false);
  const stickyTabsTop = Math.max(navBarHeight - STICKY_TABS_OVERLAP, 0);
  const stickAt = tabsTop === null ? null : Math.max(tabsTop - stickyTabsTop, 0);
  const onTabsLayout = useCallback((event: LayoutChangeEvent) => setTabsTop(event.nativeEvent.layout.y), []);
  const onNavBarLayout = useCallback((event: LayoutChangeEvent) => setNavBarHeight(event.nativeEvent.layout.height), []);
  // The bar is see-through over the header picture and gets its own background as content scrolls under it
  const navBarBackgroundOpacity = scrollY.interpolate({
    inputRange: [0, Math.max(navBarHeight, 1)],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  useEffect(() => {
    if (stickAt === null) return;
    // Only flips a boolean when the threshold is crossed, so scrolling doesn't re-render the screen
    const id = scrollY.addListener(({ value }) => setTabsStuck(value >= stickAt));
    return () => scrollY.removeListener(id);
  }, [scrollY, stickAt]);
  const onScroll = useRef(Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })).current;
  const stickyOpacity =
    stickAt === null
      ? 0
      : scrollY.interpolate({ inputRange: [stickAt - 1, stickAt], outputRange: [0, 1], extrapolate: "clamp" });

  const publish = usePublishToggle(userData);
  const photos = useProfilePhotos(userData?.gallery, userData?.gender);
  const turnOns = useTurnOnSelection(userData?.turnOns, isFocused);
  const faceVerification = useFaceVerification();
  const { reset: resetFaceVerification } = faceVerification;

  const openVerify = useCallback(() => {
    resetFaceVerification();
    setVerifyVisible(true);
  }, [resetFaceVerification]);

  const saveBio = (bio: string) => {
    dispatch(editProfile({ bio }, false));
    setBioModalVisible(false);
  };

  return (
    <AppSafeAreaView color={colors.transparent}>
      <LinearGradient style={styles.gradient} colors={["#212123", "#555359"]}>
        <Animated.ScrollView
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
        <ImageBackground source={ProfileBackGroundNew} resizeMode="cover" style={styles.header}>
          <ProfileHeader userData={userData} isHidden={publish.isHidden} onVerificationPress={openVerify} navBarPinned />
          <ProfileTabs selected={selectedTab} onSelect={setSelectedTab} onLayout={onTabsLayout} />
        </ImageBackground>

        {selectedTab === "My Bio" && (
          <TouchableOpacityView activeOpacity={0.9} onPress={() => setBioModalVisible(true)}>
            <ImageBackground source={bioBackground} resizeMode="stretch" style={styles.bioCard}>
              <ImageBackground source={biosToggla} resizeMode="contain" style={styles.bioTag}>
                <AppText style={styles.bioTagText} type={FORTEEN} weight={SCHEHERAZADE_BOLD} color={WHITE}>
                  " My bio
                </AppText>
              </ImageBackground>
              <AppText style={styles.bioText} type={TWELVE} weight={SCHEHERAZADE_BOLD} color={WHITE}>
                {userData?.bio ? userData.bio : BIO_PLACEHOLDER}
              </AppText>
            </ImageBackground>
          </TouchableOpacityView>
        )}
        {selectedTab === "Photos" && (
          <ProfilePhotosTab
            photos={photos.photos}
            canAddMore={photos.canAddMore}
            onUpload={() => photos.pickAndEdit()}
            onDelete={photos.deletePhoto}
          />
        )}
        {selectedTab === "Turn On" && (
          <TurnOnTab turnOns={turnOnData} selectedIds={turnOns.selectedIds} onToggle={turnOns.toggle} />
        )}
        </Animated.ScrollView>

        <Animated.View
          pointerEvents={tabsStuck ? "auto" : "none"}
          style={[styles.stickyTabs, { top: stickyTabsTop, opacity: stickyOpacity }]}
        >
          <ProfileTabs selected={selectedTab} onSelect={setSelectedTab} inline />
        </Animated.View>

        <View style={styles.navBar} onLayout={onNavBarLayout} pointerEvents="box-none">
          <Animated.View style={[StyleSheet.absoluteFill, styles.navBarBackground, { opacity: navBarBackgroundOpacity }]} />
          <ProfileNavBar isHidden={publish.isHidden} onVerificationPress={openVerify} />
        </View>
      </LinearGradient>

      <ImageBackground source={BottomLayer} resizeMode="stretch" style={styles.bottomLayer}>
        <TouchableOpacityView style={styles.publishTouchable} onPress={publish.onPress}>
          <LinearGradient
            colors={publish.isHidden ? ["#D08FA9", "#FDD2C1"] : ["#151517", "#151517"]}
            style={[styles.publishButton, !publish.isHidden && styles.hideButtonBorder]}
          >
            <AppText type={EIGHTEEN} weight={SCHEHERAZADE_BOLD} color={publish.isHidden ? BLACK : WHITE}>
              {publish.isHidden ? "Publish Profile" : "Hide Profile"}
            </AppText>
          </LinearGradient>
        </TouchableOpacityView>
      </ImageBackground>

      <ProfileVerifyModal
        visible={verifyVisible}
        stage={faceVerification.stage}
        error={faceVerification.error}
        onStart={faceVerification.start}
        onClose={() => setVerifyVisible(false)}
      />
      <EditBioModal
        visible={bioModalVisible}
        initialBio={userData?.bio || ""}
        onClose={() => setBioModalVisible(false)}
        onSave={saveBio}
      />
      {photos.editorVisible && <PhotoEditorModal {...photos.editorProps} />}
    </AppSafeAreaView>
  );
};

export default ProfileScreenAndroid;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  navBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    elevation: 30,
  },
  navBarBackground: {
    backgroundColor: "#212123",
  },
  stickyTabs: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 20,
    elevation: 20,
  },
  header: {
    height: metrics.hp47,
    marginBottom: metrics.hp4,
    position: "relative",
    zIndex: 1,
    overflow: "visible",
  },
  bioCard: {
    marginTop: metrics.hp6,
    marginHorizontal: metrics.hp2,
  },
  bioTag: {
    height: metrics.hp4,
    width: metrics.hp13,
    alignSelf: "center",
    marginTop: -metrics.hp2,
  },
  bioTagText: {
    textAlign: "center",
  },
  bioText: {
    marginHorizontal: metrics.hp2,
    textAlign: "center",
    marginVertical: metrics.hp1,
    lineHeight: metrics.hp2,
    marginBottom: metrics.hp3,
  },
  bottomLayer: {
    width: "100%",
    paddingVertical: metrics.hp2,
    alignItems: "center",
    backgroundColor: "#555359",
  },
  publishTouchable: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  publishButton: {
    height: metrics.hp7,
    width: "90%",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0,
    borderColor: colors.transparent,
  },
  hideButtonBorder: {
    borderWidth: metrics.hp0_1,
    borderColor: colors.white,
  },
});

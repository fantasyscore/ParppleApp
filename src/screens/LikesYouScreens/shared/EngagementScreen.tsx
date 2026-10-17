import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, ImageBackground, Modal, Platform, StyleSheet, View } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { removeIncomingProfile } from "../../../slices/loginServices/authSlice";
import metrics from "../../../assets/Metrics";
import { newColor } from "../../../theme/colors";
import { HomeBackground } from "../../../helper/ImageAssets";
import { AppSafeAreaView } from "../../../common/AppSafeAreaView";
import NewHeaderAndroid from "../../../common/NewHeaderAndroid";
import { LikeDislikeOverlays } from "../../../common/LikeDislikeOverlays";
import ScrollToTopButton from "../../../common/ScrollToTopButton";
import ProfileActionsSheet, { ProfileActionsSheetHandle } from "../../../components/ProfileCard/ProfileActionsSheet";
import ProfileListCard, { CARD_ITEM_HEIGHT } from "../../../components/ProfileCard/ProfileListCard";
import { useFaceVerification } from "../../../hooks/useFaceVerification";
import { useMatchSocket } from "../../../hooks/useMatchSocket";
import { useProfileModals } from "../../../hooks/useProfileModals";
import { useScrollToTopButton } from "../../../hooks/useScrollToTopButton";
import { useSwipeActions } from "../../../hooks/useSwipeActions";
import { useSwipeCounters } from "../../../hooks/useSwipeCounters";
import { isPublishLocked } from "../../../utils/profile";
import MatchScreen from "../../HomeScreens/MatchScreen";
import ViewProfileAndroid from "../../HomeScreens/ViewProfileAndroid";
import CrushNotesSender from "../../HomeScreens/CrushNotesSender";
import FullScreenImage from "../../HomeScreens/FullScreenImage";
import { EngagementConfig } from "./engagementConfig";
import EngagementTabs from "./EngagementTabs";
import EngagementPaywall from "./EngagementPaywall";
import EngagementEmptyState from "./EngagementEmptyState";
import VerifyIdentityModal from "./VerifyIdentityModal";

const LIST_TOP_PADDING = metrics.hp3;
const NO_PROFILES: any[] = [];

const keyExtractor = (item: any, index: number) => item?._id ?? `profile-${index}`;
const getItemLayout = (_: any, index: number) => ({
  length: CARD_ITEM_HEIGHT,
  offset: LIST_TOP_PADDING + CARD_ITEM_HEIGHT * index,
  index,
});
const swipedIdOf = (item: any) => item.userId;

/**
 * A two-tab list of profiles ("people who liked you" / "people you liked", or the same for
 * views) with the full discovery toolkit: like, dislike, crush note, preview, live matches.
 * The Likes and Views screens are this component with a different `config`.
 */
const EngagementScreen = ({ config }: { config: EngagementConfig }) => {
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const userData = useSelector((state: any) => state.auth.userData);
  const turnOnData = useSelector((state: any) => state?.auth?.turnOnData);
  const firstTabData = useSelector(config.selectors[0]) ?? NO_PROFILES;
  const secondTabData = useSelector(config.selectors[1]) ?? NO_PROFILES;

  const [selectedTab, setSelectedTab] = useState(config.tabs[0].key);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [verifyVisible, setVerifyVisible] = useState(false);

  const actionsSheetRef = useRef<ProfileActionsSheetHandle>(null);
  const modals = useProfileModals(userData);
  const faceVerification = useFaceVerification();
  const { reset: resetFaceVerification } = faceVerification;
  const scrollTop = useScrollToTopButton();
  const match = useMatchSocket(userData?._id, isFocused);

  // Refresh both lists whenever the screen gains focus
  useEffect(() => {
    if (!isFocused) return;
    config.refresh().forEach((action) => dispatch(action));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused, dispatch]);

  const { remainingSwipesRef, consumeSwipe } = useSwipeCounters(userData);

  const removeProfile = useCallback(
    (profileId: string) => {
      setHiddenIds((previous) => new Set(previous).add(profileId));
      // Also drop it from the store so the bottom-tab count updates right away (first tab only: that is the badge list)
      if (selectedTab === config.tabs[0].key) {
        dispatch(removeIncomingProfile({ listKey: config.incomingListKey, profileId }));
      }
    },
    [dispatch, selectedTab, config.tabs, config.incomingListKey]
  );
  const openVerify = useCallback(() => {
    resetFaceVerification();
    setVerifyVisible(true);
  }, [resetFaceVerification]);
  const openProfileActions = useCallback((profile: any) => actionsSheetRef.current?.open(profile), []);
  const removeBlockedProfile = useCallback((profile: any) => removeProfile(profile._id), [removeProfile]);
  const closeVerify = useCallback(() => setVerifyVisible(false), []);

  const { like, dislike, crushNoteSent, animation } = useSwipeActions({
    userData,
    remainingSwipesRef,
    consumeSwipe,
    removeProfile,
    onActionStart: modals.closePreview,
    swipedIdOf,
    crushNoteAlsoLikes: true,
    onVerifyForMoreLikes: openVerify,
  });

  const isSecondTab = selectedTab === config.tabs[1].key;
  const profiles = useMemo(() => {
    const source = isSecondTab ? secondTabData : firstTabData;
    return source.filter((profile: any) => !hiddenIds.has(profile._id));
  }, [isSecondTab, firstTabData, secondTabData, hiddenIds]);
console.log(profiles,"profiles");

  const cardActions = isSecondTab ? config.secondTabActions : { dislike: true, like: true };

  const renderItem = useCallback(
    ({ item }: any) => (
      <ProfileListCard
        item={item}
        photoField="profilePicture"
        turnOnData={turnOnData}
        showDislike={cardActions.dislike}
        showLike={cardActions.like}
        isLocked={false}
        onLike={like}
        onDislike={dislike}
        onOpenPreview={modals.openPreview}
        onCrushNote={modals.openCrushNote}
        onOpenGallery={modals.openGallery}
        onOpenActions={openProfileActions}
      />
    ),
    [turnOnData, cardActions.dislike, cardActions.like, like, dislike, modals.openPreview, modals.openCrushNote, modals.openGallery, openProfileActions]
  );

  // Hooks above must always run; only now can we swap the whole screen for the paywall
  if (isPublishLocked(userData)) {
    return <EngagementPaywall paywall={config.paywall} />;
  }

  return (
    <AppSafeAreaView style={styles.safeArea} color={newColor.blackNew}>
      <ImageBackground source={HomeBackground} resizeMode="contain" style={styles.background}>
        <View style={styles.headerLayer}>
          <EngagementTabs tabs={config.tabs} selected={selectedTab} onSelect={setSelectedTab} />
          <NewHeaderAndroid filterShow={false} />
        </View>

        {profiles.length === 0 ? (
          <EngagementEmptyState
            empty={config.empty}
            image={config.empty.images[isSecondTab ? 1 : 0]}
            showButton={config.empty.showButton(selectedTab)}
          />
        ) : (
          <FlatList
            ref={scrollTop.listRef}
            onScroll={scrollTop.onScroll}
            scrollEventThrottle={16}
            data={profiles}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            getItemLayout={getItemLayout}
            contentContainerStyle={styles.listContent}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={10}
            updateCellsBatchingPeriod={50}
            removeClippedSubviews={Platform.OS === "android"}
            showsVerticalScrollIndicator={false}
          />
        )}

        <ScrollToTopButton visible={scrollTop.visible} anim={scrollTop.anim} onPress={scrollTop.scrollToTop} />
      </ImageBackground>

      <LikeDislikeOverlays
        likeOverlayStyle={animation.likeOverlayStyle}
        likeIconAnimatedStyle={animation.likeIconAnimatedStyle}
        dislikeOverlayStyle={animation.dislikeOverlayStyle}
        dislikeIconAnimatedStyle={animation.dislikeIconAnimatedStyle}
        crushlikeOverlayStyle={animation.crushlikeOverlayStyle}
        crushlikeIconAnimatedStyle={animation.crushlikeIconAnimatedStyle}
      />

      <Modal animationType="fade" visible={modals.previewVisible} statusBarTranslucent onRequestClose={modals.closePreview}>
        <ViewProfileAndroid
          currentProfileData={modals.selectedProfile}
          setModalVisible={modals.setPreviewVisible}
          handleDislikePress={dislike}
          handleLikePress={like}
          handleCrushNote={modals.openCrushNote}
          showFullProfile={modals.openGallery}
          {...config.previewProps(selectedTab)}
        />
      </Modal>
      <Modal animationType="fade" visible={modals.crushNoteVisible} statusBarTranslucent onRequestClose={modals.closeCrushNote}>
        <CrushNotesSender
          setCrushNoteVisible={modals.setCrushNoteVisible}
          crushNoteVisible={modals.crushNoteVisible}
          currentProfileData={modals.selectedProfile}
          handleCrushNotes={crushNoteSent}
        />
      </Modal>
      <Modal
        animationType="fade"
        transparent
        statusBarTranslucent
        visible={match.matchVisible}
        onRequestClose={match.closeMatch}
      >
        {match.matchVisible ? <MatchScreen setMatchVisible={match.closeMatch} matchData={match.matchData} /> : null}
      </Modal>
      <Modal
        animationType="fade"
        transparent
        statusBarTranslucent
        visible={modals.galleryViewer.visible}
        onRequestClose={() => modals.setGalleryVisible(false)}
      >
        <FullScreenImage
          gallaryData={modals.galleryViewer.items}
          setFullImage={modals.setGalleryVisible}
          initialIndex={modals.galleryViewer.index}
        />
      </Modal>

      <VerifyIdentityModal
        visible={verifyVisible}
        stage={faceVerification.stage}
        error={faceVerification.error}
        photoUrl={userData?.gallery?.[0]?.url}
        onStart={faceVerification.start}
        onClose={closeVerify}
      />
      <ProfileActionsSheet ref={actionsSheetRef} onBlocked={removeBlockedProfile} />
    </AppSafeAreaView>
  );
};

export default EngagementScreen;

const styles = StyleSheet.create({
  safeArea: {
    flexGrow: 1,
  },
  background: {
    flex: 1,
  },
  headerLayer: {
    zIndex: 1,
  },
  listContent: {
    paddingHorizontal: metrics.hp2,
    paddingTop: LIST_TOP_PADDING,
    paddingBottom: metrics.hp15,
    flexGrow: 1,
  },
});

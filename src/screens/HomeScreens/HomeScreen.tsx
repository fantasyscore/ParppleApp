import React, { useCallback, useMemo, useRef, useState } from "react";
import { FlatList, ImageBackground, Modal, Platform, RefreshControl, StyleSheet } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useSelector } from "react-redux";
import metrics from "../../assets/Metrics";
import { newColor } from "../../theme/colors";
import { HomeBackground } from "../../helper/ImageAssets";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import NewHeaderAndroid from "../../common/NewHeaderAndroid";
import { LikeDislikeOverlays } from "../../common/LikeDislikeOverlays";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_CRUSH_PURCHESE_SCREEN, NAVIGATION_SUBSCRIPTION_SCREEN } from "../../navigation/routes";
import { useLatest } from "../../hooks/useLatest";
import { useFaceVerification } from "../../hooks/useFaceVerification";
import MatchScreen from "./MatchScreen";
import ViewProfileAndroid from "./ViewProfileAndroid";
import CrushNotesSender from "./CrushNotesSender";
import FullScreenImage from "./FullScreenImage";
import { ITEM_HEIGHT, LIST_TOP_PADDING, SHOW_PROFILE_ACTIONS } from "./home/constants";
import { isPublishLocked } from "./home/utils";
import { useProfileFeed } from "./home/hooks/useProfileFeed";
import { useSwipeCounters } from "./home/hooks/useSwipeCounters";
import { useSwipeActions } from "./home/hooks/useSwipeActions";
import { useSearchFilters } from "./home/hooks/useSearchFilters";
import { useMatchSocket } from "./home/hooks/useMatchSocket";
import { useScrollToTopButton } from "./home/hooks/useScrollToTopButton";
import { usePushPermissionPrompt } from "./home/hooks/usePushPermissionPrompt";
import ProfileListCard from "./home/components/ProfileListCard";
import ProfileActionsSheet, { ProfileActionsSheetHandle } from "./home/components/ProfileActionsSheet";
import FeedEmptyState from "./home/components/FeedEmptyState";
import FilterSheet from "./home/components/FilterSheet";
import LikeLimitModal from "./home/components/LikeLimitModal";
import ScrollToTopButton from "./home/components/ScrollToTopButton";

const keyExtractor = (item: any, index: number) => item?._id ?? `profile-${index}`;

const getItemLayout = (_: any, index: number) => ({
  length: ITEM_HEIGHT,
  offset: LIST_TOP_PADDING + ITEM_HEIGHT * index,
  index,
});

/**
 * Discovery feed. This component only wires things together: data and
 * behaviour live in ./home/hooks, UI pieces in ./home/components.
 */
const HomeScreen = () => {
  const isFocused = useIsFocused();
  const userData = useSelector((state: any) => state.auth.userData);
  const userDataRef = useLatest(userData);
  const isLocked = isPublishLocked(userData);

  // ---- Feed + list chrome ----
  const feed = useProfileFeed(isFocused);
  const scrollTop = useScrollToTopButton();
  usePushPermissionPrompt();

  // ---- Modals ----
  const [selectedProfile, setSelectedProfile] = useState<any>({});
  const [previewVisible, setPreviewVisible] = useState(false);
  const [crushNoteVisible, setCrushNoteVisible] = useState(false);
  const [galleryViewer, setGalleryViewer] = useState<{ visible: boolean; items: any[]; index: number }>({
    visible: false,
    items: [],
    index: 0,
  });
  const [likeLimitVisible, setLikeLimitVisible] = useState(false);
  const faceVerification = useFaceVerification();
  const { reset: resetFaceVerification } = faceVerification;
  const actionsSheetRef = useRef<ProfileActionsSheetHandle>(null);

  const closePreview = useCallback(() => setPreviewVisible(false), []);
  const openLikeLimit = useCallback(() => {
    resetFaceVerification();
    setLikeLimitVisible(true);
  }, [resetFaceVerification]);
  const closeLikeLimit = useCallback(() => setLikeLimitVisible(false), []);

  // ---- Swiping ----
  const { remainingSwipesRef, consumeSwipe } = useSwipeCounters(userData);
  const { like, dislike, crushNoteSent, animation } = useSwipeActions({
    userData,
    remainingSwipesRef,
    consumeSwipe,
    removeProfile: feed.removeProfile,
    onActionStart: closePreview,
    onVerifyForMoreLikes: openLikeLimit,
  });

  // ---- Filters + live matches ----
  const filters = useSearchFilters(userData);
  const match = useMatchSocket(userData?._id, isFocused);

  // ---- Card handlers (stable so memoized rows don't re-render) ----
  const openPreview = useCallback((profile: any) => {
    setSelectedProfile(profile);
    setPreviewVisible(true);
  }, []);

  const openCrushNote = useCallback(
    (profile: any) => {
      const user = userDataRef.current;
      if (isPublishLocked(user)) {
        NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN);
      } else if (user?.crushNotesRemaining === 0) {
        NavigationService.navigate(NAVIGATION_CRUSH_PURCHESE_SCREEN);
      } else {
        setSelectedProfile(profile);
        setCrushNoteVisible(true);
      }
    },
    [userDataRef]
  );

  const openGallery = useCallback((items: any[], index: number = 0) => {
    setGalleryViewer({ visible: true, items, index });
  }, []);
  const closeGallery = useCallback((visible: boolean) => setGalleryViewer((viewer) => ({ ...viewer, visible })), []);
  const openProfileActions = useCallback((profile: any) => actionsSheetRef.current?.open(profile), []);

  const renderItem = useCallback(
    ({ item }: any) => (
      <ProfileListCard
        item={item}
        isLocked={isLocked}
        onLike={like}
        onDislike={dislike}
        onOpenPreview={openPreview}
        onCrushNote={openCrushNote}
        onOpenGallery={openGallery}
        onOpenActions={SHOW_PROFILE_ACTIONS ? openProfileActions : undefined}
      />
    ),
    [isLocked, like, dislike, openPreview, openCrushNote, openGallery, openProfileActions]
  );

  const emptyState = useMemo(
    () => <FeedEmptyState userData={userData} />,
    // Only the user's photo and gender change what it renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userData?.gallery, userData?.gender]
  );

  return (
    <AppSafeAreaView style={styles.safeArea} color={newColor.blackNew}>
      <ImageBackground source={HomeBackground} resizeMode="contain" style={styles.background}>
        <NewHeaderAndroid onFilterPress={filters.open} />
        <FlatList
          key={feed.listMountKey}
          ref={scrollTop.listRef}
          onScroll={scrollTop.onScroll}
          scrollEventThrottle={16}
          data={feed.profiles}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={emptyState}
          onEndReached={feed.loadMore}
          onEndReachedThreshold={0.5}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={Platform.OS === "android"}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={feed.refreshing}
              onRefresh={feed.onRefresh}
              colors={["#E6B7A8"]} // Android
              tintColor="#E6B7A8" // iOS
              progressBackgroundColor="#212123"
            />
          }
        />
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

      <Modal animationType="fade" visible={previewVisible} statusBarTranslucent onRequestClose={closePreview}>
        <ViewProfileAndroid
          currentProfileData={selectedProfile}
          setModalVisible={setPreviewVisible}
          handleDislikePress={dislike}
          handleLikePress={like}
          handleCrushNote={openCrushNote}
          showFullProfile={openGallery}
        />
      </Modal>
      <Modal
        animationType="fade"
        visible={crushNoteVisible}
        statusBarTranslucent
        onRequestClose={() => setCrushNoteVisible(false)}
      >
        <CrushNotesSender
          setCrushNoteVisible={setCrushNoteVisible}
          crushNoteVisible={crushNoteVisible}
          currentProfileData={selectedProfile}
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
        visible={galleryViewer.visible}
        onRequestClose={() => closeGallery(false)}
      >
        <FullScreenImage gallaryData={galleryViewer.items} setFullImage={closeGallery} initialIndex={galleryViewer.index} />
      </Modal>

      <FilterSheet filters={filters} />
      <LikeLimitModal
        visible={likeLimitVisible}
        stage={faceVerification.stage}
        error={faceVerification.error}
        onStart={faceVerification.start}
        onClose={closeLikeLimit}
      />
      <ProfileActionsSheet ref={actionsSheetRef} />
    </AppSafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flexGrow: 1,
  },
  background: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: metrics.hp2,
    paddingTop: LIST_TOP_PADDING,
    paddingBottom: metrics.hp15,
    flexGrow: 1,
  },
});

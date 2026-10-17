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
import { useProfileModals } from "../../hooks/useProfileModals";
import { useFaceVerification } from "../../hooks/useFaceVerification";
import MatchScreen from "./MatchScreen";
import ViewProfileAndroid from "./ViewProfileAndroid";
import CrushNotesSender from "./CrushNotesSender";
import FullScreenImage from "./FullScreenImage";
import { LIST_TOP_PADDING, SHOW_PROFILE_ACTIONS } from "./home/constants";
import { isPublishLocked } from "../../utils/profile";
import { useProfileFeed } from "./home/hooks/useProfileFeed";
import { useSearchFilters } from "./home/hooks/useSearchFilters";
import { useSwipeCounters } from "../../hooks/useSwipeCounters";
import { useSwipeActions } from "../../hooks/useSwipeActions";
import { useMatchSocket } from "../../hooks/useMatchSocket";
import { useScrollToTopButton } from "../../hooks/useScrollToTopButton";
import { usePushPermissionPrompt } from "../../hooks/usePushPermissionPrompt";
import ProfileListCard, { CARD_ITEM_HEIGHT } from "../../components/ProfileCard/ProfileListCard";
import ProfileActionsSheet, { ProfileActionsSheetHandle } from "../../components/ProfileCard/ProfileActionsSheet";
import FeedEmptyState from "./home/components/FeedEmptyState";
import FilterSheet from "./home/components/FilterSheet";
import LikeLimitModal from "./home/components/LikeLimitModal";
import ScrollToTopButton from "../../common/ScrollToTopButton";

const keyExtractor = (item: any, index: number) => item?._id ?? `profile-${index}`;

const getItemLayout = (_: any, index: number) => ({
  length: CARD_ITEM_HEIGHT,
  offset: LIST_TOP_PADDING + CARD_ITEM_HEIGHT * index,
  index,
});

/**
 * Discovery feed. This component only wires things together: data and
 * behaviour live in ./home/hooks, UI pieces in ./home/components.
 */
const HomeScreen = () => {
  const isFocused = useIsFocused();
  const userData = useSelector((state: any) => state.auth.userData);
  const isLocked = isPublishLocked(userData);

  // ---- Feed + list chrome ----
  const feed = useProfileFeed(isFocused);
  const scrollTop = useScrollToTopButton();
  usePushPermissionPrompt();

  // ---- Modals ----
  const modals = useProfileModals(userData);
  const [likeLimitVisible, setLikeLimitVisible] = useState(false);
  const faceVerification = useFaceVerification();
  const { reset: resetFaceVerification } = faceVerification;
  const actionsSheetRef = useRef<ProfileActionsSheetHandle>(null);

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
    onActionStart: modals.closePreview,
    onVerifyForMoreLikes: openLikeLimit,
  });

  // ---- Filters + live matches ----
  const filters = useSearchFilters(userData);
  const match = useMatchSocket(userData?._id, isFocused);

  // ---- Card handlers (stable so memoized rows don't re-render) ----
  const removeBlockedProfile = useCallback((profile: any) => feed.removeProfile(profile._id), [feed.removeProfile]);
  const openProfileActions = useCallback((profile: any) => actionsSheetRef.current?.open(profile), []);

  const renderItem = useCallback(
    ({ item }: any) => (
      <ProfileListCard
        item={item}
        isLocked={isLocked}
        onLike={like}
        onDislike={dislike}
        onOpenPreview={modals.openPreview}
        onCrushNote={modals.openCrushNote}
        onOpenGallery={modals.openGallery}
        onOpenActions={SHOW_PROFILE_ACTIONS ? openProfileActions : undefined}
      />
    ),
    [isLocked, like, dislike, modals.openPreview, modals.openCrushNote, modals.openGallery, openProfileActions]
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

      <Modal animationType="fade" visible={modals.previewVisible} statusBarTranslucent onRequestClose={modals.closePreview}>
        <ViewProfileAndroid
          currentProfileData={modals.selectedProfile}
          setModalVisible={modals.setPreviewVisible}
          handleDislikePress={dislike}
          handleLikePress={like}
          handleCrushNote={modals.openCrushNote}
          showFullProfile={modals.openGallery}
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

      <FilterSheet filters={filters} />
      <LikeLimitModal
        visible={likeLimitVisible}
        stage={faceVerification.stage}
        error={faceVerification.error}
        onStart={faceVerification.start}
        onClose={closeLikeLimit}
      />
      <ProfileActionsSheet ref={actionsSheetRef} onBlocked={removeBlockedProfile} />
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

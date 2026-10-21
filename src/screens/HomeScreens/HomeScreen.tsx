import React, { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Animated, FlatList, ImageBackground, Modal, Platform, RefreshControl, StyleSheet, View } from "react-native";
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
import HomeFilterTabs, { FILTER_TABS_HEIGHT, HomeFilter } from "./home/components/HomeFilterTabs";
import { useHomeCity } from "./home/hooks/useHomeCity";
import { useFilterFeeds } from "./home/hooks/useFilterFeeds";
import FilterSheet from "./home/components/FilterSheet";
import LikeLimitModal from "./home/components/LikeLimitModal";
import ScrollToTopButton from "../../common/ScrollToTopButton";

const NO_PROFILES: any[] = [];
// Space kept above the first card for the floating tab row. A little less than the row's own height, so the
// cards start close under the pills instead of leaving a wide gap.
const TABS_SPACER_HEIGHT = FILTER_TABS_HEIGHT - metrics.hp4;
const tabsSpacer = <View style={{ height: TABS_SPACER_HEIGHT }} />;
const SCROLL_DIRECTION_THRESHOLD = 4;

const keyExtractor = (item: any, index: number) => item?._id ?? `profile-${index}`;

const getItemLayout = (_: any, index: number) => ({
  length: CARD_ITEM_HEIGHT,
  // The tab row is the list's header, so items start below it
  offset: TABS_SPACER_HEIGHT + LIST_TOP_PADDING + CARD_ITEM_HEIGHT * index,
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
  // Right after sign-up the feed can arrive before the user's own profile does. Whether photos are locked
  // depends on that profile, so hold the list back until it is known instead of showing unlocked cards
  // that turn locked a moment later.
  const isProfileReady = !!userData?.gender;

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

  // ---- Filter tabs (All / Near By / Verified / Online) ----
  const [selectedFilter, setSelectedFilter] = useState<HomeFilter>("all");
  const [tabRefreshing, setTabRefreshing] = useState(false);
  const city = useHomeCity(match.location, userData);
  const filterFeeds = useFilterFeeds(city, isProfileReady, isFocused);
  // ---- Tab row visibility: hidden while scrolling down, shown again as soon as the user scrolls up ----
  const tabsTranslateY = useRef(new Animated.Value(0)).current;
  const tabsOpacity = useRef(new Animated.Value(1)).current;
  const tabsHiddenRef = useRef(false);
  const lastOffsetRef = useRef(0);
  const setTabsHidden = useCallback(
    (hidden: boolean) => {
      if (tabsHiddenRef.current === hidden) return;
      tabsHiddenRef.current = hidden;
      Animated.parallel([
        Animated.timing(tabsTranslateY, { toValue: hidden ? -FILTER_TABS_HEIGHT : 0, duration: 200, useNativeDriver: true }),
        Animated.timing(tabsOpacity, { toValue: hidden ? 0 : 1, duration: 200, useNativeDriver: true }),
      ]).start();
    },
    [tabsTranslateY, tabsOpacity]
  );
  const { onScroll: onScrollTopButton } = scrollTop;
  const onListScroll = useCallback(
    (event: any) => {
      onScrollTopButton(event);
      const offset = event.nativeEvent.contentOffset.y;
      const delta = offset - lastOffsetRef.current;
      lastOffsetRef.current = offset;
      if (offset <= 0 || delta < -SCROLL_DIRECTION_THRESHOLD) setTabsHidden(false);
      else if (delta > SCROLL_DIRECTION_THRESHOLD && offset > FILTER_TABS_HEIGHT) setTabsHidden(true);
    },
    [onScrollTopButton, setTabsHidden]
  );

  const onSelectFilter = useCallback(
    (filter: HomeFilter) => {
      setSelectedFilter(filter);
      // Each tab is a different list: start it from the top
      scrollTop.listRef.current?.scrollToOffset({ offset: 0, animated: false });
      setTabsHidden(false);
    },
    [scrollTop.listRef, setTabsHidden]
  );
  const activeTab = selectedFilter === "all" ? null : selectedFilter;
  const tabProfiles: any[] | undefined = activeTab ? filterFeeds.feeds[activeTab] : undefined;

  const onRefresh = useCallback(async () => {
    if (!activeTab) {
      feed.onRefresh();
      return;
    }
    setTabRefreshing(true);
    await filterFeeds.refresh(activeTab);
    setTabRefreshing(false);
  }, [activeTab, feed, filterFeeds]);
  const onEndReached = useCallback(() => {
    if (activeTab) filterFeeds.loadMore(activeTab);
    else feed.loadMore();
  }, [activeTab, feed, filterFeeds]);

  // ---- Card handlers (stable so memoized rows don't re-render) ----
  const { removeProfile: removeFeedProfile } = feed;
  const removeBlockedProfile = useCallback((profile: any) => removeFeedProfile(profile._id), [removeFeedProfile]);
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
  // A filter tab shows a spinner only until its first load ends; after that an empty tab shows the same pulse as All
  const listEmpty = !isProfileReady ? null : !activeTab ? emptyState : tabProfiles === undefined ? (
    <View style={styles.tabLoading}>
      <ActivityIndicator color="#E6B7A8" />
    </View>
  ) : (
    emptyState
  );
  const listData = !isProfileReady ? NO_PROFILES : activeTab ? tabProfiles ?? NO_PROFILES : feed.profiles;

  return (
    <AppSafeAreaView style={styles.safeArea} color={newColor.blackNew}>
      <ImageBackground source={HomeBackground} resizeMode="contain" style={styles.background}>
        <NewHeaderAndroid onFilterPress={filters.open} />
        {/* The tab row floats above the list: it slides away when scrolling down and returns when scrolling up */}
        <View style={styles.listArea}>
        <Animated.View style={[styles.tabsOverlay, { opacity: tabsOpacity, transform: [{ translateY: tabsTranslateY }] }]}>
          <HomeFilterTabs selected={selectedFilter} onSelect={onSelectFilter} />
        </Animated.View>
        <FlatList
          key={feed.listMountKey}
          // Keeps the first card below the floating tab row
          ListHeaderComponent={tabsSpacer}
          ref={scrollTop.listRef}
          onScroll={onListScroll}
          scrollEventThrottle={16}
          data={listData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={listEmpty}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={Platform.OS === "android"}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={activeTab ? tabRefreshing : feed.refreshing}
              onRefresh={onRefresh}
              colors={["#E6B7A8"]} // Android
              tintColor="#E6B7A8" // iOS
              progressBackgroundColor="#212123"
            />
          }
        />
        </View>
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
  listArea: {
    flex: 1,
    overflow: "hidden",
  },
  tabsOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    elevation: 10,
  },
  tabLoading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: metrics.hp15,
  },
  listContent: {
    paddingHorizontal: metrics.hp2,
    paddingTop: LIST_TOP_PADDING,
    paddingBottom: metrics.hp15,
    flexGrow: 1,
  },
});

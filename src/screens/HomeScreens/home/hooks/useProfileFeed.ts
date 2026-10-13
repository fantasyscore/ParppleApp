import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import FastImage from "react-native-fast-image";
import { useDispatch, useSelector } from "react-redux";
import { getProfile, listProfiles } from "../../../../actions/authActions";
import { setListProfiles } from "../../../../slices/loginServices/authSlice";
import { useLatest } from "../../../../hooks/useLatest";
import {
  AVATAR_PRELOAD_CACHE_LIMIT,
  FEED_STALE_AFTER_MS,
  LIST_REMOUNT_AFTER_MS,
  PROFILE_BATCH_LIMIT,
  TOP_UP_TRIGGER_COUNT,
} from "../constants";
import { runAfterInitialInteractions } from "../utils";

// Stable reference so the selector doesn't return a new array on every store update
const NO_PROFILES: any[] = [];

/**
 * Owns the discovery feed: first load, infinite paging, low-water refill,
 * pull-to-refresh, avatar preloading and recovery after the app returns from
 * the background.
 */
export function useProfileFeed(isFocused: boolean) {
  const dispatch = useDispatch();
  const profiles: any[] = useSelector((state: any) => state.auth.listProfiles ?? NO_PROFILES);
  const userId: string | undefined = useSelector((state: any) => state.auth.userData?._id);

  const [refreshing, setRefreshing] = useState(false);
  // Bumping this remounts the list (see LIST_REMOUNT_AFTER_MS)
  const [listMountKey, setListMountKey] = useState(0);

  // Refs mirror frequently-changing values so handlers stay stable
  // (stable handlers = memoized rows never re-render unnecessarily).
  const profilesRef = useLatest(Array.isArray(profiles) ? profiles : NO_PROFILES);
  const userIdRef = useLatest(userId);
  const isFocusedRef = useLatest(isFocused);
  const hasFetchedFeedOnceRef = useRef(false);
  const isFetchingMoreRef = useRef(false);
  const feedExhaustedRef = useRef(false);
  const prevListLengthRef = useRef(0);
  const preloadedAvatarUrlsRef = useRef<Set<string>>(new Set());
  const backgroundedAtRef = useRef<number | null>(null);

  // ---- Initial data: profile + first feed batch ----
  useEffect(() => {
    if (!isFocused) return;
    if (!userIdRef.current) {
      dispatch(getProfile(true));
    }
    if (!hasFetchedFeedOnceRef.current && profilesRef.current.length === 0) {
      hasFetchedFeedOnceRef.current = true;
      dispatch(listProfiles(true, 0, PROFILE_BATCH_LIMIT, false));
    }
  }, [isFocused, dispatch, userIdRef, profilesRef]);

  // ---- Infinite feed: append the next batch, stop when the server runs dry ----
  const loadMore = useCallback(async () => {
    if (isFetchingMoreRef.current || feedExhaustedRef.current) return;
    isFetchingMoreRef.current = true;
    try {
      const skip = profilesRef.current.length;
      const result: any = await dispatch(listProfiles(true, skip, PROFILE_BATCH_LIMIT, true));
      if (result?.skipped) return;
      const newCount = Array.isArray(result?.newProfiles) ? result.newProfiles.length : 0;
      if (newCount === 0) {
        feedExhaustedRef.current = true;
      }
    } catch (error) {
      console.warn("[HomeFeed] Feed top-up failed:", error);
    } finally {
      isFetchingMoreRef.current = false;
    }
  }, [dispatch, profilesRef]);

  // A fresh/replaced list (filter change, refresh) re-opens the feed.
  useEffect(() => {
    if (profiles.length > prevListLengthRef.current) {
      feedExhaustedRef.current = false;
    }
    prevListLengthRef.current = profiles.length;
  }, [profiles.length]);

  // Low-water refill: swiping shrinks the list without scrolling, so
  // onEndReached alone isn't enough to keep the feed topped up.
  useEffect(() => {
    if (!isFocused) return;
    if (profiles.length > TOP_UP_TRIGGER_COUNT) return;

    const timer = setTimeout(loadMore, 300);
    return () => clearTimeout(timer);
  }, [isFocused, profiles.length, loadMore]);

  // ---- Image preloading: warm the cache for upcoming avatars ----
  useEffect(() => {
    if (!profiles.length) return;
    return runAfterInitialInteractions(() => {
      const cache = preloadedAvatarUrlsRef.current;
      const sources: any[] = [];
      profiles.forEach((profile: any) => {
        const url = profile?.gallery?.[0]?.url;
        if (!url || cache.has(url)) return;
        cache.add(url);
        if (cache.size > AVATAR_PRELOAD_CACHE_LIMIT) {
          const oldest = cache.values().next().value;
          if (oldest) cache.delete(oldest);
        }
        sources.push({ uri: url, priority: FastImage.priority.normal, cache: FastImage.cacheControl.immutable });
      });
      if (sources.length > 0) {
        FastImage.preload(sources);
      }
    }, 300);
  }, [profiles]);

  // ---- Pull to refresh ----
  const onRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      // Reset pagination
      feedExhaustedRef.current = false;
      isFetchingMoreRef.current = false;
      prevListLengthRef.current = 0;
      dispatch(setListProfiles([]));
      await dispatch(listProfiles(true, 0, PROFILE_BATCH_LIMIT, false));
    } catch (error) {
      console.log("Refresh Error:", error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, refreshing]);
  const onRefreshRef = useLatest(onRefresh);

  // ---- Returning from recents: a feed that sat in the background is stale and its
  // in-flight request/pagination flags may never have settled, so reload it. ----
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState: AppStateStatus) => {
      if (nextState === "background") {
        backgroundedAtRef.current = Date.now();
        return;
      }
      if (nextState !== "active" || backgroundedAtRef.current === null) return;
      const awayMs = Date.now() - backgroundedAtRef.current;
      backgroundedAtRef.current = null;
      // Unsettled pagination from before the app was suspended must not block the feed.
      isFetchingMoreRef.current = false;
      if (awayMs >= LIST_REMOUNT_AFTER_MS) setListMountKey((key) => key + 1);
      if (awayMs < FEED_STALE_AFTER_MS || !isFocusedRef.current) return;
      onRefreshRef.current();
    });
    return () => subscription.remove();
  }, [isFocusedRef, onRefreshRef]);

  /** Takes a profile out of the deck (swiped or messaged); the low-water effect refills the feed. */
  const removeProfile = useCallback(
    (profileId: string) => {
      dispatch(setListProfiles(profilesRef.current.filter((profile: any) => profile._id !== profileId)));
    },
    [dispatch, profilesRef]
  );

  return { profiles, refreshing, listMountKey, onRefresh, loadMore, removeProfile };
}

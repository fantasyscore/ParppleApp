import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useDispatch, useSelector, useStore } from "react-redux";
import { getProfile, listProfiles } from "../../../../actions/authActions";
import { removeProfileFromFeeds } from "../../../../slices/loginServices/authSlice";
import { useLatest } from "../../../../hooks/useLatest";
import {
  FEED_STALE_AFTER_MS,
  LIST_REMOUNT_AFTER_MS,
  PROFILE_BATCH_LIMIT,
  TOP_UP_TRIGGER_COUNT,
} from "../constants";

/** Longest a refresh waits for a running feed request before sending its own */
const REFRESH_WAIT_MAX_MS = 35 * 1000; // a little over the 30s request timeout

// Stable reference so the selector doesn't return a new array on every store update
const NO_PROFILES: any[] = [];

/** "loading" until the first request ends; "error" when it failed (no network, timeout, server error) */
export type LoadStatus = "loading" | "loaded" | "error";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Waits (bounded) for a request guarded by an `_inFlight` flag, e.g. the one the session load started at login */
const waitWhileInFlight = async (action: any) => {
  const startedAt = Date.now();
  while (action._inFlight && Date.now() - startedAt < REFRESH_WAIT_MAX_MS) {
    await sleep(150);
  }
};

/**
 * Owns the discovery feed: first load, infinite paging, low-water refill,
 * pull-to-refresh and recovery after the app returns from the background.
 */
export function useProfileFeed(isFocused: boolean) {
  const dispatch = useDispatch();
  const store = useStore();
  const profiles: any[] = useSelector((state: any) => state.auth.listProfiles ?? NO_PROFILES);
  const userId: string | undefined = useSelector((state: any) => state.auth.userData?._id);
  // Read from the store (not a render-time ref) right after an await, when the screen may not have re-rendered yet
  const currentProfiles = (): any[] => (store.getState() as any)?.auth?.listProfiles ?? NO_PROFILES;
  const currentUserId = (): string | undefined => (store.getState() as any)?.auth?.userData?._id;

  // Drives the empty state: a spinner only while a request is actually running, then "No profiles yet" + Refresh
  const [feedStatus, setFeedStatus] = useState<LoadStatus>(profiles.length > 0 ? "loaded" : "loading");
  const [profileStatus, setProfileStatus] = useState<LoadStatus>(userId ? "loaded" : "loading");

  const [refreshing, setRefreshing] = useState(false);
  // Bumping this remounts the list (see LIST_REMOUNT_AFTER_MS)
  const [listMountKey, setListMountKey] = useState(0);

  // Refs mirror frequently-changing values so handlers stay stable
  // (stable handlers = memoized rows never re-render unnecessarily).
  const profilesRef = useLatest(Array.isArray(profiles) ? profiles : NO_PROFILES);
  const isFocusedRef = useLatest(isFocused);
  const hasFetchedFeedOnceRef = useRef(false);
  const isFetchingMoreRef = useRef(false);
  const feedExhaustedRef = useRef(false);
  const prevListLengthRef = useRef(0);
  const backgroundedAtRef = useRef<number | null>(null);
  // True while a pull-to-refresh runs: paging must not append an old page onto the fresh list
  const isRefreshingRef = useRef(false);
  // Set once the feed has had profiles: an empty list after that means "swiped through everything"
  const hadProfilesRef = useRef(profiles.length > 0);

  useEffect(() => {
    if (profiles.length > 0) {
      hadProfilesRef.current = true;
      setFeedStatus("loaded");
    }
  }, [profiles.length]);
  useEffect(() => {
    if (userId) setProfileStatus("loaded");
  }, [userId]);

  /** The user's own profile (gender / plan decide how cards render). Retries are explicit (Refresh), never a loop. */
  const loadProfile = useCallback(async () => {
    if (currentUserId()) {
      setProfileStatus("loaded");
      return;
    }
    setProfileStatus("loading");
    const result: any = await dispatch(getProfile(true));
    if (result === "skipped") await waitWhileInFlight(getProfile);
    setProfileStatus(currentUserId() ? "loaded" : "error");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  /**
   * First feed batch. Always ends in a showProfiles response on this screen: if the session load started at login
   * is still running, wait for it; if it left the feed empty or failed, ask again. Location plays no part here.
   */
  const loadInitialFeed = useCallback(async () => {
    setFeedStatus("loading");
    await waitWhileInFlight(listProfiles);
    if (currentProfiles().length > 0) {
      setFeedStatus("loaded");
      return;
    }
    let result: any = await dispatch(listProfiles(true, 0, PROFILE_BATCH_LIMIT, false));
    if (result?.skipped) {
      // Another request slipped in between: its answer is as good as ours
      await waitWhileInFlight(listProfiles);
      result = {};
    }
    setFeedStatus(result?.error && currentProfiles().length === 0 ? "error" : "loaded");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  // ---- Initial data: profile + first feed batch (once, on first focus) ----
  useEffect(() => {
    if (!isFocused || hasFetchedFeedOnceRef.current) return;
    hasFetchedFeedOnceRef.current = true;
    if (!currentUserId()) loadProfile();
    if (currentProfiles().length === 0) loadInitialFeed();
    else setFeedStatus("loaded");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused, loadProfile, loadInitialFeed]);

  // ---- Infinite feed: append the next batch, stop when the server runs dry ----
  const loadMore = useCallback(async () => {
    if (isFetchingMoreRef.current || feedExhaustedRef.current || isRefreshingRef.current) return;
    isFetchingMoreRef.current = true;
    try {
      const skip = profilesRef.current.length;
      const result: any = await dispatch(listProfiles(true, skip, PROFILE_BATCH_LIMIT, true));
      // A skipped call (another request was running) or a failed one (timeout, no network) says nothing about
      // whether more profiles exist: the next scroll tries again instead of the feed stopping for good
      if (result?.skipped || result?.error) return;
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
    // A feed that never had profiles is the first load's job (loadInitialFeed / Refresh): topping it up here
    // would only send the same skip=0 request a second time
    if (profiles.length === 0 && !hadProfilesRef.current) return;

    const timer = setTimeout(loadMore, 300);
    return () => clearTimeout(timer);
  }, [isFocused, profiles.length, loadMore]);

  // ---- Pull to refresh ----
  const onRefresh = useCallback(async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    setRefreshing(true);
    try {
      // Reset pagination
      feedExhaustedRef.current = false;
      prevListLengthRef.current = 0;
      // listProfiles skips a call while another one is running (a page being loaded). Wait for that one to end
      // instead of dropping the refresh; the request has its own timeout, so this can't wait forever.
      await waitWhileInFlight(listProfiles);
      // Refresh also retries the user's own profile when that is what failed
      if (!currentUserId()) loadProfile();
      const result: any = await dispatch(listProfiles(true, 0, PROFILE_BATCH_LIMIT, false));
      // The old list stays on screen until the new one has arrived (it used to be cleared first, so a failed or
      // skipped refresh left an empty feed)
      if (result?.skipped) console.warn("[HomeFeed] Refresh skipped: another feed request is still running");
      setFeedStatus(result?.error && currentProfiles().length === 0 ? "error" : "loaded");
    } catch (error) {
      console.log("Refresh Error:", error);
    } finally {
      isFetchingMoreRef.current = false;
      isRefreshingRef.current = false;
      setRefreshing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, loadProfile]);
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
      // Out of the main feed and out of every filter tab (Near By / Verified / Online)
      dispatch(removeProfileFromFeeds(profileId));
    },
    [dispatch]
  );

  return { profiles, refreshing, listMountKey, onRefresh, loadMore, removeProfile, feedStatus, profileStatus };
}

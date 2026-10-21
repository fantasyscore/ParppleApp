import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FILTER_FEED_LIMIT, fetchFilterFeed, HomeFilterTab } from "../../../../actions/authActions";
import { useLatest } from "../../../../hooks/useLatest";
import { FEED_STALE_AFTER_MS } from "../constants";

export const FILTER_TABS: HomeFilterTab[] = ["nearby", "verified", "online"];

/**
 * The Near By / Verified / Online tabs of Home. All three are loaded as soon as the profile (and its
 * city) is known, so switching tabs shows data that is already there; the lists live in auth.filterFeeds.
 */
export function useFilterFeeds(city: string, enabled: boolean, isFocused: boolean) {
  const dispatch = useDispatch();
  const feeds = useSelector((state: any) => state.auth.filterFeeds) ?? {};
  const feedsRef = useLatest(feeds);
  const cityRef = useLatest(city);
  const loadedCityRef = useRef<string | null>(null);
  const loadedAtRef = useRef(0);
  const exhaustedRef = useRef<Record<string, boolean>>({});
  const fetchingRef = useRef<Record<string, boolean>>({});

  const refresh = useCallback(
    async (tab: HomeFilterTab) => {
      exhaustedRef.current[tab] = false;
      fetchingRef.current[tab] = true;
      try {
        await dispatch(fetchFilterFeed(tab, { city: cityRef.current, skip: 0, append: false }));
      } finally {
        fetchingRef.current[tab] = false;
      }
    },
    [dispatch, cityRef]
  );

  const refreshAll = useCallback(() => {
    loadedAtRef.current = Date.now();
    loadedCityRef.current = cityRef.current;
    FILTER_TABS.forEach((tab) => refresh(tab));
  }, [refresh, cityRef]);

  // First load, and again when the city changes (profile city -> city from the device's coordinates)
  useEffect(() => {
    if (!enabled || loadedCityRef.current === city) return;
    refreshAll();
  }, [enabled, city, refreshAll]);

  // Coming back to Home after a long time away: the lists are stale
  useEffect(() => {
    if (!enabled || !isFocused || loadedAtRef.current === 0) return;
    if (Date.now() - loadedAtRef.current >= FEED_STALE_AFTER_MS) refreshAll();
  }, [enabled, isFocused, refreshAll]);

  const loadMore = useCallback(
    async (tab: HomeFilterTab) => {
      if (fetchingRef.current[tab] || exhaustedRef.current[tab]) return;
      const current: any[] = feedsRef.current?.[tab] ?? [];
      if (current.length === 0) return;
      fetchingRef.current[tab] = true;
      try {
        const received: number = await dispatch(
          fetchFilterFeed(tab, { city: cityRef.current, skip: current.length, append: true })
        );
        if (received < FILTER_FEED_LIMIT) exhaustedRef.current[tab] = true;
      } finally {
        fetchingRef.current[tab] = false;
      }
    },
    [dispatch, feedsRef, cityRef]
  );

  return { feeds, refresh, loadMore };
}

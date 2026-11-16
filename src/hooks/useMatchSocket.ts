import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { checkMultiple, PERMISSIONS, RESULTS } from "react-native-permissions";
import Geolocation from "react-native-geolocation-service";
import { config } from "../config/config";
import { createSocket } from "../common/Socket";
import { useLatest } from "./useLatest";
import { trackAppsFlyerFirstMatch } from "../services/appsFlyerService";

type Coordinates = { lat: string; long: string };

/** Longest the socket waits for a location fix before connecting without one */
const LOCATION_WAIT_MS = 5000;

/**
 * Silent location for the socket only: no prompts, no gating — the app already
 * requested permission during onboarding (LocationScreen). Location is optional: `settled` turns true as soon as
 * there is a fix, it failed, permission is missing, or LOCATION_WAIT_MS passed, whichever comes first.
 */
function useSilentLocation(): { location: Coordinates; settled: boolean } {
  const [location, setLocation] = useState<Coordinates>({ lat: "", long: "" });
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    let active = true;
    const settle = () => active && setSettled(true);
    const fallbackTimer = setTimeout(settle, LOCATION_WAIT_MS);
    (async () => {
      try {
        const permissions =
          Platform.OS === "ios"
            ? [PERMISSIONS.IOS.LOCATION_WHEN_IN_USE]
            : [PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION, PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION];
        const statuses = await checkMultiple(permissions);
        if (!Object.values(statuses).some((status) => status === RESULTS.GRANTED)) return settle();

        Geolocation.getCurrentPosition(
          (position) => {
            if (!active) return;
            setLocation({
              lat: String(position?.coords?.latitude ?? ""),
              long: String(position?.coords?.longitude ?? ""),
            });
            settle();
          },
          (error) => {
            console.warn("Location fetch failed:", error);
            settle();
          },
          { enableHighAccuracy: false, timeout: LOCATION_WAIT_MS, maximumAge: 60000, forceRequestLocation: true }
        );
      } catch (error) {
        console.warn("Location permission check failed:", error);
        settle();
      }
    })();
    return () => {
      active = false;
      clearTimeout(fallbackTimer);
    };
  }, []);

  return { location, settled };
}

/** Live "it's a match" notifications over the socket; only surfaced while the screen is focused. */
export function useMatchSocket(userId: string | undefined, isFocused: boolean) {
  const { location, settled } = useSilentLocation();
  const isFocusedRef = useLatest(isFocused);
  const [matchVisible, setMatchVisible] = useState(false);
  const [matchData, setMatchData] = useState<any[]>([]);

  // The socket connects once: after the location settled (with or without coordinates). The coordinates are frozen
  // at that moment, so a fix arriving later doesn't change the URL and tear down / reopen the connection.
  const socketCoordsRef = useRef<Coordinates | null>(null);
  if (settled && !socketCoordsRef.current) socketCoordsRef.current = location;
  const socketCoords = socketCoordsRef.current;
  const socketUrl =
    userId && socketCoords
      ? `${config.BASE_URL}?userId=${encodeURIComponent(String(userId))}&lat=${encodeURIComponent(
          socketCoords.lat
        )}&long=${encodeURIComponent(socketCoords.long)}`
      : null;

  useEffect(() => {
    if (!socketUrl) return;
    const socket = createSocket(socketUrl);

    const handleNewMatch = (response: any) => {
      if (!response) return;
      // Counts even when the match popup isn't shown (another tab is open)
      trackAppsFlyerFirstMatch(userId);
      if (!isFocusedRef.current) return;
      setMatchVisible(true);
      setMatchData(response?.matchData ?? []);
    };
    const handleConnect = () => {
      console.log("✅ Socket connected:", socket.id);
    };
    socket.on("connect", handleConnect);
    socket.on("newMatch", handleNewMatch);

    return () => {
      socket.off?.("connect", handleConnect);
      socket.off?.("newMatch", handleNewMatch);
      socket.disconnect?.();
    };
  }, [socketUrl, isFocusedRef, userId]);

  const closeMatch = useCallback(() => setMatchVisible(false), []);

  return { matchVisible, matchData, closeMatch, location };
}

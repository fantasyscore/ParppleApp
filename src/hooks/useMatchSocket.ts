import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import { checkMultiple, PERMISSIONS, RESULTS } from "react-native-permissions";
import Geolocation from "react-native-geolocation-service";
import { config } from "../config/config";
import { createSocket } from "../common/Socket";
import { useLatest } from "./useLatest";

type Coordinates = { lat: string; long: string };

/**
 * Silent location for the socket only: no prompts, no gating — the app already
 * requested permission during onboarding (LocationScreen).
 */
function useSilentLocation(): Coordinates {
  const [location, setLocation] = useState<Coordinates>({ lat: "", long: "" });

  useEffect(() => {
    (async () => {
      try {
        const permissions =
          Platform.OS === "ios"
            ? [PERMISSIONS.IOS.LOCATION_WHEN_IN_USE]
            : [PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION, PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION];
        const statuses = await checkMultiple(permissions);
        if (!Object.values(statuses).some((status) => status === RESULTS.GRANTED)) return;

        Geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              lat: String(position?.coords?.latitude ?? ""),
              long: String(position?.coords?.longitude ?? ""),
            });
          },
          (error) => console.warn("Location fetch failed:", error),
          { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000, forceRequestLocation: true }
        );
      } catch (error) {
        console.warn("Location permission check failed:", error);
      }
    })();
  }, []);

  return location;
}

/** Live "it's a match" notifications over the socket; only surfaced while the screen is focused. */
export function useMatchSocket(userId: string | undefined, isFocused: boolean) {
  const location = useSilentLocation();
  const isFocusedRef = useLatest(isFocused);
  const [matchVisible, setMatchVisible] = useState(false);
  const [matchData, setMatchData] = useState<any[]>([]);

  const socketUrl = userId
    ? `${config.BASE_URL}?userId=${encodeURIComponent(String(userId))}&lat=${encodeURIComponent(
        location.lat
      )}&long=${encodeURIComponent(location.long)}`
    : null;

  useEffect(() => {
    if (!socketUrl) return;
    const socket = createSocket(socketUrl);

    const handleNewMatch = (response: any) => {
      if (!response || !isFocusedRef.current) return;
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
  }, [socketUrl, isFocusedRef]);

  const closeMatch = useCallback(() => setMatchVisible(false), []);

  return { matchVisible, matchData, closeMatch };
}

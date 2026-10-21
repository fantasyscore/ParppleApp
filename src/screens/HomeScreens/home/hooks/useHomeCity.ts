import { useEffect, useState } from "react";
import { reverseGeocode } from "../../../../services/locationService";

type Coordinates = { lat: string; long: string };

// Same coordinates -> same city: no need to ask the geocoder again on every visit
const cityByCoordinates = new Map<string, string>();

/**
 * The city used by the Home filter tabs: the one the device's coordinates (the same ones sent to the
 * socket) resolve to, or, until they do or when they cannot, the city saved on the user's profile.
 */
export function useHomeCity(location: Coordinates, userData: any): string {
  const { lat, long } = location;
  const [coordinateCity, setCoordinateCity] = useState("");

  useEffect(() => {
    if (!lat || !long) return;
    const key = `${Number(lat).toFixed(2)},${Number(long).toFixed(2)}`;
    const cached = cityByCoordinates.get(key);
    if (cached) {
      setCoordinateCity(cached);
      return;
    }
    let cancelled = false;
    reverseGeocode(Number(lat), Number(long))
      .then(({ city }) => {
        if (!city) return;
        cityByCoordinates.set(key, city);
        if (!cancelled) setCoordinateCity(city);
      })
      .catch((error) => console.warn("[HomeCity] Could not resolve the city:", error));
    return () => {
      cancelled = true;
    };
  }, [lat, long]);

  return coordinateCity || String(userData?.city ?? "").trim().toLowerCase();
}

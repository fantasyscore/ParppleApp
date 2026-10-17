import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { appOperation } from "../../../../appOperation";
import { getProfile, listProfiles } from "../../../../actions/authActions";
import { toastAlert } from "../../../../actions/UploadImageActions";
import { logMetaEvent } from "../../../../utils/MetaEvents";
import NavigationService from "../../../../navigation/NavigationService";
import { NAVIGATION_SUBSCRIPTION_SCREEN } from "../../../../navigation/routes";
import { PROFILE_BATCH_LIMIT } from "../constants";
import { isPublishLocked } from "../../../../utils/profile";

const DEFAULT_AGE_RANGE = [18, 80];
const DEFAULT_RADIUS = [100];

/** State + actions behind the "Search Preferences" bottom sheet. */
export function useSearchFilters(userData: any) {
  const dispatch = useDispatch();
  const sheetRef = useRef<any>(null);

  const [ageRange, setAgeRange] = useState(DEFAULT_AGE_RANGE);
  const [locationRadiusEnabled, setLocationRadiusEnabled] = useState(true);
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [photosOnly, setPhotosOnly] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  // Start from the user's saved preferences (only when those specific fields change)
  useEffect(() => {
    if (!userData) return;
    if (userData.preferredAgeRange) {
      setAgeRange([userData.preferredAgeRange.min ?? 18, userData.preferredAgeRange.max ?? 80]);
    }
    if (userData.preferredDistanceKm !== undefined) {
      setRadius([userData.preferredDistanceKm]);
    }
    if (userData.onlyImage !== undefined) {
      setPhotosOnly(userData.onlyImage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.preferredAgeRange, userData?.preferredDistanceKm, userData?.onlyImage]);

  const open = useCallback(() => {
    if (isPublishLocked(userData)) {
      NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN);
    } else {
      sheetRef.current?.open();
    }
  }, [userData]);

  const reset = useCallback(() => {
    setAgeRange(DEFAULT_AGE_RANGE);
    setLocationRadiusEnabled(false);
    setRadius(DEFAULT_RADIUS);
    setPhotosOnly(false);
  }, []);

  const apply = useCallback(async () => {
    if (isApplying) return;
    setIsApplying(true);
    try {
      const payload = {
        preferredAgeRange: { min: ageRange[0], max: ageRange[1] },
        preferredDistanceKm: radius[0],
        onlyImage: photosOnly,
      };
      const filterData = {
        preferredAgeRange: { min: ageRange[0], max: ageRange[1] },
        global: locationRadiusEnabled,
        onlyImage: photosOnly,
        city: userData?.city,
      };
      const response: any = await appOperation.customer.editFilterAPI(payload);
      if (response?.statusCode == 200 || response?.success || response?.status) {
        logMetaEvent("Search", undefined, {
          search_string: "Filter Applied",
          content_type: "user_search",
        });
        toastAlert.showToastError("Filters updated successfully");
        sheetRef.current?.close();
        dispatch(listProfiles(true, 0, PROFILE_BATCH_LIMIT, false, filterData));
        dispatch(getProfile(true));
      } else {
        toastAlert.showToastError(response?.message || "Failed to update filters");
      }
    } catch (error: any) {
      toastAlert.showToastError(error?.message || "Something went wrong");
    } finally {
      setIsApplying(false);
    }
  }, [isApplying, ageRange, radius, photosOnly, locationRadiusEnabled, userData?.city, dispatch]);

  return {
    sheetRef,
    open,
    ageRange,
    setAgeRange,
    locationRadiusEnabled,
    toggleLocationRadius: () => setLocationRadiusEnabled((enabled) => !enabled),
    radius,
    setRadius,
    photosOnly,
    togglePhotosOnly: () => setPhotosOnly((enabled) => !enabled),
    isApplying,
    reset,
    apply,
  };
}

export type SearchFilters = ReturnType<typeof useSearchFilters>;

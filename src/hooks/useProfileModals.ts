import { useCallback, useState } from "react";
import NavigationService from "../navigation/NavigationService";
import { NAVIGATION_CRUSH_PURCHESE_SCREEN, NAVIGATION_SUBSCRIPTION_SCREEN } from "../navigation/routes";
import { isPublishLocked } from "../utils/profile";
import { useLatest } from "./useLatest";

/**
 * The overlays opened from a profile card: the full-profile preview, the crush-note
 * composer and the full-screen photo viewer. Shared by every screen that lists profiles.
 */
export function useProfileModals(userData: any) {
  const userDataRef = useLatest(userData);
  const [selectedProfile, setSelectedProfile] = useState<any>({});
  const [previewVisible, setPreviewVisible] = useState(false);
  const [crushNoteVisible, setCrushNoteVisible] = useState(false);
  const [galleryViewer, setGalleryViewer] = useState<{ visible: boolean; items: any[]; index: number }>({
    visible: false,
    items: [],
    index: 0,
  });

  const closePreview = useCallback(() => setPreviewVisible(false), []);
  const closeCrushNote = useCallback(() => setCrushNoteVisible(false), []);

  const openPreview = useCallback((profile: any) => {
    setSelectedProfile(profile);
    setPreviewVisible(true);
  }, []);

  /** Opens the composer, or sends the user to the paywall / crush-note store when they can't send one. */
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
  /** Shaped like a state setter because FullScreenImage calls it as `setFullImage(false)`. */
  const setGalleryVisible = useCallback((visible: boolean) => {
    setGalleryViewer((viewer) => ({ ...viewer, visible }));
  }, []);

  return {
    selectedProfile,
    previewVisible,
    setPreviewVisible,
    closePreview,
    openPreview,
    crushNoteVisible,
    setCrushNoteVisible,
    closeCrushNote,
    openCrushNote,
    galleryViewer,
    openGallery,
    setGalleryVisible,
  };
}

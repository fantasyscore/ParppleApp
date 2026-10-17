import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { deletePhotoAPI, editProfile, getProfile } from "../../../../actions/authActions";
import { toastAlert } from "../../../../actions/UploadImageActions";
import { useLatest } from "../../../../hooks/useLatest";
import { usePhotoEditorUpload, UploadedPhoto } from "../../../../components/PhotoEditor/usePhotoEditorUpload";

const MAX_PHOTOS = 4;
const MIN_PHOTOS = 2;

export interface ProfilePhoto {
  id: string;
  image: string;
  imageId: string;
  loading: boolean;
}

/**
 * The photos on the signed-in profile: mirrors `userData.gallery` locally so uploads and
 * deletions show immediately, and keeps the backend gallery (order + priority) in sync.
 */
export function useProfilePhotos(gallery: any[] | undefined) {
  const dispatch = useDispatch();
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const photosRef = useLatest(photos);

  useEffect(() => {
    if (gallery) {
      setPhotos(
        gallery
          .map((photo: any, index: number) => ({
            id: String(index),
            image: photo.url || "",
            imageId: photo._id || photo.id || "",
            loading: false,
          }))
          .slice(0, MAX_PHOTOS)
      );
    }
  }, [gallery]);

  const saveGallery = async (nextPhotos: ProfilePhoto[]) => {
    const galleryData = nextPhotos
      .filter((photo) => photo.image !== "")
      .map((photo, index) => ({ priority: index === 0, url: photo.image }));
    await dispatch(editProfile({ gallery: galleryData }, true) as any);
    dispatch(getProfile(false, true));
  };

  const { pickAndEdit, editorVisible, editorProps } = usePhotoEditorUpload({
    canStart: () => {
      if (photosRef.current.some((photo) => photo.loading)) {
        toastAlert.showToastError("Please wait for the current action to finish.");
        return false;
      }
      return true;
    },
    onUploaded: async (_context: any, uploaded: UploadedPhoto) => {
      // The new photo becomes the main one
      const combined = [
        { id: `new-${Date.now()}`, image: uploaded.url, imageId: uploaded.imageId, loading: false },
        ...photosRef.current.filter((photo) => !photo.loading),
      ].slice(0, MAX_PHOTOS);
      setPhotos(combined);
      await saveGallery(combined);
    },
  });

  const setLoading = (id: string, loading: boolean) =>
    setPhotos((prev) => prev.map((photo) => (photo.id === id ? { ...photo, loading } : photo)));

  const deletePhoto = async (photo: ProfilePhoto) => {
    if (photo.loading) return;

    const validCount = photosRef.current.filter((p) => p.image).length;
    if (validCount <= MIN_PHOTOS && photo.image) {
      toastAlert.showToastError("You must have at least 2 photos on your profile.");
      return;
    }

    // Never reached the backend: just drop it locally
    if (!photo.imageId) {
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      return;
    }

    setLoading(photo.id, true);
    try {
      const res = await dispatch(deletePhotoAPI({ imageId: photo.imageId }) as any);
      if (res?.statusCode === 200 || res?.success || res?.code === 200) {
        const remaining = photosRef.current.filter((p) => p.id !== photo.id);
        setPhotos(remaining);
        await saveGallery(remaining);
      } else {
        setLoading(photo.id, false);
        toastAlert.showToastError(res?.message || "Failed to delete image");
      }
    } catch (err: any) {
      console.error("[ProfilePhotos] Delete API error:", err);
      setLoading(photo.id, false);
      toastAlert.showToastError(err?.message || "An error occurred while deleting the image");
    }
  };

  return {
    photos,
    canAddMore: photos.length < MAX_PHOTOS,
    pickAndEdit,
    deletePhoto,
    editorVisible,
    editorProps,
  };
}

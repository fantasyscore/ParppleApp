import { dummyfemaleProfile, dummyMaleProfile } from "./ImageAssets";

/** Gender as stored by the backend: "male"/"female", but profile edits may have saved "Male" */
export const isMaleGender = (gender: any) => String(gender ?? "").trim().toLowerCase() === "male";

/** The placeholder for someone without photos: always the one for their own gender */
export const dummyProfileFor = (gender: any) => (isMaleGender(gender) ? dummyMaleProfile : dummyfemaleProfile);

/**
 * URL of a user's first photo, or undefined. Screens get users in different shapes: `profilePicture` may be an
 * array of photos or a single photo object, and the signed-in user's photos are in `gallery`.
 */
export const profilePhotoUrl = (user: any): string | undefined => {
  const picture = Array.isArray(user?.profilePicture) ? user.profilePicture[0] : user?.profilePicture;
  const galleryPhoto = Array.isArray(user?.gallery) ? user.gallery[0] : undefined;
  return picture?.url || galleryPhoto?.url || undefined;
};

/** Image source for a user's avatar: their first photo, otherwise the dummy image for their gender */
export const profileImageSource = (user: any) => {
  const url = profilePhotoUrl(user);
  return url ? { uri: url } : dummyProfileFor(user?.gender);
};

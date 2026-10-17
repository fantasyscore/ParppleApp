/** Male users who haven't bought a publish plan can't see photos or use most actions. */
export const isPublishLocked = (userData: any): boolean =>
  userData?.gender === "male" && userData?.isPublish === false;

export const capitalizeFirstLetter = (text: string) => {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
};

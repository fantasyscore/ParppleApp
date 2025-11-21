
import { AppOperation } from "./../../index";
import { CUSTOMER_TYPE } from "../../types";

export default (appOperation: AppOperation) => ({
  addProfileAPI: (data: any) =>
    appOperation.post(`dattingApp/users/add-profile`, data, CUSTOMER_TYPE),
  datingProfileAPI: () =>
    appOperation.post(`datting-profile/showProfiles`, {}, CUSTOMER_TYPE),
  swipeLikeDisLikeAPI: (data: any) =>
    appOperation.post(`datting-profile/swipe`, data, CUSTOMER_TYPE),
  likesLikeYouAPI: () =>
    appOperation.post(`datting-profile/likesOnProfile`, {}, CUSTOMER_TYPE),
  youLikedAPI: () =>
    appOperation.post(`datting-profile/profilesLiked`, {}, CUSTOMER_TYPE),
  viewProfileByOtherAPI: () =>
    appOperation.post(`datting-profile/ViewedProfileByUser`, {}, CUSTOMER_TYPE),
  youViewAPI: () =>
    appOperation.post(`datting-profile/viewsOnProfile`, {}, CUSTOMER_TYPE),
  otherDataProfileAPI: (data:any) =>
    appOperation.post(`dattingApp/users/user-profile`, data, CUSTOMER_TYPE),
  getProfileAPI: () =>
    appOperation.post(`dattingApp/users/me`, {}, CUSTOMER_TYPE),
  editProfileAPI: (data:any) =>
    appOperation.post(`dattingApp/users/edit-profile`, data, CUSTOMER_TYPE),
  attributesAPI: () =>
    appOperation.post(`attributes/getAttributes`, {}, CUSTOMER_TYPE),
  editFilterAPI: (data:any) =>
    appOperation.post(`dattingApp/users/edit-filters`, data, CUSTOMER_TYPE),
  discoverAPI: () =>
    appOperation.get(`datting-profile/discoveredProfiles`,  undefined, undefined, CUSTOMER_TYPE),
});

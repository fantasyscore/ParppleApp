
import { AppOperation } from "./../../index";
import { CUSTOMER_TYPE } from "../../types";

export default (appOperation: AppOperation) => ({
  addProfileAPI: (data: any) =>
    appOperation.post(`dattingApp/users/add-profile`, data, CUSTOMER_TYPE),
  datingProfileAPI: (data?: any) =>
    appOperation.post(`datting-profile/showProfiles`, data || {}, CUSTOMER_TYPE),
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
  otherDataProfileAPI: (data: any) =>
    appOperation.post(`dattingApp/users/user-profile`, data, CUSTOMER_TYPE),
  getProfileAPI: () =>
    appOperation.post(`dattingApp/users/me`, {}, CUSTOMER_TYPE),
  editProfileAPI: (data: any) =>
    appOperation.post(`dattingApp/users/edit-profile`, data, CUSTOMER_TYPE),
  attributesAPI: () =>
    appOperation.post(`attributes/getAttributes`, {}, CUSTOMER_TYPE),
  editFilterAPI: (data: any) =>
    appOperation.post(`dattingApp/users/edit-filters`, data, CUSTOMER_TYPE),
  discoverAPI: () =>
    appOperation.get(`datting-profile/discoveredProfiles`, undefined, undefined, CUSTOMER_TYPE),
  newMatchesAPI: () =>
    appOperation.post(`matches/newMatches`, {}, CUSTOMER_TYPE),
  recentMatchesAPI: () =>
    appOperation.post(`matches/recentMatches`, {}, CUSTOMER_TYPE),
  userUnMatchApi: (data: any) =>
    appOperation.post(`app/Useraction/unmatch`, data, CUSTOMER_TYPE),
  userBlockAPI: (data: any) =>
    appOperation.post(`app/Useraction/block`, data, CUSTOMER_TYPE),
  chatHistortAPI: (data: any, params: any) =>
    appOperation.post(`chat/conversation?page=${params?.page}&limit=${params?.limit}`, data, CUSTOMER_TYPE),
  loadChatMessagesAPI: (params: any, data: any) =>
    appOperation.post(`chat/conversation?page=${params?.page}&limit=${params?.limit}`, data, CUSTOMER_TYPE),
  subscriptionverifyAPI: (data: any) =>
    appOperation.post(`subscription/verify`, data, CUSTOMER_TYPE),
  verifyconsumableAPI: (data: any) =>
    appOperation.post(`/api/purchases/google/verify-consumable`, data, CUSTOMER_TYPE),
  recoverPurchaseAPI: (data: any) =>
    appOperation.post(`/api/purchases/google/recover`, data, CUSTOMER_TYPE),
  crushnotesSenderAPI: (data: any) =>
    appOperation.post(`api/v1/crush-note/send`, data, CUSTOMER_TYPE),
  boostActivateAPI: () =>
    appOperation.post(`api/v1/boost/activate`, {}, CUSTOMER_TYPE),
  advanceFilterAPI: (data: any) =>
    appOperation.post(`dattingApp/users/advance-filters`, data, CUSTOMER_TYPE),
  sendObject: (data: any) =>
    appOperation.post(`dattingApp/users/getObject`, data, CUSTOMER_TYPE),
  receivedCrushNotesAPI: () =>
    appOperation.get(`api/v1/crush-note/received`, undefined, undefined, CUSTOMER_TYPE),
  sentCrushNotesAPI: () =>
    appOperation.get(`api/v1/crush-note/sent`, undefined, undefined, CUSTOMER_TYPE),
  crushNoteAccecpt: (data: any) =>
    appOperation.post(`api/crush-notes/action`, data, CUSTOMER_TYPE),
  deleteAccount: () =>
    appOperation.post(`dattingApp/users/delete-account`, {}, CUSTOMER_TYPE),
  reportUserAPI: (data: any) =>
    appOperation.post(`api/reports/reporteUser`, data, CUSTOMER_TYPE),
  // Alternative: If API requires POST instead of GET
  // loadChatMessagesAPI: (data: any) =>
  //   appOperation.post(`chat/conversation`, data, CUSTOMER_TYPE),
});

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState } from "./authSliceTypes";

export const initialState: AuthState = {
  isLoading: false,
  bottomRemove: false,
  addProfileData:undefined,
  listProfiles:[],
  likeByOtherData:undefined,
  likeYouData:undefined,
  viewByOtherData:undefined,
  viewYouData:undefined,
  otherUserProfile:undefined,
  userData:undefined,
  attributes:[],
  filterData:undefined,
  discoverProfileData:[],
  emailAuth:undefined,
  newMatches:[],
  matchChatUserDetails:undefined,
  chatHistory:[],
  recentMatches:[],
  receivedcrushNotes:[],
  showMessage:undefined,
  turnOnData:[],
  profileHide:undefined
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // No-op here: the root reducer resets the whole store when it sees this action
    logout: () => {},
    setLoading: (state: AuthState, { payload }: PayloadAction<boolean>) => {
      state.isLoading = payload;
    },
    setBottomRemove: (state, { payload }: PayloadAction<any>) => {
      state.bottomRemove = payload;
    },
    setAddProfile: (state, { payload }: PayloadAction<any>) => {
      state.addProfileData = payload;
    },
    setListProfiles: (state, { payload }: PayloadAction<any>) => {
      state.listProfiles = payload;
    },
    /** Drops a user (e.g. just reported) from the Home feed and the likes / views lists */
    removeUserFromProfileLists: (state, { payload: userId }: PayloadAction<string>) => {
      const without = (list: any) => (Array.isArray(list) ? list.filter((profile: any) => String(profile?.userId) !== String(userId)) : list);
      state.listProfiles = without(state.listProfiles);
      state.likeByOtherData = without(state.likeByOtherData);
      state.likeYouData = without(state.likeYouData);
      state.viewByOtherData = without(state.viewByOtherData);
      state.viewYouData = without(state.viewYouData);
    },
    /** Removes one profile from a likes / views "incoming" list so the bottom-tab badge count drops with it */
    removeIncomingProfile: (state, { payload }: PayloadAction<{ listKey: "likeByOtherData" | "viewByOtherData"; profileId: string }>) => {
      const list: any = state[payload.listKey];
      if (Array.isArray(list)) {
        (state as any)[payload.listKey] = list.filter((profile: any) => profile?._id !== payload.profileId);
      }
    },
    setLikeByOther: (state, { payload }: PayloadAction<any>) => {
      state.likeByOtherData = payload;
    },
    setLikeYou: (state, { payload }: PayloadAction<any>) => {
      state.likeYouData = payload;
    },
    setViewByOhter: (state, { payload }: PayloadAction<any>) => {
      state.viewByOtherData = payload;
    },
    setViewYou: (state, { payload }: PayloadAction<any>) => {
      state.viewYouData = payload;
    },
    setOtherUserProfile: (state, { payload }: PayloadAction<any>) => {
      state.otherUserProfile = payload;
    },
    setGetProfile: (state, { payload }: PayloadAction<any>) => {
      state.userData = payload;
    },
    setAttributes: (state, { payload }: PayloadAction<any>) => {
      state.attributes = payload;
    },
    setfilterData: (state, { payload }: PayloadAction<any>) => {
      state.filterData = payload;
    },
    setDiscoverData: (state, { payload }: PayloadAction<any>) => {
      state.discoverProfileData = payload;
    },
    setEmailAuth: (state, { payload }: PayloadAction<any>) => {
      state.emailAuth = payload;
    },
    setNewMatches: (state, { payload }: PayloadAction<any>) => {
      state.newMatches = payload;
    },
    setRecentMatches: (state, { payload }: PayloadAction<any>) => {
      state.recentMatches = payload;
    },
    matchChatDetails: (state, { payload }: PayloadAction<any>) => {
      state.matchChatUserDetails = payload;
    },
    chatHistoryDetails: (state, { payload }: PayloadAction<any>) => {
      state.chatHistory = payload;
    },
    setReceivedCrushNotes: (state, { payload }: PayloadAction<any>) => {
      state.receivedcrushNotes = payload;
    },
    setRemoteMessage: (state, { payload }: PayloadAction<any>) => {
      state.showMessage = payload;
    },
    setTurnOnData: (state, { payload }: PayloadAction<any>) => {
      state.turnOnData = payload;
    },
    setProfileHide: (state, { payload }: PayloadAction<any>) => {
      state.profileHide = payload;
    },
  },
});

export const {
  setLoading,
  logout,
  setBottomRemove,
  setAddProfile,
  setListProfiles,
  removeUserFromProfileLists,
  removeIncomingProfile,
  setLikeByOther,
  setLikeYou,
  setViewByOhter,
  setViewYou,
  setOtherUserProfile,
  setGetProfile,
  setAttributes,
  setfilterData,
  setDiscoverData,
  setEmailAuth,
  setNewMatches,
  matchChatDetails,
  chatHistoryDetails,
  setRecentMatches,
  setReceivedCrushNotes,
  setRemoteMessage,
  setTurnOnData,
  setProfileHide
} = authSlice.actions;

export default authSlice.reducer;


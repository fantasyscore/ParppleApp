import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../reducers/rootReducer";
import { AuthState, MechantProps, UserProps } from "./authSliceTypes";

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
  chatHistory:[]
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
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
    matchChatDetails: (state, { payload }: PayloadAction<any>) => {
      state.matchChatUserDetails = payload;
    },
    chatHistoryDetails: (state, { payload }: PayloadAction<any>) => {
      state.chatHistory = payload;
    },
  },
});

export const {
  setLoading,
  setBottomRemove,
  setAddProfile,
  setListProfiles,
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
  chatHistoryDetails  
} = authSlice.actions;

export const authSelector = (state: RootState) => state.auth;
export default authSlice.reducer;


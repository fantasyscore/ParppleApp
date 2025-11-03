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
  userData:undefined
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
  setGetProfile
} = authSlice.actions;

export const authSelector = (state: RootState) => state.auth;
export default authSlice.reducer;


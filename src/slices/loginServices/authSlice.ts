import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState } from "./authSliceTypes";

/** The id the blocked-users API sends for a user; also what unblocking needs as `blockedId`. */
export const blockedUserIdOf = (user: any): string => String(user?.userId ?? user?.blockedId ?? user?._id ?? "");

const PHOTO_LABEL = "📷 Photo";
const isPhotoMessage = (lastMessage: any) =>
  lastMessage?.messageType === "image" ||
  lastMessage?.type === "image" ||
  lastMessage?.text === PHOTO_LABEL ||
  lastMessage?.message === PHOTO_LABEL;

/** Swaps the last message of matches whose last message is a photo that is gone (see setLastMessageOverride). */
const applyLastMessageOverrides = (matches: any, overrides: any) => {
  if (!Array.isArray(matches) || !overrides) return matches;
  return matches.map((chat: any) => {
    const override = overrides[chat?.matchId];
    if (!override || !isPhotoMessage(chat?.lastMessage)) return chat;
    // Only the photo that was viewed: a newer message must show as it is
    const photoTime = new Date(chat.lastMessage.createdAt).getTime();
    if (Math.abs(photoTime - override.photoCreatedAt) > 1500) return chat;
    return { ...chat, lastMessage: override.lastMessage };
  });
};

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
  profileHide:undefined,
  blockedUsers:undefined,
  lastMessageOverrides:{},
  filterFeeds:{},
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
      const feeds: any = state.filterFeeds ?? {};
      Object.keys(feeds).forEach((tab) => {
        feeds[tab] = without(feeds[tab]);
      });
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
      state.newMatches = applyLastMessageOverrides(payload, state.lastMessageOverrides);
    },
    /**
     * A view-once photo that was the last message has been viewed and is gone from the chat: the chat list shows the
     * last message that is still visible instead (or none). Remembered, so a refetch from the server (which still
     * reports the photo) does not bring the photo label back.
     */
    setLastMessageOverride: (
      state,
      { payload }: PayloadAction<{ matchId: string; photoCreatedAt: number; lastMessage: any | null }>
    ) => {
      const overrides = state.lastMessageOverrides ?? (state.lastMessageOverrides = {});
      overrides[payload.matchId] = { photoCreatedAt: payload.photoCreatedAt, lastMessage: payload.lastMessage };
      state.newMatches = applyLastMessageOverrides(state.newMatches, overrides) as any;
    },
    /** One free like used: every screen reads the remaining count from userData, so they all stay in step */
    consumeStoreSwipe: (state) => {
      const user: any = state.userData;
      if (user && typeof user.swipesRemaining === "number") {
        user.swipesRemaining = Math.max(user.swipesRemaining - 1, 0);
      }
    },
    /** Stores (or appends to) the profiles of one Home filter tab */
    setFilterFeed: (
      state,
      { payload }: PayloadAction<{ tab: "nearby" | "verified" | "online"; profiles: any[]; append?: boolean }>
    ) => {
      const feeds: any = state.filterFeeds ?? (state.filterFeeds = {});
      if (payload.append) {
        const existing: any[] = feeds[payload.tab] ?? [];
        const knownIds = new Set(existing.map((profile: any) => profile._id));
        feeds[payload.tab] = [...existing, ...payload.profiles.filter((profile: any) => !knownIds.has(profile._id))];
      } else {
        feeds[payload.tab] = payload.profiles;
      }
    },
    /** Takes one profile out of the Home feed and every filter tab (liked, disliked, blocked...) */
    removeProfileFromFeeds: (state, { payload: profileId }: PayloadAction<string>) => {
      state.listProfiles = (state.listProfiles as any[]).filter((profile: any) => profile._id !== profileId) as any;
      const feeds: any = state.filterFeeds ?? {};
      Object.keys(feeds).forEach((tab) => {
        if (Array.isArray(feeds[tab])) feeds[tab] = feeds[tab].filter((profile: any) => profile._id !== profileId);
      });
    },
    setBlockedUsers: (state, { payload }: PayloadAction<any[]>) => {
      state.blockedUsers = payload;
    },
    removeBlockedUser: (state, { payload: userId }: PayloadAction<string>) => {
      state.blockedUsers = (state.blockedUsers ?? []).filter((user: any) => blockedUserIdOf(user) !== userId);
    },
    restoreBlockedUser: (state, { payload: user }: PayloadAction<any>) => {
      const list = state.blockedUsers ?? [];
      if (!list.some((existing: any) => blockedUserIdOf(existing) === blockedUserIdOf(user))) {
        state.blockedUsers = [user, ...list];
      }
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
  setLastMessageOverride,
  matchChatDetails,
  chatHistoryDetails,
  setRecentMatches,
  setBlockedUsers,
  setFilterFeed,
  removeProfileFromFeeds,
  consumeStoreSwipe,
  removeBlockedUser,
  restoreBlockedUser,
  setReceivedCrushNotes,
  setRemoteMessage,
  setTurnOnData,
  setProfileHide
} = authSlice.actions;

export default authSlice.reducer;


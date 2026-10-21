import { InteractionManager } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { appOperation } from "../appOperation";
import { USER_TOKEN_KEY } from "../helper/Constants";
import NavigationService from "../navigation/NavigationService";
import { NAVIGATION_BOTTOMTAB_SCREEN, NAVIGATION_CHATS_SCREEN, NAVIGATION_GANDER_SCREEN, NAVIGATION_OTP_SCREEN, NAVIGATION_PROCCED_SCREEN, NAVIGATION_TAKING_SCREEN, NAVIGATION_USER_EDIT_PROFILE_SCREEN, NAVIGATION_WELCOME_SCREEN } from "../navigation/routes";
import { toastAlert } from "./UploadImageActions";
import Toast from "react-native-toast-message";
import { chatHistoryDetails, matchChatDetails, setAttributes, setDiscoverData, setGetProfile, setLikeByOther, setLikeYou, setListProfiles, removeUserFromProfileLists, setFilterFeed, setBlockedUsers, removeBlockedUser, restoreBlockedUser, blockedUserIdOf, setNewMatches, setOtherUserProfile, setRecentMatches, setTurnOnData, setViewByOhter, setViewYou } from "../slices/loginServices/authSlice";
import { logLogin, logSignUp, setAnalyticsUserId } from "../services/analyticsService";

/**
 * Loads everything the signed-in app needs: profile, discovery feed, matches, likes, views and
 * turn-ons. Used on app start, after login and after onboarding. `listProfiles()` also moves the
 * user into the main tabs once the feed arrives.
 */
export const loadSessionData: any = () => (dispatch: any) => {
    // The feed and the profile decide what the first screen shows (and the feed moves the user into the tabs)
    dispatch(listProfiles());
    dispatch(getProfile(true));
    // Everything else only fills badges and the other tabs: start it once the screen transition has finished so
    // its store updates and re-renders don't compete with the animation.
    InteractionManager.runAfterInteractions(() => {
        dispatch(discoverProfile());
        dispatch(getNewMatches());
        dispatch(getRecentMatches());
        dispatch(likeByOther());
        dispatch(likeYou());
        dispatch(viewProfileByOther());
        dispatch(youView());
        dispatch(turnOn({}));
    });
};
export const userLogin: any = (data: any, gmail: any) => async (dispatch: any) => {
    try {
        const response: any = await appOperation.guest.login(data);
        console.log(response, "responseresponseresponse");

        if (response?.statusCode == 200) {
            toastAlert.showToastError(response.message);
            appOperation.setCustomerToken(response?.data?.tokenData?.token);
            await AsyncStorage.setItem(USER_TOKEN_KEY, response?.data?.tokenData?.token);
            if (response?.data?.profileCleared) {
                const userId = response?.data?.userData?.id || response?.data?.userData?._id || response?.data?.id;
                if (userId) {
                    await setAnalyticsUserId(String(userId));
                }
                await logLogin(data?.googleToken ? 'google' : data?.iosToken ? 'apple' : 'phone');
                // NavigationService.navigate(NAVIGATION_GANDER_SCREEN);
                dispatch(loadSessionData());
            } else {
                if (gmail) {
                    NavigationService.navigate(NAVIGATION_GANDER_SCREEN);
                    // NavigationService.navigate(NAVIGATION_PROCCED_SCREEN, { comming: "OTP" })
                } else {
                    NavigationService.navigate(NAVIGATION_OTP_SCREEN, { PhoneNumber: data?.phoneNumber })
                }
            }
            return true;
        } else {
            console.log("i am here")
            // toastAlert.showToastError(response.message);
            return false;
        }
    } catch (error: any) {
        console.log(error, "errorerrorerrorerrorerror")
        // toastAlert.showToastError(error);
        return false;
    }
};
export const sendOtpApi: any = (data: any, gmail: any) => async (dispatch: any) => {
    try {
        const response: any = await appOperation.guest.sendOtp(data);
        if (response?.statusCode == 200) {
            NavigationService.navigate(NAVIGATION_OTP_SCREEN, { PhoneNumber: data?.phoneNumber })
        } else {
        }
    } catch (error: any) {
        // toastAlert.showToastError(error);
    }
};
export const otpVerifyAPIOne: any = (data: any, gmail: any) => async (dispatch: any) => {
    try {
        const response: any = await appOperation.guest.otpVerifyAPI(data);
        if (response?.success == true) {
            toastAlert.showToastError(response.message);
            appOperation.setCustomerToken(response?.data?.token);
            await AsyncStorage.setItem(USER_TOKEN_KEY, response?.data?.token);
            if (response?.data?.profileCleared) {
                const userId = response?.data?.userData?.id || response?.data?.userData?._id || response?.data?.id;
                if (userId) {
                    await setAnalyticsUserId(String(userId));
                }
                await logLogin('phone_otp');
                dispatch(listProfiles());
                dispatch(getProfile(true));
                dispatch(discoverProfile())
            } else {
                NavigationService.navigate(NAVIGATION_PROCCED_SCREEN, { comming: "OTP" })
            }
        } else {
            toastAlert.showToastError(response.message);
        }
    } catch (error: any) {
        // toastAlert.showToastError(error);
    }
};
export const addProfile: any = (data: any) => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.addProfileAPI(data);
        if (response?.statusCode == 200) {
            await logSignUp('profile_complete');
            dispatch(listProfiles(true));
            NavigationService.reset(NAVIGATION_BOTTOMTAB_SCREEN)
        } else {
            Toast.show({
                type: "error",
                text2: response?.message || "Unable to save your profile. Please try again.",
            });
        }
        return response;
    } catch (error: any) {
        // Toast.show({
        //     type: "error",
        //     text2: "Unable to save your profile. Please try again.",
        // });
        return { statusCode: 500, message: String(error ?? "") };
    }
};
export const listProfiles: any = (navigate: any, skip?: number, limit?: number, merge?: boolean, filterData?: any) => async (dispatch: any, getState: any) => {
    // Prevent accidental rapid duplicate calls from multiple screens mounting.
    // (e.g. AuthLoading + Home focus effect)
    // Note: we only guard "in flight", not "already cached".
    if ((listProfiles as any)._inFlight) return { skipped: true };
    (listProfiles as any)._inFlight = true;
    try {
        const payload: any = {};
        if (skip !== undefined) payload.skip = skip;
        if (limit !== undefined) payload.limit = limit;
        // "All" tab: the city is sent empty, unless the user picked a city in the filter sheet
        payload.city = filterData?.global === false ? filterData?.city : "";
        payload.minAge = filterData?.preferredAgeRange?.min;
        payload.maxAge = filterData?.preferredAgeRange?.max;
        payload.photosOnly = filterData?.onlyImage;
        payload.anywhere = filterData?.global

        const response: any = await appOperation.customer.datingProfileAPI(payload);
        if (response?.statusCode == 200) {
            const responseData = Array.isArray(response?.data) ? response.data : [];
            const dataWithIndex = responseData.map((item: any) => ({
                ...item,
                index: Number.isFinite(Number(item?.index)) ? Number(item.index) : 0,
            }));

            if (merge && getState) {
                // Merge with existing profiles, avoiding duplicates
                const state = getState();
                const existingProfiles = state?.auth?.listProfiles || [];
                const existingIds = new Set(existingProfiles.map((p: any) => p._id));
                const newProfiles = dataWithIndex.filter((item: any) => !existingIds.has(item._id));
                if (newProfiles.length === 0) {
                    !navigate && NavigationService.reset(NAVIGATION_BOTTOMTAB_SCREEN)
                    return { data: dataWithIndex, newProfiles, mergedProfiles: existingProfiles };
                }
                const mergedProfiles = [...existingProfiles, ...newProfiles];
                dispatch(setListProfiles(mergedProfiles));
                !navigate && NavigationService.reset(NAVIGATION_BOTTOMTAB_SCREEN)
                return { data: dataWithIndex, newProfiles, mergedProfiles };
            } else {
                // Fresh fetch - replace all profiles
                dispatch(setListProfiles(dataWithIndex));
                !navigate && NavigationService.reset(NAVIGATION_BOTTOMTAB_SCREEN)
                return { data: dataWithIndex, newProfiles: dataWithIndex, mergedProfiles: dataWithIndex };
            }
        }
        return { data: [], newProfiles: [], mergedProfiles: [] };
    } catch (error: any) {
        NavigationService.navigate(NAVIGATION_WELCOME_SCREEN);
        // toastAlert.showToastError(error);
        return { data: [], newProfiles: [], mergedProfiles: [], error };
    } finally {
        (listProfiles as any)._inFlight = false;
    }
};
export type HomeFilterTab = "nearby" | "verified" | "online";
export const FILTER_FEED_LIMIT = 20;

/**
 * Loads one Home filter tab (Near By / Verified / Online) from showProfiles into auth.filterFeeds.
 * Resolves the number of profiles received, so callers know when a tab has no more pages.
 */
export const fetchFilterFeed: any =
    (tab: HomeFilterTab, options: { city?: string; skip?: number; append?: boolean } = {}) => async (dispatch: any) => {
        const { city, skip = 0, append = false } = options;
        try {
            const payload: any = { [tab]: true, skip, limit: FILTER_FEED_LIMIT };
            // Only Near By sends the city; Verified and Online do not
            if (tab === "nearby" && city) payload.city = city;
            
            const response: any = await appOperation.customer.datingProfileAPI(payload);
            // Debug: what the Verified tab's request sent and what the server answered
            if (tab === "verified") {
                console.log("[VerifiedFeed] request:", JSON.stringify(payload));
                console.log("[VerifiedFeed] response:", JSON.stringify({
                    statusCode: response?.statusCode,
                    message: response?.message,
                    count: Array.isArray(response?.data) ? response.data.length : response?.data,
                    firstProfile: Array.isArray(response?.data) ? response.data[0] : undefined,
                }));
            }
            if (response?.statusCode == 200) {
                const data: any[] = Array.isArray(response?.data) ? response.data : [];
                dispatch(setFilterFeed({ tab, profiles: data, append }));
                return data.length;
            }
        } catch (error: any) {
            console.log(error, `${tab} feed error`);
            if (tab === "verified") console.log("[VerifiedFeed] request failed:", String(error?.message ?? error));
        }
        // A failed first load still ends the tab's "loading" state with an empty list
        if (!append) dispatch(setFilterFeed({ tab, profiles: [], append: false }));
        return 0;
    };

export const swipeLikeDisLike: any = (data: any) => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.swipeLikeDisLikeAPI(data);
        if (response?.statusCode == 200) {
        }
    } catch (error: any) {
        // toastAlert.showToastError(error);
    }
};
export const turnOn: any = (data: any) => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.turnOnAPI(data);
        console.log(response, "responseresponseresponse");

        if (response?.statusCode == 200) {
            dispatch(setTurnOnData(response?.data))
        }
    } catch (error: any) {
        // toastAlert.showToastError(error);
    }
};
export const likeByOther: any = () => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.likesLikeYouAPI();
        if (response?.statusCode == 200) {
            dispatch(setLikeByOther(response?.data))
        }
    } catch (error: any) {
        // toastAlert.showToastError(error);
    }
};
export const likeYou: any = () => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.youLikedAPI();
        if (response?.statusCode == 200) {
            dispatch(setLikeYou(response?.data))
        }
    } catch (error: any) {
        // toastAlert.showToastError(error);
    }
};
export const viewProfileByOther: any = () => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.viewProfileByOtherAPI();
        if (response?.statusCode === 200) {
            // dispatch(setViewByOhter(response?.data));
            dispatch(setViewYou(response?.data));

        }
    } catch (error: any) {
        // toastAlert.showToastError(error);
    }
};
export const youView: any = () => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.youViewAPI();
        if (response?.statusCode === 200) {
            dispatch(setViewByOhter(response?.data));
        }
    } catch (error: any) {
        // toastAlert.showToastError(error);
    }
};
export const getOtherProfile: any = (data: any, setCurrentProfileData: any, setOtherUserProfile: any) => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.otherDataProfileAPI(data);

        if (response?.statusCode == 200) {
            setCurrentProfileData(response?.data);
            setOtherUserProfile(true)
        }
    } catch (error: any) {
        console.log(error, "error");
    }
};
export const getProfile: any = (navigate: any, profile: any) => async (dispatch: any) => {
    if ((getProfile as any)._inFlight) return;
    (getProfile as any)._inFlight = true;
    try {
        const response: any = await appOperation.customer.getProfileAPI();
        if (response?.statusCode == 200) {
            dispatch(setGetProfile(response?.data));
            dispatch(setOtherUserProfile(response?.data));
            const userId = response?.data?.id || response?.data?._id || response?.data?.userId;
            if (userId) {
                await setAnalyticsUserId(String(userId));
            }
            !navigate && NavigationService.navigate(NAVIGATION_USER_EDIT_PROFILE_SCREEN, { other: false, profile: profile })
        }
    } catch (error: any) {
        // toastAlert.showToastError(error);
    } finally {
        (getProfile as any)._inFlight = false;
    }
};
let isEditing = false;
export const editProfile: any = (data: any, navigate: any) => async (dispatch: any) => {
    if (isEditing) {
        console.log("Edit already in progress — skipping...");
        return;
    }
    isEditing = true;
    try {
        const response: any = await appOperation.customer.editProfileAPI(data);
        if (response?.statusCode == 200) {
            dispatch(getProfile(true));
            // navigate ? console.log() : NavigationService.goBack();
        } else {
            toastAlert.showToastError(response?.message || "Something went wrong!");
        }
    } catch (error: any) {
        console.log(error, "error");
        // toastAlert.showToastError(error);
    } finally {
        isEditing = false;
    }
};

export const attributesGet: any = () => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.attributesAPI();
        if (response?.statusCode == 200) {
            dispatch(setAttributes(response?.data));
        }
    } catch (error: any) {
        // toastAlert.showToastError(error);
    }
};
export const editFilter: any = (data: any) => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.editFilterAPI(data);
        if (response?.statusCode == 200) {
            NavigationService.goBack()
        }
    } catch (error: any) {
        // toastAlert.showToastError(error);
    }
};
export const discoverProfile: any = () => async (dispatch: any) => {
    if ((discoverProfile as any)._inFlight) return;
    (discoverProfile as any)._inFlight = true;
    try {
        const response: any = await appOperation.customer.discoverAPI();
        if (response?.statusCode == 200) {
            dispatch(setDiscoverData(response?.data))
        }
    } catch (error: any) {
    } finally {
        (discoverProfile as any)._inFlight = false;
    }
};
export const getNewMatches: any = () => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.newMatchesAPI();

        if (response?.statusCode == 200) {
            dispatch(setNewMatches(response?.data))
        }
    } catch (error: any) {
    }
};
export const publishProfileEveryone: any = (data: any) => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.publishProfileAPI(data);

        if (response?.statusCode == 200) {
            dispatch(getProfile(true) as any);
            // dispatch(setNewMatches(response?.data))
        }
    } catch (error: any) {
    }
};
export const getRecentMatches: any = () => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.recentMatchesAPI();

        if (response?.statusCode == 200) {
            dispatch(setRecentMatches(response?.data))
        }
    } catch (error: any) {
    }
};
export const userUnmatchAPI: any = (data: any) => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.userUnMatchApi(data);
        if (response?.statusCode == 200) {
            dispatch(getNewMatches())
            return NavigationService.navigate(NAVIGATION_CHATS_SCREEN)
        }
    } catch (error: any) {
    }
};
export const userBlockAPI: any = (data: any, options: { navigateToChats?: boolean } = {}) => async (dispatch: any) => {
    const { navigateToChats = true } = options;
    try {
        const response: any = await appOperation.customer.userBlockAPI(data);
        if (response?.statusCode == 200) {
            dispatch(getNewMatches())
            if (navigateToChats) NavigationService.navigate(NAVIGATION_CHATS_SCREEN)
            return true;
        }
        return false;
    } catch (error: any) {
        console.log(error, "errorerrorerror");

    }
};
// Last fetched first page per match, so reopening a chat paints instantly (like WhatsApp) while the
// fresh page loads in the background.
const chatHistoryCache = new Map<string, any[]>();
export const clearChatHistoryCache = () => chatHistoryCache.clear();
/** Replaces the cached history of a chat (the chat screen saves what it shows when it is left). */
export const setChatHistoryCache = (matchId: string, items: any[]) => {
    chatHistoryCache.set(String(matchId), items);
};
/** A deleted message must not come back from the cached history the next time the chat opens. */
export const removeMessageFromChatHistoryCache = (matchId: string, messageId: string) => {
    const cached = chatHistoryCache.get(String(matchId));
    if (!cached) return;
    chatHistoryCache.set(
        String(matchId),
        cached.filter((message: any) => String(message?._id ?? message?.messageId ?? message?.id) !== String(messageId))
    );
};

export const chatHistoryAPI: any = (data: any, params: any, shouldNavigate: boolean = true) => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.chatHistortAPI(data, params);

        if (response?.statusCode == 200) {
            if (data?.matchId && params?.page === 1 && Array.isArray(response.data)) {
                chatHistoryCache.set(String(data.matchId), response.data);
            }
            dispatch(chatHistoryDetails(response.data))
            if (shouldNavigate) {
                NavigationService.navigate(NAVIGATION_TAKING_SCREEN)
            }
        }
    } catch (error: any) {
    }
};
/**
 * Opens the chat for a match: resets the chat state, navigates to the chat screen and loads the first page of history.
 * Shared by every screen that lists matches so the flow stays identical.
 */
export const openMatchChat: any = (item: any) => (dispatch: any) => {
    const forEmptyChat = item?.lastMessage === null;
    dispatch(chatHistoryDetails(chatHistoryCache.get(String(item.matchId)) ?? []));
    dispatch(matchChatDetails(item));
    NavigationService.navigate(NAVIGATION_TAKING_SCREEN, { forEmptyChat });
    dispatch(chatHistoryAPI({ otherUserId: item.userId, matchId: item.matchId }, { page: 1, limit: 50 }, false));
};
export const subscriptionVerifyAPI: any = (data: any, params: any) => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.subscriptionverifyAPI(data);
        if (response?.statusCode == 200) {
            toastAlert.showToastError(response?.message || "Subscription verified and activated");
        }
        return response;
    } catch (error: any) {
        throw error;
    }
};
export const verifyconsumableitemsAPI: any = (data: any, params: any) => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.verifyconsumableAPI(data);
        if (response?.statusCode == 200) {
            toastAlert.showToastError(response?.message || "Subscription verified and activated");
        }
        return response;
    } catch (error: any) {
        throw error;
    }
};
export const sendCrushNotesAPI: any = (data: any, params: any) => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.crushnotesSenderAPI(data);
        if (response?.statusCode == 200) {
            toastAlert.showToastError(response.message)
        }
        return response;
    } catch (error: any) {
        toastAlert.showToastError("You can only send one crush note to this user per 24 hours")
        throw error;
    }
};

export const activateBoostAPI: any = () => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.boostActivateAPI();
        if (response?.statusCode == 200) {
            dispatch(getProfile(true));
        }
        return true;
    } catch (error: any) {
        // toastAlert.showToastError(error?.message || "Failed to activate boost");
        throw error;
    }
};
export const sendAdvanceFilter: any = (data: any, params: any) => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.advanceFilterAPI(data);
        if (response?.statusCode == 200) {
        }
        return response;
    } catch (error: any) {
        throw error;
    }
};
export const objectSendAPI: any = (data: any, params: any) => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.sendObject(data);
        if (response?.statusCode == 200) {
        }
        return response;
    } catch (error: any) {
        throw error;
    }
};
export const crushNoteAccecptAPI: any = (data: any, matchChatUserDetails: any, notNavigate: any) => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.crushNoteAccecpt(data);
        console.log(response, "response");

        if (response?.statusCode == 200) {
            if (notNavigate) {
                NavigationService.goBack()
            } else {
                const data = {
                    otherUserId: matchChatUserDetails.userId,
                    matchId: response.data,
                };
                const params = {
                    page: 1,
                    limit: 50,
                };
                dispatch(chatHistoryDetails([]));
                dispatch(matchChatDetails(matchChatUserDetails));
                NavigationService.replace(NAVIGATION_TAKING_SCREEN);
                dispatch(chatHistoryAPI(data, params, false));
            }
        }
    } catch (error: any) {
        console.log(error, "errorerrorerrorerrorerror");
        throw error;
    }
};
export const deleteAccountAPI: any = () => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.deleteAccount();
        if (response?.statusCode == 200) {
            console.log(response, "responseresponseresponse");

        }
        return response;
    } catch (error: any) {
        throw error;
    }
};
export const iosPucrchesAPIIs: any = (data: any) => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.iosPurchesAPI(data);
        if (response?.statusCode == 200) {
            console.log(response, "responseresponseresponse");

        }
        return response;
    } catch (error: any) {
        throw error;
    }
};


export const reportUserAPI: any =
    (payload: { reportedUserId: string; subject: string; body: string }) => async (dispatch: any) => {
        try {
            const response: any = await appOperation.customer.reportUserAPI(payload);
            if (response?.statusCode == 200) {
                // The reported profile disappears from Home / Likes / Views right away
                dispatch(removeUserFromProfileLists(payload.reportedUserId));
                return response;
            }
            // Toast.show({
            //     type: "error",
            //     text2: response?.message || "Unable to submit report. Please try again.",
            // });
            return response;
        } catch (error: any) {
            // Toast.show({
            //     type: "error",
            //     text2: "Unable to submit report. Please try again.",
            // });
            return { statusCode: 500, message: String(error ?? "") };
        }
    };

/** Loads the users you have blocked into the store (auth.blockedUsers). */
export const getBlockedUsersAPI: any = () => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.blockedUsersAPI();
        if (response?.statusCode == 200) {
            const list = response?.data?.blockedUsers ?? response?.data?.users ?? response?.data;
            dispatch(setBlockedUsers(Array.isArray(list) ? list : []));
            return;
        }
    } catch (error: any) {
        console.log(error, "blocked users error");
    }
    // Loading failed: show an empty list rather than a spinner forever
    dispatch(setBlockedUsers([]));
};

/** Unblocks a user: removes them from auth.blockedUsers at once and puts them back if the server refuses. */
export const unblockUserAPI: any = (user: any) => async (dispatch: any) => {
    const userId = blockedUserIdOf(user);
    if (!userId) return false;
    dispatch(removeBlockedUser(userId));
    const unblocked = await dispatch(blockByIdAPIUser({ blockedId: userId }, { navigateToChats: false }));
    if (unblocked) {
        toastAlert.showToastError(`${user?.username || user?.name || "User"} has been unblocked.`);
    } else {
        dispatch(restoreBlockedUser(user));
        toastAlert.showToastError("Couldn't unblock this user. Please try again.");
    }
    return unblocked;
};

/** Blocks a user by their user id (no match needed). Resolves true on success. */
export const blockByIdAPIUser: any = (data: any, options: { navigateToChats?: boolean } = {}) => async (dispatch: any) => {
    const { navigateToChats = true } = options;
    try {
        const response: any = await appOperation.customer.blockByIdAPI(data);
        console.log(response, "responseresponseresponse");
        if (response?.statusCode == 200) {
            dispatch(getNewMatches())
            if (navigateToChats) NavigationService.navigate(NAVIGATION_CHATS_SCREEN)
            return true;
        }
        return false;
    } catch (error: any) {
        console.log(error, "responseresponseresponse");
        return false;
    }
};


export const uploadImagesPhotoAPI: any = (data: any, params: any) => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.uplaodPhotoAPI(data);
        console.log(response, "responseresponseresponseresponse")

        if (response?.statusCode == 200) {
            console.log(response, "responseresponseresponseresponse")
        }
        return response;
    } catch (error: any) {
        throw error;
    }
};

export const deletePhotoAPI: any = (data: { imageId: string }) => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.deletePhotoAPI(data);
        console.log(response, "deletePhotoAPI response");
        return response;
    } catch (error: any) {
        throw error;
    }
};


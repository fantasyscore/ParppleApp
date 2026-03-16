import AsyncStorage from "@react-native-async-storage/async-storage";
import { appOperation } from "../appOperation";
import { USER_TOKEN_KEY } from "../helper/Constants";
import NavigationService from "../navigation/NavigationService";
import { NAVIGATION_ALL_SET_SCREEN, NAVIGATION_BOTTOMTAB_SCREEN, NAVIGATION_CHATS_SCREEN, NAVIGATION_OTP_SCREEN, NAVIGATION_PROCCED_SCREEN, NAVIGATION_TAKING_SCREEN, NAVIGATION_USER_EDIT_PROFILE_SCREEN, NAVIGATION_WELCOME_SCREEN } from "../navigation/routes";
import { toastAlert } from "./UploadImageActions";
import Toast from "react-native-toast-message";
import { chatHistoryDetails, matchChatDetails, setAttributes, setDiscoverData, setGetProfile, setLikeByOther, setLikeYou, setListProfiles, setNewMatches, setOtherUserProfile, setRecentMatches, setViewByOhter, setViewYou } from "../slices/loginServices/authSlice";

export const userLogin: any = (data: any, gmail: any) => async (dispatch: any) => {
    try {
        const response: any = await appOperation.guest.login(data);
        console.log(response,"responseresponseresponse");
        
        if (response?.statusCode == 200) {
            toastAlert.showToastError(response.message);
            appOperation.setCustomerToken(response?.data?.tokenData?.token);
            await AsyncStorage.setItem(USER_TOKEN_KEY, response?.data?.tokenData?.token);
            if (response?.data?.profileCleared) {
                dispatch(listProfiles());
                dispatch(getProfile(true));
                dispatch(discoverProfile())
            } else {
                if (gmail) {
                    NavigationService.navigate(NAVIGATION_PROCCED_SCREEN, { comming: "OTP" })
                } else {
                    NavigationService.navigate(NAVIGATION_OTP_SCREEN, { PhoneNumber: data?.phoneNumber })
                }
            }
        } else {
            // toastAlert.showToastError(response.message);
        }
    } catch (error: any) {
        toastAlert.showToastError(error);
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
        toastAlert.showToastError(error);
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
                dispatch(listProfiles());
                dispatch(getProfile(true));
                dispatch(discoverProfile())
            }else{
                NavigationService.navigate(NAVIGATION_PROCCED_SCREEN, { comming: "OTP" })
            }
        } else {
            toastAlert.showToastError(response.message);
        }
    } catch (error: any) {
        toastAlert.showToastError(error);
    }
};
export const addProfile: any = (data: any) => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.addProfileAPI(data);
        console.log(response,"responseresponseresponse");
        
        if (response?.statusCode == 200) {
            NavigationService.reset(NAVIGATION_ALL_SET_SCREEN)
            dispatch(listProfiles(true));
        } else {
            Toast.show({
                type: "error",
                text2: response?.message || "Unable to save your profile. Please try again.",
            });
        }
        return response;
    } catch (error: any) {
        Toast.show({
            type: "error",
            text2: "Unable to save your profile. Please try again.",
        });
        return { statusCode: 500, message: String(error ?? "") };
    }
};
export const listProfiles: any = (navigate: any, skip?: number, limit?: number, merge?: boolean) => async (dispatch: any, getState: any) => {
    // Prevent accidental rapid duplicate calls from multiple screens mounting.
    // (e.g. AuthLoading + Home focus effect)
    // Note: we only guard "in flight", not "already cached".
    if ((listProfiles as any)._inFlight) return;
    (listProfiles as any)._inFlight = true;
    try {
        const payload: any = {};
        if (skip !== undefined) payload.skip = skip;
        if (limit !== undefined) payload.limit = limit;
        
        const response: any = await appOperation.customer.datingProfileAPI(payload);
        if (response?.statusCode == 200) {
            const dataWithIndex = response?.data.map((item: any, idx: number) => ({
                ...item,
                index: 0,
            }));
            
            if (merge && getState) {
                // Merge with existing profiles, avoiding duplicates
                const state = getState();
                const existingProfiles = state?.auth?.listProfiles || [];
                const existingIds = new Set(existingProfiles.map((p: any) => p._id));
                const newProfiles = dataWithIndex.filter((item: any) => !existingIds.has(item._id));
                const mergedProfiles = [...existingProfiles, ...newProfiles];
                dispatch(setListProfiles(mergedProfiles));
            } else {
                // Fresh fetch - replace all profiles
                dispatch(setListProfiles(dataWithIndex));
            }
            !navigate && NavigationService.reset(NAVIGATION_BOTTOMTAB_SCREEN)
        }
    } catch (error: any) {
        NavigationService.navigate(NAVIGATION_WELCOME_SCREEN);
        toastAlert.showToastError(error);
    } finally {
        (listProfiles as any)._inFlight = false;
    }
};
export const swipeLikeDisLike: any = (data: any) => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.swipeLikeDisLikeAPI(data);
        if (response?.statusCode == 200) {
        }
    } catch (error: any) {
        toastAlert.showToastError(error);
    }
};
export const likeByOther: any = () => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.likesLikeYouAPI();
        if (response?.statusCode == 200) {
            dispatch(setLikeByOther(response?.data))
        }
    } catch (error: any) {
        toastAlert.showToastError(error);
    }
};
export const likeYou: any = () => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.youLikedAPI();
        if (response?.statusCode == 200) {
            dispatch(setLikeYou(response?.data))
        }
    } catch (error: any) {
        toastAlert.showToastError(error);
    }
};
export const viewProfileByOther: any = () => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.viewProfileByOtherAPI();
        if (response?.statusCode === 200) {
            dispatch(setViewByOhter(response?.data));
        }
    } catch (error: any) {
        toastAlert.showToastError(error);
    }
};
export const youView: any = () => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.youViewAPI();
        if (response?.statusCode === 200) {
            dispatch(setViewYou(response?.data));
        }
    } catch (error: any) {
        toastAlert.showToastError(error);
    }
};
export const getOtherProfile: any = (data: any, isNavigate: any, setProfileData: any, profile: any, from: any) => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.otherDataProfileAPI(data);
        if (response?.statusCode == 200) {
            dispatch(setOtherUserProfile(response?.data));
            const dataWithIndex = {
                ...response?.data,
                index: 0
            };
            if (!profile) {
                setProfileData(dataWithIndex)
            }

            !isNavigate && NavigationService.navigate(NAVIGATION_USER_EDIT_PROFILE_SCREEN, { other: true, from })
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
            navigate ? console.log() : NavigationService.goBack();
        } else {
            toastAlert.showToastError(response?.message || "Something went wrong!");
        }
    } catch (error: any) {
        console.log(error, "error");
        toastAlert.showToastError(error);
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
        toastAlert.showToastError(error);
    }
};
export const editFilter: any = (data: any) => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.editFilterAPI(data);
        if (response?.statusCode == 200) {
            NavigationService.goBack()
        }
    } catch (error: any) {
        toastAlert.showToastError(error);
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
export const userBlockAPI: any = (data: any) => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.userBlockAPI(data);
        if (response?.statusCode == 200) {
            dispatch(getNewMatches())
            return NavigationService.navigate(NAVIGATION_CHATS_SCREEN)
        }
    } catch (error: any) {
        console.log(error,"errorerrorerror");
        
    }
};
export const chatHistoryAPI: any = (data: any, params: any, shouldNavigate: boolean = true) => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.chatHistortAPI(data, params);
        console.log(response,"responseresponseresponse");
        
        if (response?.statusCode == 200) {
            dispatch(chatHistoryDetails(response.data))
            if (shouldNavigate) {
                NavigationService.navigate(NAVIGATION_TAKING_SCREEN)
            }
        }
    } catch (error: any) {
    }
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
        }
        return response;
    } catch (error: any) {
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
        toastAlert.showToastError(error?.message || "Failed to activate boost");
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
        console.log(response,"response");
        
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
        console.log(error,"errorerrorerrorerrorerror");
        throw error;
    }
};
export const deleteAccountAPI: any = () => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.deleteAccount();
        if (response?.statusCode == 200) {
            console.log(response,"responseresponseresponse");
            
        }
        return response;
    } catch (error: any) {
        throw error;
    }
};
export const iosPucrchesAPIIs: any = (data:any) => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.iosPurchesAPI(data);
        if (response?.statusCode == 200) {
            console.log(response,"responseresponseresponse");
            
        }
        return response;
    } catch (error: any) {
        throw error;
    }
};


export const reportUserAPI: any =
    (payload: { reportedUserId: string; subject: string; body: string }) => async () => {
        try {
            const response: any = await appOperation.customer.reportUserAPI(payload);
            if (response?.statusCode == 200) return response;
            Toast.show({
                type: "error",
                text2: response?.message || "Unable to submit report. Please try again.",
            });
            return response;
        } catch (error: any) {
            Toast.show({
                type: "error",
                text2: "Unable to submit report. Please try again.",
            });
            return { statusCode: 500, message: String(error ?? "") };
        }
    };

export const userLogout: any = () => async () => {
    appOperation.setCustomerToken('');
    await AsyncStorage.removeItem(USER_TOKEN_KEY);
    NavigationService.reset(NAVIGATION_WELCOME_SCREEN);
};

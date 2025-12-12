import AsyncStorage from "@react-native-async-storage/async-storage";
import { appOperation } from "../appOperation";
import { USER_TOKEN_KEY } from "../helper/Constants";
import NavigationService from "../navigation/NavigationService";
import { NAVIGATION_ALL_SET_SCREEN, NAVIGATION_BOTTOMTAB_SCREEN, NAVIGATION_OTP_SCREEN, NAVIGATION_PROCCED_SCREEN, NAVIGATION_USER_EDIT_PROFILE_SCREEN, NAVIGATION_WELCOME_SCREEN } from "../navigation/routes";
import { toastAlert } from "./UploadImageActions";
import { setAttributes, setDiscoverData, setGetProfile, setLikeByOther, setLikeYou, setListProfiles, setOtherUserProfile, setViewByOhter, setViewYou } from "../slices/loginServices/authSlice";

export const userLogin: any = (data: any, gmail: any) => async (dispatch: any) => {
    try {
        const response: any = await appOperation.guest.login(data);
        if (response?.statusCode == 200) {
            console.log(response,"responseresponseresponseresponse");
            
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
export const addProfile: any = (data: any) => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.addProfileAPI(data);
        if (response?.statusCode == 200) {
            NavigationService.reset(NAVIGATION_ALL_SET_SCREEN)
            dispatch(listProfiles(true));
        } else {
            // toastAlert.showToastError(response.message);
        }
    } catch (error: any) {
        // toastAlert.showToastError(error);
    }
};
export const listProfiles: any = (navigate: any) => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.datingProfileAPI();
        if (response?.statusCode == 200) {
            const dataWithIndex = response?.data.map((item: any, idx: number) => ({
                ...item,
                index: 0,
            }));
            dispatch(setListProfiles(dataWithIndex));
            !navigate && NavigationService.reset(NAVIGATION_BOTTOMTAB_SCREEN)
        }
    } catch (error: any) {
        NavigationService.navigate(NAVIGATION_WELCOME_SCREEN);
        toastAlert.showToastError(error);
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
        if (response?.statusCode == 200) {
            dispatch(setViewByOhter(response?.data))
        }
    } catch (error: any) {
        toastAlert.showToastError(error);
    }
};
export const youView: any = () => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.youViewAPI();
        if (response?.statusCode == 200) {
            dispatch(setViewYou(response?.data))
        }
    } catch (error: any) {
        toastAlert.showToastError(error);
    }
};
export const getOtherProfile: any = (data: any, isNavigate: any, setProfileData: any, profile:any) => async (dispatch: any) => {
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

            !isNavigate && NavigationService.navigate(NAVIGATION_USER_EDIT_PROFILE_SCREEN, { other: true })
        }
    } catch (error: any) {
        console.log(error, "error");
    }
};
export const getProfile: any = (navigate: any) => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.getProfileAPI();
        if (response?.statusCode == 200) {
            dispatch(setGetProfile(response?.data));
            dispatch(setOtherUserProfile(response?.data));
            !navigate && NavigationService.navigate(NAVIGATION_USER_EDIT_PROFILE_SCREEN, { other: false })
        }
    } catch (error: any) {
        // toastAlert.showToastError(error);
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
    try {
        const response: any = await appOperation.customer.discoverAPI();
        if (response?.statusCode == 200) {
            dispatch(setDiscoverData(response?.data))
        }
    } catch (error: any) {
        // toastAlert.showToastError(error);
    }
};
export const userLogout: any = () => async () => {
    appOperation.setCustomerToken('');
    await AsyncStorage.removeItem(USER_TOKEN_KEY);
    NavigationService.reset(NAVIGATION_WELCOME_SCREEN);
};

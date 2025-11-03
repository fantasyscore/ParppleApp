import AsyncStorage from "@react-native-async-storage/async-storage";
import { appOperation } from "../appOperation";
import { USER_TOKEN_KEY } from "../helper/Constants";
import NavigationService from "../navigation/NavigationService";
import { NAVIGATION_ALL_SET_SCREEN, NAVIGATION_BOTTOMTAB_SCREEN, NAVIGATION_OTP_SCREEN, NAVIGATION_USER_EDIT_PROFILE_SCREEN, NAVIGATION_WELCOME_SCREEN } from "../navigation/routes";
import { toastAlert } from "./UploadImageActions";
import { setGetProfile, setLikeByOther, setLikeYou, setListProfiles, setOtherUserProfile, setViewByOhter, setViewYou } from "../slices/loginServices/authSlice";

export const userLogin: any = (data: any) => async (dispatch: any) => {
    try {
        const response: any = await appOperation.guest.login(data);
        if (response?.statusCode == 200) {
            toastAlert.showToastError(response.message);
            appOperation.setCustomerToken(response?.data?.tokenData?.token);
            await AsyncStorage.setItem(USER_TOKEN_KEY, response?.data?.tokenData?.token);
            if (response?.data?.profileCleared) {
                dispatch(listProfiles());
                dispatch(getProfile(true))
            } else {
                NavigationService.navigate(NAVIGATION_OTP_SCREEN)
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
        if (response?.statusCode == 200) {
            NavigationService.reset(NAVIGATION_ALL_SET_SCREEN)
            dispatch(listProfiles());
        } else {
            toastAlert.showToastError(response.message);
        }
    } catch (error: any) {
        toastAlert.showToastError(error);
    }
};
export const listProfiles: any = (navigate:any) => async (dispatch: any) => {
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
            console.log(response, "responseresponseresponse")

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
export const getOtherProfile: any = (data:any) => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.otherDataProfileAPI(data);
        if (response?.statusCode == 200) {
            dispatch(setOtherUserProfile(response?.data));
            NavigationService.navigate(NAVIGATION_USER_EDIT_PROFILE_SCREEN, {other:true})
        }
    } catch (error: any) {
        toastAlert.showToastError(error);
    }
};
export const getProfile: any = (navigate:any) => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.getProfileAPI();
        if (response?.statusCode == 200) {
            dispatch(setGetProfile(response?.data));
            dispatch(setOtherUserProfile(response?.data));
            !navigate && NavigationService.navigate(NAVIGATION_USER_EDIT_PROFILE_SCREEN, {other:false})
        }
    } catch (error: any) {
        toastAlert.showToastError(error);
    }
};
export const editProfile: any = (data:any) => async (dispatch: any) => {
    try {
        const response: any = await appOperation.customer.editProfileAPI(data);
        if (response?.statusCode == 200) {
            dispatch(setGetProfile(response?.data));
            NavigationService.goBack();
        }
    } catch (error: any) {
        toastAlert.showToastError(error);
    }
};
export const userLogout: any = () => async () => {
    appOperation.setCustomerToken('');
    await AsyncStorage.removeItem(USER_TOKEN_KEY);
    NavigationService.reset(NAVIGATION_WELCOME_SCREEN);
};

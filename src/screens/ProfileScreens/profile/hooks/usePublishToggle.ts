import { useDispatch, useSelector } from "react-redux";
import { publishProfileEveryone } from "../../../../actions/authActions";
import { toastAlert } from "../../../../actions/UploadImageActions";
import NavigationService from "../../../../navigation/NavigationService";
import { NAVIGATION_SUBSCRIPTION_SCREEN } from "../../../../navigation/routes";

const PUBLISH_PLANS = ["publish_one_week", "publish_one_month", "publish_six_months"];

/** Publish / hide the profile. Men need a publish plan; everyone else toggles freely. */
export function usePublishToggle(userData: any) {
  const dispatch = useDispatch();
  const profileHide = useSelector((state: any) => state.auth.profileHide);

  const hasPublishPlan = PUBLISH_PLANS.includes(userData?.subscription?.plan);
  const canManagePublish = userData?.gender === "female" || (userData?.gender === "male" && hasPublishPlan);
  // True when the profile is currently hidden, i.e. the button offers to publish it
  const isHidden = userData?.isPublish === false || profileHide === "Hide";

  const onPress = () => {
    if (!canManagePublish) {
      NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN);
      return;
    }
    dispatch(publishProfileEveryone({ isPublish: userData?.isPublish == false }));
    toastAlert.showToastError(userData?.isPublish === false ? "Your profile is published" : "Your profile is hidden");
  };

  return { isHidden, onPress };
}

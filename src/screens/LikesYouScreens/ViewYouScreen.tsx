import React from "react";
import { viewProfileByOther, youView } from "../../actions/authActions";
import { viewedYouEmptyNew, viewedYouNewIcon, whoVisitYourProfileWithOutPurches, youViewEmptuNew, youViewednewIcon } from "../../helper/ImageAssets";
import EngagementScreen from "./shared/EngagementScreen";
import { EngagementConfig } from "./shared/engagementConfig";

const VIEWED_YOU = "Viewed You";
const YOU_VIEWED = "You Viewed";

const config: EngagementConfig = {
  tabs: [
    { key: VIEWED_YOU, label: "Viewed You", icon: viewedYouNewIcon },
    { key: YOU_VIEWED, label: "You Viewed", icon: youViewednewIcon },
  ],
  incomingListKey: "viewByOtherData",
  selectors: [(state) => state.auth.viewByOtherData, (state) => state.auth.viewYouData],
  refresh: () => [viewProfileByOther(), youView()],
  // You can dislike anyone you viewed, but a like would be a first move on someone you only looked at
  secondTabActions: { dislike: true, like: false },
  previewProps: (tabKey) => ({ likeYoue: "Likes You", ViewYoue: tabKey }),
  paywall: {
    image: whoVisitYourProfileWithOutPurches,
    titleTop: "Who’s",
    titleBottom: "watching You?",
    subtitle: "Let Your Mystery Drew Someone In.",
  },
  empty: {
    images: [viewedYouEmptyNew, youViewEmptuNew],
    resizeMode: "stretch",
    buttonLabel: "Visit Now",
    // Nothing to nudge you towards on "You Viewed": you already visited them
    showButton: (tabKey) => tabKey !== YOU_VIEWED,
  },
};

/** People who viewed you, and people you viewed. */
const ViewYouScreen = () => <EngagementScreen config={config} />;

export default ViewYouScreen;

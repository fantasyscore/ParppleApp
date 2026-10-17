import React from "react";
import { likeByOther, likeYou } from "../../actions/authActions";
import { likedYouNewIcon, likeYouEmptyNew, whosWatchingYouWhitePurhces, youLikedNewIcon, youLikeEmptyNew } from "../../helper/ImageAssets";
import metrics from "../../assets/Metrics";
import EngagementScreen from "./shared/EngagementScreen";
import { EngagementConfig } from "./shared/engagementConfig";

const LIKES_YOU = "Likes You";
const YOU_LIKED = "You Liked";

const config: EngagementConfig = {
  tabs: [
    { key: LIKES_YOU, label: "Liked You", icon: likedYouNewIcon },
    { key: YOU_LIKED, label: "You Liked", icon: youLikedNewIcon },
  ],
  incomingListKey: "likeByOtherData",
  selectors: [(state) => state.auth.likeByOtherData, (state) => state.auth.likeYouData],
  refresh: () => [likeByOther(), likeYou()],
  // Profiles you already liked can't be liked / disliked again
  secondTabActions: { dislike: false, like: false },
  previewProps: (tabKey) => ({ likeYoue: tabKey }),
  paywall: {
    image: whosWatchingYouWhitePurhces,
    titleTop: "Who send",
    titleBottom: "You a heart?",
    subtitle: "Someone Couldn't Resist Taking a Look.",
  },
  empty: {
    images: [likeYouEmptyNew, youLikeEmptyNew],
    resizeMode: "cover",
    marginTop: -metrics.hp10,
    buttonLabel: "Discover Now",
    showButton: () => true,
  },
};

/** People who liked you, and people you liked. */
const LikesYouScreen = () => <EngagementScreen config={config} />;

export default LikesYouScreen;

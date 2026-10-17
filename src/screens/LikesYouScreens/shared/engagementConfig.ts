export interface EngagementTab {
  /** Value stored as the selected tab and passed to the profile preview */
  key: string;
  label: string;
  icon: any;
}

/** What differs between the "likes" and the "views" screens; everything else is shared. */
export interface EngagementConfig {
  /** First tab = people who acted on you, second = what you did */
  tabs: [EngagementTab, EngagementTab];
  /** Redux selectors for each tab's profiles */
  selectors: [(state: any) => any[] | undefined, (state: any) => any[] | undefined];
  /** Redux key of the first tab's list; it also drives the bottom-tab badge count */
  incomingListKey: "likeByOtherData" | "viewByOtherData";
  /** Thunks that refresh both lists; dispatched whenever the screen gains focus */
  refresh: () => any[];
  /** Which card buttons the second tab keeps (the first tab shows all) */
  secondTabActions: { dislike: boolean; like: boolean };
  /** Extra props the profile preview needs to hide the same buttons */
  previewProps: (tabKey: string) => { likeYoue?: string; ViewYoue?: string };
  /** Shown instead of the list to male users without a publish plan */
  paywall: { image: any; titleTop: string; titleBottom: string; subtitle: string };
  empty: {
    images: [any, any];
    resizeMode: "cover" | "stretch";
    /** Pulls the artwork up under the tabs */
    marginTop?: number;
    buttonLabel: string;
    /** Whether the call-to-action button is offered on the given tab */
    showButton: (tabKey: string) => boolean;
  };
}

import metrics from "../../../assets/Metrics";

// ---- Feed paging ----
export const PROFILE_BATCH_LIMIT = 10;
/** Fetch the next batch when this few profiles remain */
export const TOP_UP_TRIGGER_COUNT = 3;

// ---- Returning from the background ----
/** Reload the feed after being away at least this long */
export const FEED_STALE_AFTER_MS = 5 * 60 * 1000;
/** Remount the list after this long away: Android can leave clipped rows detached after a suspend */
export const LIST_REMOUNT_AFTER_MS = 60 * 1000;

export const LIST_TOP_PADDING = metrics.hp0;

/** The three-dot (report / block) menu on each card. */
export const SHOW_PROFILE_ACTIONS = true;

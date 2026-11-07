import AsyncStorage from "@react-native-async-storage/async-storage";
import RNFS from "react-native-fs";

/**
 * A copy of every view-once photo I sent, so my own chat shows it in full. The server never gives the sender a link
 * to a view-once photo (only the receiver gets one, once), so the picked file is kept on this device, keyed by the
 * message id. Copies are dropped when the photo is opened / expires, or after MAX_AGE_MS.
 */
const STORAGE_KEY = "@parpple_view_once_sent_photos";
const DIRECTORY = `${RNFS.DocumentDirectoryPath}/view-once`;
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

type Entry = { uri: string; savedAt: number };
let entries: Record<string, Entry> = {};

const toPath = (uri: string) => uri.replace(/^file:\/\//, "");
const toUri = (path: string) => (path.startsWith("file://") ? path : `file://${path}`);

const persist = () => {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries)).catch(() => undefined);
};

const deleteFile = (uri: string) => {
  const path = toPath(uri);
  if (!path.startsWith(DIRECTORY)) return; // never delete the picker's own file
  RNFS.unlink(path).catch(() => undefined);
};

// Loaded once at start-up; chats opened later read it synchronously
(async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const stored: Record<string, Entry> = raw ? JSON.parse(raw) : {};
    const now = Date.now();
    Object.entries(stored).forEach(([id, entry]) => {
      if (!entry?.uri || now - entry.savedAt > MAX_AGE_MS) deleteFile(entry?.uri ?? "");
      else entries[id] = { ...entry, ...entries[id] };
    });
    persist();
  } catch {
    // nothing stored yet
  }
})();

/** Local image of a photo I sent, if this device still has it */
export const getSentPhotoUri = (messageId: string | number | undefined): string | undefined =>
  messageId === undefined ? undefined : entries[String(messageId)]?.uri;

/** Keeps the photo just sent: shown from the picked file at once, then from a copy that survives cache clean-ups */
export const rememberSentPhoto = (messageId: string, sourceUri: string | undefined) => {
  if (!messageId || !sourceUri) return;
  entries[messageId] = { uri: sourceUri, savedAt: Date.now() };
  persist();
  const destination = `${DIRECTORY}/${messageId.replace(/[^a-zA-Z0-9_-]/g, "")}.jpg`;
  RNFS.mkdir(DIRECTORY)
    .then(() => RNFS.copyFile(toPath(sourceUri), destination))
    .then(() => {
      if (!entries[messageId]) return; // already forgotten
      entries[messageId] = { uri: toUri(destination), savedAt: entries[messageId].savedAt };
      persist();
    })
    .catch((error) => console.warn("[ViewOnce] Couldn't keep a copy of the sent photo:", error?.message ?? error));
};

/** The photo was opened, expired or deleted: its copy isn't needed any more */
export const forgetSentPhoto = (messageId: string | number | undefined) => {
  const key = String(messageId ?? "");
  const entry = entries[key];
  if (!entry) return;
  delete entries[key];
  deleteFile(entry.uri);
  persist();
};

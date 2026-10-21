import { useEffect, useSyncExternalStore } from "react";
import { appOperation } from "../../../appOperation";
import { toastAlert } from "../../../actions/UploadImageActions";
import { createSocket } from "../../../common/Socket";

/**
 * Photos that are on their way to the server. This lives outside any screen on purpose: leaving a chat and
 * coming back while photos are still "Sending..." must show them exactly as they were, and the sending itself
 * must carry on while the chat is closed.
 */

interface PendingPhoto {
  id: string;
  matchKey: string;
  message: any;
}

interface Awaiting {
  id: string;
  matchKey: string;
  socket: any;
  timer: ReturnType<typeof setTimeout>;
}

const PHOTO_LABEL = "📷 Photo";
/** How long a sent photo may stay on "Sending..." without the server confirming it */
const SEND_CONFIRMATION_TIMEOUT_MS = 30000;

let pending: PendingPhoto[] = []; // newest first
let version = 0;
const listeners = new Set<() => void>();
const snapshots = new Map<string, { version: number; list: any[] }>();
const mountedChats = new Map<string, number>();
const confirmListeners = new Set<(matchKey: string, saved: any) => void>();
/** Photos handed to the socket, in send order, waiting for the server's messageSent */
const awaiting: Awaiting[] = [];
const trackedSockets = new WeakSet<object>();
// Photos upload side by side but are sent over the socket strictly in the order they were picked
let sendChain: Promise<void> = Promise.resolve();

const notify = () => {
  version += 1;
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const removePending = (id: string) => {
  pending = pending.filter((photo) => photo.id !== id);
  notify();
};

const isChatOpen = (matchKey: string) => (mountedChats.get(matchKey) ?? 0) > 0;

const releaseAwaiting = (entry: Awaiting) => {
  clearTimeout(entry.timer);
  try {
    entry.socket.disconnect();
  } catch {
    // already closed
  }
};

/** The server confirmed a photo: it is now a real message (the open chat adds it, a closed chat loads it later). */
const handleMessageSent = (payload: any) => {
  const saved = payload?.message;
  if (saved?.messageType !== "image" || !saved?._id) return;
  const entry = awaiting.shift();
  if (!entry) return;
  releaseAwaiting(entry);
  removePending(entry.id);
  confirmListeners.forEach((listener) => listener(entry.matchKey, saved));
};

const track = (socket: any) => {
  if (trackedSockets.has(socket)) return;
  trackedSockets.add(socket);
  socket.on("messageSent", handleMessageSent);
};

const giveUp = (id: string) => {
  const index = awaiting.findIndex((entry) => entry.id === id);
  if (index === -1) return;
  const [entry] = awaiting.splice(index, 1);
  releaseAwaiting(entry);
  removePending(id);
  if (isChatOpen(entry.matchKey)) toastAlert.showToastError("A photo couldn't be sent. Please try again.");
};

export interface OutgoingPhotoRequest {
  asset: { uri: string; type?: string; fileName?: string };
  receiverId: string;
  matchKey: string;
  socketUrl: string;
  /** Key of "me" in the chat list's messages */
  myUserKey: number | string;
}

/** Shows the photo in the chat at once ("Sending..."), uploads it and sends it, whether or not the chat stays open. */
export function enqueueOutgoingPhoto({ asset, receiverId, matchKey, socketUrl, myUserKey }: OutgoingPhotoRequest) {
  const id = `pending-photo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  pending = [
    {
      id,
      matchKey,
      message: {
        _id: id,
        text: PHOTO_LABEL,
        createdAt: new Date(),
        isMine: true,
        viewOnce: true,
        sending: true,
        messageType: "image",
        mediaStatus: "unopened",
        user: { _id: myUserKey, name: "", avatar: null },
      },
    },
    ...pending,
  ];
  notify();

  const formData = new FormData();
  formData.append("image", {
    uri: asset.uri,
    type: asset.type || "image/jpeg",
    name: asset.fileName || `photo_${Date.now()}.jpg`,
  } as any);
  const upload = appOperation.customer.uploadChatMediaAPI(formData);
  upload.catch(() => undefined);

  sendChain = sendChain.then(async () => {
    try {
      const response: any = await upload;
      const mediaId = response?.data?.mediaId;
      if (!mediaId) throw new Error(response?.message || "Upload failed");

      const socket = createSocket(socketUrl);
      track(socket);
      awaiting.push({ id, matchKey, socket, timer: setTimeout(() => giveUp(id), SEND_CONFIRMATION_TIMEOUT_MS) });
      socket.emit("send_message", { receiverId, messageType: "image", mediaId });
    } catch (error: any) {
      console.warn("[ViewOnce] Sending the photo failed:", error?.message ?? error);
      removePending(id);
      if (isChatOpen(matchKey)) toastAlert.showToastError("Couldn't send the photo. Please try again.");
    }
  });
}

const EMPTY: any[] = [];

/** The photos still being sent in this chat (newest first), plus a callback when one of them is confirmed. */
export function useOutgoingPhotos(matchKey: string | undefined, onConfirmed: (saved: any) => void) {
  const pendingMessages = useSyncExternalStore(
    subscribe,
    () => {
      if (!matchKey) return EMPTY;
      const cached = snapshots.get(matchKey);
      if (cached && cached.version === version) return cached.list;
      const list = pending.filter((photo) => photo.matchKey === matchKey).map((photo) => photo.message);
      const next = list.length === 0 ? EMPTY : list;
      snapshots.set(matchKey, { version, list: next });
      return next;
    }
  );

  useEffect(() => {
    if (!matchKey) return;
    mountedChats.set(matchKey, (mountedChats.get(matchKey) ?? 0) + 1);
    const listener = (confirmedMatchKey: string, saved: any) => {
      if (confirmedMatchKey === matchKey) onConfirmed(saved);
    };
    confirmListeners.add(listener);
    return () => {
      confirmListeners.delete(listener);
      mountedChats.set(matchKey, Math.max((mountedChats.get(matchKey) ?? 1) - 1, 0));
    };
  }, [matchKey, onConfirmed]);

  return pendingMessages;
}

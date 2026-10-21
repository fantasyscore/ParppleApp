import { useCallback, useEffect, useRef, useState } from "react";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { toastAlert } from "../../../actions/UploadImageActions";
import { ensureCameraPermission } from "../../../hooks/useFaceVerification";
import { enqueueOutgoingPhoto, useOutgoingPhotos } from "./outgoingPhotos";

export type MediaStatus = "unopened" | "opened" | "expired";
export type PhotoSource = "gallery" | "camera";

interface Options {
  socket: any;
  /** URL of the chat socket (the same shared connection the chat screen uses) */
  socketUrl: string | null;
  /** The other user of this chat */
  receiverId?: string;
  /** Id of this match: photos still being sent are kept per match */
  matchKey?: string;
  /** Key of "me" in the chat list's messages (messages with this user id are mine) */
  myUserKey: number | string;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  seenMessageKeysRef: React.MutableRefObject<Set<string>>;
  /** Called when a photo is about to leave the chat (viewed, or opened by the other user), before it is removed */
  onPhotoGone?: (messageId: string) => void;
}

const PHOTO_LABEL = "📷 Photo";

/** How long the "disintegrate" animation of a viewed photo runs (see ViewOncePhotoBubble) */
export const DISSOLVE_DURATION_MS = 750;
/** The photo viewer's fade-out; the chat's animation waits for it so it can be seen */
const VIEWER_CLOSE_DELAY_MS = 450;

/**
 * Photos this device has already viewed. They leave the chat for good: the history that is loaded again later
 * may still list them, so those ids are filtered out (see TakingScreen).
 */
export const dismissedPhotoIds = new Set<string>();

/** Reads a downloaded photo into memory as a data URI (nothing is written to disk). */
const downloadToMemory = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
};

/**
 * View-once photos of a chat: upload + send, tap-to-open and the Opened / Expired updates.
 * The photo URL is only ever used right after the receiver taps; the image is kept in memory and
 * dropped when the viewer closes. See the chat integration guide (section 4).
 */
export function useViewOncePhotos({ socket, socketUrl, receiverId, matchKey, myUserKey, setMessages, seenMessageKeysRef, onPhotoGone }: Options) {
  const onPhotoGoneRef = useRef(onPhotoGone);
  onPhotoGoneRef.current = onPhotoGone;
  // The viewer opens the moment a photo is tapped (with a spinner); the picture follows once downloaded
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerImage, setViewerImage] = useState<string | null>(null);
  const openingIdRef = useRef<string | null>(null);
  // The photo currently on screen in the viewer
  const viewingIdRef = useRef<string | null>(null);
  // Only one picker / camera at a time: a second launch while one is open leaves the app stuck
  const pickerOpenRef = useRef(false);

  const patchMessage = useCallback(
    (messageId: string, patch: Record<string, any>) => {
      setMessages((previous) =>
        previous.map((message) => (String(message._id) === String(messageId) ? { ...message, ...patch } : message))
      );
    },
    [setMessages]
  );

  // The chat adds a photo's real message when the server confirms it (photos still being sent are shown from outgoingPhotos)
  const onPhotoConfirmed = useCallback(
    (saved: any) => {
      const key = `id:${String(saved._id)}`;
      if (seenMessageKeysRef.current.has(key)) return;
      seenMessageKeysRef.current.add(key);
      setMessages((previous) => [
        {
          _id: saved._id,
          text: PHOTO_LABEL,
          createdAt: new Date(saved.createdAt || Date.now()),
          isMine: true,
          viewOnce: true,
          messageType: "image",
          mediaStatus: saved.mediaStatus || "unopened",
          user: { _id: myUserKey, name: "", avatar: null },
        },
        ...previous,
      ]);
    },
    [myUserKey, setMessages, seenMessageKeysRef]
  );
  const pendingMessages = useOutgoingPhotos(matchKey, onPhotoConfirmed);

  // ---- Sender: pick -> (outgoingPhotos: show, upload, send_message { mediaId }) ----
  const sendPhoto = useCallback(
    async (source: PhotoSource) => {
      if (!socketUrl || !receiverId || !matchKey) {
        toastAlert.showToastError("Chat is still connecting. Please try again in a moment.");
        return;
      }
      if (pickerOpenRef.current) return;
      pickerOpenRef.current = true;
      try {
        // Android does not ask for the camera permission by itself when the camera is launched: ask first. If it was
        // refused for good, the user is sent to the app's settings (ensureCameraPermission shows that dialog).
        if (source === "camera" && !(await ensureCameraPermission("sending photos"))) {
          pickerOpenRef.current = false;
          return;
        }
        // The picker scales and compresses the photo natively: a smaller file uploads (and opens) much faster
        const size = { maxWidth: 1280, maxHeight: 1280, quality: 0.7 as const };
        const picked: any =
          source === "camera"
            ? await launchCamera({ mediaType: "photo", saveToPhotos: false, ...size })
            : await launchImageLibrary({ mediaType: "photo", selectionLimit: 1, ...size });
        pickerOpenRef.current = false;
        if (picked?.didCancel) return;
        if (picked?.errorCode) {
          console.warn("[ViewOnce] Picker error:", picked.errorCode, picked.errorMessage);
          toastAlert.showToastError(
            picked.errorCode === "permission"
              ? "Please allow camera access in Settings."
              : picked.errorCode === "camera_unavailable"
                ? "No camera is available on this device. You can still pick a photo from the gallery."
                : "Couldn't open the " + source + ". Please try again."
          );
          return;
        }
        const asset = picked?.assets?.[0];
        if (!asset?.uri) return;
        enqueueOutgoingPhoto({
          asset: { uri: asset.uri, type: asset.type, fileName: asset.fileName },
          receiverId,
          matchKey,
          socketUrl,
          myUserKey,
        });
      } catch (error: any) {
        pickerOpenRef.current = false;
        console.warn("[ViewOnce] Picking the photo failed:", error?.message ?? error);
        toastAlert.showToastError("Couldn't send the photo. Please try again.");
      }
    },
    [receiverId, matchKey, socketUrl, myUserKey]
  );

  // ---- Receiver: tap -> open_media -> media_url ----
  const openPhoto = useCallback(
    (messageId: string) => {
      if (!socket || !messageId || openingIdRef.current) return;
      openingIdRef.current = messageId;
      // Marked as "being viewed" from the tap on: the server's media_opened can arrive before the photo has
      // downloaded, and must not take the bubble out of the chat before it has had its animation
      viewingIdRef.current = messageId;
      setViewerImage(null);
      setViewerVisible(true);
      socket.emit("open_media", { messageId });
    },
    [socket]
  );

  const closeViewer = useCallback(() => {
    openingIdRef.current = null;
    setViewerVisible(false);
    // The picture is dropped from memory as soon as the viewer closes
    setViewerImage(null);

    // A photo that was looked at disintegrates in the chat and is gone for good (there is no URL to show it again)
    const viewedId = viewingIdRef.current;
    viewingIdRef.current = null;
    if (viewedId) {
      dismissedPhotoIds.add(viewedId);
      // The viewer is still fading out over the chat for a moment: start the animation once the chat is
      // visible again, or it would play unseen behind the viewer.
      setTimeout(() => {
        onPhotoGoneRef.current?.(viewedId);
        patchMessage(viewedId, { dissolving: true });
        setTimeout(
          () => setMessages((previous) => previous.filter((message) => String(message._id) !== viewedId)),
          DISSOLVE_DURATION_MS + 50
        );
      }, VIEWER_CLOSE_DELAY_MS);
    }
  }, [patchMessage, setMessages]);

  useEffect(() => {
    if (!socket) return;

    const handleMediaUrl = async ({ messageId, url }: { messageId: string; url: string }) => {
      try {
        const dataUri = await downloadToMemory(url);
        // The viewer was closed while the photo was loading: nothing to show
        if (openingIdRef.current !== messageId) return;
        setViewerImage(dataUri);
        // It leaves the chat (with its animation) once the viewer closes: see closeViewer
      } catch (error) {
        console.warn("[ViewOnce] Could not load the photo");
        viewingIdRef.current = null;
        setViewerVisible(false);
        toastAlert.showToastError("Couldn't load the photo. Please try again.");
      } finally {
        if (openingIdRef.current === messageId) openingIdRef.current = null;
      }
    };

    // The other user opened (or lost) a photo I sent: it disintegrates in my chat and is gone, like on theirs.
    // A photo I received that was opened elsewhere (another device) or has expired just leaves the chat.
    const updateOrRemove = (messageId: string, _status: MediaStatus) => {
      if (messageId === viewingIdRef.current) return;
      const id = String(messageId);
      dismissedPhotoIds.add(id);
      onPhotoGoneRef.current?.(id);
      setMessages((previous) =>
        previous.flatMap((message) => {
          if (String(message._id) !== id) return [message];
          return message.isMine ? [{ ...message, dissolving: true }] : [];
        })
      );
      setTimeout(
        () => setMessages((previous) => previous.filter((message) => String(message._id) !== id)),
        DISSOLVE_DURATION_MS + 50
      );
    };
    const handleMediaOpened = ({ messageId }: { messageId: string }) => updateOrRemove(messageId, "opened");
    const handleMediaExpired = ({ messageId }: { messageId: string }) => updateOrRemove(messageId, "expired");

    const handleError = (payload: any) => {
      const messageId = payload?.messageId;
      if (payload?.event === "open_media") {
        openingIdRef.current = null;
        viewingIdRef.current = null;
        setViewerVisible(false);
        const reason = String(payload?.message ?? "");
        if (/authentication/i.test(reason)) {
          toastAlert.showToastError("Please log in again to open photos.");
        } else if (/already been viewed|expired|no longer available|not found/i.test(reason)) {
          // Nothing left to show: the photo leaves the chat
          if (messageId) updateOrRemove(messageId, "expired");
        } else {
          toastAlert.showToastError(reason || "Couldn't open this photo.");
        }
      }
    };

    socket.on("media_url", handleMediaUrl);
    socket.on("media_opened", handleMediaOpened);
    socket.on("media_expired", handleMediaExpired);
    socket.on("error", handleError);
    return () => {
      socket.off("media_url", handleMediaUrl);
      socket.off("media_opened", handleMediaOpened);
      socket.off("media_expired", handleMediaExpired);
      socket.off("error", handleError);
    };
  }, [socket, patchMessage, setMessages]);

  return { sendPhoto, pendingMessages, openPhoto, viewerVisible, viewerImage, closeViewer };
}

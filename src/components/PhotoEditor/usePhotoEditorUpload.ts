import { useRef, useState } from "react";
import { Alert, Platform } from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import { useDispatch, useSelector } from "react-redux";
import { uploadImagesPhotoAPI } from "../../actions/authActions";
import { PhotoEditorResult } from "./PhotoEditorModal";

export interface UploadedPhoto {
  url: string;
  imageId: string;
}

interface EditorSession {
  visible: boolean;
  /** Opaque caller value passed to pickAndEdit, handed back on success */
  context: any;
  imageUri: string;
  fileName: string;
}

const CLOSED_SESSION: EditorSession = {
  visible: false,
  context: null,
  imageUri: "",
  fileName: "",
};

interface Options {
  /** Return false (optionally after showing a toast) to block picking */
  canStart?: () => boolean;
  /**
   * Gender sent with the upload (the backend picks a moderation model from it). Defaults to the
   * signed-in user's; onboarding passes the one being entered, since there is no profile yet.
   */
  getGender?: () => string | undefined;
  /**
   * Called once the backend has stored the photo, right before the editor
   * closes. Awaited, so follow-up API calls keep the busy overlay up.
   */
  onUploaded: (context: any, uploaded: UploadedPhoto) => void | Promise<void>;
}

/**
 * The shared pick → crop (3:4) → face-detect → edit → upload pipeline behind
 * every profile photo entry point. Screens call pickAndEdit(context) from their Upload tile
 * and spread `editorProps` onto a PhotoEditorModal; everything else — gallery
 * permission, single-photo picker, the Done flatten upload, the Skip upload,
 * and Retry/Cancel error handling — lives here so
 * the flow stays identical on every screen.
 */
export function usePhotoEditorUpload({ canStart, getGender, onUploaded }: Options) {
  const dispatch = useDispatch();
  const userData = useSelector((state: any) => state.auth.userData);

  const [session, setSession] = useState<EditorSession>(CLOSED_SESSION);
  const [busy, setBusy] = useState(false);
  const isPickerOpenRef = useRef(false);
  // session is read inside async editor callbacks; a ref avoids stale closures
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const pickAndEdit = async (context?: any) => {
    if (isPickerOpenRef.current || sessionRef.current.visible) {
      console.log("[PhotoEditorUpload] Picker or editor already open. Request ignored.");
      return;
    }
    if (canStart && !canStart()) return;

    try {
      // No storage permission is needed: the system photo picker returns the chosen photo on its own

      isPickerOpenRef.current = true;

      launchImageLibrary(
        {
          mediaType: "photo",
          selectionLimit: 1,
          // Full quality: the editor needs the original pixels, and the only
          // file ever uploaded is the editor's bounded output
          quality: 1,
          ...(Platform.OS === "ios" && { presentationStyle: "pageSheet" as const }),
        },
        async (res: any) => {
          isPickerOpenRef.current = false;

          if (res.didCancel) return;
          if (res.errorCode || res.errorMessage) {
            console.error("[PhotoEditorUpload] Picker error:", res.errorMessage || res.errorCode);
            return;
          }
          const asset = res.assets?.[0];
          if (!asset?.uri) return;

          // The editor crops to 3:4 first, then runs face detection on the cropped photo
          setSession({
            visible: true,
            context,
            imageUri: asset.uri,
            fileName: asset.fileName || `image_${Date.now()}.jpg`,
          });
        }
      );
    } catch (e) {
      console.error("[PhotoEditorUpload] pickAndEdit exception:", e);
      isPickerOpenRef.current = false;
    }
  };

  /** Uploads a local image file to the asset endpoint. */
  const uploadFile = async (
    file: { uri: string; name: string; type: string }
  ): Promise<{ ok: boolean; uploaded?: UploadedPhoto; message?: string }> => {
    try {
      const formData = new FormData();
      formData.append("image", {
        uri: file.uri,
        type: file.type,
        name: file.name,
      } as any);
      formData.append("gender", getGender ? getGender() : userData?.gender);
      const response: any = await dispatch(uploadImagesPhotoAPI(formData));
      console.log("[PhotoEditorUpload] Upload response:", response);

      if (response?.statusCode === 200 && response?.data && response?.data?.success !== false) {
        const url =
          typeof response.data === "string"
            ? response.data
            : response.data.url || response.data.image || response.data.fileUrl || "";
        const imageId = response.data?._id || response.data?.id || "";
        if (url) return { ok: true, uploaded: { url, imageId } };
      }
      return {
        ok: false,
        message: response?.data?.message || response?.message || "Unsupported image format or size.",
      };
    } catch (err: any) {
      console.error("[PhotoEditorUpload] Upload failed:", err);
      return { ok: false, message: err?.message || "An error occurred during upload. Please try again." };
    }
  };

  /**
   * Shared tail of the editor flow: upload while the editor stays open behind
   * a busy overlay; close it only after the backend has the URL and the
   * caller's onUploaded finished. Failures offer Retry (same file) or Cancel
   * (nothing saved, editor stays open so the user's edits aren't lost).
   */
  const uploadFromEditor = async (file: { uri: string; name: string; type: string }) => {
    const { context } = sessionRef.current;
    setBusy(true);
    let done = false;
    while (!done) {
      const outcome = await uploadFile(file);
      if (outcome.ok && outcome.uploaded) {
        try {
          await onUploaded(context, outcome.uploaded);
        } catch (err) {
          console.error("[PhotoEditorUpload] onUploaded callback failed:", err);
        }
        done = true;
        setBusy(false);
        setSession(CLOSED_SESSION);
      } else {
        const choice = await new Promise<"retry" | "cancel">((resolve) => {
          Alert.alert(
            "Upload Failed",
            outcome.message || "Something went wrong while uploading this photo.",
            [
              { text: "Cancel", style: "cancel", onPress: () => resolve("cancel") },
              { text: "Retry", onPress: () => resolve("retry") },
            ],
            { cancelable: false }
          );
        });
        if (choice === "cancel") {
          done = true;
          setBusy(false);
        }
      }
    }
  };

  /** Done: upload the flattened editor output (always a JPEG). */
  const onEditorDone = (result: PhotoEditorResult) =>
    uploadFromEditor({
      uri: result.uri,
      name: sessionRef.current.fileName.replace(/\.[^.]+$/, "") + "_edited.jpg",
      type: "image/jpeg",
    });

  /**
   * Skip: upload the cropped 3:4 photo without stickers. The editor already
   * flattened it to a bounded JPEG (long edge <= 2160), so unlike the raw
   * gallery file it can't trip the server's 413 Payload Too Large limit.
   */
  const onEditorSkip = (result: PhotoEditorResult) =>
    uploadFromEditor({
      uri: result.uri,
      name: sessionRef.current.fileName.replace(/\.[^.]+$/, "") + ".jpg",
      type: "image/jpeg",
    });

  const onEditorCancel = () => {
    if (busy) return;
    setSession(CLOSED_SESSION);
  };

  return {
    /** Launch the picker → editor → upload flow. context is echoed to onUploaded. */
    pickAndEdit,
    /** True while the editor modal should be mounted */
    editorVisible: session.visible,
    /** Spread onto <PhotoEditorModal /> */
    editorProps: {
      visible: session.visible,
      imageUri: session.imageUri,
      busy,
      busyLabel: "Uploading...",
      onCancel: onEditorCancel,
      onDone: onEditorDone,
      onSkip: onEditorSkip,
    },
  };
}

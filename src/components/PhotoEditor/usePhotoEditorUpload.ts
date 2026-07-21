import { useRef, useState } from "react";
import { Alert, PermissionsAndroid, Platform } from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import { Image as ImageCompressor } from "react-native-compressor";
import { useDispatch } from "react-redux";
import { check, request, PERMISSIONS, RESULTS, openSettings } from "react-native-permissions";
import { uploadImagesPhotoAPI } from "../../actions/authActions";
import { analyzeFaceForMask, FaceMaskAnalysis } from "../../helper/faceMask";
import { PhotoEditorResult } from "./PhotoEditorModal";

export interface PermissionResult {
  granted: boolean;
  newlyGranted: boolean;
}

export async function requestGalleryPermission(): Promise<PermissionResult> {
  if (Platform.OS === "android") {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES || PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: "Gallery Permission",
          message: "App needs access to your photos to upload them.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
      return { granted: isGranted, newlyGranted: false };
    } catch (err) {
      console.warn("Android permission error:", err);
      return { granted: false, newlyGranted: false };
    }
  } else {
    // iOS permission handling
    try {
      const permission = PERMISSIONS.IOS.PHOTO_LIBRARY;
      const checkResult = await check(permission);

      if (checkResult === RESULTS.GRANTED || checkResult === RESULTS.LIMITED) {
        return { granted: true, newlyGranted: false };
      }

      if (checkResult === RESULTS.BLOCKED) {
        Alert.alert(
          "Photo Library Permission Required",
          "Photo library access is disabled. Please enable it in your device Settings to choose profile photos.",
          [
            { text: "Open Settings", onPress: () => openSettings().catch(() => null) },
            { text: "Cancel", style: "cancel" },
          ]
        );
        return { granted: false, newlyGranted: false };
      }

      // Request permission if not determined
      const requestResult = await request(permission);
      if (requestResult === RESULTS.BLOCKED) {
        Alert.alert(
          "Photo Library Permission Required",
          "Photo library access is disabled. Please enable it in your device Settings to choose profile photos.",
          [
            { text: "Open Settings", onPress: () => openSettings().catch(() => null) },
            { text: "Cancel", style: "cancel" },
          ]
        );
      }
      const isAllowed = requestResult === RESULTS.GRANTED || requestResult === RESULTS.LIMITED;
      return { granted: isAllowed, newlyGranted: isAllowed };
    } catch (err) {
      console.warn("iOS permission error:", err);
      return { granted: false, newlyGranted: false };
    }
  }
}

export interface UploadedPhoto {
  url: string;
  imageId: string;
}

interface EditorSession {
  visible: boolean;
  /** Opaque caller value passed to pickAndEdit, handed back on success */
  context: any;
  imageUri: string;
  analysis: FaceMaskAnalysis | null;
  fileName: string;
}

const CLOSED_SESSION: EditorSession = {
  visible: false,
  context: null,
  imageUri: "",
  analysis: null,
  fileName: "",
};

// Long-edge cap shared by the Done export and the Skip transcode; keeps
// payloads within server limits (raw camera files 413 otherwise)
const MAX_UPLOAD_DIMENSION = 2160;

interface Options {
  /** Return false (optionally after showing a toast) to block picking */
  canStart?: () => boolean;
  /**
   * Called once the backend has stored the photo, right before the editor
   * closes. Awaited, so follow-up API calls keep the busy overlay up.
   */
  onUploaded: (context: any, uploaded: UploadedPhoto) => void | Promise<void>;
}

/**
 * The shared pick → face-detect → edit → upload pipeline behind every profile
 * photo entry point. Screens call pickAndEdit(context) from their Upload tile
 * and spread `editorProps` onto a PhotoEditorModal; everything else — gallery
 * permission, single-photo picker, ML Kit analysis, the Done flatten upload,
 * the Skip transcode upload, and Retry/Cancel error handling — lives here so
 * the flow stays identical on every screen.
 */
export function usePhotoEditorUpload({ canStart, onUploaded }: Options) {
  const dispatch = useDispatch();
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
      const permissionResult = await requestGalleryPermission();
      console.log("[PhotoEditorUpload] Permission result:", permissionResult);
      if (!permissionResult.granted) return;

      isPickerOpenRef.current = true;

      // Safe presentation buffer delay for first-time grants on iOS
      if (Platform.OS === "ios" && permissionResult.newlyGranted) {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

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

          // Automatic face detection; the editor opens either way. A valid
          // analysis auto-places the mask, null falls back to the manual
          // emoji/sticker editor.
          const analysis = await analyzeFaceForMask(asset.uri);
          setSession({
            visible: true,
            context,
            imageUri: asset.uri,
            analysis,
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
   * Skip: upload the photo without any edits. The raw gallery file can be
   * 10MB+ (and HEIC), which the server rejects with 413 Payload Too Large —
   * so transcode it to a JPEG capped at the same long edge the Done path
   * exports at. Visually identical pipeline, bounded payload.
   */
  const onEditorSkip = async () => {
    setBusy(true);
    let uploadUri = sessionRef.current.imageUri;
    try {
      uploadUri = await ImageCompressor.compress(sessionRef.current.imageUri, {
        compressionMethod: "manual",
        maxWidth: MAX_UPLOAD_DIMENSION,
        maxHeight: MAX_UPLOAD_DIMENSION,
        quality: 0.92,
        output: "jpg",
      });
    } catch (err) {
      console.warn("[PhotoEditorUpload] Skip transcode failed, uploading original:", err);
    }
    await uploadFromEditor({
      uri: uploadUri,
      name: sessionRef.current.fileName.replace(/\.[^.]+$/, "") + ".jpg",
      type: "image/jpeg",
    });
  };

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
      analysis: session.analysis,
      busy,
      busyLabel: "Uploading...",
      onCancel: onEditorCancel,
      onDone: onEditorDone,
      onSkip: onEditorSkip,
    },
  };
}

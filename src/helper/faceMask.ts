import { Image } from "react-native";
import FaceDetection from "@react-native-ml-kit/face-detection";
import { Image as ImageCompressor } from "react-native-compressor";
import {
  mask1,
  mask2,
  mask3,
  mask4,
  mask5,
  mask6,
  mask7,
  mask8,
  mask9,
  mask10,
} from "./ImageAssets";

export interface FaceMaskOption {
  id: string;
  source: any;
  /** Fraction of the asset width covered by visible (non-transparent) art */
  contentWidthFraction: number;
  /** Vertical position of the eye holes, as a fraction of the asset height */
  eyeLineYFraction: number;
}

// contentWidthFraction / eyeLineYFraction were measured from each PNG's alpha
// channel (visible-art bounding box and eye-hole centroid). The assets carry
// large, uneven transparent margins, so placement must compensate per mask.
export const FACE_MASKS: FaceMaskOption[] = [
  { id: "mask1", source: mask1, contentWidthFraction: 0.81, eyeLineYFraction: 0.54 },
  { id: "mask2", source: mask2, contentWidthFraction: 0.81, eyeLineYFraction: 0.56 },
  { id: "mask3", source: mask3, contentWidthFraction: 0.83, eyeLineYFraction: 0.46 },
  { id: "mask4", source: mask4, contentWidthFraction: 0.83, eyeLineYFraction: 0.5 },
  { id: "mask5", source: mask5, contentWidthFraction: 0.79, eyeLineYFraction: 0.54 },
  { id: "mask6", source: mask6, contentWidthFraction: 0.82, eyeLineYFraction: 0.51 },
  { id: "mask7", source: mask7, contentWidthFraction: 0.8, eyeLineYFraction: 0.51 },
  { id: "mask8", source: mask8, contentWidthFraction: 0.87, eyeLineYFraction: 0.47 },
  { id: "mask9", source: mask9, contentWidthFraction: 0.87, eyeLineYFraction: 0.57 },
  { id: "mask10", source: mask10, contentWidthFraction: 0.86, eyeLineYFraction: 0.63 },
];

export interface FacePoint {
  x: number;
  y: number;
}

/**
 * All pixel values below (image size, eye positions, face frame) are expressed
 * in the DETECTION image space: an EXIF-normalized re-encode of the original
 * photo. Because normalization preserves aspect ratio, these coordinates map
 * onto the displayed original image with a single uniform scale.
 */
export interface FaceMaskAnalysis {
  imageWidth: number;
  imageHeight: number;
  leftEye: FacePoint;
  rightEye: FacePoint;
  faceFrame: { left: number; top: number; width: number; height: number };
  rollDegrees: number;
}

// Face must span at least this fraction of the image width to be maskable
const MIN_FACE_WIDTH_RATIO = 0.15;
const MAX_ROLL_DEGREES = 30;
const MAX_YAW_DEGREES = 20;
const MIN_EYE_OPEN_PROBABILITY = 0.10;
// Plausible interpupillary distance relative to face width; outside this band
// the landmarks are unreliable (blurred or partially occluded face)
const MIN_EYE_DISTANCE_RATIO = 0.2;
const MAX_EYE_DISTANCE_RATIO = 0.8;

const DETECTION_MAX_DIMENSION = 1280;

const getImageSize = (uri: string): Promise<{ width: number; height: number }> =>
  new Promise((resolve, reject) => {
    Image.getSize(uri, (width, height) => resolve({ width, height }), reject);
  });

/**
 * Re-encodes the photo so its EXIF orientation is baked into the pixels.
 * ML Kit reports landmarks in post-rotation coordinates while Image.getSize
 * can return the raw stored dimensions (and the iOS detector never applies
 * orientation at all), so detecting on a normalized copy is the only way to
 * keep landmark coordinates and image dimensions in the same space.
 */
async function normalizeForDetection(imageUri: string): Promise<string> {
  try {
    const uri = await ImageCompressor.compress(imageUri, {
      compressionMethod: "manual",
      maxWidth: DETECTION_MAX_DIMENSION,
      maxHeight: DETECTION_MAX_DIMENSION,
      quality: 0.9,
    });
    return uri || imageUri;
  } catch (err) {
    console.warn("[faceMask] Normalization failed, detecting on original:", err);
    return imageUri;
  }
}

/**
 * Runs on-device face detection on the given image and validates that it
 * contains exactly one clearly visible, well-lit, front-facing face with both
 * eyes open. Returns the geometry needed to place a mask over the eyes, or
 * null when the photo is not suitable for mask selection.
 */
export async function analyzeFaceForMask(imageUri: string): Promise<FaceMaskAnalysis | null> {
  try {
    const detectionUri = await normalizeForDetection(imageUri);
    const [faces, imageSize] = await Promise.all([
      FaceDetection.detect(detectionUri, {
        performanceMode: "accurate",
        landmarkMode: "all",
        classificationMode: "all",
        minFaceSize: 0.1,
      }),
      getImageSize(detectionUri),
    ]);

    if (!faces || faces.length !== 1) {
      console.log(`[faceMask] Skipping mask: ${faces?.length ?? 0} face(s) detected.`);
      return null;
    }

    const face = faces[0];
    const leftEye = face.landmarks?.leftEye?.position;
    const rightEye = face.landmarks?.rightEye?.position;
    const noseBase = face.landmarks?.noseBase?.position;

    if (!leftEye || !rightEye || !noseBase) {
      console.log("[faceMask] Skipping mask: eyes/nose landmarks not resolved.");
      return null;
    }

    const { leftEyeOpenProbability, rightEyeOpenProbability } = face;
    if (
      (typeof leftEyeOpenProbability === "number" && leftEyeOpenProbability < MIN_EYE_OPEN_PROBABILITY) ||
      (typeof rightEyeOpenProbability === "number" && rightEyeOpenProbability < MIN_EYE_OPEN_PROBABILITY)
    ) {
      console.log("[faceMask] Skipping mask: eyes not clearly visible/open.");
      return null;
    }

    if (imageSize.width > 0 && face.frame.width / imageSize.width < MIN_FACE_WIDTH_RATIO) {
      console.log("[faceMask] Skipping mask: face too small in frame.");
      return null;
    }

    if (Math.abs(face.rotationZ) > MAX_ROLL_DEGREES || Math.abs(face.rotationY) > MAX_YAW_DEGREES) {
      console.log("[faceMask] Skipping mask: face too tilted or turned away.");
      return null;
    }

    const eyeDistance = Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y);
    const eyeDistanceRatio = face.frame.width > 0 ? eyeDistance / face.frame.width : 0;
    if (eyeDistanceRatio < MIN_EYE_DISTANCE_RATIO || eyeDistanceRatio > MAX_EYE_DISTANCE_RATIO) {
      console.log("[faceMask] Skipping mask: landmark confidence too low.");
      return null;
    }

    return {
      imageWidth: imageSize.width,
      imageHeight: imageSize.height,
      leftEye,
      rightEye,
      faceFrame: {
        left: face.frame.left,
        top: face.frame.top,
        width: face.frame.width,
        height: face.frame.height,
      },
      rollDegrees: face.rotationZ,
    };
  } catch (err) {
    console.warn("[faceMask] Face detection failed, continuing without mask:", err);
    return null;
  }
}

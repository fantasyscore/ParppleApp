import {NativeModules, Platform} from 'react-native';

type FaceLivenessResult =
  | {status: 'success'}
  | {status: 'cancelled'; message?: string};

type FaceLivenessModule = {
  startLiveness(sessionId: string): Promise<FaceLivenessResult>;
};

const {FaceLiveness} = NativeModules as {FaceLiveness?: FaceLivenessModule};

export async function startLiveness(sessionId: string): Promise<FaceLivenessResult> {
  if (!sessionId) {
    throw new Error('Missing sessionId');
  }
  if (!FaceLiveness?.startLiveness) {
    throw new Error(
      `FaceLiveness native module is not available on ${Platform.OS}. Did you rebuild the app?`,
    );
  }
  return FaceLiveness.startLiveness(sessionId);
}


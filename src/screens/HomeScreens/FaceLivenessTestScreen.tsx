import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Modal,
  NativeModules,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {appOperation} from '../../appOperation';
import {useDispatch} from 'react-redux';
import {getProfile} from '../../actions/authActions';

type FaceLivenessResult =
  | {status?: string; message?: string}
  | string
  | null
  | undefined;

export default function FaceLivenessTestScreen() {
  const dispatch = useDispatch();
  const FaceLiveness = (NativeModules as any)?.FaceLiveness as
    | {startLiveness?: (sessionId: string) => Promise<FaceLivenessResult>}
    | undefined;

  const moduleAvailable = useMemo(() => {
    return Boolean(FaceLiveness && typeof FaceLiveness.startLiveness === 'function');
  }, [FaceLiveness]);

  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState<string>('');
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [verifyModalText, setVerifyModalText] = useState('');
  const [allowRetry, setAllowRetry] = useState(false);

  // const extractSessionId = (payload: any): string | null => {
  //   if (!payload) {
  //     return null;
  //   }
  //   if (typeof payload.sessionId === 'string' && payload.sessionId) {
  //     return payload.sessionId;
  //   }
  //   if (typeof payload?.data?.sessionId === 'string' && payload.data.sessionId) {
  //     return payload.data.sessionId;
  //   }
  //   if (typeof payload?.result?.sessionId === 'string' && payload.result.sessionId) {
  //     return payload.result.sessionId;
  //   }
  //   return null;
  // };

  const start = async () => {
    if (!moduleAvailable) {
      const msg =
        'FaceLiveness native module not found. Make sure you rebuilt the app (not just Metro reload).';
      console.warn('[FaceLivenessTest] ' + msg);
      setResultText(msg);
      return;
    }

    setLoading(true);
    setResultText('');

    try {
      console.log('[FaceLivenessTest] Requesting session from /faceId/liveliness');
      const sessionResp = await (appOperation.customer as any).createFaceLivenessSessionAPI();
      const sessionId = sessionResp?.data
      console.log(sessionId,"sessionResp");
      
      if (!sessionId) {
        throw new Error('Session API did not return a valid sessionId');
      }

      console.log('[FaceLivenessTest] Starting native liveness with sessionId:', sessionId);
      const res = await FaceLiveness!.startLiveness!(sessionId);
      console.log('[FaceLivenessTest] Native result:', res);

      // Normalize a few common shapes.
      if (res && typeof res === 'object') {
        const status = (res as any).status;
        if (status === 'success') {
          console.log('[FaceLivenessTest] Verifying session via faceId/verifySessionResult');
          const verifyResp = await (appOperation.customer as any).verifyFaceLivenessSessionAPI({
            sessionId,
          });
          const confidence = Number(verifyResp?.data?.confidence ?? 0);

          if (verifyResp?.success && confidence >= 80 && confidence < 90) {
            dispatch(getProfile(true));
            setAllowRetry(false);
            setVerifyModalText('Your face verification is done.');
            setVerifyModalVisible(true);
            setResultText(
              `Liveness Success\nConfidence: ${confidence}\nVerify Response: ${JSON.stringify(verifyResp)}`,
            );
          } else {
            setAllowRetry(true);
            setVerifyModalText('Please re-verify your face.');
            setVerifyModalVisible(true);
            setResultText(
              `Verification needs retry\nConfidence: ${confidence}\nVerify Response: ${JSON.stringify(verifyResp)}`,
            );
          }
        } else if (status === 'cancelled') {
          setResultText((res as any).message ? `Cancelled: ${(res as any).message}` : 'Cancelled');
        } else {
          setResultText(`Result: ${JSON.stringify(res)}`);
        }
      } else {
        setResultText(res ? `Result: ${String(res)}` : 'Liveness Success');
      }
    } catch (e: any) {
      const msg = e?.message ?? String(e);
      console.error('[FaceLivenessTest] Error:', e);
      setResultText(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.button, loading ? styles.buttonDisabled : null]}
        onPress={start}
        disabled={loading}>
        {loading ? (
          <View style={styles.row}>
            <ActivityIndicator color="#FFFFFF" />
            <Text style={styles.buttonText}>Starting...</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>Start Face Liveness</Text>
        )}
      </Pressable>

      <View style={styles.resultBox}>
        <Text style={styles.resultLabel}>Result</Text>
        <Text selectable style={styles.resultText}>
          {resultText || '—'}
        </Text>
      </View>

      {!loading && Boolean(resultText) && (
        <Pressable style={styles.retry} onPress={start}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      )}

      <Modal
        transparent
        animationType="fade"
        visible={verifyModalVisible}
        onRequestClose={() => setVerifyModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Face Verification</Text>
            <Text style={styles.modalMessage}>{verifyModalText}</Text>

            {allowRetry ? (
              <Pressable
                style={[styles.modalButton, styles.modalPrimaryButton]}
                onPress={() => {
                  setVerifyModalVisible(false);
                  start();
                }}>
                <Text style={styles.modalPrimaryButtonText}>Start Again</Text>
              </Pressable>
            ) : null}

            <Pressable
              style={[styles.modalButton, styles.modalSecondaryButton]}
              onPress={() => setVerifyModalVisible(false)}>
              <Text style={styles.modalSecondaryButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  button: {
    minWidth: 220,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: '#111827',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultBox: {
    marginTop: 18,
    width: '100%',
    maxWidth: 420,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    backgroundColor: '#F9FAFB',
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
    color: '#111827',
  },
  retry: {
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  modalMessage: {
    marginTop: 10,
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
  modalButton: {
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  modalPrimaryButton: {
    backgroundColor: '#111827',
  },
  modalPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalSecondaryButton: {
    backgroundColor: '#EEF2FF',
  },
  modalSecondaryButtonText: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '600',
  },
});


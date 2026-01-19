import { connect, io } from 'socket.io-client';

// Track all created sockets so we can safely disconnect them on logout.
const activeSockets = new Set<any>();

export const createSocket = (url: any) => {
  if (!url || typeof url !== 'string') {
    console.error('[Socket] Invalid URL provided to createSocket:', url);
    throw new Error('Invalid socket URL');
  }

  try {
    const socket = connect(url, {
      transports: ['websocket'],
      forceNew: true,
      autoConnect: true,
      upgrade: false,
      rejectUnauthorized: false,
      reconnectionAttempts: 5,
    });

    if (!socket) {
      throw new Error('Failed to create socket');
    }

    activeSockets.add(socket);

    // Best-effort cleanup if socket disconnects naturally
    try {
      socket.on?.('disconnect', () => {
        activeSockets.delete(socket);
      });
    } catch (e) {
      console.warn('[Socket] Error setting disconnect handler:', e);
      // ignore - socket still works
    }

    return socket;
  } catch (error) {
    console.error('[Socket] Error creating socket:', error);
    throw error;
  }
};

export const disconnectAllSockets = () => {
  try {
    activeSockets.forEach((socket) => {
      try {
        socket.removeAllListeners?.();
      } catch (e) {
        // ignore
      }
      try {
        socket.disconnect?.();
      } catch (e) {
        // ignore
      }
    });
  } finally {
    activeSockets.clear();
  }
};
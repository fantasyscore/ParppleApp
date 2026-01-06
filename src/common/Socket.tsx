import { connect, io } from 'socket.io-client';

// Track all created sockets so we can safely disconnect them on logout.
const activeSockets = new Set<any>();

export const createSocket = (url: any) => {
  const socket = connect(url, {
    transports: ['websocket'],
    forceNew: true,
    autoConnect: true,
    upgrade: false,
    rejectUnauthorized: false,
    reconnectionAttempts: 5,
  });

  activeSockets.add(socket);

  // Best-effort cleanup if socket disconnects naturally
  try {
    socket.on?.('disconnect', () => {
      activeSockets.delete(socket);
    });
  } catch (e) {
    // ignore
  }

  return socket;
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
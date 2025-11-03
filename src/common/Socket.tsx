import { connect, io } from 'socket.io-client';
export const createSocket = (url:any) => {
    return connect(url, {
      transports: ['websocket'],
      forceNew: true,
      autoConnect: true,
      upgrade: false,
      rejectUnauthorized: false,
      reconnectionAttempts: 5,
    });
  }
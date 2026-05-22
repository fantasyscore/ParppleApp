import { connect } from 'socket.io-client';
import { AppState, AppStateStatus } from 'react-native';

// Track all created sockets so we can safely disconnect them on logout.
const activeSockets = new Set<any>();

class LifecycleAwareSocket {
  private url: string;
  private rawSocket: any = null;
  private listeners: Map<string, Set<(...args: any[]) => void>> = new Map();
  private isDisconnectedByUser: boolean = false;
  private appStateSubscription: any = null;

  constructor(url: string) {
    this.url = url;
    this.connectInternal();

    // Listen to AppState globally inside the socket wrapper
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
  }

  private connectInternal() {
    if (this.isDisconnectedByUser) return;

    try {
      console.log('[LifecycleAwareSocket] Establishing fresh connection to:', this.url);
      const socket = connect(this.url, {
        transports: ['websocket'],
        forceNew: true,
        autoConnect: true,
        upgrade: false,
        rejectUnauthorized: false,
        reconnectionAttempts: 5,
      });

      if (!socket) {
        throw new Error('Failed to instantiate raw socket');
      }

      this.rawSocket = socket;

      // Automatically re-attach all stored listeners
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach((callback) => {
          try {
            this.rawSocket.on(event, callback);
          } catch (e) {
            console.error(`[LifecycleAwareSocket] Error re-attaching listener for ${event}:`, e);
          }
        });
      });

      // Handle raw socket errors defensively
      this.rawSocket.on('connect_error', (err: any) => {
        console.warn('[LifecycleAwareSocket] Raw socket connect_error:', err);
      });
      
      this.rawSocket.on('error', (err: any) => {
        console.warn('[LifecycleAwareSocket] Raw socket error:', err);
      });

    } catch (error) {
      console.error('[LifecycleAwareSocket] Error inside connectInternal:', error);
    }
  }

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    console.log('[LifecycleAwareSocket] AppState transitioned to:', nextAppState);

    if (nextAppState === 'background' || nextAppState === 'inactive') {
      console.log('[LifecycleAwareSocket] Cleaning raw socket connection for background safety...');
      this.disconnectRaw();
    } else if (nextAppState === 'active') {
      if (!this.isDisconnectedByUser) {
        // Safe timeout delay to ensure OS has fully resumed the TCP socket stack
        setTimeout(() => {
          if (!this.isDisconnectedByUser && !this.rawSocket) {
            console.log('[LifecycleAwareSocket] Resurrecting fresh socket connection on active state');
            this.connectInternal();
          }
        }, 300);
      }
    }
  };

  private disconnectRaw() {
    if (this.rawSocket) {
      try {
        this.rawSocket.removeAllListeners?.();
        this.rawSocket.disconnect?.();
      } catch (e) {
        console.warn('[LifecycleAwareSocket] Error disconnecting raw socket:', e);
      }
      this.rawSocket = null;
    }
  }

  // Socket.io standard methods wrapper
  public on(event: string, callback: (...args: any[]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    if (this.rawSocket) {
      try {
        this.rawSocket.on(event, callback);
      } catch (e) {
        console.error(`[LifecycleAwareSocket] Error adding listener for ${event}:`, e);
      }
    }
  }

  public off(event: string, callback?: (...args: any[]) => void) {
    if (!callback) {
      this.listeners.delete(event);
      if (this.rawSocket) {
        try {
          this.rawSocket.off(event);
        } catch (e) {
          // ignore
        }
      }
      return;
    }

    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }

    if (this.rawSocket) {
      try {
        this.rawSocket.off(event, callback);
      } catch (e) {
        // ignore
      }
    }
  }

  public removeAllListeners(event?: string) {
    if (event) {
      this.listeners.delete(event);
      if (this.rawSocket) {
        try {
          this.rawSocket.removeAllListeners?.(event);
        } catch (e) {
          // ignore
        }
      }
    } else {
      this.listeners.clear();
      if (this.rawSocket) {
        try {
          this.rawSocket.removeAllListeners?.();
        } catch (e) {
          // ignore
        }
      }
    }
  }

  public emit(event: string, ...args: any[]) {
    if (this.rawSocket) {
      try {
        this.rawSocket.emit(event, ...args);
      } catch (e) {
        console.error(`[LifecycleAwareSocket] Error emitting event ${event}:`, e);
      }
    } else {
      console.warn(`[LifecycleAwareSocket] Cannot emit event "${event}" on a disconnected/backgrounded socket.`);
    }
  }

  public disconnect() {
    this.isDisconnectedByUser = true;
    
    // Clean up AppState listeners
    if (this.appStateSubscription) {
      try {
        this.appStateSubscription.remove();
      } catch (e) {
        // ignore
      }
      this.appStateSubscription = null;
    }

    this.disconnectRaw();
    this.listeners.clear();
  }

  // Getters to mimic socket.io properties perfectly
  public get connected(): boolean {
    return this.rawSocket ? this.rawSocket.connected : false;
  }

  public get id(): string | null {
    return this.rawSocket ? this.rawSocket.id : null;
  }
}

export const createSocket = (url: any) => {
  if (!url || typeof url !== 'string') {
    console.error('[Socket] Invalid URL provided to createSocket:', url);
    throw new Error('Invalid socket URL');
  }

  try {
    const socket = new LifecycleAwareSocket(url);
    activeSockets.add(socket);
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
        socket.disconnect();
      } catch (e) {
        // ignore
      }
    });
  } finally {
    activeSockets.clear();
  }
};
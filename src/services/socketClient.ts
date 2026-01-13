import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config/apiEndpoints';

export interface NotificationData {
  type: 'hire' | 'bid_received' | 'bid_rejected' | 'gig_completed';
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
}

export type NotificationHandler = (notification: NotificationData) => void;
export type ConnectionHandler = (connected: boolean) => void;

class SocketClient {
  private socket: Socket | null = null;
  private notificationHandlers: NotificationHandler[] = [];
  private connectionHandlers: ConnectionHandler[] = [];
  private isConnected = false;

  connect(token: string): void {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token
      },
      autoConnect: true
    });

    this.setupEventHandlers();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.notifyConnectionHandlers(false);
    }
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to Socket.io server');
      this.isConnected = true;
      this.notifyConnectionHandlers(true);
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('Disconnected from Socket.io server:', reason);
      this.isConnected = false;
      this.notifyConnectionHandlers(false);
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('Socket.io connection error:', error);
      this.isConnected = false;
      this.notifyConnectionHandlers(false);
    });

    this.socket.on('notification', (notification: NotificationData) => {
      console.log('Received notification:', notification);
      this.notifyNotificationHandlers(notification);
      
      // Show browser notification if permission granted
      this.showBrowserNotification(notification);
    });
  }

  private notifyNotificationHandlers(notification: NotificationData): void {
    this.notificationHandlers.forEach(handler => {
      try {
        handler(notification);
      } catch (error) {
        console.error('Error in notification handler:', error);
      }
    });
  }

  private notifyConnectionHandlers(connected: boolean): void {
    this.connectionHandlers.forEach(handler => {
      try {
        handler(connected);
      } catch (error) {
        console.error('Error in connection handler:', error);
      }
    });
  }

  private showBrowserNotification(notification: NotificationData): void {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.type // Prevents duplicate notifications
      });
    }
  }

  // Event handler management
  onNotification(handler: NotificationHandler): () => void {
    this.notificationHandlers.push(handler);
    
    // Return unsubscribe function
    return () => {
      const index = this.notificationHandlers.indexOf(handler);
      if (index > -1) {
        this.notificationHandlers.splice(index, 1);
      }
    };
  }

  onConnectionChange(handler: ConnectionHandler): () => void {
    this.connectionHandlers.push(handler);
    
    // Call immediately with current status
    handler(this.isConnected);
    
    // Return unsubscribe function
    return () => {
      const index = this.connectionHandlers.indexOf(handler);
      if (index > -1) {
        this.connectionHandlers.splice(index, 1);
      }
    };
  }

  // Utility methods
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  joinRoom(room: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_room', room);
    }
  }

  leaveRoom(room: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_room', room);
    }
  }

  // Request notification permission
  static async requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return await Notification.requestPermission();
    }
    return 'unsupported';
  }

  // Check if notifications are supported and permitted
  static isNotificationSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  static getNotificationPermission(): NotificationPermission | 'unsupported' {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported';
  }
}

// Export singleton instance
export const socketClient = new SocketClient();
export default SocketClient;
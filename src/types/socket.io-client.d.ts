// Type declarations for socket.io-client
declare module 'socket.io-client' {
  export interface Socket {
    id: string;
    connected: boolean;
    on(event: string, callback: (...args: any[]) => void): void;
    emit(event: string, ...args: any[]): void;
    disconnect(): void;
  }

  export interface SocketOptions {
    auth?: {
      token?: string;
    };
    autoConnect?: boolean;
  }

  export function io(url: string, options?: SocketOptions): Socket;
}
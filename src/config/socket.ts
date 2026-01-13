import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import User from '../modules/auth/models/User';
import logger from './logger';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
}

class SocketManager {
  private io: SocketIOServer;
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: 'http://localhost:3000',
        credentials: true
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware for socket connections
    this.io.use(async (socket: any, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = user._id.toString();
        socket.userEmail = user.email;
        next();
      } catch (error) {
        logger.error('Socket authentication error:', error);
        next(new Error('Invalid authentication token'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      logger.info(`User connected: ${socket.userEmail} (${socket.userId})`);
      
      // Store user socket mapping
      if (socket.userId) {
        this.userSockets.set(socket.userId, socket.id);
        
        // Join user to their personal room
        socket.join(`user_${socket.userId}`);
      }

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info(`User disconnected: ${socket.userEmail} (${socket.userId})`);
        if (socket.userId) {
          this.userSockets.delete(socket.userId);
        }
      });

      // Handle user joining specific rooms (optional for future features)
      socket.on('join_room', (room: string) => {
        socket.join(room);
        logger.info(`User ${socket.userEmail} joined room: ${room}`);
      });
    });
  }

  // Send notification to specific user
  public sendNotificationToUser(userId: string, notification: any) {
    const room = `user_${userId}`;
    this.io.to(room).emit('notification', notification);
    logger.info(`Notification sent to user ${userId}:`, notification);
  }

  // Send notification to multiple users
  public sendNotificationToUsers(userIds: string[], notification: any) {
    userIds.forEach(userId => {
      this.sendNotificationToUser(userId, notification);
    });
  }

  // Check if user is online
  public isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  // Get Socket.io instance for direct access if needed
  public getIO(): SocketIOServer {
    return this.io;
  }
}

export default SocketManager;
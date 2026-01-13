import express from 'express';
import { createServer } from 'http';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import logger from './config/logger';
import connectDB from './config/database';
import { errorHandler } from './utils/errorHandler';
import SocketManager from './config/socket';
import { notificationService } from './services/notificationService';

// Import routes
import authRoutes from './modules/auth/routes/authRoutes';
import gigRoutes from './modules/gigs/routes/gigRoutes';
import bidRoutes from './modules/bids/routes/bidRoutes';

dotenv.config();

const app = express();
const server = createServer(app);

// Initialize Socket.io
const socketManager = new SocketManager(server);
notificationService.setSocketManager(socketManager);

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: 'https://gigflow-client-6t9z-hxz3ymqzs-amit-sharmas-projects-ad05ea67.vercel.app', // Frontend URL
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.get('/api/health', (_req: express.Request, res: express.Response) => {
  logger.info('Health check endpoint accessed');
  res.json({ message: 'Server is running!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/bids', bidRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} with Socket.io enabled`);
});
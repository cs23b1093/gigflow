import mongoose from 'mongoose';
import logger from './logger';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(mongoURI, {
      // Remove deprecated options that are now defaults in Mongoose 6+
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    // Connection event listeners
    mongoose.connection.on('connected', () => {
      logger.info('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Mongoose disconnected from MongoDB');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (error) {
        logger.error('Error during MongoDB disconnection:', error);
        process.exit(1);
      }
    });

  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
};

export default connectDB;
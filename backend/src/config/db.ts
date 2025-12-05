import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import env from './env';
import logger from '../utils/logger';

// Prisma Client for MySQL
export const prisma = new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// MongoDB Connection using Mongoose
export const connectMongoDB = async (): Promise<void> => {
    try {
        await mongoose.connect(env.MONGODB_URI);
        logger.info('✅ MongoDB connected successfully');
    } catch (error) {
        logger.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Graceful shutdown
export const disconnectDatabases = async (): Promise<void> => {
    await prisma.$disconnect();
    await mongoose.disconnect();
    logger.info('🔌 Databases disconnected');
};

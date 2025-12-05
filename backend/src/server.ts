import 'dotenv/config';
import app from './app';
import env from './config/env';
import { connectMongoDB, disconnectDatabases } from './config/db';
import logger from './utils/logger';

import socketService from './services/socket.service';

const PORT = parseInt(env.PORT);

async function startServer() {
    try {
        // Connect to MongoDB
        await connectMongoDB();

        // Start server
        const server = app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
            logger.info(` Environment: ${env.NODE_ENV}`);
            logger.info(`CORS Origin: ${env.CORS_ORIGIN}`);
        });

        // Initialize Socket.io
        socketService.initialize(server);

        // Graceful shutdown
        const gracefulShutdown = async (signal: string) => {
            logger.info(`\n${signal} received. Starting graceful shutdown...`);

            server.close(async () => {
                logger.info('HTTP server closed');
                await disconnectDatabases();
                process.exit(0);
            });

            // Force shutdown after 10 seconds
            setTimeout(() => {
                logger.error('Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

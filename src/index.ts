import { Server } from 'http';
import app from './app';
import { config } from './config/env';
import { logger } from './utils/logger';
import { prisma } from './config/database';

let server: Server;

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected successfully');

    // Start server and store the server instance
    server = app.listen(config.port, () => {
      logger.info(`Server is running on port ${config.port}`);
      logger.info(`Environment: ${config.env}`);
      logger.info(`API Documentation available at http://localhost:${config.port}/api-docs`);
    });

    // Debug: Check server state
    server.on('close', () => {
      logger.error('Server closed unexpectedly!');
    });

    server.on('error', (error) => {
      logger.error('Server error:', error);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
      });
      await prisma.$disconnect();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
      });
      await prisma.$disconnect();
      process.exit(0);
    });

    // Keep the promise alive - don't let the async function complete
    return new Promise(() => {
      // This promise never resolves, keeping the event loop alive
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

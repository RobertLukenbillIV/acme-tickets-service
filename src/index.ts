import app from './app';
import { config } from './config/env';
import { logger } from './utils/logger';
import { prisma } from './config/database';
import { closeQueues } from './config/queue';

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected successfully');

    // Start server
    app.listen(config.port, () => {
      logger.info(`Server is running on port ${config.port}`);
      logger.info(`Environment: ${config.env}`);
      logger.info(`API Documentation available at http://localhost:${config.port}/api-docs`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Shutdown signal received: closing server...');
      await closeQueues();
      await prisma.$disconnect();
      logger.info('Server shut down gracefully');
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

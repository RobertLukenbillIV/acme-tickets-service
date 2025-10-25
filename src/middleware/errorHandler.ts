import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,

  next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.error(`AppError: ${err.message}`, { statusCode: err.statusCode, stack: err.stack });
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  logger.error(`Unexpected error: ${err.message}`, { stack: err.stack });
  return res.status(500).json({
    error: 'Internal server error',
  });
};

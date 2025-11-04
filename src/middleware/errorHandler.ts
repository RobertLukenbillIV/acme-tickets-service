import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { ErrorCode, ErrorResponse, ValidationErrorDetail } from '../contracts';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: ErrorCode,
    public details?: ValidationErrorDetail[],
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
  const requestId = uuidv4();
  const timestamp = new Date().toISOString();
  const path = req.originalUrl;

  if (err instanceof AppError) {
    logger.error(`AppError: ${err.message}`, {
      statusCode: err.statusCode,
      code: err.code,
      requestId,
      path,
      stack: err.stack,
    });

    const errorResponse: ErrorResponse = {
      code: err.code,
      message: err.message,
      timestamp,
      path,
      requestId,
      ...(err.details && { details: err.details }),
    };

    return res.status(err.statusCode).json(errorResponse);
  }

  // Handle validation errors from express-validator or zod
  if (err.name === 'ValidationError' || err.name === 'ZodError') {
    const validationError: ErrorResponse = {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      timestamp,
      path,
      requestId,
      details: [], // TODO: Extract validation details from err
    };

    logger.error('Validation error', { requestId, path, error: err.message });
    return res.status(400).json(validationError);
  }

  // Default internal server error
  logger.error(`Unexpected error: ${err.message}`, { requestId, path, stack: err.stack });

  const internalError: ErrorResponse = {
    code: 'INTERNAL_ERROR',
    message: 'Internal server error',
    timestamp,
    path,
    requestId,
  };

  return res.status(500).json(internalError);
};

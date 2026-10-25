import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from './AppError.js';
import { handleZodError } from './handleZodError.js';
import { handlePrismaError } from './handlePrismaError.js';
import { config } from '../config/env.js';

export const globalErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let statusCode = 500;
  let message = 'Something went wrong!';
  let code = 'INTERNAL_SERVER_ERROR';

  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    code = simplifiedError.code;
  } else if (
    err instanceof Prisma.PrismaClientKnownRequestError ||
    err instanceof Prisma.PrismaClientValidationError
  ) {
    const simplifiedError = handlePrismaError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    code = simplifiedError.code;
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
  } else if (err instanceof Error) {
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: { code },
    ...(config.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

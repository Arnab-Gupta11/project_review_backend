import { ZodSchema } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utils/catchAsync.js';

export const validateRequest = (schema: ZodSchema) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
      cookies: req.cookies,
    });
    next();
  });
};
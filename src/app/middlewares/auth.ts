import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../errors/AppError.js';
import { config } from '../config/env.js';
import { prisma } from '../db/index.js';
import { catchAsync } from '../utils/catchAsync.js';

interface JwtPayload {
  id: string;
  role: string;
  email: string;
}

('Bearer fdfasfsdfadsfadsfadsf');

export const auth = (...requiredRoles: string[]) => {
  return catchAsync(
    async (req: Request, _res: Response, next: NextFunction) => {
      const token =
        req.cookies?.token || req.headers?.authorization?.split(' ')[1];

      if (!token) {
        throw new AppError(401, 'You are not authorize', 'AUTH_UNAUTHORIZE');
      }

      let decoded: JwtPayload;

      try {
        decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
      } catch (error) {
        throw new AppError(401, 'Token Invalid', 'AUTH_TOKEN_INVALID');
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user || !user.isActive) {
        throw new AppError(404, 'User Not Found', 'AUTH_NOT_FOUND');
      }

      if (requiredRoles.length && !requiredRoles.includes(user.role)) {
        throw new AppError(403, 'Forbidden Access', 'AUTH_Forbidden');
      }

      (req as any).user = user;

      next();
    }
  );
};

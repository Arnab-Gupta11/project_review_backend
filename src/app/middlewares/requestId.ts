import type { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const requestId = (req: Request, res: Response, next: NextFunction) => {
  const reqId = uuidv4();
  req.headers['x-request-id'] = reqId;
  res.setHeader('x-request-id', reqId);
  next();
};
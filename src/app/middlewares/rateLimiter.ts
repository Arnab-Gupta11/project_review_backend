import { rateLimit } from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    error: { code: 'RATE_LIMIT_EXCEEDED' },
  },
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.',
    error: { code: 'RATE_LIMIT_EXCEEDED' },
  },
});

export const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many project submissions from this IP, please try again after 15 minutes.',
    error: { code: 'RATE_LIMIT_EXCEEDED' },
  },
});

import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.js';
import { sendResponse } from '../../utils/sendResponse.js';
import { AuthService } from './auth.service.js';
import { config } from '../../config/env.js';

const cookieOptions = {
  secure: config.NODE_ENV === 'production',
  httpOnly: true,
  sameSite: (config.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const register = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.register(req.body);

  res.cookie('token', result.token, cookieOptions);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'User registered successfully',
    data: result,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.login(req.body);

  res.cookie('token', result.token, cookieOptions);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User logged in successfully',
    data: result,
  });
});

const logout = catchAsync(async (_req: Request, res: Response) => {
  res.clearCookie('token', {
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User logged out successfully',
    data: null,
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await AuthService.getMe(user.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User profile retrieved successfully',
    data: result,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  await AuthService.changePassword(user.id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Password changed successfully',
    data: null,
  });
});

const forgetPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.forgetPassword(req.body.email);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Password reset code generated and sent to email',
    data: {
      email: req.body.email,
      ...(config.NODE_ENV === 'development' && { otp: result.otp }),
    },
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  await AuthService.resetPassword(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Password reset successfully',
    data: null,
  });
});

export const AuthController = {
  register,
  login,
  logout,
  getMe,
  changePassword,
  forgetPassword,
  resetPassword,
};


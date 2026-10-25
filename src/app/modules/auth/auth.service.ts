import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { prisma } from '../../db/index.js';
import { config } from '../../config/env.js';
import { AppError } from '../../errors/AppError.js';
import type { ILoginResponse, IUserResponse } from './auth.interface.js';
import type { Role } from '@prisma/client';

const sanitizeUser = (user: {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}): IUserResponse => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const generateToken = (payload: { id: string; email: string; role: Role }): string => {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN as any,
  });
};

const register = async (payload: {
  name?: string;
  email: string;
  password: string;
}): Promise<ILoginResponse> => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email.toLowerCase() },
  });

  if (existingUser) {
    throw new AppError(409, 'User with this email already exists', 'AUTH_DUPLICATE_EMAIL');
  }

  const hashedPassword = await argon2.hash(payload.password);

  const newUser = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email.toLowerCase(),
      password: hashedPassword,
      role: 'STUDENT',
    },
  });

  const token = generateToken({
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
  });

  return {
    user: sanitizeUser(newUser),
    token,
  };
};

const login = async (payload: {
  email: string;
  password: string;
}): Promise<ILoginResponse> => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email.toLowerCase() },
  });

  if (!user || !user.isActive) {
    throw new AppError(401, 'Invalid email or password', 'AUTH_INVALID_CREDENTIALS');
  }

  const isPasswordValid = await argon2.verify(user.password, payload.password);
  if (!isPasswordValid) {
    throw new AppError(401, 'Invalid email or password', 'AUTH_INVALID_CREDENTIALS');
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: sanitizeUser(user),
    token,
  };
};

const getMe = async (userId: string): Promise<IUserResponse> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.isActive) {
    throw new AppError(404, 'User not found', 'AUTH_USER_NOT_FOUND');
  }

  return sanitizeUser(user);
};

const changePassword = async (
  userId: string,
  payload: { oldPassword: string; newPassword: string },
): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, 'User not found', 'AUTH_USER_NOT_FOUND');
  }

  const isPasswordValid = await argon2.verify(user.password, payload.oldPassword);
  if (!isPasswordValid) {
    throw new AppError(400, 'Current password does not match', 'AUTH_PASSWORD_MISMATCH');
  }

  const hashedPassword = await argon2.hash(payload.newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
};

const forgetPassword = async (email: string): Promise<{ otp: string }> => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user || !user.isActive) {
    throw new AppError(404, 'No active account found with this email', 'AUTH_USER_NOT_FOUND');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.passwordReset.deleteMany({
    where: { email: email.toLowerCase() },
  });

  await prisma.passwordReset.create({
    data: {
      email: email.toLowerCase(),
      otp,
      expiresAt,
    },
  });

  console.log(`[AUTH] Password reset OTP for ${email}: ${otp}`);

  return { otp };
};

const resetPassword = async (payload: {
  email: string;
  otp: string;
  newPassword: string;
}): Promise<void> => {
  const record = await prisma.passwordReset.findFirst({
    where: {
      email: payload.email.toLowerCase(),
      otp: payload.otp,
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) {
    throw new AppError(400, 'Invalid or expired OTP code', 'AUTH_INVALID_OTP');
  }

  const hashedPassword = await argon2.hash(payload.newPassword);

  await prisma.user.update({
    where: { email: payload.email.toLowerCase() },
    data: { password: hashedPassword },
  });

  await prisma.passwordReset.deleteMany({
    where: { email: payload.email.toLowerCase() },
  });
};

export const AuthService = {
  register,
  login,
  getMe,
  changePassword,
  forgetPassword,
  resetPassword,
};


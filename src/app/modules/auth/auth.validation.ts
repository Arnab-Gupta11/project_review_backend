import { z } from 'zod';

const registerValidationSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

const loginValidationSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const changePasswordValidationSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, 'Old password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),
});

const forgetPasswordValidationSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

const resetPasswordValidationSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    otp: z.string().length(6, 'Verification code must be exactly 6 digits'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),
});

export const AuthValidation = {
  registerValidationSchema,
  loginValidationSchema,
  changePasswordValidationSchema,
  forgetPasswordValidationSchema,
  resetPasswordValidationSchema,
};


import { Router } from 'express';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { auth } from '../../middlewares/auth.js';
import { loginLimiter } from '../../middlewares/rateLimiter.js';
import { AuthValidation } from './auth.validation.js';
import { AuthController } from './auth.controller.js';

const router = Router();

router.post(
  '/register',
  loginLimiter,
  validateRequest(AuthValidation.registerValidationSchema),
  AuthController.register,
);

router.post(
  '/login',
  loginLimiter,
  validateRequest(AuthValidation.loginValidationSchema),
  AuthController.login,
);

router.post('/logout', AuthController.logout);

router.get('/me', auth(), AuthController.getMe);

router.patch(
  '/change-password',
  auth(),
  validateRequest(AuthValidation.changePasswordValidationSchema),
  AuthController.changePassword,
);

router.post(
  '/forget-password',
  validateRequest(AuthValidation.forgetPasswordValidationSchema),
  AuthController.forgetPassword,
);

router.post(
  '/reset-password',
  validateRequest(AuthValidation.resetPasswordValidationSchema),
  AuthController.resetPassword,
);

export const AuthRoutes = router;


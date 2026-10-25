import { Router } from 'express';
import { auth } from '../../middlewares/auth.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { submissionLimiter } from '../../middlewares/rateLimiter.js';
import { SubmissionValidation } from './submission.validation.js';
import { SubmissionController } from './submission.controller.js';

const router = Router();

router.post(
  '/',
  auth('STUDENT', 'ADMIN'),
  submissionLimiter,
  validateRequest(SubmissionValidation.createSubmissionValidationSchema),
  SubmissionController.createSubmission
);

router.get(
  '/my-submissions',
  auth('STUDENT', 'ADMIN'),
  SubmissionController.getMySubmissions
);

router.get(
  '/',
  auth('MENTOR', 'ADMIN'),
  SubmissionController.getAllSubmissions
);

router.get('/:id', auth(), SubmissionController.getSubmissionById);

router.patch(
  '/:id/review',
  auth('MENTOR', 'ADMIN'),
  validateRequest(SubmissionValidation.reviewSubmissionValidationSchema),
  SubmissionController.reviewSubmission
);

export const SubmissionRoutes = router;

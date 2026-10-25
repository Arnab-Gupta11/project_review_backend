import { z } from 'zod';

const createSubmissionValidationSchema = z.object({
  body: z.object({
    projectName: z
      .string()
      .trim()
      .min(3, 'Project name must be at least 3 characters')
      .max(100, 'Project name cannot exceed 100 characters'),
    repoUrl: z
      .string()
      .trim()
      .url('Please enter a valid URL (e.g. https://github.com/username/repo)')
      .regex(/^https?:\/\//, 'Repository URL must begin with http:// or https://'),
    liveUrl: z
      .string()
      .trim()
      .url('Please enter a valid URL (e.g. https://project.vercel.app)')
      .regex(/^https?:\/\//, 'Live URL must begin with http:// or https://'),
    description: z
      .string()
      .trim()
      .min(15, 'Please provide at least 15 characters describing your project')
      .max(2000, 'Description cannot exceed 2000 characters'),
  }),
});

const reviewSubmissionValidationSchema = z.object({
  body: z.object({
    status: z.enum(['APPROVED', 'REJECTED'] as const),
    feedback: z.string().trim().optional(),
  }),
});

export const SubmissionValidation = {
  createSubmissionValidationSchema,
  reviewSubmissionValidationSchema,
};


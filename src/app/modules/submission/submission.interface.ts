import type { SubmissionStatus } from '@prisma/client';

export interface ICreateSubmissionPayload {
  projectName: string;
  repoUrl: string;
  liveUrl: string;
  description: string;
}

export interface IReviewSubmissionPayload {
  status: 'APPROVED' | 'REJECTED';
  feedback?: string;
}

export interface ISubmissionQueryOptions {
  page?: number | string;
  limit?: number | string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ISubmissionStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}


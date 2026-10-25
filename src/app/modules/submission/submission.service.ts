import { prisma } from '../../db/index.js';
import { AppError } from '../../errors/AppError.js';
import type { SubmissionStatus, Prisma } from '@prisma/client';
import type {
  ICreateSubmissionPayload,
  IReviewSubmissionPayload,
  ISubmissionQueryOptions,
  ISubmissionStats,
} from './submission.interface.js';

const createSubmission = async (
  studentId: string,
  payload: ICreateSubmissionPayload
) => {
  const normalizedName = payload.projectName.trim();

  const existingSubmission = await prisma.projectSubmission.findFirst({
    where: {
      studentId,
      projectName: {
        equals: normalizedName,
        mode: 'insensitive',
      },
    },
  });

  if (existingSubmission) {
    throw new AppError(
      409,
      `You have already submitted a project with the name "${normalizedName}". You cannot submit duplicate projects with the same name.`,
      'DUPLICATE_PROJECT_NAME'
    );
  }

  const submission = await prisma.projectSubmission.create({
    data: {
      projectName: normalizedName,
      repoUrl: payload.repoUrl.trim(),
      liveUrl: payload.liveUrl.trim(),
      description: payload.description.trim(),
      studentId,
      status: 'PENDING',
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return submission;
};

const getMySubmissions = async (
  studentId: string,
  options: ISubmissionQueryOptions
) => {
  const page = Math.max(1, Number(options.page || 1));
  const limit = Math.min(Math.max(1, Number(options.limit || 10)), 100);
  const skip = (page - 1) * limit;

  const where: Prisma.ProjectSubmissionWhereInput = {
    studentId,
  };

  if (options.status && options.status !== 'ALL') {
    where.status = options.status as SubmissionStatus;
  }

  if (options.search && options.search.trim()) {
    const search = options.search.trim();
    where.OR = [
      { projectName: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { repoUrl: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [total, pending, approved, rejected] = await Promise.all([
    prisma.projectSubmission.count({ where: { studentId } }),
    prisma.projectSubmission.count({ where: { studentId, status: 'PENDING' } }),
    prisma.projectSubmission.count({
      where: { studentId, status: 'APPROVED' },
    }),
    prisma.projectSubmission.count({
      where: { studentId, status: 'REJECTED' },
    }),
  ]);

  const stats: ISubmissionStats = { total, pending, approved, rejected };

  const [submissions, filteredCount] = await Promise.all([
    prisma.projectSubmission.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        student: { select: { id: true, name: true, email: true } },
        reviewer: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.projectSubmission.count({ where }),
  ]);

  const totalPage = Math.ceil(filteredCount / limit) || 1;

  return {
    meta: {
      page,
      limit,
      total: filteredCount,
      totalPage,
    },
    stats,
    data: submissions,
  };
};

const getAllSubmissions = async (options: ISubmissionQueryOptions) => {
  const page = Math.max(1, Number(options.page || 1));
  const limit = Math.min(Math.max(1, Number(options.limit || 10)), 100);
  const skip = (page - 1) * limit;

  const where: Prisma.ProjectSubmissionWhereInput = {};

  if (options.status && options.status !== 'ALL') {
    where.status = options.status as SubmissionStatus;
  }

  if (options.search && options.search.trim()) {
    const search = options.search.trim();
    where.OR = [
      { projectName: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { repoUrl: { contains: search, mode: 'insensitive' } },
      {
        student: {
          name: { contains: search, mode: 'insensitive' },
        },
      },
      {
        student: {
          email: { contains: search, mode: 'insensitive' },
        },
      },
    ];
  }

  const [total, pending, approved, rejected] = await Promise.all([
    prisma.projectSubmission.count(),
    prisma.projectSubmission.count({ where: { status: 'PENDING' } }),
    prisma.projectSubmission.count({ where: { status: 'APPROVED' } }),
    prisma.projectSubmission.count({ where: { status: 'REJECTED' } }),
  ]);

  const stats: ISubmissionStats = { total, pending, approved, rejected };

  const [submissions, filteredCount] = await Promise.all([
    prisma.projectSubmission.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        student: { select: { id: true, name: true, email: true } },
        reviewer: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.projectSubmission.count({ where }),
  ]);

  const totalPage = Math.ceil(filteredCount / limit) || 1;

  return {
    meta: {
      page,
      limit,
      total: filteredCount,
      totalPage,
    },
    stats,
    data: submissions,
  };
};

const getSubmissionById = async (
  submissionId: string,
  currentUser: { id: string; role: string }
) => {
  const submission = await prisma.projectSubmission.findUnique({
    where: { id: submissionId },
    include: {
      student: { select: { id: true, name: true, email: true } },
      reviewer: { select: { id: true, name: true, email: true } },
    },
  });

  if (!submission) {
    throw new AppError(404, 'Submission not found', 'NOT_FOUND');
  }

  if (
    currentUser.role === 'STUDENT' &&
    submission.studentId !== currentUser.id
  ) {
    throw new AppError(
      403,
      'You are not authorized to view this submission',
      'AUTH_FORBIDDEN'
    );
  }

  return submission;
};

const reviewSubmission = async (
  submissionId: string,
  mentorId: string,
  payload: IReviewSubmissionPayload
) => {
  const project = await prisma.projectSubmission.findUnique({
    where: { id: submissionId },
  });
  if (!project) {
    throw new AppError(404, 'Project Not Found', 'NOT_FOUND');
  }

  const updated = await prisma.projectSubmission.update({
    where: { id: submissionId },
    data: {
      status: payload.status,
      feedback: payload.feedback,
      reviewerId: mentorId,
      reviewedAt: new Date(),
    },
  });
  return updated;
};

export const SubmissionService = {
  createSubmission,
  getMySubmissions,
  getAllSubmissions,
  getSubmissionById,
  reviewSubmission,
};

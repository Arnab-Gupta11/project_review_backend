import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.js';
import { sendResponse } from '../../utils/sendResponse.js';
import { SubmissionService } from './submission.service.js';

const createSubmission = catchAsync(async (req: Request, res: Response) => {
  const studentId = (req as any).user.id;
  const result = await SubmissionService.createSubmission(studentId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Project submitted successfully',
    data: result,
  });
});

const getMySubmissions = catchAsync(async (req: Request, res: Response) => {
  const studentId = (req as any).user.id;
  const result = await SubmissionService.getMySubmissions(studentId, req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'My submissions retrieved successfully',
    meta: result.meta,
    stats: result.stats,
    data: result.data,
  });
});

const getAllSubmissions = catchAsync(async (req: Request, res: Response) => {
  const result = await SubmissionService.getAllSubmissions(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All project submissions retrieved successfully',
    meta: result.meta,
    stats: result.stats,
    data: result.data,
  });
});

const getSubmissionById = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await SubmissionService.getSubmissionById(req.params.id, user);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Submission details retrieved successfully',
    data: result,
  });
});

const reviewSubmission = catchAsync(async (req: Request, res: Response) => {
  const mentorId = (req as any).user.id;
  const payload = req.body;
  const result = await SubmissionService.reviewSubmission(
    req.params.id,
    mentorId,
    payload
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Review status update successfully',
    data: result,
  });
});

export const SubmissionController = {
  createSubmission,
  getMySubmissions,
  getAllSubmissions,
  getSubmissionById,
  reviewSubmission,
};

import { Response } from 'express';
import { IApiResponse } from '../interface/common.types.js';

export const sendResponse = <T>(res: Response, data: IApiResponse<T> & { statusCode: number }) => {
  const { statusCode, success, message, data: responseData, meta, stats } = data;
  res.status(statusCode).json({
    success,
    message,
    ...(responseData !== undefined && { data: responseData }),
    ...(meta && { meta }),
    ...(stats && { stats }),
  });
};
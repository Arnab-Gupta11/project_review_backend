export class AppError extends Error {
  public statusCode: number;
  public code: string;
  constructor(statusCode: number, message: string, code: string = 'INTERNAL_SERVER_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}
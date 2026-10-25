import { ZodError } from 'zod';
export const handleZodError = (err: ZodError) => {
  const statusCode = 400;
  const message = err.issues.map((issue) => issue.message).join(', ');
  const code = 'VALIDATION_ERROR';
  return { statusCode, message, code };
};
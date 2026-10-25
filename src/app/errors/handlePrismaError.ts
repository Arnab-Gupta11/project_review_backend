import { Prisma } from '@prisma/client';

interface SimplifiedError {
  statusCode: number;
  message: string;
  code: string;
}

export const handlePrismaError = (
  err: Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientValidationError,
): SimplifiedError => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        const target = (err.meta?.target as string[]) || [];
        if (target.includes('projectName') || target.includes('unique_student_project_name')) {
          return {
            statusCode: 409,
            message: 'You have already submitted a project with this name. Please use a unique project name.',
            code: 'DUPLICATE_PROJECT_NAME',
          };
        }
        const field = target.length > 0 ? target.join(', ') : 'field';
        return {
          statusCode: 409,
          message: `A record with this ${field} already exists.`,
          code: 'DUPLICATE_ENTRY',
        };
      }
      case 'P2025': {
        return {
          statusCode: 404,
          message: (err.meta?.cause as string) || 'Record not found.',
          code: 'RECORD_NOT_FOUND',
        };
      }
      case 'P2003': {
        return {
          statusCode: 400,
          message: 'Foreign key constraint failed.',
          code: 'FOREIGN_KEY_VIOLATION',
        };
      }
      default:
        return {
          statusCode: 400,
          message: err.message,
          code: `PRISMA_${err.code}`,
        };
    }
  }

  return {
    statusCode: 400,
    message: err.message || 'Prisma validation failed',
    code: 'VALIDATION_ERROR',
  };
};


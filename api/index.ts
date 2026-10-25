import app from '../src/app.js';
import { prisma } from '../src/app/db/index.js';

export default async function handler(req: any, res: any) {
  try {
    await prisma.$connect();
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database connection failed.',
      error: error instanceof Error ? error.message : error,
    });
  }
  return app(req as any, res as any);
}

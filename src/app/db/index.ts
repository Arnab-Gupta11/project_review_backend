import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { config } from '../config/env.js';

const pool = new pg.Pool({
  connectionString: config.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL Connected via Prisma 7 & PrismaPg');
  } catch (error) {
    console.error('❌ Failed to connect to PostgreSQL:', error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  await prisma.$disconnect();
  await pool.end();
  console.log('PostgreSQL Disconnected');
};

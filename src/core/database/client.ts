import { PrismaClient } from '@prisma/client';
import { logger } from '@core/utils/logger';
import { env } from '@core/config';

let prisma: PrismaClient | null = null;

export function getPrisma(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: env.isDev ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  return prisma;
}

export function hasDatabase(): boolean {
  return Boolean(env.databaseUrl);
}

export async function connectDatabase(): Promise<void> {
  if (!env.databaseUrl) {
    logger.warn('DATABASE_URL not set; auth and users will not persist');
    return;
  }
  try {
    const db = getPrisma();
    await db.$connect();
    logger.info('Database connected');
  } catch (err) {
    logger.error(err, 'Database connection failed');
    throw err;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
    logger.info('Database disconnected');
  }
}

export type DatabaseHealth = 'ok' | 'down' | 'unconfigured';

export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  if (!env.databaseUrl) return 'unconfigured';
  try {
    const db = getPrisma();
    await db.$queryRaw`SELECT 1`;
    return 'ok';
  } catch {
    return 'down';
  }
}

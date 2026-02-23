import { buildApp } from '@app/app';
import { env } from '@core/config';
import { logger } from '@core/utils/logger';
import { connectDatabase } from '@core/database/client';

export async function startServer() {
  await connectDatabase();
  const app = await buildApp();

  try {
    await app.listen({ port: env.port, host: env.host });
    logger.info(`Server listening on http://${env.host}:${env.port}`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
}

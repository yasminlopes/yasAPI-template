import type { FastifyInstance } from 'fastify';
import { checkDatabaseHealth } from '@core/database/client';

export async function registerHealthRoute(app: FastifyInstance) {
  app.get('/health', async (_, reply) => {
    const database = await checkDatabaseHealth();
    const status = database === 'down' ? 'degraded' : 'ok';
    return reply.status(status === 'ok' ? 200 : 503).send({
      status,
      timestamp: new Date().toISOString(),
      database,
      version: process.env.npm_package_version ?? '1.0.0',
    });
  });
}

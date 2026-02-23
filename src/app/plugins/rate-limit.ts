import fastifyRateLimit from '@fastify/rate-limit';
import fastifyPlugin from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';

async function rateLimitPlugin(app: FastifyInstance) {
  await app.register(fastifyRateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });
}

export default fastifyPlugin(rateLimitPlugin);

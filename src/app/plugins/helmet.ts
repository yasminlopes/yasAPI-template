import fastifyHelmet from '@fastify/helmet';
import fastifyPlugin from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';

async function helmetPlugin(app: FastifyInstance) {
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: false,
    global: true,
  });
}

export default fastifyPlugin(helmetPlugin);

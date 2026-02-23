import fastifyCors from '@fastify/cors';
import fastifyPlugin from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { env } from '@core/config';

async function corsPlugin(app: FastifyInstance) {
  await app.register(fastifyCors, {
    origin: env.isDev ? true : [], // em prod, liste origens permitidas
    credentials: true,
  });
}

export default fastifyPlugin(corsPlugin);

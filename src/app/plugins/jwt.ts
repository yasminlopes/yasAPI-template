import fastifyJwt from '@fastify/jwt';
import fastifyPlugin from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { env } from '@core/config';

export interface JwtPayload {
  sub: string;
  iat?: number;
  exp?: number;
}

async function jwtPlugin(app: FastifyInstance) {
  await app.register(fastifyJwt, {
    secret: env.jwtSecret,
    sign: { expiresIn: '7d' },
  });
}

export default fastifyPlugin(jwtPlugin);

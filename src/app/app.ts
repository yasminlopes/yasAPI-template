import Fastify from 'fastify';
import { env } from '@core/config';
import jwtPlugin from '@app/plugins/jwt';
import corsPlugin from '@app/plugins/cors';
import swaggerPlugin from '@app/plugins/swagger';
import rateLimitPlugin from '@app/plugins/rate-limit';
import { registerRoutes } from '@app/routes';
import { errorHandler } from '@app/error-handler';

export async function buildApp() {
  const app = Fastify({
    logger: env.isDev ? { transport: { target: 'pino-pretty', options: { colorize: true } } } : true,
  });

  await app.register(corsPlugin);
  await app.register(rateLimitPlugin);
  await app.register(jwtPlugin);
  if (env.isDev) {
    await app.register(swaggerPlugin);
  }

  app.setErrorHandler(errorHandler);
  await registerRoutes(app);

  return app;
}

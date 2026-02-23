import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastifyPlugin from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { env } from '@core/config';

async function swaggerPlugin(app: FastifyInstance) {
  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'yasAPI',
        description: 'API template Fastify + TypeScript',
        version: '1.0.0',
      },
      servers: [{ url: `http://localhost:${env.port}`, description: 'Local' }],
    },
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: { docExpansion: 'list', deepLinking: true },
  });
}

export default fastifyPlugin(swaggerPlugin);

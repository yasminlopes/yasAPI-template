import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';

const HEADER_NAME = 'x-request-id';

export async function requestIdPlugin(app: FastifyInstance) {
  app.addHook('onRequest', async (request, reply) => {
    const incoming = request.headers[HEADER_NAME];
    const id = typeof incoming === 'string' ? incoming : randomUUID();
    (request as { id: string }).id = id;
    reply.header(HEADER_NAME, id);
  });
}

import type { FastifyRequest, FastifyReply } from 'fastify';
import { env } from '@core/config';
import { sendError } from '@core/http/response';

const HEADER_NAME = 'x-api-key';

export async function apiKeyMiddleware(request: FastifyRequest, reply: FastifyReply) {
  if (!env.apiSecret) return;
  if (request.url === '/health') return;

  const key = request.headers[HEADER_NAME];
  if (typeof key !== 'string' || key !== env.apiSecret) {
    return sendError(reply, 401, 'Invalid or missing API key', 'Unauthorized');
  }
}

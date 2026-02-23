import type { FastifyRequest, FastifyReply } from 'fastify';
import { UnauthorizedError } from '@core/http/errors';
import { sendError } from '@core/http/response';

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    const payload = request.user as { sub: string };
    (request as { userId?: string }).userId = payload.sub;
  } catch {
    const err = new UnauthorizedError('Token inválido ou expirado', 'Unauthorized');
    return sendError(reply, err.statusCode, err.message, err.code);
  }
}

import type { FastifyInstance } from 'fastify';
import { authService } from '@modules/auth/auth.service';
import { loginBodySchema } from '@modules/auth/auth.schema';
import { sendOk } from '@core/http/response';
import { UnauthorizedError, NotFoundError } from '@core/http/errors';
import { authMiddleware } from '@shared/middlewares';

export async function authRoutes(app: FastifyInstance) {
  /** Público: login (rate limit 3 tentativas / 15 min aplicado no service) */
  app.post<{ Body: { email: string; password: string } }>(
    '/login',
    { schema: { body: loginBodySchema } },
    async (request, reply) => {
      const result = await authService.login(request.body.email, request.body.password);
      if (!result) throw new UnauthorizedError('Credenciais inválidas');
      const token = app.jwt.sign({ sub: result.user.id } as { sub: string });
      return sendOk(reply, { token, user: result.user });
    }
  );

  /** Autenticado (exemplo): perfil do usuário logado */
  app.get('/me', { onRequest: [authMiddleware] }, async (request, reply) => {
    const userId = (request as { userId?: string }).userId;
    const profile = await authService.getProfile(userId!);
    if (!profile) throw new NotFoundError('Usuário não encontrado');
    return sendOk(reply, profile);
  });
}

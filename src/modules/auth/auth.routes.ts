import type { FastifyInstance } from 'fastify';
import { authService } from '@modules/auth/auth.service';
import { loginBodySchema } from '@modules/auth/auth.schema';
import { sendOk } from '@core/http/response';
import { authMiddleware } from '@shared/middlewares';
import { validateOrThrow } from '@shared/helpers/validation';

export async function authRoutes(app: FastifyInstance) {
  /** Público: login (rate limit 3 tentativas / 15 min aplicado no service) */
  app.post('/login', async (request, reply) => {
    const parsed = loginBodySchema.safeParse(request.body);
    if (!parsed.success) validateOrThrow(parsed.error);
    const { email, password } = parsed.data;
    const result = await authService.login(email, password);
    const token = app.jwt.sign({ sub: result.user.id } as { sub: string });
    return sendOk(reply, { token, user: result.user });
  });

  /** Autenticado (exemplo): perfil do usuário logado */
  app.get('/me', { onRequest: [authMiddleware] }, async (request, reply) => {
    const userId = (request as { userId?: string }).userId;
    const profile = await authService.getProfile(userId!);
    return sendOk(reply, profile);
  });
}

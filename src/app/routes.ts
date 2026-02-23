import type { FastifyInstance } from 'fastify';
import { API_PREFIX } from '@shared/constants';
import { registerHealthRoute } from '@app/health';
import { authRoutes } from '@modules/auth/auth.routes';
import { usersRoutes } from '@modules/users/users.routes';

export async function registerRoutes(app: FastifyInstance) {
  await registerHealthRoute(app);

  await app.register(authRoutes, { prefix: `${API_PREFIX}/auth` });
  await app.register(usersRoutes, { prefix: `${API_PREFIX}/users` });
}

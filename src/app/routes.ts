import type { FastifyInstance } from 'fastify';
import { API_PREFIX } from '@shared/constants';
import { authRoutes } from '@modules/auth/auth.routes';
import { usersRoutes } from '@modules/users/users.routes';

export async function registerRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  await app.register(authRoutes, { prefix: `${API_PREFIX}/auth` });
  await app.register(usersRoutes, { prefix: `${API_PREFIX}/users` });
}

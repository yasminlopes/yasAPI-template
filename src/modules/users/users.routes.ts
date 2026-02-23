import type { FastifyInstance } from 'fastify';
import { usersService } from '@modules/users/users.service';
import { createUserBodySchema } from '@modules/users/users.schema';
import { sendCreated } from '@core/http/response';

/** Rotas públicas: apenas criar conta (registro) */
export async function usersRoutes(app: FastifyInstance) {
  app.post<{ Body: { email: string; password: string; name: string } }>(
    '/',
    { schema: { body: createUserBodySchema } },
    async (request, reply) => {
      const user = await usersService.create(request.body);
      return sendCreated(reply, { id: user.id, email: user.email, name: user.name });
    }
  );
}

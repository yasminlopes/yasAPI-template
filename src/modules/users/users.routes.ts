import type { FastifyInstance } from 'fastify';
import { usersService } from '@modules/users/users.service';
import { createUserBodySchema } from '@modules/users/users.schema';
import { sendCreated } from '@core/http/response';
import { validateOrThrow } from '@shared/helpers/validation';

/** Rotas públicas: apenas criar conta (registro) */
export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const parsed = createUserBodySchema.safeParse(request.body);
    if (!parsed.success) validateOrThrow(parsed.error);
    const user = await usersService.create(parsed.data);
    return sendCreated(reply, { id: user.id, email: user.email, name: user.name });
  });
}

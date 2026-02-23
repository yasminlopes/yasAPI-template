import { z } from 'zod';

export const createUserBodySchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  name: z.string().min(1, 'Nome obrigatório'),
});

export type CreateUserBody = z.infer<typeof createUserBodySchema>;

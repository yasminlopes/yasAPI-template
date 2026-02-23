import { z } from 'zod';

export const loginBodySchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

export type LoginBody = z.infer<typeof loginBodySchema>;

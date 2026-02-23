import type { ZodError } from 'zod';
import { BadRequestError } from '@core/http/errors';

/**
 * Formata o primeiro erro do Zod para mensagem legível.
 */
export function formatZodError(error: ZodError): string {
  const first = error.errors[0];
  if (!first) return 'Dados inválidos';
  const path = first.path.length > 0 ? `${first.path.join('.')}: ` : '';
  return `${path}${first.message}`;
}

/**
 * Valida o payload com o schema Zod. Em caso de erro, lança BadRequestError.
 */
export function validateOrThrow(error: ZodError): never {
  throw new BadRequestError(formatZodError(error), 'ValidationError');
}

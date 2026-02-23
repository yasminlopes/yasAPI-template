import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '@core/http/errors';
import { HttpStatus } from '@shared/enums';
import { sendError } from '@core/http/response';

export async function errorHandler(
  error: FastifyError | AppError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (error instanceof AppError) {
    return sendError(reply, error.statusCode, error.message, error.code);
  }

  if (error.validation) {
    return sendError(
      reply,
      HttpStatus.BadRequest,
      error.message || 'Validation failed',
      'VALIDATION_ERROR'
    );
  }

  request.log.error(error);
  return sendError(
    reply,
    (error as FastifyError).statusCode ?? HttpStatus.InternalServerError,
    'Internal server error'
  );
}

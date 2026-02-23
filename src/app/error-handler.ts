import type { FastifyReply, FastifyRequest } from 'fastify';
import { DomainError } from '@core/domain';
import { AppError } from '@core/http/errors';
import { HttpStatus } from '@shared/enums';
import { sendError } from '@core/http/response';

interface ValidationError extends Error {
  validation?: unknown[];
}

export async function errorHandler(
  error: Error | AppError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (error instanceof DomainError) {
    return sendError(reply, error.httpStatus, error.message, error.code);
  }
  if (error instanceof AppError) {
    return sendError(reply, error.statusCode, error.message, error.code);
  }

  const err = error as ValidationError;
  if (err.validation) {
    return sendError(
      reply,
      HttpStatus.BadRequest,
      error.message || 'Validation failed',
      'VALIDATION_ERROR'
    );
  }

  request.log.error(error);
  return sendError(reply, HttpStatus.InternalServerError, 'Internal server error');
}

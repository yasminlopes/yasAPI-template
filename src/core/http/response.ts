import type { FastifyReply } from 'fastify';
import { HttpStatus, HttpErrorCode } from '@shared/enums';
import type { PaginatedResult } from '@shared/helpers/pagination';

/** Resposta de erro estilo AWS: { error: { code, message, statusCode } } */
export function sendError(reply: FastifyReply, statusCode: number, message: string, code?: string) {
  const errorCode =
    code ?? HttpErrorCode[statusCode as keyof typeof HttpErrorCode] ?? 'InternalServerError';
  return reply.status(statusCode).send({
    error: {
      code: errorCode,
      message,
      statusCode,
    },
  });
}

export function sendOk<T>(reply: FastifyReply, data: T, status = HttpStatus.OK) {
  return reply.status(status).send({ success: true, data });
}

export function sendCreated<T>(reply: FastifyReply, data: T) {
  return sendOk(reply, data, HttpStatus.Created);
}

export function sendNoContent(reply: FastifyReply) {
  return reply.status(HttpStatus.NoContent).send();
}

export function sendPaginated<T>(reply: FastifyReply, result: PaginatedResult<T>) {
  return reply.status(HttpStatus.OK).send({
    success: true,
    data: result.data,
    meta: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    },
  });
}

import { HttpStatus, HttpErrorCode } from '@shared/enums';

/**
 * Erro HTTP estilo AWS: statusCode + code (ex.: NotFound, Forbidden) + message.
 * Uso: throw new HttpError(HttpStatus.NotFound, 'User not found');
 *      throw new ForbiddenError();
 */
export class AppError extends Error {
  public readonly code: string;

  constructor(
    public readonly statusCode: number,
    message: string,
    code?: string
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code ?? HttpErrorCode[statusCode as keyof typeof HttpErrorCode] ?? 'InternalServerError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/** Erro genérico por status: throw new HttpError(HttpStatus.NotFound, 'Recurso não encontrado') */
export function HttpError(statusCode: number, message: string, code?: string): AppError {
  return new AppError(statusCode, message, code);
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', code?: string) {
    super(HttpStatus.BadRequest, message, code ?? 'BadRequest');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', code?: string) {
    super(HttpStatus.Unauthorized, message, code ?? 'Unauthorized');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', code?: string) {
    super(HttpStatus.Forbidden, message, code ?? 'Forbidden');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found', code?: string) {
    super(HttpStatus.NotFound, message, code ?? 'NotFound');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', code?: string) {
    super(HttpStatus.Conflict, message, code ?? 'Conflict');
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests', code?: string) {
    super(HttpStatus.TooManyRequests, message, code ?? 'TooManyRequests');
  }
}

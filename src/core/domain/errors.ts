import { DomainError } from './domain-error';
import { HttpStatus } from '@shared/enums';

/**
 * Erros de domínio: um único lugar mapeado (estilo core/http/errors).
 * O domínio não conhece HTTP; code + httpStatus são usados pelo error-handler na borda.
 */

/** Auth */
export class InvalidCredentialsError extends DomainError {
  constructor(message = 'Credenciais inválidas') {
    super(message, 'INVALID_CREDENTIALS', HttpStatus.Unauthorized);
    this.name = 'InvalidCredentialsError';
  }
}

export class LoginBlockedError extends DomainError {
  constructor(message: string) {
    super(message, 'LOGIN_BLOCKED', HttpStatus.TooManyRequests);
    this.name = 'LoginBlockedError';
  }
}

export class UserNotFoundError extends DomainError {
  constructor(message = 'Usuário não encontrado') {
    super(message, 'USER_NOT_FOUND', HttpStatus.NotFound);
    this.name = 'UserNotFoundError';
  }
}

/** Users */
export class EmailAlreadyRegisteredError extends DomainError {
  constructor(message = 'Email já cadastrado') {
    super(message, 'EMAIL_ALREADY_REGISTERED', HttpStatus.Conflict);
    this.name = 'EmailAlreadyRegisteredError';
  }
}

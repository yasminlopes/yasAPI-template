/**
 * Erro de domínio: o domínio não conhece HTTP.
 * Cada subclasse define code e httpStatus; o error-handler mapeia para a resposta HTTP.
 */
export abstract class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly httpStatus: number
  ) {
    super(message);
    this.name = 'DomainError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

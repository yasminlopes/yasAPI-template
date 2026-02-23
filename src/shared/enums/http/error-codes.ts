import { HttpStatus } from './status';

export const HttpErrorCode: Record<number, string> = {
  [HttpStatus.BadRequest]: 'BadRequest',
  [HttpStatus.Unauthorized]: 'Unauthorized',
  [HttpStatus.Forbidden]: 'Forbidden',
  [HttpStatus.NotFound]: 'NotFound',
  [HttpStatus.Conflict]: 'Conflict',
  [HttpStatus.UnprocessableEntity]: 'UnprocessableEntity',
  [HttpStatus.TooManyRequests]: 'TooManyRequests',
  [HttpStatus.InternalServerError]: 'InternalServerError',
} as const;

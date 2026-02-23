const BEARER_PREFIX = 'Bearer ';

export function isBearerToken(authorization: string | undefined): boolean {
  if (!authorization || typeof authorization !== 'string') return false;
  return authorization.startsWith(BEARER_PREFIX) && authorization.length > BEARER_PREFIX.length;
}

export function extractBearerToken(authorization: string | undefined): string | null {
  if (!isBearerToken(authorization) || !authorization) return null;
  return authorization.slice(BEARER_PREFIX.length).trim() || null;
}

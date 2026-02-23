export const requiredEnv = (key: string): string => {
  const value = process.env[key];
  if (value === undefined || value === '') {
    throw new Error(`Missing required env: ${key}`);
  }
  return value;
};

const optional = (key: string, defaultValue: string): string => {
  return process.env[key] ?? defaultValue;
};

export const env = {
  nodeEnv: optional('NODE_ENV', 'development'),
  port: Number(optional('PORT', '8080')),
  host: optional('HOST', '0.0.0.0'),
  jwtSecret: optional('JWT_SECRET', 'dev-secret-change-in-production'),
  databaseUrl: optional('DATABASE_URL', ''),
  isDev: process.env.NODE_ENV !== 'production',
} as const;

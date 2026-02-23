import { env } from './env';

export const features = {
  swagger: env.isDev,
  seedAllowed: env.isDev,
} as const;

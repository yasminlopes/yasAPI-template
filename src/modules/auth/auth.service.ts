import { hash } from '@core/utils/crypto';
import { authRepository } from '@modules/auth/auth.repository';
import {
  isBlocked,
  recordFailedAttempt,
  clearAttempts,
  getRemainingBlockMs,
} from '@core/utils/login-rate-limit';
import { TooManyRequestsError } from '@core/http/errors';

export const authService = {
  async login(
    email: string,
    password: string
  ): Promise<{ user: { id: string; email: string; name: string } } | null> {
    const key = email.toLowerCase().trim();
    if (isBlocked(key)) {
      const remainingMs = getRemainingBlockMs(key);
      throw new TooManyRequestsError(
        `Muitas tentativas. Tente novamente em ${Math.ceil(remainingMs / 60000)} minuto(s).`,
        'TooManyRequests'
      );
    }
    const user = await authRepository.findByEmail(email);
    if (!user) {
      recordFailedAttempt(key);
      return null;
    }
    const passwordHash = hash(password);
    if (user.passwordHash !== passwordHash) {
      recordFailedAttempt(key);
      return null;
    }
    clearAttempts(key);
    return { user: { id: user.id, email: user.email, name: user.name } };
  },

  async getProfile(userId: string) {
    const user = await authRepository.findById(userId);
    if (!user) return null;
    return { id: user.id, email: user.email, name: user.name };
  },
};

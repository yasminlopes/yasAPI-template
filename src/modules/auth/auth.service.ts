import { hash } from '@core/utils/crypto';
import { authRepository } from '@modules/auth/auth.repository';
import {
  isBlocked,
  recordFailedAttempt,
  clearAttempts,
  getRemainingBlockMs,
} from '@core/utils/login-rate-limit';
import { InvalidCredentialsError, LoginBlockedError, UserNotFoundError } from '@core/domain';

export const authService = {
  async login(
    email: string,
    password: string
  ): Promise<{ user: { id: string; email: string; name: string } }> {
    const key = email.toLowerCase().trim();
    if (isBlocked(key)) {
      const remainingMs = getRemainingBlockMs(key);
      throw new LoginBlockedError(
        `Muitas tentativas. Tente novamente em ${Math.ceil(remainingMs / 60000)} minuto(s).`
      );
    }
    const user = await authRepository.findByEmail(email);
    if (!user) {
      recordFailedAttempt(key);
      throw new InvalidCredentialsError();
    }
    const passwordHash = hash(password);
    if (user.passwordHash !== passwordHash) {
      recordFailedAttempt(key);
      throw new InvalidCredentialsError();
    }
    clearAttempts(key);
    return { user: { id: user.id, email: user.email, name: user.name } };
  },

  async getProfile(userId: string) {
    const user = await authRepository.findById(userId);
    if (!user) throw new UserNotFoundError();
    return { id: user.id, email: user.email, name: user.name };
  },
};

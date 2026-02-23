import { usersRepository } from '@modules/users/users.repository';
import { hash } from '@core/utils/crypto';
import { EmailAlreadyRegisteredError } from '@core/domain';

export const usersService = {
  async create(data: { email: string; name: string; password: string }) {
    const existing = await usersRepository.findByEmail(data.email);
    if (existing) throw new EmailAlreadyRegisteredError();
    return usersRepository.create({
      email: data.email,
      name: data.name,
      passwordHash: hash(data.password),
    });
  },
};

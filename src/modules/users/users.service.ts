import { usersRepository } from '@modules/users/users.repository';
import { hash } from '@core/utils/crypto';
import { ConflictError } from '@core/http/errors';

export const usersService = {
  async create(data: { email: string; name: string; password: string }) {
    const existing = await usersRepository.findByEmail(data.email);
    if (existing) throw new ConflictError('Email já cadastrado');
    return usersRepository.create({
      email: data.email,
      name: data.name,
      passwordHash: hash(data.password),
    });
  },
};

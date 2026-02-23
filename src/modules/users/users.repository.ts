import { getPrisma, hasDatabase } from '@core/database/client';

export interface UserEntity {
  id: string;
  email: string;
  name: string;
  passwordHash?: string;
  createdAt: Date;
}

export const usersRepository = {
  async create(data: Omit<UserEntity, 'id' | 'createdAt'> & { passwordHash: string }): Promise<UserEntity> {
    if (!hasDatabase()) throw new Error('Database not configured');
    const prisma = getPrisma();
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash: data.passwordHash,
      },
    });
    return { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt };
  },

  async findByEmail(email: string): Promise<UserEntity | null> {
    if (!hasDatabase()) return null;
    const user = await getPrisma().user.findUnique({ where: { email } });
    if (!user) return null;
    return { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt };
  },
};

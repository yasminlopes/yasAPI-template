import { getPrisma, hasDatabase } from '@core/database/client';

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: Date;
}

export const authRepository = {
  async findByEmail(email: string): Promise<UserRecord | null> {
    if (!hasDatabase()) return null;
    const user = await getPrisma().user.findUnique({ where: { email } });
    if (!user) return null;
    return { ...user, createdAt: user.createdAt };
  },

  async findById(id: string): Promise<UserRecord | null> {
    if (!hasDatabase()) return null;
    const user = await getPrisma().user.findUnique({ where: { id } });
    if (!user) return null;
    return { ...user, createdAt: user.createdAt };
  },

  async create(data: Omit<UserRecord, 'id' | 'createdAt'>): Promise<UserRecord> {
    if (!hasDatabase()) throw new Error('Database not configured');
    const prisma = getPrisma();
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        name: data.name,
      },
    });
    return { ...user, createdAt: user.createdAt };
  },
};

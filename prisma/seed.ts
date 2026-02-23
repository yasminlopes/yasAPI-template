import { PrismaClient } from '@prisma/client';
import { createHash } from 'node:crypto';

const prisma = new PrismaClient();

function hash(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

async function main() {
  const email = 'dev@localhost';
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Usuário de desenvolvimento já existe:', email);
    return;
  }
  await prisma.user.create({
    data: {
      email,
      name: 'Dev User',
      passwordHash: hash('dev123'),
    },
  });
  console.log('Usuário de desenvolvimento criado:', email, '| senha: dev123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

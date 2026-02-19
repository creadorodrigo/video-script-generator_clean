import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_EMAIL || 'admin@example.com';
  const password = process.env.SEED_PASSWORD || 'senha123';
  const name = process.env.SEED_NAME || 'Admin';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Usuário ${email} já existe. Nenhuma ação necessária.`);
    return;
  }

  const hashed = await hash(password, 12);
  const user = await prisma.user.create({
    data: { email, name, password: hashed },
  });

  console.log(`✅ Usuário criado: ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@financepro.com';
  const password = 'admin'; 
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'ADMIN',
      plan: 'ELITE',
    },
    create: {
      email,
      nombre: 'Administrador',
      password: hashedPassword,
      role: 'ADMIN',
      plan: 'ELITE',
    },
  });

  console.log(`Usuario Admin creado/actualizado: ${admin.email}`);
  console.log(`Password: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

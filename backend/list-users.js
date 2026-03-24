const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.findMany({ select: { id: true, email: true, nombre: true, role: true, plan: true } })
  .then(u => console.table(u))
  .finally(() => p.$disconnect());

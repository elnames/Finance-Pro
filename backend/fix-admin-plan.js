/**
 * fix-admin-plan.js
 * Run inside the backend Docker container to promote all ADMIN-role users to plan=ADMIN.
 *
 * Usage (on the server):
 *   docker exec -it finance_backend node fix-admin-plan.js
 *
 * Or, if you know the admin email, pass it as an argument:
 *   docker exec -it finance_backend node fix-admin-plan.js admin@email.com
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const emailArg = process.argv[2];

  let result;
  if (emailArg) {
    result = await prisma.user.updateMany({
      where: { email: emailArg },
      data: { plan: 'ADMIN', role: 'ADMIN' },
    });
    console.log(`Updated user "${emailArg}":`, result);
  } else {
    // Update all users that have role=ADMIN but plan!=ADMIN
    result = await prisma.user.updateMany({
      where: { role: 'ADMIN' },
      data: { plan: 'ADMIN' },
    });
    console.log(`Updated ${result.count} user(s) with role=ADMIN to plan=ADMIN`);
  }

  const admins = await prisma.user.findMany({
    where: { plan: 'ADMIN' },
    select: { id: true, email: true, nombre: true, plan: true, role: true },
  });
  console.log('\nAdmin users after update:');
  console.table(admins);
}

main().catch(console.error).finally(() => prisma.$disconnect());

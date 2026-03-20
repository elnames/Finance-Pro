const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const tables = await prisma.$queryRaw`SELECT name FROM sys.tables WHERE name = 'Budget'`;
  console.log('Result:', JSON.stringify(tables, null, 2));
}
main()
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const quote = await prisma.quote.findUnique({ where: { id: 1 }, include: { items: { include: { product: true } } } });
  console.dir(quote, { depth: null });
}
main().catch(console.error).finally(() => prisma.$disconnect());

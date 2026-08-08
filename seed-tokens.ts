import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const quotes = await prisma.$queryRaw`SELECT id FROM "Quote" WHERE "token" IS NULL`;
  
  if (Array.isArray(quotes)) {
    for (const quote of quotes) {
      const id = quote.id;
      const uuid = crypto.randomUUID();
      await prisma.$executeRaw`UPDATE "Quote" SET "token" = ${uuid} WHERE id = ${id}`;
    }
  }
  console.log('Done updating tokens');
}

main().catch(console.error).finally(() => prisma.$disconnect());

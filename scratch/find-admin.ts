import { prisma } from '../lib/prisma';

async function main() {
  const user = await prisma.webUser.findUnique({ where: { email: 'rodrigo@zirian.com' }, include: { client: true } });
  console.log("WebUser:", user);
}

main().catch(console.error);

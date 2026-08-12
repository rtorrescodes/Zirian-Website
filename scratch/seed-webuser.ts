import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const crmUser = await prisma.user.findUnique({ where: { email: 'rodrigo@zirian.com' } });
  console.log("CRM User:", crmUser);

  if (crmUser) {
    const webUser = await prisma.webUser.upsert({
      where: { email: 'rodrigo@zirian.com' },
      update: { role: 'admin', password: crmUser.passwordHash },
      create: {
        email: 'rodrigo@zirian.com',
        name: crmUser.nombre,
        password: crmUser.passwordHash,
        role: 'admin'
      }
    });
    console.log("Seeded WebUser:", webUser);
  }
}

main().catch(console.error);

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
  const pass = await bcrypt.hash('Sistema10$', 10);
  await prisma.user.upsert({
    where: { email: 'rodrigo@zirian.com' },
    update: { passwordHash: pass },
    create: { email: 'rodrigo@zirian.com', nombre: 'Rodrigo', passwordHash: pass, role: 'ADMIN', activo: true }
  });
  console.log('User updated');
}
main().catch(console.error).finally(() => prisma.$disconnect());

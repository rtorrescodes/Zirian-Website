import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'rodrigo@zirian.com';
  const password = 'Sistema10$';
  const role = 'SuperAdmin';
  const name = 'Rodrigo';

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log(`User ${email} already exists. Updating password and role.`);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    await prisma.user.update({
      where: { email },
      data: {
        passwordHash,
        role,
        nombre: name,
      }
    });
    console.log('User updated successfully.');
  } else {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        nombre: name,
      },
    });
    console.log(`SuperAdmin user created: ${email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

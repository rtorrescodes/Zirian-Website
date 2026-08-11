'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function registerUser({ name, email, password }: any) {
  try {
    if (!email || !password || password.length < 6) {
      return { error: 'Invalid data provided' };
    }

    const existingUser = await prisma.webUser.findUnique({
      where: { email }
    });

    if (existingUser) {
      return { error: 'Email already exists. Try logging in.' };
    }

    // 1. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. CRM Link: Find existing Client by email, or create a Lead
    let crmClient = await prisma.client.findFirst({
      where: { email }
    });
    
    if (!crmClient) {
      crmClient = await prisma.client.create({
        data: {
          nombre: name || email.split('@')[0],
          email: email,
          telefono: "N/A", // Required by CRM schema
          ubicacion: "N/A", // Required by CRM schema
          origen: "Web Portal",
          status: "Lead"
        }
      });
    }

    // 3. Create WebUser
    await prisma.webUser.create({
      data: {
        name,
        email,
        password: hashedPassword,
        clientId: crmClient.id,
        role: "customer"
      }
    });

    return { success: true };
  } catch (err: any) {
    console.error('Registration error:', err);
    return { error: 'Failed to create account. Please try again.' };
  }
}

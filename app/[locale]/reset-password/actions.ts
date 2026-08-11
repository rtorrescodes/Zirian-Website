'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function executePasswordReset(token: string, password: string) {
  try {
    if (!token || !password || password.length < 6) {
      return { error: 'Invalid data provided.' };
    }

    const user = await prisma.webUser.findUnique({
      where: { resetToken: token }
    });
    
    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return { error: 'Invalid or expired reset token.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.webUser.update({
      where: { id: user.id },
      data: { 
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    return { success: true };
  } catch (err: any) {
    console.error('Execute reset error:', err);
    return { error: 'Failed to process request.' };
  }
}

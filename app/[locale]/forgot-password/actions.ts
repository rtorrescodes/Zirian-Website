'use server';

import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { enviarCorreo } from '@/lib/mail';

export async function requestPasswordReset(email: string) {
  try {
    const user = await prisma.webUser.findUnique({ where: { email } });
    
    if (!user) {
      // Return success even if user doesn't exist for security (avoid email enumeration)
      return { success: true };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.webUser.update({
      where: { email },
      data: { resetToken, resetTokenExpiry }
    });

    const resetUrl = `http://localhost:3000/es/reset-password?token=${resetToken}`;
    
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto;">
        <h2>Recuperación de Contraseña - Zirian</h2>
        <p>Hola ${user.name || 'Cliente'},</p>
        <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #00A3FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Restablecer mi Contraseña</a>
        </div>
        <p style="color: #666; font-size: 12px;">Si no solicitaste este cambio, puedes ignorar este correo de forma segura. El enlace expirará en 1 hora.</p>
      </div>
    `;

    await enviarCorreo("Recupera tu contraseña - Zirian", htmlBody, email);

    return { success: true };
  } catch (err: any) {
    console.error('Password reset error:', err);
    return { error: 'Failed to process request.' };
  }
}

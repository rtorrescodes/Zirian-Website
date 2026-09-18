import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic'; // Asegurar que no se guarde en caché

export async function GET() {
  try {
    // Consulta muy ligera solo para mantener la conexión activa (ping)
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ success: true, message: 'Database is awake' });
  } catch (error) {
    console.error('Keepalive error:', error);
    return NextResponse.json({ error: 'Failed to wake database' }, { status: 500 });
  }
}

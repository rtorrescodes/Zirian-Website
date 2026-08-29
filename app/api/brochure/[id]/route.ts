import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const brochure = await prisma.brochure.findUnique({
    where: { id: parseInt(params.id) },
    select: { file_base64: true, nombre: true }
  });

  if (!brochure || !brochure.file_base64) {
    return new NextResponse('Not found', { status: 404 });
  }

  const buffer = Buffer.from(brochure.file_base64, 'base64');
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline'
    }
  });
}


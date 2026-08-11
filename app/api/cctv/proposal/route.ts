import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { shareToken, proposedMapState } = body;

    if (!shareToken || !proposedMapState) {
      return new NextResponse('Faltan datos requeridos', { status: 400 });
    }

    const project = await prisma.cctvProject.update({
      where: { shareToken },
      data: {
        proposedMapState,
        hasClientChanges: true
      }
    });

    await prisma.clientActivity.create({
      data: {
        clientId: project.clientId,
        tipo: 'Propuesta CCTV',
        descripcion: `El cliente ha sugerido cambios en el diseño de CCTV: ${project.nombre}`,
        url: `/admin/design-cctv?cctvId=${project.id}`
      }
    });

    revalidatePath(`/admin/clientes/editor/${project.clientId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error guardando propuesta CCTV:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

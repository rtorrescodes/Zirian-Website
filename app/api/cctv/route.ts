import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientId, nombre, mapState, previewImage } = body;

    if (!clientId || !nombre || !mapState) {
      return new NextResponse('Faltan datos requeridos', { status: 400 });
    }

    const project = await prisma.cctvProject.create({
      data: {
        clientId: parseInt(clientId),
        nombre,
        mapState,
        previewImage
      }
    });

    await prisma.clientActivity.create({
      data: {
        clientId: parseInt(clientId),
        tipo: 'Diseño CCTV',
        descripcion: `Se guardó un nuevo diseño de CCTV: ${nombre}`,
        url: `/admin/design-cctv?cctvId=${project.id}`
      }
    });

    revalidatePath(`/admin/clientes/editor/${clientId}`);

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error guardando proyecto CCTV:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, nombre, mapState, previewImage, hasClientChanges, proposedMapState } = body;

    if (!id || !nombre || !mapState) {
      return new NextResponse('Faltan datos requeridos', { status: 400 });
    }

    const dataToUpdate: any = {
      nombre,
      mapState,
      previewImage: previewImage || undefined
    };

    if (hasClientChanges !== undefined) dataToUpdate.hasClientChanges = hasClientChanges;
    if (proposedMapState !== undefined) dataToUpdate.proposedMapState = proposedMapState;

    const project = await prisma.cctvProject.update({
      where: { id: parseInt(id) },
      data: dataToUpdate
    });

    await prisma.clientActivity.create({
      data: {
        clientId: project.clientId,
        tipo: 'Diseño CCTV',
        descripcion: `Se actualizó el diseño de CCTV: ${nombre}`,
        url: `/admin/design-cctv?cctvId=${project.id}`
      }
    });

    revalidatePath(`/admin/clientes/editor/${project.clientId}`);

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error actualizando proyecto CCTV:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    let projects;
    if (clientId) {
      projects = await prisma.cctvProject.findMany({
        where: { clientId: parseInt(clientId) },
        orderBy: { fecha_creacion: 'desc' }
      });
    } else {
      projects = await prisma.cctvProject.findMany({
        orderBy: { fecha_creacion: 'desc' },
        include: { client: true }
      });
    }

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error obteniendo proyectos CCTV:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

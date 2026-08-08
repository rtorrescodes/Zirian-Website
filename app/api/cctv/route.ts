import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error guardando proyecto CCTV:', error);
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

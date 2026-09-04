'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { cookies } from "next/headers"
import { verifyAuth } from "@/lib/auth"

export async function getScoutingReports(query = '', status = 'all') {
  const cookieStore = await cookies();
  const session = cookieStore.get("zirian_session");
  let userId = null;
  let isDistribuidor = false;
  
  if (session) {
    try {
      const payload = await verifyAuth(session.value);
      if (payload.role === 'Distribuidor') {
        isDistribuidor = true;
        userId = payload.userId || payload.id;
      }
    } catch (e) {}
  }

  const where: any = {}
  
  if (isDistribuidor) {
    where.client = { assignedUserId: userId };
  }
  
  if (query) {
    where.OR = [
      { client: { nombre: { contains: query, mode: 'insensitive' }, ...(isDistribuidor ? { assignedUserId: userId } : {}) } },
      { tecnico: { contains: query, mode: 'insensitive' } },
      { notas: { contains: query, mode: 'insensitive' } }
    ]
  }

  if (status !== 'all') {
    where.status = status
  }

  return await prisma.scoutingReport.findMany({
    where,
    include: {
      client: true,
      photos: true
    },
    orderBy: { fecha_visita: 'desc' }
  })
}

export async function getScoutingReportById(id: number) {
  const cookieStore = await cookies();
  const session = cookieStore.get("zirian_session");
  let userId = null;
  let isDistribuidor = false;
  
  if (session) {
    try {
      const payload = await verifyAuth(session.value);
      if (payload.role === 'Distribuidor') {
        isDistribuidor = true;
        userId = payload.userId || payload.id;
      }
    } catch (e) {}
  }

  const report = await prisma.scoutingReport.findUnique({
    where: { id },
    include: {
      client: true,
      photos: true
    }
  });

  if (isDistribuidor && report?.client?.assignedUserId !== userId) {
    return null; // No autorizado
  }

  return report;
}

export async function createScoutingReport(data: {
  clientId: number;
  tecnico?: string;
  fecha_visita?: Date;
  distancia_cable?: number;
  tipo_conexion?: string;
  notas?: string;
  status?: string;
}) {
  const report = await prisma.scoutingReport.create({
    data: {
      clientId: data.clientId,
      tecnico: data.tecnico,
      fecha_visita: data.fecha_visita || new Date(),
      distancia_cable: data.distancia_cable,
      tipo_conexion: data.tipo_conexion,
      notas: data.notas,
      status: data.status || 'Programado'
    }
  })
  
  revalidatePath('/admin/levantamientos')
  return report
}

export async function updateScoutingReport(id: number, data: {
  clientId?: number;
  tecnico?: string;
  fecha_visita?: Date;
  distancia_cable?: number;
  tipo_conexion?: string;
  notas?: string;
  status?: string;
}) {
  const report = await prisma.scoutingReport.update({
    where: { id },
    data
  })
  
  revalidatePath('/admin/levantamientos')
  return report
}

export async function deleteScoutingReport(id: number) {
  await prisma.scoutingReport.delete({
    where: { id }
  })
  revalidatePath('/admin/levantamientos')
}

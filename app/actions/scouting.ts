'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getScoutingReports(query = '', status = 'all') {
  const where: any = {}
  
  if (query) {
    where.OR = [
      { client: { nombre: { contains: query, mode: 'insensitive' } } },
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
  return await prisma.scoutingReport.findUnique({
    where: { id },
    include: {
      client: true,
      photos: true
    }
  })
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

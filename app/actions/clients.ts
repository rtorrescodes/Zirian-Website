"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getClients(query?: string, statusFilter?: string, origenFilter?: string, tipoFilter?: string) {
  const whereClause: any = {};
  
  if (query) {
    whereClause.OR = [
      { nombre: { contains: query, mode: 'insensitive' } },
      { empresa: { contains: query, mode: 'insensitive' } },
      { email: { contains: query, mode: 'insensitive' } },
      { telefono: { contains: query, mode: 'insensitive' } }
    ];
  }

  if (statusFilter && statusFilter !== 'all') {
    whereClause.status = statusFilter;
  }
  
  if (origenFilter && origenFilter !== 'all') {
    whereClause.origen = origenFilter;
  }
  
  if (tipoFilter && tipoFilter !== 'all') {
    whereClause.tipo_instalacion = tipoFilter;
  }

  const clients = await prisma.client.findMany({
    where: whereClause,
    orderBy: { fecha_creacion: 'desc' },
    include: {
      partner: true,
      quotes: {
        select: { id: true, status: true, total: true }
      }
    }
  });

  return clients.map(client => ({
    ...client,
    quotes: client.quotes.map(q => ({
      ...q,
      total: q.total ? Number(q.total) : 0
    }))
  }));
}

export async function getClientById(id: number) {
  return await prisma.client.findUnique({
    where: { id }
  });
}

export async function createClient(data: {
  nombre: string;
  empresa?: string;
  telefono: string;
  email?: string;
  marca_ev?: string;
  tipo_instalacion?: string;
  distancia_centro_carga?: string;
  ubicacion: string;
  status: string;
  origen: string;
  notas?: string;
  partnerId?: number;
  fecha_creacion?: Date;
}) {
  const client = await prisma.client.create({
    data: {
      ...data,
      partnerId: data.partnerId ? Number(data.partnerId) : null
    }
  });
  revalidatePath('/admin/clientes');
  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/cotizador');
  return client;
}

export async function updateClient(id: number, data: {
  nombre: string;
  empresa?: string;
  telefono: string;
  email?: string;
  marca_ev?: string;
  tipo_instalacion?: string;
  distancia_centro_carga?: string;
  ubicacion: string;
  status: string;
  origen: string;
  notas?: string;
  partnerId?: number;
  fecha_creacion?: Date;
}) {
  const client = await prisma.client.update({
    where: { id },
    data: {
      ...data,
      partnerId: data.partnerId ? Number(data.partnerId) : null
    }
  });
  revalidatePath('/admin/clientes');
  revalidatePath(`/admin/clientes/editor/${id}`);
  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/cotizador');
  return client;
}

export async function getClientActivities(clientId: number) {
  return await prisma.clientActivity.findMany({
    where: { clientId },
    orderBy: { fecha_actividad: 'desc' }
  });
}

export async function createClientActivity(data: {
  clientId: number;
  tipo: string;
  descripcion: string;
}) {
  const activity = await prisma.clientActivity.create({
    data
  });
  revalidatePath(`/admin/clientes/editor/${data.clientId}`);
  return activity;
}

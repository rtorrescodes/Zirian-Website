'use server'

import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { verifyAuth } from "@/lib/auth"

export interface CalendarEvent {
  id: string; // prefix with type e.g. "scouting-1"
  title: string;
  start: Date;
  end: Date;
  type: 'visita' | 'scouting' | 'instalacion';
  status: string;
  clientName: string;
  technician: string | null;
  originalId: number;
}

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const events: CalendarEvent[] = [];
  
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

  const baseWhere = isDistribuidor ? { client: { assignedUserId: userId } } : {};

  // 1. Initial Visits (Removed since fecha_visita is not on Client)

  // 2. Scouting Reports (fecha_visita is required, so we just fetch all or filter by status)
  const scoutings = await prisma.scoutingReport.findMany({
    where: baseWhere,
    include: { client: { select: { nombre: true } } }
  });

  scoutings.forEach(s => {
    events.push({
      id: `scouting-${s.id}`,
      title: `Levantamiento Técnico - ${s.client.nombre}`,
      start: s.fecha_visita,
      end: new Date(new Date(s.fecha_visita).getTime() + 2 * 60 * 60 * 1000), // 2 hours
      type: 'scouting',
      status: s.status,
      clientName: s.client.nombre,
      technician: s.tecnico,
      originalId: s.id
    });
  });

  // 3. Service Orders (Installations / Maintenance / Support)
  const orders = await prisma.serviceOrder.findMany({
    where: { fecha_programada: { not: null }, ...baseWhere },
    include: { 
      quote: { include: { client: { select: { nombre: true } } } },
      client: { select: { nombre: true } },
      tecnico: { select: { nombre: true } }
    }
  });

  orders.forEach(o => {
    if (o.fecha_programada) {
      const clientName = o.client?.nombre || o.quote?.client?.nombre || 'Cliente Desconocido';
      events.push({
        id: `order-${o.id}`,
        title: `${o.tipo} - ${clientName}`,
        start: o.fecha_programada,
        end: new Date(new Date(o.fecha_programada).getTime() + 4 * 60 * 60 * 1000), // 4 hours
        type: 'instalacion',
        status: o.status,
        clientName: clientName,
        technician: o.tecnico?.nombre || null,
        originalId: o.id
      });
    }
  });

  return events;
}

export async function getUnscheduledOrders() {
  const orders = await prisma.serviceOrder.findMany({
    where: { 
      fecha_programada: null,
      status: { not: 'Cancelada' }
    },
    include: { 
      quote: { include: { client: { select: { nombre: true } } } },
      client: { select: { nombre: true } }
    }
  });

  return orders.map(o => {
    const clientName = o.client?.nombre || o.quote?.client?.nombre || 'Cliente Desconocido';
    return {
      id: o.id,
      clientName: clientName,
      status: o.status,
      total: o.quote ? Number(o.quote.total) : 0,
      template: o.quote?.template || o.tipo
    };
  });
}

export async function scheduleServiceOrder(id: number, date: Date, tecnicoId?: number) {
  const data: any = { fecha_programada: date };
  if (tecnicoId) data.tecnicoId = tecnicoId;
  
  await prisma.serviceOrder.update({
    where: { id },
    data
  });
}

export async function createMaintenanceOrder(clientId: number, type: 'Mantenimiento' | 'Soporte', notes?: string) {
  const newOrder = await prisma.serviceOrder.create({
    data: {
      clientId,
      tipo: type,
      status: 'Pendiente',
      notas_internas: notes
    }
  });
  return newOrder;
}

export async function getMaintenanceCandidates() {
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

  const baseWhere = isDistribuidor ? { client: { assignedUserId: userId } } : {};

  const completedOrders = await prisma.serviceOrder.findMany({
    where: {
      tipo: 'Instalacion',
      status: 'Completada',
      ...baseWhere
    },
    include: {
      client: { select: { id: true, nombre: true } },
      quote: { include: { client: { select: { id: true, nombre: true } } } }
    },
    orderBy: {
      fecha_completada: 'desc'
    }
  });

  return completedOrders.map(o => {
    const client = o.client || o.quote?.client;
    
    // Determine status (e.g., if more than 6 months have passed)
    let maintenanceStatus = 'Activo';
    if (o.fecha_completada) {
      const monthsSince = (new Date().getTime() - o.fecha_completada.getTime()) / (1000 * 60 * 60 * 24 * 30);
      if (monthsSince >= 6) {
        maintenanceStatus = 'Requiere Revisión';
      }
    }

    return {
      id: o.id,
      clientId: client?.id || 0,
      clientName: client?.nombre || 'Cliente Desconocido',
      type: o.quote?.template || 'instalacion',
      lastService: o.fecha_completada ? o.fecha_completada.toISOString().split('T')[0] : 'N/A',
      status: maintenanceStatus
    };
  });
}

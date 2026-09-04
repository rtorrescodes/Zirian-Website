"use server";

import { prisma } from "@/lib/prisma";

import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/auth";

export async function getDashboardMetrics() {
  const cookieStore = await cookies();
  const session = cookieStore.get("zirian_session");
  let userId: number | null = null;
  let isDistribuidor = false;
  
  if (session) {
    try {
      const payload = await verifyAuth(session.value);
      const dbUser = await prisma.user.findUnique({ where: { id: payload.id || payload.userId } });
      const actualRole = dbUser?.role || payload.role;
      if (actualRole === 'Distribuidor') {
        isDistribuidor = true;
        userId = payload.userId || payload.id;
      }
    } catch (e) {}
  }

  const baseWhereClient = isDistribuidor ? { assignedUserId: userId } : {};
  const baseWhereQuote = isDistribuidor ? { client: { assignedUserId: userId } } : {};
  
  const totalLeadsCount = await prisma.client.count({
    where: { status: 'Lead', ...baseWhereClient }
  });

  const qualifiedQuotesCount = await prisma.quote.count({
    where: { status: { notIn: ['Borrador', 'Rechazada', 'Cancelada'] }, ...baseWhereQuote }
  });

  const openTicketsCount = isDistribuidor ? 0 : await prisma.supportTicket.count({
    where: { status: 'Abierto' }
  });

  // --- NUEVAS METRICAS FINANCIERAS Y GRAFICAS ---

  // 1. Ingreso Total (Ventas Aprobadas y Cerradas)
  const wonQuotes = await prisma.quote.findMany({
    where: { status: { in: ['Aprobada', 'Aprobado', 'Cerrado'] }, ...baseWhereQuote },
    select: {
      total: true,
      fecha_creacion: true
    }
  });

  let totalRevenue = 0;
  const monthlyRevenueData: Record<string, number> = {};

  wonQuotes.forEach(q => {
    const val = Number(q.total);
    totalRevenue += val;
    
    // Extraer Mes y Año
    const date = new Date(q.fecha_creacion);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyRevenueData[monthKey]) {
      monthlyRevenueData[monthKey] = 0;
    }
    monthlyRevenueData[monthKey] += val;
  });

  // Formatear para Recharts: [{ name: '2026-08', revenue: 15000 }, ...]
  const monthlyRevenue = Object.keys(monthlyRevenueData).sort().map(key => ({
    name: key,
    revenue: monthlyRevenueData[key]
  }));

  // 2. Distribución de Leads por Status
  const leadsDistribution = await prisma.client.groupBy({
    by: ['status'],
    where: { status: { in: ['Lead', 'Contactado', 'Visita Programada'] }, ...baseWhereClient },
    _count: { id: true }
  });

  const leadData = leadsDistribution.map(l => ({
    name: l.status,
    value: l._count.id
  }));

  // 3. Distribución de Tickets
  let ticketData: { name: string, value: number }[] = [];
  if (!isDistribuidor) {
    const ticketsDistribution = await prisma.supportTicket.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    ticketData = ticketsDistribution.map(t => ({
      name: t.status,
      value: t._count.id
    }));
  }

  return {
    totalLeadsCount,
    qualifiedQuotesCount,
    openTicketsCount,
    totalRevenue,
    monthlyRevenue,
    leadData,
    ticketData
  };
}



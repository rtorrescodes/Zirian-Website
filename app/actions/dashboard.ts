"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardMetrics() {
  const totalLeadsCount = await prisma.client.count({
    where: { status: 'Lead' }
  });

  const qualifiedQuotesCount = await prisma.quote.count({
    where: { status: { notIn: ['Borrador', 'Rechazada', 'Cancelada'] } }
  });

  const openTicketsCount = await prisma.supportTicket.count({
    where: { status: 'Abierto' }
  });

  // --- NUEVAS METRICAS FINANCIERAS Y GRAFICAS ---

  // 1. Ingreso Total (Ventas Aprobadas y Cerradas)
  const wonQuotes = await prisma.quote.findMany({
    where: { status: { in: ['Aprobado', 'Cerrado'] } },
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
    where: { tipo_lead: 'Cotización Cualificada' },
    _count: { id: true }
  });

  const leadData = leadsDistribution.map(l => ({
    name: l.status,
    value: l._count.id
  }));

  // 3. Distribución de Tickets
  const ticketsDistribution = await prisma.supportTicket.groupBy({
    by: ['status'],
    _count: { id: true }
  });

  const ticketData = ticketsDistribution.map(t => ({
    name: t.status,
    value: t._count.id
  }));

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

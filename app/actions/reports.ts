"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/auth";

export async function getReportsData() {
  const cookieStore = await cookies();
  const session = cookieStore.get("zirian_session");
  let isDistribuidor = false;
  let userId = null;
  if (session) {
    try {
      const payload = await verifyAuth(session.value);
      if (payload.role === 'Distribuidor') {
        isDistribuidor = true;
        userId = payload.id;
      }
    } catch(e){}
  }
  
  const baseWhereClient = isDistribuidor ? { assignedUserId: userId } : {};
  const baseWhereQuote = isDistribuidor ? { client: { assignedUserId: userId } } : {};
  const baseWhereOrder = isDistribuidor ? { client: { assignedUserId: userId } } : {};

  const totalQuotes = await prisma.quote.count({ where: baseWhereQuote });
  const approvedQuotes = await prisma.quote.count({ where: { status: 'Aprobado', ...baseWhereQuote } });
  const totalClients = await prisma.client.count({ where: baseWhereClient });
  const totalOrders = await prisma.serviceOrder.count({ where: baseWhereOrder });

  // Ingresos reales (Cotizaciones Aprobadas / Cerradas)
  const wonQuotes = await prisma.quote.findMany({
    where: { status: { in: ['Aprobado', 'Cerrado'] }, ...baseWhereQuote },
    select: {
      total: true,
      fecha_creacion: true
    }
  });

  let totalRevenue = 0;
  let currentMonthRevenue = 0;
  let previousMonthRevenue = 0;
  
  const monthlyRevenueData: Record<string, number> = {};
  
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  let prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
  let prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const prevMonthKey = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}`;

  wonQuotes.forEach(q => {
    const val = Number(q.total);
    totalRevenue += val;
    
    const date = new Date(q.fecha_creacion);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyRevenueData[monthKey]) {
      monthlyRevenueData[monthKey] = 0;
    }
    monthlyRevenueData[monthKey] += val;

    if (monthKey === currentMonthKey) currentMonthRevenue += val;
    if (monthKey === prevMonthKey) previousMonthRevenue += val;
  });

  const growth = previousMonthRevenue === 0 
    ? (currentMonthRevenue > 0 ? 100 : 0) 
    : ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;

  // Monthly Revenue Chart Data
  const monthlyRevenueChart = Object.keys(monthlyRevenueData).sort().map(key => ({
    name: key,
    revenue: monthlyRevenueData[key]
  }));

  // Distribución de Proyectos
  const sourceDistribution = await prisma.client.groupBy({
    by: ['origen'],
    where: baseWhereClient,
    _count: { id: true }
  });

  const projectDistributionChart = sourceDistribution.map(s => ({
    name: s.origen || 'Otro',
    value: s._count.id
  }));

  return {
    totalQuotes,
    approvedQuotes,
    totalClients,
    totalOrders,
    currentMonthRevenue,
    growth: growth.toFixed(1),
    monthlyRevenueChart,
    projectDistributionChart
  };
}

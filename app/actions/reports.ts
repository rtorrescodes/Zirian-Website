"use server";

import { prisma } from "@/lib/prisma";

export async function getReportsData() {
  const totalQuotes = await prisma.quote.count();
  const approvedQuotes = await prisma.quote.count({ where: { status: 'Aprobado' } });
  const totalClients = await prisma.client.count();
  const totalOrders = await prisma.serviceOrder.count();

  // Ingresos reales (Cotizaciones Aprobadas / Cerradas)
  const wonQuotes = await prisma.quote.findMany({
    where: { status: { in: ['Aprobado', 'Cerrado'] } },
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
  // Asumimos que los Leads tienen tipo_instalacion o algo similar, o contamos por origen.
  // Vamos a usar el origen de los clientes para la donación de proyectos
  const sourceDistribution = await prisma.client.groupBy({
    by: ['origen'],
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

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

  return {
    totalLeadsCount,
    qualifiedQuotesCount,
    openTicketsCount,
  };
}

"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPartnersWithMetrics() {
  const partners = await prisma.partner.findMany({
    include: {
      referrals: {
        include: {
          quotes: {
            where: {
              status: "Aprobada"
            }
          }
        }
      }
    },
    orderBy: { nombre: 'asc' }
  });

  return partners.map(partner => {
    let totalVendido = 0;
    
    partner.referrals.forEach(client => {
      client.quotes.forEach(quote => {
        totalVendido += Number(quote.total);
      });
    });

    const comisionPorcentaje = partner.comision_base ? Number(partner.comision_base) : 0;
    const comisionEstimada = (totalVendido * comisionPorcentaje) / 100;

    return {
      ...partner,
      totalReferidos: partner.referrals.length,
      totalVendido,
      comisionEstimada
    };
  });
}

export async function getPartnerDetails(id: number) {
  const partner = await prisma.partner.findUnique({
    where: { id },
    include: {
      referrals: {
        include: {
          quotes: {
            orderBy: { fecha_creacion: 'desc' }
          }
        }
      }
    }
  });

  if (!partner) return null;

  let totalVendidoAprobado = 0;
  
  const clientesConVentas = partner.referrals.map(client => {
    let totalVendidoPorCliente = 0;
    client.quotes.forEach(quote => {
      if (quote.status === 'Aprobada') {
        totalVendidoPorCliente += Number(quote.total);
        totalVendidoAprobado += Number(quote.total);
      }
    });

    return {
      ...client,
      totalVendidoPorCliente
    };
  });

  const comisionPorcentaje = partner.comision_base ? Number(partner.comision_base) : 0;
  const comisionEstimadaTotal = (totalVendidoAprobado * comisionPorcentaje) / 100;

  return {
    ...partner,
    clientes: clientesConVentas,
    totalVendidoAprobado,
    comisionEstimadaTotal
  };
}

export async function createPartner(data: { nombre: string; marca?: string; comision_base?: number; telefono?: string; email?: string }) {
  const partner = await prisma.partner.create({
    data: {
      ...data,
      activo: true
    }
  });
  revalidatePath('/admin/partners');
  return partner;
}

export async function updatePartner(id: number, data: { nombre?: string; marca?: string; comision_base?: number; telefono?: string; email?: string; activo?: boolean }) {
  const partner = await prisma.partner.update({
    where: { id },
    data
  });
  revalidatePath('/admin/partners');
  revalidatePath(`/admin/partners/${id}`);
  return partner;
}

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
    let comisionEstimada = 0;
    const comisionPorcentaje = partner.comision_base ? Number(partner.comision_base) : 0;
    
    partner.referrals.forEach(client => {
      client.quotes.forEach(quote => {
        const quoteTotal = Number(quote.total);
        totalVendido += quoteTotal;
        
        const hasCustomCommission = quote.comision_partner !== null;
        const baseCommission = (quoteTotal * comisionPorcentaje) / 100;
        const finalCommission = hasCustomCommission ? Number(quote.comision_partner) : baseCommission;
        comisionEstimada += finalCommission;
      });
    });

    return {
      id: partner.id,
      nombre: partner.nombre,
      marca: partner.marca,
      telefono: partner.telefono,
      email: partner.email,
      activo: partner.activo,
      comision_base: partner.comision_base ? Number(partner.comision_base) : null,
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
  const comisionPorcentaje = partner.comision_base ? Number(partner.comision_base) : 0;
  let comisionEstimadaTotal = 0;
  
  const clientesConVentas = partner.referrals.map(client => {
    let totalVendidoPorCliente = 0;
    
    // Convert decimals to numbers for the frontend
    const serializedQuotes = client.quotes.map(quote => {
      const quoteTotal = Number(quote.total);
      const hasCustomCommission = quote.comision_partner !== null;
      const baseCommission = (quoteTotal * comisionPorcentaje) / 100;
      const finalCommission = hasCustomCommission ? Number(quote.comision_partner) : baseCommission;
      
      if (quote.status === 'Aprobada') {
        totalVendidoPorCliente += quoteTotal;
        totalVendidoAprobado += quoteTotal;
        comisionEstimadaTotal += finalCommission;
      }
      
      return {
        ...quote,
        total: quoteTotal,
        subtotal: Number(quote.subtotal),
        impuestos: Number(quote.impuestos),
        comision_partner: quote.comision_partner ? Number(quote.comision_partner) : null,
        costo_real: quote.costo_real ? Number(quote.costo_real) : null,
        utilidad_real: quote.utilidad_real ? Number(quote.utilidad_real) : null,
        comision_fija: quote.comision_fija ? Number(quote.comision_fija) : null,
        monto_pagado: quote.monto_pagado ? Number(quote.monto_pagado) : 0,
        calculatedCommission: finalCommission
      };
    });

    return {
      ...client,
      totalVendidoPorCliente,
      quotes: serializedQuotes
    };
  });

  return {
    id: partner.id,
    nombre: partner.nombre,
    marca: partner.marca,
    telefono: partner.telefono,
    email: partner.email,
    activo: partner.activo,
    comision_base: partner.comision_base ? Number(partner.comision_base) : null,
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

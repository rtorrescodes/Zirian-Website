"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function serializeQuote(quote: any) {
  if (!quote) return quote;
  return {
    ...quote,
    total: quote.total ? Number(quote.total) : 0,
    subtotal: quote.subtotal ? Number(quote.subtotal) : 0,
    impuestos: quote.impuestos ? Number(quote.impuestos) : 0,
    comision_fija: quote.comision_fija ? Number(quote.comision_fija) : 0,
    costo_real: quote.costo_real ? Number(quote.costo_real) : 0,
    utilidad_real: quote.utilidad_real ? Number(quote.utilidad_real) : 0,
    monto_pagado: quote.monto_pagado ? Number(quote.monto_pagado) : 0,
    items: quote.items ? quote.items.map((item: any) => ({
      ...item,
      cantidad: item.cantidad ? Number(item.cantidad) : 0,
      precio_unitario: item.precio_unitario ? Number(item.precio_unitario) : 0,
      total: item.total ? Number(item.total) : 0,
      costo_unitario: item.costo_unitario ? Number(item.costo_unitario) : 0,
      cantidad_planeada: item.cantidad_planeada ? Number(item.cantidad_planeada) : 0,
      cantidad_usada: item.cantidad_usada ? Number(item.cantidad_usada) : 0,
      product: item.product ? {
        ...item.product,
        precio_base: item.product.precio_base ? Number(item.product.precio_base) : 0,
        costo_estimado: item.product.costo_estimado ? Number(item.product.costo_estimado) : null,
        stock_general: item.product.stock_general ? Number(item.product.stock_general) : 0,
      } : undefined
    })) : undefined
  };
}

export async function createQuote(data: {
  clientId: number;
  subtotal: number;
  impuestos: number;
  total: number;
  mostrar_desglose: boolean;
  notas_internas?: string;
  condiciones?: string;
  validez_dias?: number;
  template?: string;
  requiere_factura?: boolean;
  items: {
    productId: number | null;
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    total: number;
  }[];
  brochures?: number[];
}) {
  const { items, brochures, ...quoteData } = data;

  const latestCctv = await prisma.cctvProject.findFirst({
    where: { clientId: quoteData.clientId },
    orderBy: { fecha_creacion: 'desc' }
  });

  const quote = await prisma.quote.create({
    data: {
      ...quoteData,
      status: "Borrador",
      cctvProjectId: latestCctv ? latestCctv.id : undefined,
      items: {
        create: items,
      },
      brochures: brochures ? {
        create: brochures.map(id => ({ brochureId: id }))
      } : undefined
    }
  });

  revalidatePath("/admin/cotizador");
  return serializeQuote(quote);
}

export async function updateQuotePartnerCommission(id: number, comision_partner: number | null) {
  const quote = await prisma.quote.update({
    where: { id },
    data: { comision_partner }
  });
  revalidatePath("/admin/partners");
  return serializeQuote(quote);
}

import { createNotification } from "./notifications";

export async function getQuotes() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const fifteenDaysAgo = new Date();
  fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

  try {
    // 1. Find quotes to auto-reject
    const toReject = await prisma.quote.findMany({
      where: {
        status: { in: ['Enviada', 'Borrador', 'Requiere Atención'] },
        fecha_creacion: { lt: thirtyDaysAgo }
      }
    });

    if (toReject.length > 0) {
      await prisma.quote.updateMany({
        where: { id: { in: toReject.map(q => q.id) } },
        data: { status: 'Rechazada', motivo_rechazo: 'No contestó de vuelta' }
      });
      for (const q of toReject) {
        await createNotification({
          title: "Cotización Expirada",
          message: `La cotización #${q.id} fue rechazada automáticamente tras 30 días sin respuesta.`,
          categoria: "CRM",
          url: `/admin/cotizaciones/${q.id}`
        });
      }
    }

    // 2. Find quotes requiring attention
    const toFlag = await prisma.quote.findMany({
      where: {
        status: { in: ['Enviada', 'Borrador'] },
        fecha_creacion: { lt: fifteenDaysAgo, gte: thirtyDaysAgo }
      }
    });

    if (toFlag.length > 0) {
      await prisma.quote.updateMany({
        where: { id: { in: toFlag.map(q => q.id) } },
        data: { status: 'Requiere Atención' }
      });
      for (const q of toFlag) {
        await createNotification({
          title: "Cotización en Riesgo",
          message: `La cotización #${q.id} lleva 15 días sin avanzar. ¡Contáctalos!`,
          categoria: "CRM",
          url: `/admin/cotizaciones/${q.id}`
        });
      }
    }
  } catch (e) {
    console.error("Error auto-expiring quotes", e);
  }

  const quotes = await prisma.quote.findMany({
    include: {
      client: true,
      items: {
        include: {
          product: true
        }
      }
    },
    orderBy: { fecha_creacion: 'desc' }
  });
  return quotes.map(serializeQuote);
}

export async function deleteQuote(id: number) {
  // Prisma will cascade delete items if configured, but let's delete items first to be safe
  await prisma.quoteItem.deleteMany({
    where: { quoteId: id }
  });
  
  await prisma.quoteBrochure.deleteMany({
    where: { quoteId: id }
  });

  await prisma.quote.delete({
    where: { id }
  });

  revalidatePath("/admin/cotizaciones");
}

export async function updateQuote(id: number, data: any) {
  const { items, brochures, requiere_factura, ...quoteData } = data;

  // Delete existing items
  await prisma.quoteItem.deleteMany({
    where: { quoteId: id }
  });

  await prisma.quoteBrochure.deleteMany({
    where: { quoteId: id }
  });

  const quote = await prisma.quote.update({
    where: { id },
    data: {
      ...quoteData,
      requiere_factura: requiere_factura,
      items: {
        create: items,
      },
      brochures: brochures ? {
        create: brochures.map((bId: number) => ({ brochureId: bId }))
      } : undefined
    }
  });

  if (quote.status === 'Rechazada' || quote.status === 'Cancelada') {
    await prisma.client.update({
      where: { id: quote.clientId },
      data: { status: 'Prospecto (perdido)' }
    });

    await prisma.clientActivity.create({
      data: {
        clientId: quote.clientId,
        tipo: 'Nota General', // Using Nota General as it exists, or could be 'Cotización Perdida' if any string is allowed
        descripcion: `La cotización COT-${new Date(quote.fecha_creacion).getFullYear()}-${String(quote.id).padStart(4, '0')} ha sido marcada como perdida.\nMotivo: ${quote.motivo_rechazo || 'No especificado'}`,
        url: `/admin/cotizaciones/${quote.id}`
      }
    });
  }

  revalidatePath("/admin/cotizaciones");
  revalidatePath(`/admin/cotizaciones/${id}`);
  revalidatePath("/admin/clientes");
  revalidatePath(`/admin/clientes/${quote.clientId}`);
  return serializeQuote(quote);
}

export async function getQuoteByToken(token: string) {
  const quote = await prisma.quote.findUnique({
    where: { token },
    include: {
      client: true,
      items: {
        include: { product: true }
      },
      cctvProject: true
    }
  });
  return serializeQuote(quote);
}

export async function acceptQuote(token: string) {
  const quote = await prisma.quote.update({
    where: { token },
    data: { status: 'Aprobado' },
    include: { items: { include: { product: true } } }
  });
  
  // Create blank ServiceOrder
  await prisma.serviceOrder.upsert({
    where: { quoteId: quote.id },
    create: { quoteId: quote.id, status: 'Pendiente' },
    update: {}
  });

  // Notifications
  await createNotification({
    title: "¡Cotización Aprobada!",
    message: `El cliente ha aprobado la cotización #${quote.id} por $${quote.total}.`,
    categoria: "CRM",
    url: `/admin/cotizaciones/${quote.id}`
  });

  // Check Inventory
  for (const item of quote.items) {
    if (item.product && Number(item.cantidad) > Number(item.product.stock_general)) {
      await createNotification({
        title: "Alerta de Inventario",
        message: `La cotización #${quote.id} recién aprobada requiere ${item.cantidad}x ${item.product.nombre}, pero solo hay ${item.product.stock_general} en stock.`,
        categoria: "Inventario",
        url: `/admin/cotizaciones/${quote.id}`
      });
    }
  }

  revalidatePath("/admin/cotizaciones");
  revalidatePath(`/presupuesto/${token}`);
  return serializeQuote(quote);
}

export async function adminAcceptQuote(id: number) {
  const quote = await prisma.quote.update({
    where: { id },
    data: { status: 'Aprobado' },
    include: { items: { include: { product: true } } }
  });
  
  // Create blank ServiceOrder
  await prisma.serviceOrder.upsert({
    where: { quoteId: quote.id },
    create: { quoteId: quote.id, status: 'Pendiente' },
    update: {}
  });

  // Notifications
  await createNotification({
    title: "¡Venta Cerrada Manualmente!",
    message: `Has marcado la cotización #${quote.id} como Aprobada.`,
    categoria: "CRM",
    url: `/admin/cotizaciones/${quote.id}`
  });

  // Check Inventory
  for (const item of quote.items) {
    if (item.product && Number(item.cantidad) > Number(item.product.stock_general)) {
      await createNotification({
        title: "Alerta de Inventario",
        message: `La cotización #${quote.id} recién aprobada requiere ${item.cantidad}x ${item.product.nombre}, pero solo hay ${item.product.stock_general} en stock.`,
        categoria: "Inventario",
        url: `/admin/cotizaciones/${quote.id}`
      });
    }
  }

  revalidatePath("/admin/cotizaciones");
  if (quote.token) revalidatePath(`/presupuesto/${quote.token}`);
  return serializeQuote(quote);
}


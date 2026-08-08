"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createQuote(data: {
  clientId: number;
  subtotal: number;
  impuestos: number;
  total: number;
  mostrar_desglose: boolean;
  notas_internas?: string;
  condiciones?: string;
  validez_dias?: number;
  items: {
    productId: number;
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
  return quote;
}

export async function getQuotes() {
  return await prisma.quote.findMany({
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
  const { items, brochures, ...quoteData } = data;

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
      items: {
        create: items,
      },
      brochures: brochures ? {
        create: brochures.map((bId: number) => ({ brochureId: bId }))
      } : undefined
    }
  });

  revalidatePath("/admin/cotizaciones");
  revalidatePath(`/admin/cotizaciones/${id}`);
  return quote;
}

export async function getQuoteByToken(token: string) {
  return await prisma.quote.findUnique({
    where: { token },
    include: {
      client: true,
      items: {
        include: { product: true }
      },
      cctvProject: true
    }
  });
}

export async function acceptQuote(token: string) {
  const quote = await prisma.quote.update({
    where: { token },
    data: { status: 'Aprobado' }
  });
  revalidatePath("/admin/cotizaciones");
  revalidatePath(`/presupuesto/${token}`);
  return quote;
}


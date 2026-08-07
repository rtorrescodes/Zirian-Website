"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createQuote(data: {
  clientId: number;
  subtotal: number;
  impuestos: number;
  total: number;
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

  const quote = await prisma.quote.create({
    data: {
      ...quoteData,
      status: "Borrador",
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

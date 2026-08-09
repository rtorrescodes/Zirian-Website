"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createQuoteFromCctv(clientId: number, cameras: { modelId: string; name?: string; section?: string }[]) {
  if (!clientId || cameras.length === 0) {
    throw new Error("Cliente inválido o no hay cámaras para presupuestar.");
  }

  // Agrupar cámaras por modelo Y sección
  const cameraCounts: Record<string, number> = {};
  cameras.forEach(cam => {
    const sec = cam.section && cam.section !== 'General' ? cam.section : '';
    const key = `${cam.modelId}|${sec}`;
    cameraCounts[key] = (cameraCounts[key] || 0) + 1;
  });

  // Mapear modelId a nombres descriptivos (basado en GENERIC_CAMERAS)
  const modelNames: Record<string, string> = {
    'cam-2.8mm': 'Domo 2MP Lente 2.8mm',
    'cam-4mm': 'Bala 4MP Lente 4mm',
    'cam-ptz': 'PTZ 25x (Zoom Máximo)',
    'cam-ezviz-cscb54k': 'EZVIZ Solar 4K Wi-Fi 6'
  };

  // Buscar productos reales en la BD para asignar precios correctos
  const allProducts = await prisma.product.findMany();
  
  const searchKeywords: Record<string, string> = {
    'cam-2.8mm': '2.8mm',
    'cam-4mm': '4mm',
    'cam-ptz': 'PTZ',
    'cam-ezviz-cscb54k': '4K Wi-Fi' // Hace match con la cámara EZVIZ 4K
  };

  let subtotal = 0;

  const itemsData = Object.entries(cameraCounts).map(([key, count]) => {
    const [modelId, section] = key.split('|');
    const keyword = searchKeywords[modelId] || '';
    const realProduct = keyword ? allProducts.find(p => p.nombre.toLowerCase().includes(keyword.toLowerCase())) : null;
    const sectionPrefix = section ? `[${section}] ` : '';

    if (realProduct) {
      const lineTotal = Number(realProduct.precio_base) * count;
      subtotal += lineTotal;
      return {
        productId: realProduct.id,
        descripcion: `${sectionPrefix}${realProduct.nombre}`,
        cantidad: count,
        precio_unitario: realProduct.precio_base,
        total: lineTotal,
        costo_unitario: realProduct.costo_estimado || 0,
        cantidad_planeada: count
      };
    } else {
      return {
        descripcion: `${sectionPrefix}Cámara CCTV: ${modelNames[modelId] || modelId}`,
        cantidad: count,
        precio_unitario: 0,
        total: 0,
        costo_unitario: 0,
        cantidad_planeada: count
      };
    }
  });

  const impuestos = subtotal * 0.16;
  const totalQuote = subtotal + impuestos;

  const quote = await prisma.quote.create({
    data: {
      clientId,
      status: "Borrador",
      subtotal: subtotal,
      impuestos: impuestos,
      total: totalQuote,
      items: {
        create: itemsData
      }
    }
  });

  await prisma.clientActivity.create({
    data: {
      clientId,
      tipo: 'Presupuesto Creado',
      descripcion: `Se creó un borrador de presupuesto a partir de un diseño CCTV.`,
      url: `/admin/cotizador?editId=${quote.id}`
    }
  });

  revalidatePath("/admin/cotizador");
  return quote.id;
}

"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createQuoteFromCctv(clientId: number, cameras: { modelId: string; name?: string }[]) {
  if (!clientId || cameras.length === 0) {
    throw new Error("Cliente inválido o no hay cámaras para presupuestar.");
  }

  // Agrupar cámaras por modelo
  const cameraCounts: Record<string, number> = {};
  cameras.forEach(cam => {
    cameraCounts[cam.modelId] = (cameraCounts[cam.modelId] || 0) + 1;
  });

  // Mapear modelId a nombres descriptivos (basado en GENERIC_CAMERAS)
  const modelNames: Record<string, string> = {
    'cam-2.8mm': 'Domo 2MP Lente 2.8mm',
    'cam-4mm': 'Bala 4MP Lente 4mm',
    'cam-ptz': 'PTZ 25x (Zoom Máximo)',
    'cam-ezviz-cscb54k': 'EZVIZ Solar 4K Wi-Fi 6'
  };

  const itemsData = Object.entries(cameraCounts).map(([modelId, count]) => {
    return {
      descripcion: `Cámara CCTV: ${modelNames[modelId] || modelId}`,
      cantidad: count,
      precio_unitario: 0, // Placeholder
      total: 0, // Placeholder
      costo_unitario: 0,
      cantidad_planeada: count
    };
  });

  const quote = await prisma.quote.create({
    data: {
      clientId,
      status: "Borrador",
      subtotal: 0,
      impuestos: 0,
      total: 0,
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

"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPendingQuotesForClient(clientId: number) {
  return await prisma.quote.findMany({
    where: { clientId, status: "Borrador" },
    orderBy: { fecha_creacion: 'desc' },
    select: { id: true, total: true, fecha_creacion: true, template: true, client: { select: { nombre: true } } }
  });
}

export async function getQuotesLinkedToCctv(cctvProjectId: number) {
  return await prisma.quote.findMany({
    where: { cctvProjectId, status: "Borrador" },
    select: { id: true, total: true, fecha_creacion: true, template: true }
  });
}

export async function createQuoteFromCctv(
  clientId: number, 
  cameras: { modelId: string; name?: string; section?: string }[], 
  existingQuoteId?: number,
  cctvProjectId?: number
) {
  if (!clientId || cameras.length === 0) {
    throw new Error("Cliente inválido o no hay cámaras para presupuestar.");
  }

  const cameraCounts: Record<string, number> = {};
  cameras.forEach(cam => {
    const sec = cam.section && cam.section !== 'General' ? cam.section : '';
    const key = `${cam.modelId}|${sec}`;
    cameraCounts[key] = (cameraCounts[key] || 0) + 1;
  });

  const modelNames: Record<string, string> = {
    'cam-2.8mm': 'Domo 2MP Lente 2.8mm',
    'cam-4mm': 'Bala 4MP Lente 4mm',
    'cam-ptz': 'PTZ 25x (Zoom Máximo)',
    'cam-ezviz-cscb54k': 'EZVIZ Solar 4K Wi-Fi 6',
    'wifi-ubiquiti-u6': 'Ubiquiti U6-Mesh (360°)',
    'wifi-ruijie-rgrap': 'Ruijie RGRAP52ODSEC (90°)',
    'wifi-ruijie-rgrap6260g': 'Ruijie RGRAP6260(G) (360°)',
    'wifi-tplink-bridge': 'TP-Link Bridge 5km'
  };

  const allProducts = await prisma.product.findMany();
  
  const searchKeywords: Record<string, string> = {
    'cam-2.8mm': '2.8mm',
    'cam-4mm': '4mm',
    'cam-ptz': 'PTZ',
    'cam-ezviz-cscb54k': '4K Wi-Fi',
    'wifi-ubiquiti-u6': 'U6-Mesh',
    'wifi-ruijie-rgrap': 'RGRAP52ODSEC',
    'wifi-ruijie-rgrap6260g': 'RGRAP6260',
    'wifi-tplink-bridge': 'EAP215'
  };

  let newSubtotal = 0;

  const itemsData = Object.entries(cameraCounts).map(([key, count]) => {
    const [modelId, section] = key.split('|');
    const keyword = searchKeywords[modelId] || '';
    const realProduct = keyword ? allProducts.find(p => p.nombre.toLowerCase().includes(keyword.toLowerCase())) : null;
    const sectionPrefix = section ? `[${section}] ` : '';

    if (realProduct) {
      const lineTotal = Number(realProduct.precio_base) * count;
      newSubtotal += lineTotal;
      return {
        productId: realProduct.id,
        descripcion: `${sectionPrefix}Cámara CCTV: ${modelNames[modelId] || modelId}`,
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

  if (existingQuoteId) {
    const existingQuote = await prisma.quote.findUnique({ where: { id: existingQuoteId } });
    if (!existingQuote) throw new Error("La cotización no existe.");

    const finalSubtotal = Number(existingQuote.subtotal) + newSubtotal;
    const finalImpuestos = existingQuote.requiere_factura ? (finalSubtotal * 0.16) : 0;
    const finalTotal = finalSubtotal + finalImpuestos;

    await prisma.quote.update({
      where: { id: existingQuoteId },
      data: {
        subtotal: finalSubtotal,
        impuestos: finalImpuestos,
        total: finalTotal,
        cctvProjectId: cctvProjectId || existingQuote.cctvProjectId,
        items: {
          create: itemsData
        }
      }
    });

    await prisma.clientActivity.create({
      data: {
        clientId,
        tipo: 'Presupuesto Actualizado',
        descripcion: `Se agregaron equipos desde un diseño de CCTV a la cotización #${existingQuoteId}.`,
        url: `/admin/cotizador?editId=${existingQuoteId}`
      }
    });

    revalidatePath("/admin/cotizador");
    return existingQuoteId;
  } else {
    const impuestos = newSubtotal * 0.16;
    const totalQuote = newSubtotal + impuestos;

    const quote = await prisma.quote.create({
      data: {
        clientId,
        status: "Borrador",
        subtotal: newSubtotal,
        impuestos: impuestos,
        total: totalQuote,
        cctvProjectId: cctvProjectId || null,
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
}

export async function syncCctvToQuote(quoteId: number, clientId: number, cameras: { modelId: string; name?: string; section?: string }[]) {
  const quote = await prisma.quote.findUnique({ 
    where: { id: quoteId },
    include: { items: true }
  });
  
  if (!quote) throw new Error("Quote not found");

  const allProducts = await prisma.product.findMany();
  const searchKeywords: Record<string, string> = {
    'cam-2.8mm': '2.8mm',
    'cam-4mm': '4mm',
    'cam-ptz': 'PTZ',
    'cam-ezviz-cscb54k': '4K Wi-Fi',
    'wifi-ubiquiti-u6': 'U6-Mesh',
    'wifi-ruijie-rgrap': 'RGRAP52ODSEC',
    'wifi-ruijie-rgrap6260g': 'RGRAP6260',
    'wifi-tplink-bridge': 'EAP215'
  };

  // Identificar qué items borrar: aquellos cuyo productId corresponde a una de las searchKeywords o la desc dice 'Cámara CCTV:'
  const cameraProductIds = allProducts
    .filter(p => Object.values(searchKeywords).some(kw => p.nombre.toLowerCase().includes(kw.toLowerCase())))
    .map(p => p.id);

  const itemsToDelete = quote.items.filter(item => {
    if (item.productId && cameraProductIds.includes(item.productId)) return true;
    if (item.descripcion.includes('Cámara CCTV:')) return true;
    return false;
  });

  const idsToDelete = itemsToDelete.map(i => i.id);

  // Borrar los items viejos
  if (idsToDelete.length > 0) {
    await prisma.quoteItem.deleteMany({
      where: { id: { in: idsToDelete } }
    });
  }

  // Si no hay cámaras nuevas, simplemente recalculamos y volvemos
  if (cameras.length === 0) {
    // recalcular subtotales con lo que queda
    const remainingItems = await prisma.quoteItem.findMany({ where: { quoteId } });
    const finalSubtotal = remainingItems.reduce((acc, it) => acc + Number(it.total), 0);
    const finalImpuestos = quote.requiere_factura ? (finalSubtotal * 0.16) : 0;
    const finalTotal = finalSubtotal + finalImpuestos;

    await prisma.quote.update({
      where: { id: quoteId },
      data: { subtotal: finalSubtotal, impuestos: finalImpuestos, total: finalTotal }
    });
    revalidatePath("/admin/cotizador");
    return;
  }

  // Generar los nuevos items
  const cameraCounts: Record<string, number> = {};
  cameras.forEach(cam => {
    const sec = cam.section && cam.section !== 'General' ? cam.section : '';
    const key = `${cam.modelId}|${sec}`;
    cameraCounts[key] = (cameraCounts[key] || 0) + 1;
  });

  const modelNames: Record<string, string> = {
    'cam-2.8mm': 'Domo 2MP Lente 2.8mm',
    'cam-4mm': 'Bala 4MP Lente 4mm',
    'cam-ptz': 'PTZ 25x (Zoom Máximo)',
    'cam-ezviz-cscb54k': 'EZVIZ Solar 4K Wi-Fi 6',
    'wifi-ubiquiti-u6': 'Ubiquiti U6-Mesh (360°)',
    'wifi-ruijie-rgrap': 'Ruijie RGRAP52ODSEC (90°)',
    'wifi-ruijie-rgrap6260g': 'Ruijie RGRAP6260(G) (360°)',
    'wifi-tplink-bridge': 'TP-Link Bridge 5km'
  };

  let newSubtotal = 0;
  const itemsData = Object.entries(cameraCounts).map(([key, count]) => {
    const [modelId, section] = key.split('|');
    const keyword = searchKeywords[modelId] || '';
    const realProduct = keyword ? allProducts.find(p => p.nombre.toLowerCase().includes(keyword.toLowerCase())) : null;
    const sectionPrefix = section ? `[${section}] ` : '';

    if (realProduct) {
      const lineTotal = Number(realProduct.precio_base) * count;
      newSubtotal += lineTotal;
      return {
        quoteId,
        productId: realProduct.id,
        descripcion: `${sectionPrefix}Cámara CCTV: ${modelNames[modelId] || modelId}`,
        cantidad: count,
        precio_unitario: realProduct.precio_base,
        total: lineTotal,
        costo_unitario: realProduct.costo_estimado || 0,
        cantidad_planeada: count
      };
    } else {
      return {
        quoteId,
        descripcion: `${sectionPrefix}Cámara CCTV: ${modelNames[modelId] || modelId}`,
        cantidad: count,
        precio_unitario: 0,
        total: 0,
        costo_unitario: 0,
        cantidad_planeada: count
      };
    }
  });

  await prisma.quoteItem.createMany({ data: itemsData });

  // Recalcular
  const updatedItems = await prisma.quoteItem.findMany({ where: { quoteId } });
  const finalSubtotal = updatedItems.reduce((acc, it) => acc + Number(it.total), 0);
  const finalImpuestos = quote.requiere_factura ? (finalSubtotal * 0.16) : 0;
  const finalTotal = finalSubtotal + finalImpuestos;

  await prisma.quote.update({
    where: { id: quoteId },
    data: { subtotal: finalSubtotal, impuestos: finalImpuestos, total: finalTotal }
  });

  await prisma.clientActivity.create({
    data: {
      clientId,
      tipo: 'Presupuesto Actualizado',
      descripcion: `Se sincronizó el diseño CCTV a la cotización #${quoteId}.`,
      url: `/admin/cotizador?editId=${quoteId}`
    }
  });

  revalidatePath("/admin/cotizador");
}
export async function checkQuoteMismatch(cctvProjectId: number, mapCameras: { modelId: string }[]) {
  const quotes = await prisma.quote.findMany({
    where: { cctvProjectId, status: "Borrador" },
    include: { items: true }
  });
  
  if (quotes.length === 0) return [];
  
  const quote = quotes[0]; // just check the first active linked quote
  
  const allProducts = await prisma.product.findMany();
  const searchKeywords: Record<string, string> = {
    'cam-2.8mm': '2.8mm',
    'cam-4mm': '4mm',
    'cam-ptz': 'PTZ',
    'cam-ezviz-cscb54k': '4K Wi-Fi',
    'wifi-ubiquiti-u6': 'U6-Mesh',
    'wifi-ruijie-rgrap': 'RGRAP52ODSEC',
    'wifi-ruijie-rgrap6260g': 'RGRAP6260',
    'wifi-tplink-bridge': 'EAP215'
  };
  
  const modelNames: Record<string, string> = {
    'cam-2.8mm': 'Domo 2MP Lente 2.8mm',
    'cam-4mm': 'Bala 4MP Lente 4mm',
    'cam-ptz': 'PTZ 25x',
    'cam-ezviz-cscb54k': 'EZVIZ Solar 4K',
    'wifi-ubiquiti-u6': 'Ubiquiti U6-Mesh',
    'wifi-ruijie-rgrap': 'Ruijie RGRAP52ODSEC',
    'wifi-ruijie-rgrap6260g': 'Ruijie RGRAP6260(G)',
    'wifi-tplink-bridge': 'TP-Link Bridge 5km'
  };

  // 1. Count what's in the Map
  const mapCounts: Record<string, number> = {};
  for (const cam of mapCameras) {
    mapCounts[cam.modelId] = (mapCounts[cam.modelId] || 0) + 1;
  }
  
  // 2. Count what's in the Quote
  const quoteCounts: Record<string, number> = {};
  
  for (const item of quote.items) {
    // try to map this item back to a modelId
    let foundModelId = null;
    
    // First, check by productId via keywords
    if (item.productId) {
      const product = allProducts.find(p => p.id === item.productId);
      if (product) {
        for (const [mId, kw] of Object.entries(searchKeywords)) {
          if (product.nombre.toLowerCase().includes(kw.toLowerCase())) {
            foundModelId = mId;
            break;
          }
        }
      }
    }
    
    // If not found by product ID, check description for generic fallback
    if (!foundModelId && item.descripcion.includes('Cámara CCTV:')) {
      for (const [mId, mName] of Object.entries(modelNames)) {
        if (item.descripcion.includes(mName) || item.descripcion.includes(mId)) {
          foundModelId = mId;
          break;
        }
      }
    }
    
    if (foundModelId) {
      quoteCounts[foundModelId] = (quoteCounts[foundModelId] || 0) + item.cantidad;
    }
  }
  
  // 3. Compare Map vs Quote
  const warnings: string[] = [];
  
  for (const [modelId, mapQty] of Object.entries(mapCounts)) {
    const quoteQty = quoteCounts[modelId] || 0;
    if (quoteQty < mapQty) {
      const name = modelNames[modelId] || modelId;
      const missing = mapQty - quoteQty;
      warnings.push(`Hay ${missing}x "${name}" menos en la cotización que en el diseño.`);
    }
  }
  
  return warnings;
}

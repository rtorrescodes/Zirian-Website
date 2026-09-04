"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/auth";

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
      comision_partner: quote.comision_partner ? Number(quote.comision_partner) : null,
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
    costo_unitario?: number;
    total: number;
      seccion?: string | null;
      imagen_url?: string | null;
      syscom_id?: string | null;
    }[];
  brochures?: number[];
}) {
  const { items, brochures, ...quoteData } = data;

  const latestCctv = await prisma.cctvProject.findFirst({
    where: { clientId: quoteData.clientId },
    orderBy: { fecha_creacion: 'desc' }
  });

  const cookieStore = await cookies();
  const session = cookieStore.get('zirian_session');
  let user: any = null;
  if (session) {
    try {
      const payload = await verifyAuth(session.value);
      user = await prisma.user.findUnique({ where: { id: payload.id || payload.userId } });
    } catch(e){}
  }

  let utilidad_real = 0;
  let comision_partner = 0;
  
  if (user?.role === 'Distribuidor') {
    const marginZ = Number(user.margen_zirian || 0);
    // Calcular costos inversos (de abajo hacia arriba)
    items.forEach(item => {
      const costoDistribuidor = Number(item.costo_unitario || 0);
      const ventaCliente = Number(item.precio_unitario || 0);
      const qty = Number(item.cantidad || 1);
      
      const rawCost = marginZ > 0 ? costoDistribuidor / (1 + (marginZ / 100)) : costoDistribuidor;
      
      const miUtilidadUnitariaZirian = costoDistribuidor - rawCost;
      const utilidadDistribuidor = ventaCliente - costoDistribuidor;
      
      utilidad_real += (miUtilidadUnitariaZirian * qty);
      comision_partner += (utilidadDistribuidor * qty);
    });
  }

  const quote = await prisma.quote.create({
    data: {
      ...quoteData,
      status: "Borrador",
      cctvProjectId: latestCctv ? latestCctv.id : undefined,
      utilidad_real: utilidad_real > 0 ? utilidad_real : undefined,
      comision_partner: comision_partner > 0 ? comision_partner : undefined,
      items: {
        create: items,
      },
      brochures: brochures ? {
        create: brochures.map(id => ({ brochureId: id }))
      } : undefined
    }
  });

  await prisma.clientActivity.create({
    data: {
      clientId: quote.clientId,
      tipo: 'Presupuesto',
      descripcion: `Cotización creada: COT-${new Date(quote.fecha_creacion).getFullYear()}-${String(quote.id).padStart(4, '0')} (Monto: $${Number(quote.total).toLocaleString('es-MX')})`,
      url: `/admin/cotizaciones/${quote.id}`
    }
  });

  revalidatePath("/admin/cotizador");
  revalidatePath(`/admin/clientes/${quote.clientId}`);
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

export async function getQuotes(roleOverride?: string, userIdOverride?: number) {
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

  const cookieStore = await cookies();
  const session = cookieStore.get('zirian_session');
  let whereClause: any = {};
    console.log('getQuotes CALLED WITH roleOverride:', roleOverride, 'userIdOverride:', userIdOverride);
    if (roleOverride === 'Distribuidor' && userIdOverride) {
      whereClause = { client: { assignedUserId: userIdOverride } };
    }
  if (session) {
    try {
      const payload = await verifyAuth(session.value);
      console.log('User role:', payload.role, 'User ID:', payload.id || payload.userId);
        const dbUser = await prisma.user.findUnique({ where: { id: payload.id || payload.userId } });
        const actualRole = dbUser?.role || payload.role;
        if (actualRole === 'Distribuidor') {
        whereClause = { client: { assignedUserId: payload.id || payload.userId } };
      }
    } catch(e) { console.error('getQuotes auth error:', e) }
  }

  console.log('GET QUOTES WHERE CLAUSE:', JSON.stringify(whereClause));
    const quotes = await prisma.quote.findMany({
    where: whereClause,
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
  const quote = await prisma.quote.findUnique({ where: { id } });

  if (!quote) return null;

  if (quote) {
    await prisma.clientActivity.create({
      data: {
        clientId: quote.clientId,
        tipo: 'Nota General',
        descripcion: `Cotización eliminada: COT-${new Date(quote.fecha_creacion).getFullYear()}-${String(quote.id).padStart(4, '0')} (Monto: $${Number(quote.total).toLocaleString('es-MX')})`,
      }
    });
  }

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
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin");
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

  const cookieStore = await cookies();
  const session = cookieStore.get('zirian_session');
  let user: any = null;
  if (session) {
    try {
      const payload = await verifyAuth(session.value);
      user = await prisma.user.findUnique({ where: { id: payload.id || payload.userId } });
    } catch(e){}
  }

  let utilidad_real = 0;
  let comision_partner = 0;
  
  if (user?.role === 'Distribuidor') {
    const marginZ = Number(user.margen_zirian || 0);
    items.forEach((item: any) => {
      const costoDistribuidor = Number(item.costo_unitario || 0);
      const ventaCliente = Number(item.precio_unitario || 0);
      const qty = Number(item.cantidad || 1);
      
      const rawCost = marginZ > 0 ? costoDistribuidor / (1 + (marginZ / 100)) : costoDistribuidor;
      
      const miUtilidadUnitariaZirian = costoDistribuidor - rawCost;
      const utilidadDistribuidor = ventaCliente - costoDistribuidor;
      
      utilidad_real += (miUtilidadUnitariaZirian * qty);
      comision_partner += (utilidadDistribuidor * qty);
    });
  }

  const quote = await prisma.quote.update({
    where: { id },
    data: {
      ...quoteData,
      requiere_factura: requiere_factura,
      utilidad_real: utilidad_real > 0 ? utilidad_real : undefined,
      comision_partner: comision_partner > 0 ? comision_partner : undefined,
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
        tipo: 'Nota General',
        descripcion: `La cotización COT-${new Date(quote.fecha_creacion).getFullYear()}-${String(quote.id).padStart(4, '0')} ha sido marcada como perdida.\nMotivo: ${quote.motivo_rechazo || 'No especificado'}`,
        url: `/admin/cotizaciones/${quote.id}`
      }
    });
  } else {
    // Log general update
    await prisma.clientActivity.create({
      data: {
        clientId: quote.clientId,
        tipo: 'Presupuesto',
        descripcion: `Cotización actualizada: COT-${new Date(quote.fecha_creacion).getFullYear()}-${String(quote.id).padStart(4, '0')} (Estatus: ${quote.status})`,
        url: `/admin/cotizaciones/${quote.id}`
      }
    });
  }

  revalidatePath("/admin/cotizaciones");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin");
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
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin");
  revalidatePath(`/presupuesto/${token}`);
  return serializeQuote(quote);
}

export async function adminAcceptQuote(id: number, addressData?: any) {
  let envioAddressId: number | null = null;

  if (addressData) {
    const quoteData = await prisma.quote.findUnique({ where: { id }, select: { clientId: true } });
    if (quoteData) {
      const newAddress = await prisma.address.create({
        data: {
          clientId: quoteData.clientId,
          nombre_contacto: addressData.nombre_contacto || "Cliente",
          calle: addressData.calle || "",
          num_ext: addressData.num_ext || "",
          num_int: addressData.num_int || "",
          colonia: addressData.colonia || "",
          codigo_postal: addressData.codigo_postal || "",
          ciudad: addressData.ciudad || "",
          estado: addressData.estado || "",
          telefono: addressData.telefono || ""
        }
      });
      envioAddressId = newAddress.id;
      
      // TODO: Here we will call Syscom API with the newAddress data and quote items.
      // await createSyscomOrder(id, newAddress);
      console.log("Simulando creación de pedido Syscom para cotización", id, "con dirección:", newAddress);
    }
  }

  const quote = await prisma.quote.update({
    where: { id },
    data: { status: 'Aprobado', envioAddressId },
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
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin");
  if (quote.token) revalidatePath(`/presupuesto/${quote.token}`);
  return serializeQuote(quote);
}



export async function adminCompleteQuote(id: number) {
  const quote = await prisma.quote.findUnique({ where: { id } });
  if (!quote) throw new Error('Cotización no encontrada');
  
  await prisma.quote.update({
    where: { id },
    data: {
      status: 'Cobrada',
      status_pago: 'Pagado',
      monto_pagado: quote.total
    }
  });

  await prisma.clientActivity.create({
    data: {
      clientId: quote.clientId,
      tipo: 'Cobro de Proyecto',
      descripcion: `El administrador marcó la cotización #${id} como Terminada y Cobrada.`
    }
  });

  revalidatePath('/admin/cotizaciones');
  revalidatePath('/admin/dashboard');
  revalidatePath('/admin');
}














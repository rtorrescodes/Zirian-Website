"use server";

import { searchSyscomProducts, getSyscomExchangeRate } from "@/lib/syscom";
import { getSyscomSettings } from "./syscom-settings";
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function searchSyscomForQuote(query: string) {
  if (!query || query.length < 3) return { items: [], filteredOut: 0 };
  
  let products = await searchSyscomProducts(query);
  let filteredOut = 0;
  const tc = await getSyscomExchangeRate();

  const cookieStore = await cookies();
  const session = cookieStore.get('zirian_session');
  let user: any = null;
  if (session) {
    try {
      const payload = await verifyAuth(session.value);
      user = await prisma.user.findUnique({ where: { id: payload.id || payload.userId } });
    } catch(e){}
  }

  const isDistributor = user?.role === 'Distribuidor';
  const marginZirian = isDistributor ? Number(user?.margen_zirian || 0) : 0;
  const marginDistributor = isDistributor ? Number(user?.margen_distribuidor || 0) : 0;
  const limitPrice = isDistributor ? user?.limitar_precio_lista : false;

  const items = products.map(p => {
    let rawListaUSD = p.precios?.precio_lista ? parseFloat(p.precios.precio_lista.toString().replace(/,/g, '')) : 0;
    let rawEspecialUSD = p.precios?.precio_especial ? parseFloat(p.precios.precio_especial.toString().replace(/,/g, '')) : 0;
    
    const rawCostMXN = rawEspecialUSD * tc;
    const rawListaMXN = rawListaUSD * tc;

    let finalCostMXN = rawCostMXN;
    let finalSaleMXN = rawCostMXN;

    if (isDistributor) {
      finalCostMXN = rawCostMXN * (1 + marginZirian / 100);
      finalSaleMXN = finalCostMXN * (1 + marginDistributor / 100);
      if (limitPrice && rawListaMXN > 0 && finalSaleMXN > rawListaMXN) {
        finalSaleMXN = rawListaMXN;
      }
    } else {
      finalCostMXN = rawCostMXN;
      finalSaleMXN = rawListaMXN;
    }

    return {
      id: `syscom-${p.producto_id}`,
      syscomId: p.producto_id,
      nombre: p.titulo,
      descripcion: '',
      modelo: p.modelo,
      marca: p.marca,
      imagen: p.img_portada,
      img_portada: p.img_portada,
      
      precioListaUSD: rawListaUSD,
      precioEspecialUSD: rawEspecialUSD,
      
      precioListaMXN: finalSaleMXN,
      precioEspecialMXN: finalCostMXN,
      costoRawMXN: rawCostMXN,
      
      stock: p.existencia?.nuevo || p.total_existencia || 0,
      existencia: p.existencia?.nuevo || p.total_existencia || 0,
      categorias: p.categorias || [],

      precio_base: finalSaleMXN,
      costo_estimado: finalCostMXN,
      syscom_precio_lista: finalSaleMXN,
      syscom_precio_especial: finalCostMXN,
      codigo: p.modelo,
    };
  });

  return { items, filteredOut };
}


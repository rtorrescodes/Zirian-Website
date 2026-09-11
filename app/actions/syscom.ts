"use server";

import { searchSyscomProducts, getSyscomExchangeRate } from "@/lib/syscom";
import { getSyscomSettings } from "./syscom-settings";
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateAufitPricing, isAufitProduct } from "@/lib/aufit";

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
    let rawEspecialUSD = (p.precios as any)?.precio_especial ? parseFloat((p.precios as any).precio_especial.toString().replace(/,/g, '')) : 0;
    let rawDescuentoUSD = (p.precios as any)?.precio_descuento ? parseFloat((p.precios as any).precio_descuento.toString().replace(/,/g, '')) : 0;
    
    const rawCostMXN = (rawDescuentoUSD > 0 ? rawDescuentoUSD : rawEspecialUSD) * tc;
    const rawEspecialMXN = rawEspecialUSD * tc;
    const rawListaMXN = rawListaUSD * tc;

    let finalCostMXN = rawCostMXN;
    let finalSaleMXN = rawCostMXN;

    const aufitCalc = calculateAufitPricing({
      modelo: p.modelo,
      marca: p.marca,
      titulo: p.titulo,
      precioEspecialMXN: rawEspecialMXN,
      costoDescuentoMXN: rawCostMXN,
    });

    if (aufitCalc) {
      // Para productos AUFIT:
      // Se ofrece el precio especial (no el precio de lista que es excesivo).
      // Para distribuidores, su comisión es la estipulada en la hoja de comisiones AUFIT.
      finalSaleMXN = aufitCalc.precioVentaMXN;
      if (isDistributor) {
        finalCostMXN = aufitCalc.costoDistribuidorMXN; // finalSaleMXN - comisionDistribuidor
      } else {
        finalCostMXN = rawCostMXN;
      }
    } else if (isDistributor) {
      // Para otros productos Syscom en cuenta de distribuidor:
      // Se les ofrece únicamente el precio especial (no precio de lista que es demasiado alto).
      finalCostMXN = rawCostMXN * (1 + marginZirian / 100);
      finalSaleMXN = rawEspecialMXN > 0 ? rawEspecialMXN : finalCostMXN * (1 + marginDistributor / 100);
      if (limitPrice && rawEspecialMXN > 0 && finalSaleMXN > rawEspecialMXN) {
        finalSaleMXN = rawEspecialMXN;
      }
    } else {
      finalCostMXN = rawCostMXN;
      finalSaleMXN = rawListaMXN > 0 ? rawListaMXN : rawEspecialMXN;
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
      esAufit: !!aufitCalc,
      comisionDistribuidor: aufitCalc ? aufitCalc.comisionDistribuidor : undefined,
    };
  });

  return { items, filteredOut };
}


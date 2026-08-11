"use server";

import { searchSyscomProducts, getSyscomExchangeRate } from "@/lib/syscom";

export async function searchSyscomForQuote(query: string) {
  if (!query || query.length < 3) return [];
  
  // Obtenemos los productos
  const products = await searchSyscomProducts(query);
  
  // Obtenemos el tipo de cambio
  const tc = await getSyscomExchangeRate();
  
  // Transformamos los productos para que el cliente los reciba fácilmente
  return products.map(p => ({
    id: `syscom-${p.producto_id}`,
    syscomId: p.producto_id,
    nombre: p.titulo,
    modelo: p.modelo,
    marca: p.marca,
    imagen: p.img_portada,
    precioListaUSD: p.precios?.precio_lista ? parseFloat(p.precios.precio_lista) : 0,
    precioEspecialUSD: p.precios?.precio_1 ? parseFloat(p.precios.precio_1) : 0,
    precioListaMXN: p.precios?.precio_lista ? parseFloat(p.precios.precio_lista) * tc : 0,
    stock: p.existencia?.nuevo || p.total_existencia || 0
  }));
}

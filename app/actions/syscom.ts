"use server";

import { searchSyscomProducts, getSyscomExchangeRate } from "@/lib/syscom";
import { getSyscomSettings } from "./syscom-settings";

export async function searchSyscomForQuote(query: string) {
  if (!query || query.length < 3) return { items: [], filteredOut: 0 };
  
  // Obtenemos los productos
  let products = await searchSyscomProducts(query);
  
  let filteredOut = 0;

  // Ya no filtramos por Whitelist en el Cotizador (CRM) para permitir buscar cualquier producto.
  // El whitelist debe ser solo para la tienda pública.

  // Obtenemos el tipo de cambio
  const tc = await getSyscomExchangeRate();
  
  // Transformamos los productos para que el cliente los reciba fácilmente
      const items = products.map(p => {
      let nombre = p.titulo;
      let descripcion = '';

      return {
        id: `syscom-${p.producto_id}`,
        syscomId: p.producto_id,
        nombre: nombre,
        descripcion: descripcion,
        modelo: p.modelo,
        marca: p.marca,
        imagen: p.img_portada,
        precioListaUSD: p.precios?.precio_lista ? parseFloat(p.precios.precio_lista.toString().replace(/,/g, '')) : 0,
        precioEspecialUSD: p.precios?.precio_especial ? parseFloat(p.precios.precio_especial.toString().replace(/,/g, '')) : 0,
          precioDescuentoUSD: p.precios?.precio_descuento ? parseFloat(p.precios.precio_descuento.toString().replace(/,/g, '')) : 0,
        precioListaMXN: p.precios?.precio_lista ? parseFloat(p.precios.precio_lista.toString().replace(/,/g, '')) * tc : 0,
        precioEspecialMXN: p.precios?.precio_especial ? parseFloat(p.precios.precio_especial.toString().replace(/,/g, '')) * tc : 0,
          precioDescuentoMXN: p.precios?.precio_descuento ? parseFloat(p.precios.precio_descuento.toString().replace(/,/g, '')) * tc : 0,
        stock: p.existencia?.nuevo || p.total_existencia || 0,
        categorias: p.categorias || []
      };
    });

  return { items, filteredOut };
}

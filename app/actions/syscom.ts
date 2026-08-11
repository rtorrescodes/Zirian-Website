"use server";

import { searchSyscomProducts, getSyscomExchangeRate } from "@/lib/syscom";
import { getSyscomSettings } from "./syscom-settings";

export async function searchSyscomForQuote(query: string) {
  if (!query || query.length < 3) return { items: [], filteredOut: 0 };
  
  // Obtenemos los productos
  let products = await searchSyscomProducts(query);
  
  let filteredOut = 0;

  // Aplicamos Filtros (Whitelist)
  const settings = await getSyscomSettings();
  if (settings.brands.length > 0 || settings.models.length > 0) {
    const totalBefore = products.length;
    products = products.filter(p => {
      const brandAllowed = settings.brands.includes(p.marca.toUpperCase());
      // Permitimos buscar por ID (producto_id numérico de syscom convertido a string) o Modelo exacto
      const modelAllowed = settings.models.includes(p.modelo.toUpperCase()) || settings.models.includes(String(p.producto_id));
      return brandAllowed || modelAllowed;
    });
    filteredOut = totalBefore - products.length;
  }

  // Obtenemos el tipo de cambio
  const tc = await getSyscomExchangeRate();
  
  // Transformamos los productos para que el cliente los reciba fácilmente
  const items = products.map(p => ({
    id: `syscom-${p.producto_id}`,
    syscomId: p.producto_id,
    nombre: p.titulo,
    modelo: p.modelo,
    marca: p.marca,
    imagen: p.img_portada,
    precioListaUSD: p.precios?.precio_lista ? parseFloat(p.precios.precio_lista.toString().replace(/,/g, '')) : 0,
    precioEspecialUSD: p.precios?.precio_1 ? parseFloat(p.precios.precio_1.toString().replace(/,/g, '')) : 0,
    precioListaMXN: p.precios?.precio_lista ? parseFloat(p.precios.precio_lista.toString().replace(/,/g, '')) * tc : 0,
    precioEspecialMXN: p.precios?.precio_1 ? parseFloat(p.precios.precio_1.toString().replace(/,/g, '')) * tc : 0,
    stock: p.existencia?.nuevo || p.total_existencia || 0
  }));

  return { items, filteredOut };
}

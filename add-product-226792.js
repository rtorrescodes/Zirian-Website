const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const res = await fetch('https://developers.syscom.mx/oauth/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: 'lsT0mk8DY2iEY1RvEI4kW2xrCLOdyz5X', client_secret: 'n2TaAcT8C44fweZ9TAVgbSHR5yZqAhAw0EhXDplb', grant_type: 'client_credentials' }) });
  const data = await res.json();
  const token = data.access_token;
  
  const tcRes = await fetch('https://developers.syscom.mx/api/v1/tipocambio', { headers: { Authorization: 'Bearer ' + token } });
  const tcData = await tcRes.json();
  const tc = parseFloat(tcData.normal) || 20.0;
  
  const pRes = await fetch('https://developers.syscom.mx/api/v1/productos/226792', { headers: { Authorization: 'Bearer ' + token } });
  const p = await pRes.json();
  
  let cost_mxn = parseFloat(p.precios.precio_1) * tc;
  let precio_base = (cost_mxn * 1.16) + 30.0;
  
  const dbP = await prisma.product.create({ 
      data: { 
          categoryId: 2, // CCTV / Memorias
          nombre: p.titulo.substring(0, 150), 
          codigo: p.modelo.substring(0, 50), 
          marca: p.marca ? p.marca.substring(0, 100) : null, 
          descripcion: 'Syscom ID: ' + p.producto_id + '\nURL: https://www.syscom.mx/products/' + p.producto_id, 
          precio_base: precio_base, 
          costo_estimado: cost_mxn, 
          grupo_impresion: 'Equipamiento CCTV', 
          proveedor_default: 'Syscom' 
      } 
  });
  console.log('Insertado:', dbP.nombre);
  
  const quote = await prisma.quote.findUnique({ where: { id: 20 } });
  let quoteSubtotal = parseFloat(quote.subtotal);
  
  await prisma.quoteItem.create({ 
      data: { 
          quoteId: 20, 
          productId: dbP.id, 
          descripcion: dbP.nombre, 
          cantidad: 1, 
          precio_unitario: dbP.precio_base, 
          total: dbP.precio_base, 
          costo_unitario: dbP.costo_estimado 
      } 
  });
  
  quoteSubtotal += Number(dbP.precio_base);
  
  await prisma.quote.update({ 
      where: { id: 20 }, 
      data: { 
          subtotal: quoteSubtotal, 
          impuestos: quoteSubtotal * 0.16, 
          total: quoteSubtotal * 1.16 
      } 
  });
  console.log('Quote 20 updated with product 226792!');
}
main();

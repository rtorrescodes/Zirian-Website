const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const items = [
  { syscomId: '205955', cost: 272.46, price: 443.47 },
  { syscomId: '241449', cost: 1970.44, price: 2850.76 },
  { syscomId: '243024', cost: 4065.65, price: 6617.28 },
  { model: 'RG-NBS3100-24GT4SFP-P-V2' },
  { model: 'LP1KRT' },
  { syscomId: '165752' },
  { syscomId: '196774' },
  { syscomId: '215634' },
  { syscomId: '183512' },
  { syscomId: '152915' },
];
async function getSyscomToken() {
  const res = await fetch('https://developers.syscom.mx/oauth/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: 'lsT0mk8DY2iEY1RvEI4kW2xrCLOdyz5X', client_secret: 'n2TaAcT8C44fweZ9TAVgbSHR5yZqAhAw0EhXDplb', grant_type: 'client_credentials' }) });
  const data = await res.json(); return data.access_token;
}
async function getTc(token) {
    const res = await fetch('https://developers.syscom.mx/api/v1/tipocambio', { headers: { Authorization: 'Bearer ' + token } });
    const data = await res.json(); return parseFloat(data.normal) || 20.0;
}
async function main() {
  const token = await getSyscomToken();
  const tc = await getTc(token);
  const dbProducts = [];
  for (const item of items) {
    let url = item.syscomId ? ('https://developers.syscom.mx/api/v1/productos/' + item.syscomId) : ('https://developers.syscom.mx/api/v1/productos?busqueda=' + item.model);
    const res = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
    const data = await res.json();
    let p = item.syscomId ? data : (data.productos && data.productos[0]);
    if (!p) { console.log('No encontrado:', item); continue; }
    let price = item.price; let cost = item.cost;
    if (!price && p.precios) { price = parseFloat(p.precios.precio_1) * tc; cost = price * 0.75; }
    const dbP = await prisma.product.create({ data: { categoryId: 3, nombre: p.titulo.substring(0, 150), codigo: p.modelo.substring(0, 50), marca: p.marca ? p.marca.substring(0, 100) : null, descripcion: 'Syscom ID: ' + p.producto_id + '\nURL: https://www.syscom.mx/products/' + p.producto_id, precio_base: price, costo_estimado: cost, grupo_impresion: 'Equipamiento de Redes y Enlaces', proveedor_default: 'Syscom' } });
    console.log('Insertado:', dbP.nombre);
    dbProducts.push(dbP);
  }
  const quote = await prisma.quote.findUnique({ where: { id: 20 } });
  let quoteSubtotal = parseFloat(quote.subtotal);
  for (const prod of dbProducts) {
    await prisma.quoteItem.create({ data: { quoteId: 20, productId: prod.id, descripcion: prod.nombre, cantidad: 1, precio_unitario: prod.precio_base, total: prod.precio_base, costo_unitario: prod.costo_estimado } });
    quoteSubtotal += Number(prod.precio_base);
  }
  await prisma.quote.update({ where: { id: 20 }, data: { subtotal: quoteSubtotal, impuestos: quoteSubtotal * 0.16, total: quoteSubtotal * 1.16 } });
  console.log('Quote 20 updated!');
}
main().catch(console.error);

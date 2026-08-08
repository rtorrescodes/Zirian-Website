import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  console.log("Fixing quote 1...");

  // Delete all quotes except 1
  await prisma.quoteItem.deleteMany({ where: { quoteId: { gt: 1 } } });
  await prisma.quote.deleteMany({ where: { id: { gt: 1 } } });
  
  // Clear items for quote 1
  await prisma.quoteItem.deleteMany({ where: { quoteId: 1 } });

  // Get/Update client
  let client = await prisma.client.findFirst({ where: { email: 'diego.bener@ejemplo.com' } });
  if (client) {
    client = await prisma.client.update({
      where: { id: client.id },
      data: { nombre: 'Diego Bener', telefono: '442 219 4431', ubicacion: 'Apartamento Vista Vela 2, Residencial en Cabo San Lucas, número 4405' }
    });
  } else {
    client = await prisma.client.create({
      data: { 
        nombre: 'Diego Bener', 
        email: 'diego.bener@ejemplo.com',
        telefono: '442 219 4431', 
        ubicacion: 'Apartamento Vista Vela 2, Residencial en Cabo San Lucas, número 4405',
        origen: 'Directo'
      }
    });
  }

  let category = await prisma.productCategory.findFirst({ where: { nombre: 'Instalación EV' } });
  if (!category) {
    category = await prisma.productCategory.create({ data: { nombre: 'Instalación EV' } });
  }

  let dosHermanos = await prisma.supplier.findFirst({ where: { nombre: 'Electrica Dos Hermanos' } });
  if (!dosHermanos) {
    dosHermanos = await prisma.supplier.create({ data: { nombre: 'Electrica Dos Hermanos', telefono: '' } });
  }

  let china = await prisma.supplier.findFirst({ where: { nombre: 'China' } });
  if (!china) {
    china = await prisma.supplier.create({ data: { nombre: 'China', telefono: '' } });
  }

  const items = [
    { nombre: 'Cable negro 8AWG 100% Cobre', sku: 'CAB-N-8AWG', precio_costo: 31, price: 31, qty: 60, sup: dosHermanos.id, details: '', group: 'Instalación de Cargador EV' },
    { nombre: 'Cable blanco 8AWG 100% Cobre', sku: 'CAB-B-8AWG', precio_costo: 31, price: 31, qty: 60, sup: dosHermanos.id, details: '', group: 'Instalación de Cargador EV' },
    { nombre: 'Cable verde 10AWG', sku: 'CAB-V-10AWG', precio_costo: 20, price: 20, qty: 10, sup: dosHermanos.id, details: '', group: 'Instalación de Cargador EV' },
    { nombre: 'Tubo PVC pesado 3/4', sku: 'PVC-34', precio_costo: 27, price: 27, qty: 20, sup: dosHermanos.id, details: '', group: 'Instalación de Cargador EV' },
    { nombre: 'Abrazadera uña 3/4', sku: 'ABR-34', precio_costo: 3, price: 3, qty: 60, sup: dosHermanos.id, details: '', group: 'Instalación de Cargador EV' },
    { nombre: 'Curva PVC pesado 3/4', sku: 'CUR-34', precio_costo: 5, price: 5, qty: 30, sup: dosHermanos.id, details: '', group: 'Instalación de Cargador EV' },
    { nombre: 'Varilla de tierra 1mt cobre 1/2', sku: 'VAR-1MT', precio_costo: 66, price: 66, qty: 1, sup: dosHermanos.id, details: '', group: 'Instalación de Cargador EV' },
    { nombre: 'Conector para tierra', sku: 'CON-TIERRA', precio_costo: 12, price: 12, qty: 1, sup: dosHermanos.id, details: '', group: 'Instalación de Cargador EV' },
    { nombre: 'Mano de Obra - Instalación EV', sku: 'SRV-INSTALACION', precio_costo: 1500, price: 12632, qty: 1, sup: dosHermanos.id, details: 'Incluye 60mts x 2 cables 100% cobre y ductería 60 mts.', group: 'Instalación de Cargador EV' },
    { nombre: 'Caja de protecciones eléctricas', sku: 'CAJA-PROT', precio_costo: 1100, price: 1500, qty: 1, sup: china.id, details: 'Centro de carga con RCBO y supresor de picos SPD.', group: 'Caja de protecciones' },
    { nombre: 'Gabinete exterior intemperie', sku: 'GAB-EXT', precio_costo: 1050, price: 2000, qty: 1, sup: dosHermanos.id, details: 'Gabinete NEMA 3R.', group: 'Gabinete exterior para intemperie' },
  ];

  const dbProducts = [];
  for (const item of items) {
    let p = await prisma.product.findFirst({ where: { codigo: item.sku } });
    if (p) {
        p = await prisma.product.update({
            where: { id: p.id },
            data: { costo_estimado: item.precio_costo, precio_base: item.price, categoryId: category.id, grupo_impresion: item.group }
        });
    } else {
        p = await prisma.product.create({
            data: { 
              nombre: item.nombre, 
              codigo: item.sku, 
              costo_estimado: item.precio_costo, 
              precio_base: item.price, 
              unidad_medida: 'Pieza', 
              stock_general: 100, 
              categoryId: category.id,
              grupo_impresion: item.group
            }
        });
    }
    dbProducts.push({ ...p, __quoteQty: item.qty, __quoteDetails: item.details });
  }

  const subtotal = dbProducts.reduce((acc, p) => acc + (Number(p.precio_base) * p.__quoteQty), 0);
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  let quote = await prisma.quote.findUnique({ where: { id: 1 } });
  if (quote) {
    quote = await prisma.quote.update({
      where: { id: 1 },
      data: {
        clientId: client.id,
        status: 'Borrador',
        subtotal,
        impuestos: iva,
        total,
        mostrar_desglose: false,
        items: {
          create: dbProducts.map(p => ({
            productId: p.id,
            cantidad: p.__quoteQty,
            precio_unitario: p.precio_base,
            total: Number(p.precio_base) * p.__quoteQty,
            descripcion: p.__quoteDetails
          }))
        }
      }
    });
  } else {
    // If quote 1 is missing, create it forcing ID 1 (might fail with autoincrement but let's try, or just create)
    console.log("Quote 1 missing!");
  }

  console.log('Quote 1 updated successfully!');
}
main().catch(console.error).finally(() => prisma.$disconnect());

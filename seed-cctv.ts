import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create Category CCTV
  let cctvCat = await prisma.productCategory.findFirst({ where: { nombre: 'CCTV' } });
  if (!cctvCat) {
    cctvCat = await prisma.productCategory.create({
      data: {
        nombre: 'CCTV',
        descripcion: 'Cámaras y accesorios de videovigilancia'
      }
    });
  }

  // Create Syscom Supplier
  let syscom = await prisma.supplier.findFirst({ where: { nombre: 'SYSCOM' } });
  if (!syscom) {
    syscom = await prisma.supplier.create({
      data: { nombre: 'SYSCOM' }
    });
  }

  // Insert Camera
  const product = await prisma.product.create({
    data: {
      categoryId: cctvCat.id,
      nombre: 'Cámara de Batería con Panel Solar Integrado 4K Wi-Fi 6',
      codigo: 'CSCB54K',
      descripcion: 'EZVIZ CSCB54K (CS-CB5-4K). Resolución 4K a 15fps. Lente 2.8mm. Panel solar integrado para autonomía. Visión nocturna a color. Batería 10400 MAH.',
      precio_base: 3497.17, // Precio Lista
      costo_estimado: 1791.93, // Costo Syscom
      unidad_medida: 'Pieza',
      stock_general: 0,
      proveedor_default: syscom.nombre,
      grupo_impresion: 'Cámaras de Seguridad',
      activo: true
    }
  });

  console.log("Producto agregado exitosamente:", product);
}

main().finally(() => prisma.$disconnect());

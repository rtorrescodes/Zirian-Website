import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.product.createMany({
    data: [
      {
        nombre: 'Instalación de equipos, red WiFi & Cámaras + Configuraciones',
        descripcion: 'Servicio de instalación integral y configuraciones.',
        categoryId: 2, // CCTV
        precio_base: 0,
        costo_estimado: 0,
        unidad_medida: 'Servicio',
        grupo_impresion: 'Mano de Obra',
      },
      {
        nombre: 'Instalación de equipos + Configuraciones',
        descripcion: 'Servicio de instalación y configuraciones.',
        categoryId: 2, // CCTV
        precio_base: 0,
        costo_estimado: 0,
        unidad_medida: 'Servicio',
        grupo_impresion: 'Mano de Obra',
      },
      {
        nombre: 'Tubo Galvanizado Calibre 20 2" x 6 m + instalación',
        descripcion: 'Tubo Galvanizado Calibre 20 2 pulgadas x 6 metros con instalación.',
        categoryId: 2, // CCTV
        precio_base: 4500,
        costo_estimado: 3500, // just a guess
        unidad_medida: 'Pieza',
        grupo_impresion: 'Infraestructura CCTV',
      }
    ]
  });
  console.log("Servicios creados");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect())

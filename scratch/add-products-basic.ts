import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  let redesCategory = await prisma.productCategory.findFirst({ where: { nombre: 'Redes' } })
  if (!redesCategory) {
    redesCategory = await prisma.productCategory.create({
      data: {
        nombre: 'Redes',
        descripcion: 'Equipos de red, switches, access points, etc.'
      }
    })
  }

  const p1 = await prisma.product.create({
    data: {
      categoryId: 2, // CCTV
      nombre: 'DS1673ZJP Montaje de Poste para PTZ / Acero Inoxidable',
      codigo: '203699',
      descripcion: 'Montura recomendada para EZ 4K',
      precio_base: 656.26,
      costo_estimado: 312.69
    }
  })

  const p2 = await prisma.product.create({
    data: {
      categoryId: redesCategory.id,
      nombre: 'EAP215BRIDGEKIT Punto de Acceso Exterior Bridge 5 GHz',
      codigo: '235958',
      descripcion: 'Alcance 5 km / IP65 / 3 Puertos Gigabit',
      precio_base: 4839.92,
      costo_estimado: 2676.33
    }
  })

  const p3 = await prisma.product.create({
    data: {
      categoryId: 2, // CCTV
      nombre: 'HSSDP10/128G/GUARDPRO Tarjeta SD GuardPro P10 / 128 GB',
      codigo: '236654',
      descripcion: 'Especializada Para Videovigilancia 24/7 (Para EZ 4K)',
      precio_base: 1702.13,
      costo_estimado: 956.12
    }
  })

  console.log('Created products:', p1.id, p2.id, p3.id)
}
main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
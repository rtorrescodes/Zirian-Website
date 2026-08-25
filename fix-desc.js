const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: {
      descripcion: { startsWith: 'Syscom ID:' }
    }
  });

  for (const p of products) {
    let newNombre = p.nombre;
    let newDesc = '';

    if (p.nombre.includes('/')) {
      const parts = p.nombre.split('/').map(s => s.trim());
      newNombre = parts[0];
      newDesc = parts.slice(1).join(' / ');
    } else {
      // Just clear the syscom URL
      newDesc = '';
    }

    // Asegurarse de que el nombre no exceda los limites
    newNombre = newNombre.substring(0, 150);

    await prisma.product.update({
      where: { id: p.id },
      data: {
        nombre: newNombre,
        descripcion: newDesc
      }
    });

    console.log('Actualizado:', newNombre);
    
    // Buscar en QuoteItem de la cotizacion 20 y actualizar
    const qItems = await prisma.quoteItem.findMany({
      where: { quoteId: 20, productId: p.id }
    });

    for (const qi of qItems) {
      await prisma.quoteItem.update({
        where: { id: qi.id },
        data: {
          descripcion: newDesc ? (newNombre + '\n' + newDesc) : newNombre
        }
      });
    }
  }
  console.log('Productos y items de cotizacion actualizados.');
}
main().catch(console.error);

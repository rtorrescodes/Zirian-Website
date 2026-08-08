import { AppShell } from '@/components/panel/app-shell'
import { QuoteBuilder } from '@/components/cotizador/quote-builder'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic";

export default async function CotizadorPage({ searchParams }: { searchParams: Promise<{ clientId?: string, editId?: string }> }) {
  const resolvedParams = await searchParams
  // Fetch real data from the database
  const clients = await prisma.client.findMany({
    orderBy: { nombre: 'asc' }
  })

  const products = await prisma.product.findMany({
    include: { category: true },
    where: { activo: true },
    orderBy: { nombre: 'asc' }
  })

  const plainProducts = products.map(p => ({
    ...p,
    precio_base: p.precio_base ? Number(p.precio_base) : 0,
    costo_estimado: p.costo_estimado ? Number(p.costo_estimado) : 0,
    stock_general: p.stock_general ? Number(p.stock_general) : 0
  }))

  const categories = await prisma.productCategory.findMany({
    orderBy: { nombre: 'asc' }
  })

  let editQuote: any = null;
  if (resolvedParams.editId) {
    const parsedId = parseInt(resolvedParams.editId, 10);
    if (!isNaN(parsedId)) {
      const q = await prisma.quote.findUnique({
        where: { id: parsedId },
        include: {
          items: {
            include: { product: true }
          }
        }
      });
      if (q) {
        editQuote = {
          ...q,
          subtotal: q.subtotal ? Number(q.subtotal) : 0,
          iva: q.impuestos ? Number(q.impuestos) : 0,
          total: q.total ? Number(q.total) : 0,
          items: q.items.map(item => ({
            ...item,
            cantidad: item.cantidad ? Number(item.cantidad) : 0,
            precio_unitario: item.precio_unitario ? Number(item.precio_unitario) : 0,
            product: item.product ? {
              ...item.product,
              precio_base: item.product.precio_base ? Number(item.product.precio_base) : 0
            } : null
          }))
        }
      }
    }
  }

  return (
    <AppShell
      title="Cotizador"
      subtitle="Instalación de cargadores EV · genera y guarda cotizaciones"
    >
      <QuoteBuilder 
        initialClients={clients} 
        initialProducts={plainProducts} 
        initialCategories={categories} 
        initialClientId={resolvedParams.clientId ? parseInt(resolvedParams.clientId) : undefined}
        initialQuote={editQuote}
      />
    </AppShell>
  )
}

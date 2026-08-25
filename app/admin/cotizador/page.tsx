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
    include: { 
      category: true,
      recommendations: {
        include: { recommended: true }
      }
    },
    where: { activo: true },
    orderBy: { nombre: 'asc' }
  })

  const plainProducts = products.map(p => ({
    ...p,
    precio_base: p.precio_base ? Number(p.precio_base) : 0,
    costo_estimado: p.costo_estimado ? Number(p.costo_estimado) : 0,
    stock_general: p.stock_general ? Number(p.stock_general) : 0,
    recommendations: p.recommendations?.map(r => ({
      ...r,
      recommended: {
        ...r.recommended,
        precio_base: r.recommended.precio_base ? Number(r.recommended.precio_base) : 0,
        costo_estimado: r.recommended.costo_estimado ? Number(r.recommended.costo_estimado) : 0,
        stock_general: r.recommended.stock_general ? Number(r.recommended.stock_general) : 0
      }
    }))
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
          impuestos: q.impuestos ? Number(q.impuestos) : 0,
          total: q.total ? Number(q.total) : 0,
          comision_fija: q.comision_fija ? Number(q.comision_fija) : 0,
          costo_real: q.costo_real ? Number(q.costo_real) : 0,
          utilidad_real: q.utilidad_real ? Number(q.utilidad_real) : 0,
          monto_pagado: q.monto_pagado ? Number(q.monto_pagado) : 0,
          items: q.items.map(item => ({
            ...item,
            cantidad: item.cantidad ? Number(item.cantidad) : 0,
            precio_unitario: item.precio_unitario ? Number(item.precio_unitario) : 0,
            total: item.total ? Number(item.total) : 0,
            costo_unitario: item.costo_unitario ? Number(item.costo_unitario) : 0,
            cantidad_planeada: item.cantidad_planeada ? Number(item.cantidad_planeada) : 0,
            cantidad_usada: item.cantidad_usada ? Number(item.cantidad_usada) : 0,
            product: item.product ? {
              ...item.product,
              precio_base: item.product.precio_base ? Number(item.product.precio_base) : 0,
              costo_estimado: item.product.costo_estimado ? Number(item.product.costo_estimado) : 0,
              stock_general: item.product.stock_general ? Number(item.product.stock_general) : 0
            } : null
          }))
        }
      }
    }
  }

  
  const brochures = await prisma.brochure.findMany({
    orderBy: { fecha_creacion: 'desc' }
  });
  
  return (
    <AppShell
      title="Cotizador"
      subtitle="Instalación de cargadores EV · genera y guarda cotizaciones"
    >
      <QuoteBuilder 
        initialClients={clients} 
        initialProducts={plainProducts} 
        initialCategories={categories} 
        initialBrochures={brochures}
        initialClientId={resolvedParams.clientId ? parseInt(resolvedParams.clientId) : undefined}
        initialQuote={editQuote}
      />
    </AppShell>
  )
}

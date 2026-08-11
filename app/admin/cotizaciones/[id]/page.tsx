import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { QuoteManager } from "@/components/cotizador/quote-manager"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AppShell } from "@/components/panel/app-shell"

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const quoteId = parseInt(resolvedParams.id)
  
  if (isNaN(quoteId)) {
    notFound()
  }

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: {
      client: true,
      items: {
        include: {
          product: true
        }
      }
    }
  })

  if (!quote) {
    notFound()
  }

  const plainQuote = {
    ...quote,
    subtotal: quote.subtotal ? Number(quote.subtotal) : 0,
    impuestos: quote.impuestos ? Number(quote.impuestos) : 0,
    iva: quote.impuestos ? Number(quote.impuestos) : 0,
    total: quote.total ? Number(quote.total) : 0,
    costo_real: quote.costo_real ? Number(quote.costo_real) : 0,
    utilidad_real: quote.utilidad_real ? Number(quote.utilidad_real) : 0,
    comision_fija: quote.comision_fija ? Number(quote.comision_fija) : 0,
    monto_pagado: quote.monto_pagado ? Number(quote.monto_pagado) : 0,
    items: quote.items.map(item => ({
      ...item,
      cantidad: item.cantidad ? Number(item.cantidad) : 0,
      precio_unitario: item.precio_unitario ? Number(item.precio_unitario) : 0,
      total: item.total ? Number(item.total) : 0,
      costo_unitario: item.costo_unitario ? Number(item.costo_unitario) : 0,
      cantidad_planeada: item.cantidad_planeada ? Number(item.cantidad_planeada) : 0,
      product: item.product ? {
        ...item.product,
        precio_base: item.product.precio_base ? Number(item.product.precio_base) : 0,
        costo_estimado: item.product.costo_estimado ? Number(item.product.costo_estimado) : 0,
        stock_general: item.product.stock_general ? Number(item.product.stock_general) : 0
      } : null
    }))
  }

  return (
    <AppShell title={`Cotización #${quote.id.toString().padStart(4, '0')}`} subtitle={`Gestión y detalles de la cotización para ${quote.client.nombre}`}>
      <div className="mx-auto max-w-7xl p-4 sm:p-6">
        <div className="mb-8">
        <Link 
          href="/admin/cotizaciones" 
          className="inline-flex items-center text-sm font-tech font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Cotizaciones
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-tech text-3xl font-bold uppercase tracking-widest text-white">
              Gestión de Cotización <span className="text-brand-cyan">#{quote.id.toString().padStart(4, '0')}</span>
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Cliente: {quote.client.nombre} | {new Date(quote.fecha_creacion).toLocaleDateString('es-MX')}
            </p>
          </div>
          <div className="flex gap-3">
            <a 
              href={`/api/quotes/${quote.id}/pdf`}
              target="_blank"
              className="inline-flex items-center justify-center rounded-md border border-brand-blue bg-brand-blue/10 px-4 py-2 text-sm font-tech font-bold uppercase tracking-wider text-brand-blue transition-colors hover:bg-brand-blue hover:text-slate-950 hover:bg-brand-cyan"
            >
              Ver PDF
            </a>
          </div>
        </div>
      </div>

        <QuoteManager quote={plainQuote} />
      </div>
    </AppShell>
  )
}

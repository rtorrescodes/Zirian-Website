import { getQuotes } from "@/app/actions/quotes"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Settings } from "lucide-react"
import Link from "next/link"
import { AppShell } from "@/components/panel/app-shell"
import { QuoteActions } from "@/components/cotizador/quote-actions"

export const dynamic = 'force-dynamic'

export default async function CotizacionesPage({ searchParams }: { searchParams: Promise<{ showLost?: string }> }) {
  const resolvedParams = await searchParams;
  const showLost = resolvedParams.showLost === 'true';
  const allQuotes = await getQuotes();
  const quotes = showLost ? allQuotes : allQuotes.filter(q => q.status !== 'Rechazada' && q.status !== 'Cancelada');

  return (
    <AppShell title="Historial de Cotizaciones" subtitle="Gestiona las cotizaciones creadas, inventario y órdenes de compra.">
      <div className="mx-auto max-w-7xl p-4 sm:p-6">
        <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-tech text-3xl font-bold uppercase tracking-widest text-white">
            Historial de Cotizaciones
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Gestiona las cotizaciones creadas, inventario y órdenes de compra.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href={showLost ? "/admin/cotizaciones" : "?showLost=true"}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-slate-700 bg-slate-800 text-white hover:bg-slate-700 h-9 px-4 py-2 font-tech uppercase tracking-widest"
          >
            {showLost ? "Ocultar Perdidas" : "Ver Perdidas"}
          </Link>
          <Link 
            href="/admin/cotizador"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-brand-blue text-slate-950 shadow hover:bg-brand-blue/90 h-9 px-4 py-2 font-tech uppercase tracking-widest font-bold"
          >
            Nueva Cotización
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quotes.map((quote) => (
          <Card key={quote.id} className="relative overflow-hidden border-slate-800 bg-slate-900/60 p-5 shadow-xl transition-colors hover:border-brand-blue/50">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-tech text-xs font-bold text-slate-400 uppercase tracking-widest">
                  COT-{new Date(quote.fecha_creacion).getFullYear()}-{String(quote.id).padStart(4, '0')}
                </p>
                <p className="mt-1 font-medium text-white text-lg">
                  {quote.client.nombre}
                </p>
              </div>
              <Badge variant="outline" className={`font-tech uppercase ${
                quote.status === 'Aprobada' || quote.status === 'Aprobado' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' :
                quote.status === 'Enviada' ? 'border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan' :
                quote.status === 'Borrador' ? 'border-slate-500/30 bg-slate-500/10 text-slate-400' :
                quote.status === 'Cancelada' || quote.status === 'Rechazada' ? 'border-red-500/30 bg-red-500/10 text-red-400' :
                quote.status === 'Requiere Atención' ? 'border-orange-500/30 bg-orange-500/10 text-orange-400' :
                'border-brand-blue/30 bg-brand-blue/10 text-brand-blue'
              }`}>
                {quote.status}
                {quote.motivo_rechazo && <span className="block text-[8px] opacity-70 mt-1 capitalize">{quote.motivo_rechazo}</span>}
              </Badge>
            </div>
            
            <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-4">
              <p className="font-mono text-xl font-bold text-emerald-400">
                ${Number(quote.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-slate-500">
                {new Date(quote.fecha_creacion).toLocaleDateString('es-MX')}
              </p>
            </div>

            <div className="mt-4 flex gap-2">
              <Link 
                href={`/admin/cotizaciones/${quote.id}`}
                className="flex-1 inline-flex items-center justify-center rounded-md border border-brand-cyan/30 bg-brand-cyan/10 px-3 py-2 text-[10px] font-tech font-bold uppercase tracking-wider text-brand-cyan transition-colors hover:bg-brand-cyan hover:text-white"
              >
                <Settings className="mr-2 h-3 w-3" />
                Gestionar Proyecto
              </Link>
              <a 
                href={`/api/quotes/${quote.id}/pdf`}
                target="_blank"
                className="inline-flex items-center justify-center rounded-md bg-brand-blue/10 px-3 py-2 text-[10px] font-tech font-bold uppercase tracking-wider text-brand-blue transition-colors hover:bg-brand-blue/20"
              >
                <FileText className="h-4 w-4" />
              </a>
            </div>
            
            <QuoteActions quoteId={quote.id} token={quote.token || undefined} status={quote.status} />
          </Card>
        ))}
        {quotes.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 font-tech uppercase tracking-wider">
            No hay cotizaciones registradas
          </div>
        )}
      </div>
      </div>
    </AppShell>
  )
}

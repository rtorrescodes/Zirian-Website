import { getQuotes } from "@/app/actions/quotes"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Settings, UserCheck } from "lucide-react"
import Link from "next/link"
import { AppShell } from "@/components/panel/app-shell"
import { QuoteActions } from "@/components/cotizador/quote-actions"
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic'

export default async function CotizacionesPage({ searchParams }: { searchParams: Promise<{ showLost?: string }> }) {
  const cookieStore = await cookies();
  const session = cookieStore.get('zirian_session');
  let userRole = 'Instalador';
  let userId = 0;
  if (session) {
    try {
      const payload = await verifyAuth(session.value);
      userId = payload.id || payload.userId || 0;
      const dbUser = await prisma.user.findUnique({ where: { id: payload.id || payload.userId } });
      userRole = dbUser?.role || payload.role;
    } catch(e){ console.error('PAGE VERIFY AUTH ERROR:', e); }
  }
  const isAdmin = userRole === 'Admin' || userRole === 'SuperAdmin';

  const resolvedParams = await searchParams;
  const showLost = resolvedParams.showLost === 'true';
  console.log('COTIZACIONES PAGE ROLE:', userRole, 'USERID:', userId);
  const allQuotes = await getQuotes(userRole, userId);
  const quotes = showLost ? allQuotes : allQuotes.filter(q => q.status !== 'Rechazada' && q.status !== 'Cancelada' && q.status !== 'Cobrada');

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
            {showLost ? "Ocultar Archivadas" : "Ver Archivadas"}
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
            
            {(isAdmin && (Number(quote.utilidad_real) > 0 || Number(quote.comision_partner) > 0)) && (
              <div className="mt-3 bg-slate-950/80 rounded border border-brand-blue/20 p-2.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <UserCheck className="h-3 w-3 text-brand-blue" />
                  <span className="text-[10px] font-tech font-bold uppercase tracking-widest text-brand-blue">Venta de Distribuidor</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Ganancia Zirian</span>
                    <span className="font-bold text-emerald-400 font-mono">${Number(quote.utilidad_real || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Comisión Dist.</span>
                    <span className="font-bold text-amber-500 font-mono">${Number(quote.comision_partner || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            )}

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






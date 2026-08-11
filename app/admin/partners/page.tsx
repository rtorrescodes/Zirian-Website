import { getPartnersWithMetrics } from '@/app/actions/partners';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Users, DollarSign, Percent, ArrowRight, Building2 } from 'lucide-react';
import { AppShell } from '@/components/panel/app-shell';

export const dynamic = 'force-dynamic';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
}

export default async function PartnersAdminPage() {
  const partners = await getPartnersWithMetrics();

  const grouped = partners.reduce((acc, partner) => {
    const marca = partner.marca || "Otros / Sin Marca";
    if (!acc[marca]) acc[marca] = [];
    acc[marca].push(partner);
    return acc;
  }, {} as Record<string, typeof partners>);

  // Asegurar que BYD sea el primer grupo
  const groupKeys = Object.keys(grouped).sort((a, b) => {
    if (a.toUpperCase() === 'BYD') return -1;
    if (b.toUpperCase() === 'BYD') return 1;
    return a.localeCompare(b);
  });

  return (
    <AppShell title="Comisiones y Referidos" subtitle="Gestiona agencias, vendedores externos y calcula sus comisiones por ventas cerradas.">
      <div className="space-y-8 font-tech">
        <div className="flex justify-end">
          <Button className="bg-brand-blue hover:bg-brand-blue/80 text-slate-950 font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(0,163,255,0.4)]">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Partner
          </Button>
        </div>

        <div className="space-y-12">
          {partners.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center rounded-xl border border-slate-800 bg-slate-900/50 shadow-sm">
              <div className="rounded-full bg-slate-800 p-4 mb-4">
                <Users className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-white uppercase tracking-widest">No hay Partners registrados</h3>
              <p className="text-sm text-slate-400 mt-2 max-w-sm">
                Agrega tu primer vendedor externo o agencia para empezar a rastrear clientes referidos y comisiones.
              </p>
            </div>
          ) : (
            groupKeys.map((marca) => (
              <div key={marca} className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
                  <Building2 className="w-5 h-5 text-brand-blue" />
                  <h2 className="text-xl font-bold text-white uppercase tracking-widest">{marca}</h2>
                  <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full">{grouped[marca].length}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {grouped[marca].map((partner) => (
                    <div key={partner.id} className="rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm overflow-hidden shadow-2xl hover:border-brand-blue/50 transition-all flex flex-col group">
                      <div className="p-6 border-b border-slate-800 flex-1 relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-blue/20 to-transparent"></div>
                        <div className="flex items-start justify-between mb-6">
                          <div>
                            <h3 className="font-bold text-lg text-white group-hover:text-brand-blue transition-colors">{partner.nombre}</h3>
                            <p className="text-xs text-slate-400 mt-1">{partner.email || "Sin correo"}</p>
                          </div>
                          <div className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md text-xs font-bold tracking-widest">
                            <Percent className="h-3 w-3" />
                            {Number(partner.comision_base || 0).toFixed(1)}%
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-sm bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/50">
                            <span className="text-slate-400 flex items-center gap-2 text-xs uppercase tracking-wider font-semibold">
                              <Users className="h-3.5 w-3.5 text-brand-blue" /> Referidos
                            </span>
                            <span className="font-bold text-white">{partner.totalReferidos}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/50">
                            <span className="text-slate-400 flex items-center gap-2 text-xs uppercase tracking-wider font-semibold">
                              <DollarSign className="h-3.5 w-3.5 text-emerald-400" /> Cerrado
                            </span>
                            <span className="font-bold text-white">{formatCurrency(partner.totalVendido)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-slate-950 p-4 flex items-center justify-between border-t border-slate-800 mt-auto">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-500 mb-1">Comisión Estimada</p>
                          <p className="font-bold text-lg text-brand-cyan">{formatCurrency(partner.comisionEstimada)}</p>
                        </div>
                        <Link href={`/admin/partners/${partner.id}`}>
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 font-bold uppercase tracking-widest text-xs">
                            Ver <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}

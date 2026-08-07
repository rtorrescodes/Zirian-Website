import { getPartnersWithMetrics } from '@/app/actions/partners';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Users, DollarSign, Percent, ArrowRight } from 'lucide-react';
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

  return (
    <AppShell title="Comisiones y Referidos" subtitle="Gestiona agencias, vendedores externos y calcula sus comisiones por ventas cerradas.">
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button className="bg-brand-cyan hover:bg-brand-cyan/90">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Partner
          </Button>
        </div>

        <div className="grid gap-6">
          {partners.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center rounded-xl border border-border bg-white shadow-sm">
              <div className="rounded-full bg-slate-100 p-4 mb-4">
                <Users className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No hay Partners registrados</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Agrega tu primer vendedor externo o agencia para empezar a rastrear clientes referidos y comisiones.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {partners.map((partner) => (
                <div key={partner.id} className="rounded-xl border border-border bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <div className="p-5 border-b border-border flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">{partner.nombre}</h3>
                        {partner.marca && (
                          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10 mt-1">
                            {partner.marca}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-brand-green bg-brand-green/10 px-2 py-1 rounded-md text-sm font-medium">
                        <Percent className="h-3 w-3" />
                        {Number(partner.comision_base || 0).toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="space-y-3 mt-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Users className="h-4 w-4" /> Clientes Referidos
                        </span>
                        <span className="font-medium text-foreground">{partner.totalReferidos}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <DollarSign className="h-4 w-4" /> Ventas Cerradas
                        </span>
                        <span className="font-medium text-foreground">{formatCurrency(partner.totalVendido)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 flex items-center justify-between border-t border-border mt-auto">
                    <div>
                      <p className="text-xs text-muted-foreground">Comisión Estimada</p>
                      <p className="font-semibold text-brand-cyan">{formatCurrency(partner.comisionEstimada)}</p>
                    </div>
                    <Link href={`/admin/partners/${partner.id}`}>
                      <Button variant="ghost" size="sm" className="text-slate-600 hover:text-brand-cyan hover:bg-brand-cyan/10">
                        Ver Detalles <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

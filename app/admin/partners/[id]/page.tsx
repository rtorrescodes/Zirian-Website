import { getPartnerDetails } from '@/app/actions/partners';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit2, Mail, Phone, Users, DollarSign, Percent, CheckCircle2 } from 'lucide-react';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
}

export default async function PartnerDetailPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  const partner = await getPartnerDetails(id);

  if (!partner) {
    notFound();
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <Link href="/admin/partners">
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{partner.nombre}</h1>
            {partner.marca && (
              <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                {partner.marca}
              </span>
            )}
            {!partner.activo && (
              <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                Inactivo
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-4">
            {partner.email && (
              <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {partner.email}</span>
            )}
            {partner.telefono && (
              <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {partner.telefono}</span>
            )}
          </p>
        </div>
        <Button variant="outline">
          <Edit2 className="mr-2 h-4 w-4" />
          Editar Partner
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Users className="h-4 w-4" />
            <h3 className="text-sm font-medium">Total de Clientes Referidos</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{partner.clientes.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <DollarSign className="h-4 w-4" />
            <h3 className="text-sm font-medium">Ventas Aprobadas</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{formatCurrency(partner.totalVendidoAprobado)}</p>
        </div>
        <div className="rounded-xl border border-border bg-gradient-to-br from-brand-cyan/10 to-brand-cyan/5 p-5 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10">
            <Percent className="w-24 h-24 text-brand-cyan" />
          </div>
          <div className="flex items-center gap-2 text-brand-cyan mb-2 relative z-10">
            <Percent className="h-4 w-4" />
            <h3 className="text-sm font-medium">Comisión a Pagar ({Number(partner.comision_base || 0)}%)</h3>
          </div>
          <p className="text-3xl font-bold text-brand-cyan relative z-10">{formatCurrency(partner.comisionEstimadaTotal)}</p>
        </div>
      </div>

      {/* Referred Clients List */}
      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border bg-slate-50/50">
          <h3 className="font-semibold text-foreground">Detalle de Clientes Referidos</h3>
        </div>
        
        {partner.clientes.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            Aún no ha referido clientes.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-xs uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Cliente</th>
                  <th className="px-6 py-4 font-medium">Fecha de Alta</th>
                  <th className="px-6 py-4 font-medium">Estatus del Lead</th>
                  <th className="px-6 py-4 font-medium text-right">Cotizaciones Aprobadas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {partner.clientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">{cliente.nombre}</p>
                      {cliente.empresa && <p className="text-xs text-muted-foreground">{cliente.empresa}</p>}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(cliente.fecha_creacion).toLocaleDateString('es-MX')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        cliente.status === 'Cliente' ? 'bg-brand-green/10 text-brand-green ring-brand-green/20' :
                        cliente.status === 'Prospect' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' :
                        'bg-slate-100 text-slate-600 ring-slate-500/10'
                      }`}>
                        {cliente.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {cliente.totalVendidoPorCliente > 0 ? (
                        <div className="flex flex-col items-end">
                          <span className="font-semibold text-foreground">{formatCurrency(cliente.totalVendidoPorCliente)}</span>
                          <span className="text-[10px] text-brand-green flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="h-3 w-3" /> Aprobada
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">Sin ventas aprobadas</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

import { getPartnerDetails } from '@/app/actions/partners';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit2, Mail, Phone, Users, DollarSign, Percent, CheckCircle2 } from 'lucide-react';
import { notFound } from 'next/navigation';
import PartnerQuotesTable from '@/components/partners/PartnerQuotesTable';

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
          <PartnerQuotesTable clients={partner.clientes} />
        )}
      </div>
    </div>
  );
}

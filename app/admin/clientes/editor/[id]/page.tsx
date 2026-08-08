import { getClientById, getClientActivities } from '@/app/actions/clients';
import { ClientEditor } from '@/components/clientes/client-editor';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/panel/app-shell';

export const dynamic = 'force-dynamic';

export default async function EditClientPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = parseInt(params.id, 10);
  const client = await getClientById(id);

  if (!client) {
    notFound();
  }

  const partners = await prisma.partner.findMany({
    where: { activo: true },
    orderBy: { nombre: 'asc' }
  });

  const plainPartners = partners.map(p => ({
    ...p,
    comision_base: p.comision_base ? Number(p.comision_base) : null
  }));

  const rawActivities = await getClientActivities(id);
  const quotes = await prisma.quote.findMany({
    where: { clientId: id },
    orderBy: { fecha_creacion: 'desc' }
  });

  const quoteActivities = quotes.map(q => ({
    id: q.id + 100000,
    tipo: 'Cotización',
    descripcion: `Se generó la cotización #${q.id} por $${Number(q.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
    fecha_actividad: q.fecha_creacion,
    quoteId: q.id
  }));

  const activities = [...rawActivities, ...quoteActivities].sort(
    (a, b) => b.fecha_actividad.getTime() - a.fecha_actividad.getTime()
  );

  return (
    <AppShell title={`Editar Cliente: ${client.nombre}`} subtitle="Actualiza la información del cliente y revisa su historial">
      <div className="py-6">
        <ClientEditor initialData={client} partners={plainPartners} initialActivities={activities} />
      </div>
    </AppShell>
  );
}

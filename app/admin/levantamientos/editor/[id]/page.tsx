import { AppShell } from '@/components/panel/app-shell';
import { ScoutingEditor } from '@/components/levantamientos/scouting-editor';
import { getScoutingReportById } from '@/app/actions/scouting';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EditScoutingPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return notFound();

  const report = await getScoutingReportById(id);
  if (!report) return notFound();

  const clients = await prisma.client.findMany({
    orderBy: { nombre: 'asc' },
    select: { id: true, nombre: true, empresa: true, ubicacion: true, telefono: true }
  });

  return (
    <AppShell title={`Editar Levantamiento LEV-${String(report.id).padStart(4, '0')}`} subtitle="Modifica los detalles de la visita técnica.">
      <ScoutingEditor clients={clients} initialData={report} />
    </AppShell>
  );
}

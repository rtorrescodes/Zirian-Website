import { AppShell } from '@/components/panel/app-shell';
import { ScoutingEditor } from '@/components/levantamientos/scouting-editor';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function NewScoutingPage() {
  const clients = await prisma.client.findMany({
    orderBy: { nombre: 'asc' },
    select: { id: true, nombre: true, empresa: true, ubicacion: true, telefono: true }
  });

  return (
    <AppShell title="Nuevo Levantamiento" subtitle="Programa una inspección técnica para un cliente.">
      <ScoutingEditor clients={clients} />
    </AppShell>
  );
}

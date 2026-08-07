import { ClientEditor } from '@/components/clientes/client-editor';
import { prisma } from '@/lib/prisma';
import { AppShell } from '@/components/panel/app-shell';

export const dynamic = 'force-dynamic';

export default async function NewClientPage() {
  const partners = await prisma.partner.findMany({
    where: { activo: true },
    orderBy: { nombre: 'asc' }
  });

  return (
    <AppShell title="Nuevo Cliente" subtitle="Registra un nuevo lead o prospecto">
      <div className="py-6">
        <ClientEditor partners={partners} />
      </div>
    </AppShell>
  );
}

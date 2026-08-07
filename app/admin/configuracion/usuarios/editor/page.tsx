import { UserEditor } from '@/components/usuarios/user-editor';
import { AppShell } from '@/components/panel/app-shell';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function CreateUserPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("zirian_session");
  
  if (!session) redirect('/admin');

  try {
    const currentUser = await verifyAuth(session.value);
    if (currentUser.role !== 'SuperAdmin') {
      redirect('/admin/configuracion/usuarios');
    }
  } catch (err) {
    redirect('/admin');
  }

  return (
    <AppShell title="Crear Usuario" subtitle="Da de alta a un nuevo miembro del equipo">
      <div className="py-6">
        <UserEditor />
      </div>
    </AppShell>
  );
}

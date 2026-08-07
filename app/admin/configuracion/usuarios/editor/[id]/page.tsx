import { getUserById } from '@/app/actions/users';
import { UserEditor } from '@/components/usuarios/user-editor';
import { notFound, redirect } from 'next/navigation';
import { AppShell } from '@/components/panel/app-shell';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function EditUserPage(props: { params: Promise<{ id: string }> }) {
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

  const params = await props.params;
  const id = parseInt(params.id, 10);
  const user = await getUserById(id);

  if (!user) {
    notFound();
  }

  return (
    <AppShell title={`Editar Usuario: ${user.nombre}`} subtitle="Modifica permisos, acceso o cambia su contraseña">
      <div className="py-6">
        <UserEditor initialData={user} />
      </div>
    </AppShell>
  );
}

import { AppShell } from '@/components/panel/app-shell';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ProfileEditor } from '@/components/usuarios/profile-editor';
import { getUserById } from '@/app/actions/users';

export const dynamic = 'force-dynamic';

export default async function PerfilPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("zirian_session");
  
  if (!session) redirect('/admin');

  let currentUser;
  try {
    currentUser = await verifyAuth(session.value);
  } catch (err) {
    redirect('/admin');
  }

  const dbUser = await getUserById(currentUser.id);
  if (!dbUser) redirect('/admin');

  return (
    <AppShell title="Mi Perfil" subtitle="Actualiza tus datos y cambia tu contraseña" user={currentUser}>
      <div className="py-6">
        <ProfileEditor initialData={dbUser} />
      </div>
    </AppShell>
  );
}

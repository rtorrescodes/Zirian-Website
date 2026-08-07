import { getUsers } from '@/app/actions/users';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Users, Edit2, Shield, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import { AppShell } from '@/components/panel/app-shell';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function UsuariosAdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("zirian_session");
  
  if (!session) {
    redirect('/admin');
  }

  let currentUser;
  try {
    currentUser = await verifyAuth(session.value);
  } catch (err) {
    redirect('/admin');
  }

  // Allow only SuperAdmin to see this page, or maybe Gerente if the user decided so.
  // The user didn't respond to the plan, so I will restrict it to SuperAdmin and Gerente for viewing.
  if (currentUser.role !== 'SuperAdmin' && currentUser.role !== 'Gerente') {
    return (
      <AppShell title="Configuración / Usuarios" subtitle="Acceso Denegado">
        <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl border border-red-500/30 bg-red-950/20 shadow-xl backdrop-blur-sm">
          <ShieldAlert className="h-12 w-12 text-red-500 mb-4 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
          <h3 className="text-xl font-tech font-bold uppercase tracking-widest text-white">Acceso Restringido</h3>
          <p className="text-slate-400 font-tech mt-2">No tienes permisos para ver esta sección.</p>
        </div>
      </AppShell>
    );
  }

  const users = await getUsers();

  return (
    <AppShell title="Configuración / Usuarios" subtitle="Administra los accesos y roles del sistema.">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-tech font-bold uppercase tracking-widest text-white">Directorio de Usuarios</h2>
            <p className="text-sm font-tech text-slate-400">{users.length} usuarios registrados en el sistema</p>
          </div>
          {currentUser.role === 'SuperAdmin' && (
            <Link href="/admin/configuracion/usuarios/editor">
              <Button className="bg-brand-blue hover:bg-brand-blue/80 text-white font-tech uppercase tracking-wider font-bold shadow-[0_0_15px_rgba(0,163,255,0.4)] transition-all">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Usuario
              </Button>
            </Link>
          )}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-slate-950/40 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Rol / Permisos</th>
                  <th className="px-6 py-4 text-center">Estatus</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-950/20 transition duration-150">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-white flex items-center gap-2">
                          {u.nombre}
                          {u.id === currentUser.id && (
                            <span className="text-[10px] bg-brand-blue/20 border border-brand-blue/30 text-brand-blue px-2 py-0.5 rounded-full font-tech font-bold uppercase">TÚ</span>
                          )}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 font-tech">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Shield className={`h-4 w-4 ${u.role === 'SuperAdmin' ? 'text-purple-400' : u.role === 'Gerente' ? 'text-brand-blue' : 'text-slate-400'}`} />
                        <span className={`font-tech font-bold text-[11px] uppercase tracking-wider ${u.role === 'SuperAdmin' ? 'text-purple-300' : u.role === 'Gerente' ? 'text-brand-blue' : 'text-slate-400'}`}>
                          {u.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {u.activo ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-md text-[10px] font-tech font-bold uppercase tracking-wider">
                          <CheckCircle className="h-3 w-3" /> Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-400 bg-red-950/60 border border-red-500/30 px-2.5 py-1 rounded-md text-[10px] font-tech font-bold uppercase tracking-wider">
                          <XCircle className="h-3 w-3" /> Suspendido
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {currentUser.role === 'SuperAdmin' && (
                        <Link href={`/admin/configuracion/usuarios/editor/${u.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 transition-colors" title="Editar Usuario">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

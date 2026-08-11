import { getScoutingReports } from '@/app/actions/scouting';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Map, Calendar, User as UserIcon, Edit2, AlertCircle } from 'lucide-react';
import { AppShell } from '@/components/panel/app-shell';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export default async function LevantamientosAdminPage(props: { searchParams?: Promise<{ q?: string; status?: string }> }) {
  const searchParams = await props.searchParams;
  const query = searchParams?.q || '';
  const statusFilter = searchParams?.status || 'all';

  const reports = await getScoutingReports(query, statusFilter);

  return (
    <AppShell title="Levantamientos (Scouting)" subtitle="Programa y gestiona las visitas técnicas de inspección.">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-tech text-xl font-bold uppercase tracking-widest text-white">Directorio de Visitas</h2>
            <p className="font-tech text-sm text-slate-400">{reports.length} reportes registrados</p>
          </div>
          <Link href="/admin/levantamientos/editor">
            <Button className="bg-brand-blue hover:bg-brand-blue/80 text-slate-950 hover:bg-brand-cyan font-tech uppercase tracking-wider font-bold shadow-[0_0_15px_rgba(0,163,255,0.4)] transition-all">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Levantamiento
            </Button>
          </Link>
        </div>

        {/* Filtros simples por ahora */}
        <div className="flex items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800 shadow-md backdrop-blur-sm">
          <p className="text-sm text-slate-400 font-tech uppercase tracking-widest">Filtros próximamente...</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl backdrop-blur-sm">
          {reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="rounded-full bg-slate-950/80 p-4 mb-4 border border-slate-800 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                <Map className="h-8 w-8 text-brand-blue drop-shadow-[0_0_8px_rgba(0,163,255,0.8)]" />
              </div>
              <h3 className="text-lg font-tech uppercase tracking-widest font-bold text-white">No hay levantamientos aún</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-sm">
                Comienza programando tu primera visita técnica a un prospecto.
              </p>
              <Link href="/admin/levantamientos/editor" className="mt-6">
                <Button className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-tech uppercase tracking-wider">Programar Visita</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-slate-950/40 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">ID / Cliente</th>
                    <th className="px-6 py-4">Fecha Programada</th>
                    <th className="px-6 py-4">Técnico Asignado</th>
                    <th className="px-6 py-4">Detalles</th>
                    <th className="px-6 py-4">Estatus</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-950/20 transition duration-150">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-mono text-[10px] text-brand-blue">LEV-{String(report.id).padStart(4, '0')}</p>
                          <p className="font-semibold text-white mt-0.5">{report.client.nombre}</p>
                          {report.client.empresa && <p className="text-xs text-slate-400">{report.client.empresa}</p>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-300">
                          <Calendar className="h-4 w-4 text-slate-500" />
                          <span>
                            {new Date(report.fecha_visita).toLocaleDateString('es-MX', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-300">
                          <UserIcon className="h-4 w-4 text-slate-500" />
                          <span>{report.tecnico || 'Sin asignar'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-400 flex flex-col gap-1">
                          {report.distancia_cable && (
                            <span className="font-tech">
                              <span className="text-slate-500">Cable:</span> {Number(report.distancia_cable)}m
                            </span>
                          )}
                          {report.tipo_conexion && (
                            <span className="font-tech">
                              <span className="text-slate-500">Conexión:</span> {report.tipo_conexion}
                            </span>
                          )}
                          {!report.distancia_cable && !report.tipo_conexion && (
                            <span>-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-[10px] font-bold font-tech uppercase tracking-wider border ${
                          report.status === 'Completado' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50' :
                          report.status === 'Programado' ? 'bg-brand-blue/10 text-brand-blue border-brand-blue/30' :
                          report.status === 'En Progreso' ? 'bg-amber-950/40 text-amber-400 border-amber-900/50' :
                          'bg-slate-800/50 text-slate-300 border-slate-700'
                        }`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/levantamientos/editor/${report.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 transition-colors">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

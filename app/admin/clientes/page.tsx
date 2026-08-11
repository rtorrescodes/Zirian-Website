import { getClients } from '@/app/actions/clients';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Users, Edit2, FileText, Phone, Mail, MapPin } from 'lucide-react';
import { AppShell } from '@/components/panel/app-shell';
import { ClientFilters } from '@/components/clientes/client-filters';
import { ClickableRow } from '@/components/ui/clickable-row';
import { DeleteClientButton } from '@/components/clientes/delete-client-button';

export const dynamic = 'force-dynamic';

export default async function ClientesAdminPage(props: { searchParams?: Promise<{ q?: string; status?: string; origen?: string; tipo?: string; ciudad?: string }> }) {
  const searchParams = await props.searchParams;
  const query = searchParams?.q || '';
  const statusFilter = searchParams?.status || 'all';
  const origenFilter = searchParams?.origen || 'all';
  const tipoFilter = searchParams?.tipo || 'all';
  const ciudadFilter = searchParams?.ciudad || 'all';

  const clients = await getClients(query, statusFilter, origenFilter, tipoFilter, ciudadFilter);

  return (
    <AppShell title="CRM / Clientes" subtitle="Gestiona tus prospectos y clientes, y genera cotizaciones al instante.">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-tech text-xl font-bold uppercase tracking-widest text-white">Directorio de Contactos</h2>
            <p className="font-tech text-sm text-slate-400">{clients.length} registros encontrados</p>
          </div>
          <Link href="/admin/clientes/editor">
            <Button className="bg-brand-blue hover:bg-brand-cyan text-slate-950 font-tech uppercase tracking-wider font-bold shadow-[0_0_15px_rgba(0,163,255,0.4)] transition-all">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Lead
            </Button>
          </Link>
        </div>

        <ClientFilters />

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl backdrop-blur-sm">
          {clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="rounded-full bg-slate-950/80 p-4 mb-4 border border-slate-800 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                <Users className="h-8 w-8 text-brand-blue drop-shadow-[0_0_8px_rgba(0,163,255,0.8)]" />
              </div>
              <h3 className="text-lg font-tech uppercase tracking-widest font-bold text-white">No hay clientes aún</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-sm">
                Comienza registrando tu primer lead o prospecto.
              </p>
              <Link href="/admin/clientes/editor" className="mt-6">
                <Button className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-tech uppercase tracking-wider">Registrar Cliente</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-slate-950/40 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Cliente / Contacto</th>
                    <th className="px-6 py-4">Tipo / Ubicación</th>
                    <th className="px-6 py-4">Origen / Partner</th>
                    <th className="px-6 py-4">Estatus</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {clients.map((client) => (
                    <ClickableRow key={client.id} href={`/admin/clientes/editor/${client.id}`} className="hover:bg-slate-950/20 transition duration-150">
                      <td className="px-6 py-4">
                        <div>
                          {client.empresa ? (
                            <>
                              <p className="font-bold text-white uppercase tracking-wider font-tech">{client.empresa}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{client.nombre}</p>
                            </>
                          ) : (
                            <p className="font-semibold text-white">{client.nombre}</p>
                          )}
                          <div className="flex flex-col gap-0.5 mt-2">
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-tech">
                              <Phone className="h-3 w-3" /> {client.telefono}
                            </span>
                            {client.email && (
                              <span className="text-[10px] text-slate-400 flex items-center gap-1 font-tech">
                                <Mail className="h-3 w-3" /> {client.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-400">
                          <p className="font-medium text-white mb-1">{client.tipo_instalacion || 'Sin Tipo Especificado'}</p>
                          {client.marca_ev && <p className="text-slate-400 mb-1">EV: {client.marca_ev}</p>}
                          {client.ubicacion && (
                            <div className="flex flex-col gap-1 mt-1">
                              {client.ciudad && <p className="text-slate-300 font-bold">{client.ciudad}</p>}
                              <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(client.ubicacion)}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-brand-blue hover:text-brand-cyan hover:underline transition"
                              >
                                <MapPin className="h-3 w-3" /> Ver Mapa
                              </a>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs">
                          <p className="font-medium text-slate-300">{client.origen}</p>
                          {client.partner && (
                            <span className="inline-flex items-center rounded-md bg-brand-blue/15 border border-brand-blue/30 px-1.5 py-0.5 mt-1 text-[10px] font-bold text-brand-blue font-tech uppercase tracking-wider">
                              {client.partner.nombre}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-[10px] font-bold font-tech uppercase tracking-wider border ${
                          client.status === 'Cliente' ? 'bg-brand-green/10 text-brand-green border-brand-green/30' :
                          client.status === 'Prospect' ? 'bg-brand-blue/10 text-brand-blue border-brand-blue/30' :
                          'bg-slate-800/50 text-slate-300 border-slate-700'
                        }`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/cotizador?clientId=${client.id}`}>
                            <Button size="sm" className="h-8 bg-brand-blue/10 text-brand-blue hover:text-slate-950 hover:bg-brand-blue border border-brand-blue/30 transition-all font-tech font-bold uppercase text-[10px] tracking-wider">
                              <FileText className="h-3.5 w-3.5 mr-1.5" />
                              Cotizar
                            </Button>
                          </Link>
                          <Link href={`/admin/clientes/editor/${client.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 transition-colors">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </Link>
                          <DeleteClientButton clientId={client.id} clientName={client.nombre} />
                        </div>
                      </td>
                    </ClickableRow>
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

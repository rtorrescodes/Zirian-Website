import { getTechnicianTasks } from '@/app/actions/field';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, CalendarClock, ChevronRight, ClipboardList } from 'lucide-react';
import { currencyExact } from '@/components/cotizador/quote-builder'; // we can just reuse formatting if needed, but not strictly required. Let's just do a basic dashboard.

export const dynamic = 'force-dynamic';

export default async function TechnicianDashboard() {
  const { scoutingReports, serviceOrders } = await getTechnicianTasks();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Mis Tareas de Hoy</h1>
        <p className="text-sm text-muted-foreground">Tienes {scoutingReports.length + serviceOrders.length} tareas pendientes.</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <ClipboardList className="h-4 w-4" />
          Scoutings ({scoutingReports.length})
        </h2>
        
        {scoutingReports.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-transparent py-8 text-center text-sm text-muted-foreground">
            No hay scoutings pendientes.
          </div>
        ) : (
          <ul className="space-y-3">
            {scoutingReports.map(report => (
              <li key={report.id}>
                <Link href={`/tecnico/scouting/${report.id}`}>
                  <Card className="group relative overflow-hidden p-4 transition-all hover:border-brand-cyan/40 active:bg-secondary/40">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">Scouting</Badge>
                          <span className="text-xs font-medium text-muted-foreground">{new Date(report.fecha_visita).toLocaleDateString('es-MX')}</span>
                        </div>
                        <h3 className="mt-2 truncate font-medium text-foreground">{report.client.nombre}</h3>
                        <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {report.client.ubicacion || 'Sin ubicación'}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </div>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <CalendarClock className="h-4 w-4" />
          Instalaciones ({serviceOrders.length})
        </h2>
        
        {serviceOrders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-transparent py-8 text-center text-sm text-muted-foreground">
            No hay instalaciones pendientes.
          </div>
        ) : (
          <ul className="space-y-3">
            {serviceOrders.map(order => (
              <li key={order.id}>
                <Link href={`/tecnico/orden/${order.id}`}>
                  <Card className="group relative overflow-hidden p-4 transition-all hover:border-brand-cyan/40 active:bg-secondary/40">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-brand-green/30 bg-brand-green/10 text-brand-green">Instalación</Badge>
                          <span className="text-xs font-medium text-muted-foreground">
                            {order.fecha_programada ? new Date(order.fecha_programada).toLocaleDateString('es-MX') : 'Por programar'}
                          </span>
                        </div>
                        <h3 className="mt-2 truncate font-medium text-foreground">{order.quote?.client?.nombre}</h3>
                        <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {order.quote?.client?.ubicacion || 'Sin ubicación'}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </div>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

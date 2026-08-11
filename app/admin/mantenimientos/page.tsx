'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wrench, Settings, Plus, CalendarIcon, CheckCircle2 } from 'lucide-react'
import { createMaintenanceOrder, getMaintenanceCandidates } from '@/app/actions/calendar'
import { AppShell } from "@/components/panel/app-shell"
import Link from 'next/link'

export default function MantenimientosPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [successMsg, setSuccessMsg] = useState('')

  const fetchMantenimientos = async () => {
    try {
      const candidates = await getMaintenanceCandidates()
      setOrders(candidates)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMantenimientos()
  }, [])

  const handleProgramar = async (clientId: number, clientName: string) => {
    try {
      await createMaintenanceOrder(clientId, 'Mantenimiento', `Mantenimiento Programado para ${clientName}`);
      setSuccessMsg(`Orden de mantenimiento creada para ${clientName}. Ve a Calendario para agendarla.`);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (e) {
      console.error(e);
      alert('Error al crear el mantenimiento.');
    }
  }

  return (
    <AppShell title="Mantenimientos" subtitle="Programa mantenimientos preventivos y genera órdenes técnicas.">
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            {successMsg && (
              <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-lg font-tech text-sm tracking-wider uppercase border border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5" />
                {successMsg}
              </div>
            )}
          </div>
          <Link href="/admin/calendario">
            <Button className="bg-brand-blue hover:bg-brand-blue/80 text-slate-950 font-tech font-bold uppercase tracking-wider">
              <CalendarIcon className="w-4 h-4 mr-2" /> Ver Calendario
            </Button>
          </Link>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-slate-500 col-span-full">Cargando inventario de pólizas...</p>
        ) : orders.length === 0 ? (
          <p className="text-slate-500 col-span-full">No hay mantenimientos candidatos en este momento.</p>
        ) : (
          orders.map(order => (
            <Card key={order.id} className="border-slate-800 bg-slate-900/60 hover:bg-slate-900 transition-colors">
              <CardHeader className="pb-2 border-b border-slate-800/50">
                <CardTitle className="text-lg font-bold text-slate-200 flex items-center justify-between">
                  {order.clientName}
                  {order.status === 'Requiere Revisión' ? (
                    <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30">Revisión</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">Activo</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300 capitalize">
                    {order.type === 'ev_charger' ? 'Instalación Cargador EV' : 
                     order.type === 'savant_home' ? 'Domótica Savant' : 
                     order.type.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-6">
                  <CalendarIcon className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-400">Último servicio: {order.lastService}</span>
                </div>
                
                <Button onClick={() => handleProgramar(order.clientId, order.clientName)} className="w-full bg-brand-green hover:bg-brand-greenDark text-brand-dark font-tech font-bold uppercase tracking-wider transition-colors">
                  <Wrench className="w-4 h-4 mr-2" /> Programar Mantenimiento
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
    </AppShell>
  )
}

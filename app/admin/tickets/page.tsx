'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { LifeBuoy, AlertCircle, CheckCircle, Clock, ExternalLink, CalendarPlus } from 'lucide-react'
import { createMaintenanceOrder } from '@/app/actions/calendar'
import { AppShell } from "@/components/panel/app-shell"

export default function TicketsPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/tickets')
      if (res.ok) {
        setTickets(await res.json())
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch('/api/tickets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })
      if (res.ok) {
        fetchTickets()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleEscalate = async (ticket: any) => {
    // If ticket doesn't have a clientId, we might need a fallback, but for now we pass a dummy ID (1) if missing
    // In production, we'd link tickets to Client entities.
    const clientId = ticket.clientId || 1; 
    try {
      await createMaintenanceOrder(clientId, 'Soporte', `Escalado desde Ticket #${ticket.id}: ${ticket.descripcion}`);
      alert('¡Orden de Soporte creada y enviada a Por Agendar en el Calendario!');
      await updateStatus(ticket.id, 'Resuelto');
    } catch (error) {
      console.error(error);
      alert('Error al escalar.');
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Abierto': return <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30"><AlertCircle className="w-3 h-3 mr-1"/> Abierto</Badge>
      case 'En Revisión': return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30"><Clock className="w-3 h-3 mr-1"/> En Revisión</Badge>
      case 'Resuelto': return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"><CheckCircle className="w-3 h-3 mr-1"/> Resuelto</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <AppShell title="Tickets de Soporte" subtitle="Gestiona reportes de garantías, fallas y solicitudes de clientes.">
      <div className="p-6">

      {loading ? (
        <p className="text-slate-500">Cargando tickets...</p>
      ) : tickets.length === 0 ? (
        <Card className="border-slate-800 bg-slate-900/50">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <CheckCircle className="w-12 h-12 text-emerald-500/50 mb-4" />
            <h3 className="text-xl font-bold text-slate-300">Bandeja Limpia</h3>
            <p className="text-slate-500">No hay tickets de soporte activos en este momento.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tickets.map(ticket => (
            <Card key={ticket.id} className="border-slate-800 bg-slate-900/60 hover:bg-slate-900 transition-colors">
              <CardContent className="p-5 flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusBadge(ticket.status)}
                    <span className="text-xs text-slate-500">Folio: {ticket.folio_cliente || 'N/A'}</span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-500">{new Date(ticket.fecha_creacion).toLocaleString('es-MX')}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-200 mb-1">{ticket.nombre_cliente}</h3>
                  <p className="text-sm text-slate-400 whitespace-pre-wrap">{ticket.descripcion}</p>
                </div>
                
                <div className="flex flex-col gap-2 min-w-[200px] border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 justify-center">
                  {ticket.foto_path && (
                    <Button variant="outline" size="sm" className="w-full justify-start border-slate-700 bg-slate-950 text-slate-300 hover:text-brand-blue" asChild>
                      <a href={ticket.foto_path} target="_blank" rel="noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" /> Ver Foto Adjunta
                      </a>
                    </Button>
                  )}
                  
                  {ticket.status !== 'Resuelto' && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" className="w-full justify-start bg-brand-blue hover:bg-brand-blue/90 text-white font-tech uppercase tracking-wider">
                          Actualizar Estatus
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="border-slate-800 bg-slate-950">
                        <DialogHeader>
                          <DialogTitle className="font-tech text-slate-200 uppercase">Cambiar Estatus del Ticket</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col gap-3 mt-4">
                          {ticket.status !== 'Abierto' && (
                            <Button variant="outline" onClick={() => updateStatus(ticket.id, 'Abierto')} className="border-slate-700 bg-slate-900 text-slate-300">Marcar como Abierto</Button>
                          )}
                          {ticket.status !== 'En Revisión' && (
                            <Button variant="outline" onClick={() => updateStatus(ticket.id, 'En Revisión')} className="border-yellow-900/50 bg-yellow-950/20 text-yellow-500 hover:bg-yellow-900/40">Marcar En Revisión</Button>
                          )}
                          <Button variant="outline" onClick={() => updateStatus(ticket.id, 'Resuelto')} className="border-emerald-900/50 bg-emerald-950/20 text-emerald-500 hover:bg-emerald-900/40">Marcar Resuelto</Button>
                          <hr className="border-slate-800 my-2" />
                          <Button variant="outline" onClick={() => handleEscalate(ticket)} className="border-brand-blue/50 bg-brand-blue/10 text-brand-blue hover:bg-brand-blue hover:text-white transition-colors">
                            <CalendarPlus className="w-4 h-4 mr-2" /> Escalar a Orden Física
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
    </AppShell>
  )
}

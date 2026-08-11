'use client'

import { useState, useEffect } from 'react'
import { getCalendarEvents, getUnscheduledOrders, scheduleServiceOrder, CalendarEvent } from '@/app/actions/calendar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CalendarIcon, Clock, MapPin, Search, Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'
import { AppShell } from "@/components/panel/app-shell"

export default function CalendarPage() {
  const router = useRouter()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [unscheduled, setUnscheduled] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('09:00')
  const [isScheduling, setIsScheduling] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    const [evs, unsched] = await Promise.all([
      getCalendarEvents(),
      getUnscheduledOrders()
    ])
    // Sort events chronologically
    setEvents(evs.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()))
    setUnscheduled(unsched)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrder || !scheduleDate) return
    setIsScheduling(true)
    
    // Create Date object from date and time strings
    const datetime = new Date(`${scheduleDate}T${scheduleTime}`)
    
    await scheduleServiceOrder(selectedOrder, datetime)
    
    setSelectedOrder(null)
    setScheduleDate('')
    setIsScheduling(false)
    fetchData() // Refresh
  }

  // Group events by day
  const groupedEvents = events.reduce((acc, event) => {
    const day = new Date(event.start).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    if (!acc[day]) acc[day] = []
    acc[day].push(event)
    return acc
  }, {} as Record<string, CalendarEvent[]>)

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'visita': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'scouting': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'instalacion': return 'bg-brand-blue/20 text-brand-blue border-brand-blue/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  return (
    <AppShell title="Calendario de Operaciones" subtitle="Gestiona visitas iniciales, levantamientos e instalaciones.">
      <div className="p-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
          <h1 className="font-tech text-3xl font-bold uppercase tracking-wider text-slate-100">
            Calendario de Operaciones
          </h1>
          <p className="mt-2 text-slate-400">
            Gestiona visitas iniciales, levantamientos técnicos e instalaciones.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Sidebar: Por Agendar */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm h-full">
            <CardHeader className="border-b border-slate-800 bg-slate-900/80">
              <CardTitle className="font-tech text-sm uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-400" />
                Órdenes por Agendar
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {loading ? (
                <p className="text-slate-500 text-sm">Cargando...</p>
              ) : unscheduled.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">No hay órdenes pendientes de agendar.</p>
              ) : (
                unscheduled.map(order => (
                  <div key={order.id} className="p-3 rounded-lg border border-slate-800 bg-slate-950 hover:border-slate-700 transition-colors">
                    <p className="font-bold text-slate-200 text-sm">{order.clientName}</p>
                    <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider mt-1">
                      {order.template === 'ev_charger' ? 'Instalación Cargador EV' : 
                       order.template === 'savant_home' ? 'Domótica Savant' : 
                       order.template}
                    </p>
                    
                    <Dialog>
                      <DialogTrigger>
                        <Button 
                          size="sm" 
                          onClick={() => setSelectedOrder(order.id)}
                          className="w-full h-8 bg-brand-green hover:bg-brand-greenDark text-brand-dark font-tech font-black text-xs uppercase tracking-wider"
                        >
                          <CalendarIcon className="w-3 h-3 mr-2" /> Agendar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="border-slate-800 bg-slate-950 sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="font-tech text-brand-blue uppercase tracking-wider">
                            Agendar Instalación
                          </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSchedule} className="space-y-4 mt-4">
                          <div>
                            <p className="text-sm text-slate-400 mb-2">Cliente: <strong className="text-slate-200">{order.clientName}</strong></p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-xs text-slate-400 uppercase tracking-wider">Fecha</label>
                              <Input 
                                type="date" 
                                required
                                value={scheduleDate}
                                onChange={e => setScheduleDate(e.target.value)}
                                className="border-slate-800 bg-slate-900 text-slate-200"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs text-slate-400 uppercase tracking-wider">Hora</label>
                              <Input 
                                type="time" 
                                required
                                value={scheduleTime}
                                onChange={e => setScheduleTime(e.target.value)}
                                className="border-slate-800 bg-slate-900 text-slate-200"
                              />
                            </div>
                          </div>
                          <Button type="submit" disabled={isScheduling} className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white">
                            {isScheduling ? 'Guardando...' : 'Confirmar Fecha'}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content: Agenda */}
        <div className="lg:col-span-3">
          <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm min-h-[600px]">
            <CardHeader className="border-b border-slate-800 bg-slate-900/80 flex flex-row items-center justify-between">
              <CardTitle className="font-tech text-sm uppercase tracking-wider text-slate-300">
                Agenda Próxima
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <p className="text-slate-500 text-center py-10">Cargando agenda...</p>
              ) : Object.keys(groupedEvents).length === 0 ? (
                <div className="text-center py-20">
                  <CalendarIcon className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-400 font-tech uppercase tracking-wider">Tu agenda está limpia</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(groupedEvents).map(([day, dayEvents]) => (
                    <div key={day} className="relative">
                      {/* Day Header */}
                      <h3 className="sticky top-0 z-10 py-2 bg-slate-900/95 backdrop-blur-md font-bold text-slate-200 capitalize border-b border-slate-800 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-brand-blue"></div>
                        {day}
                      </h3>
                      
                      {/* Events List */}
                      <div className="space-y-3 pl-4 border-l-2 border-slate-800 ml-1">
                        {dayEvents.map(event => (
                          <div key={event.id} className="relative pl-6">
                            {/* Timeline Dot */}
                            <div className="absolute -left-[5px] top-4 w-2 h-2 rounded-full bg-slate-600"></div>
                            
                            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 hover:bg-slate-900 transition-colors group">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-bold text-slate-300">
                                      {new Date(event.start).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <Badge variant="outline" className={getTypeColor(event.type)}>
                                      {event.type.toUpperCase()}
                                    </Badge>
                                  </div>
                                  <p className="font-medium text-slate-200">{event.title}</p>
                                  {event.technician && (
                                    <p className="text-xs text-slate-500 mt-1">Técnico: {event.technician}</p>
                                  )}
                                </div>
                                
                                <div>
                                  <Button variant="outline" size="sm" className="border-slate-700 text-slate-400 hover:text-white h-8 text-xs font-tech tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                                    Ver Detalles
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
    </AppShell>
  )
}

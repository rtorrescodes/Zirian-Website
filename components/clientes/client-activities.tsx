'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, FileText, Plus, Loader2, Calculator } from 'lucide-react';
import { createClientActivity } from '@/app/actions/clients';

interface Activity {
  id: number;
  tipo: string;
  descripcion: string;
  fecha_actividad: Date;
  quoteId?: number;
  url?: string | null;
}

export function ClientActivities({ clientId, initialActivities }: { clientId: number, initialActivities: Activity[] }) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities || []);
  const [tipo, setTipo] = useState('Llamada');
  const [descripcion, setDescripcion] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion.trim()) return;
    
    setIsSaving(true);
    try {
      const newActivity = await createClientActivity({
        clientId,
        tipo,
        descripcion
      });
      setActivities([newActivity, ...activities]);
      setDescripcion('');
    } catch (error) {
      console.error('Error adding activity:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'Llamada': return <Phone className="h-4 w-4" />;
      case 'Correo': return <Mail className="h-4 w-4" />;
      case 'Visita': return <MapPin className="h-4 w-4" />;
      case 'Cotización': return <Calculator className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getColor = (tipo: string) => {
    switch (tipo) {
      case 'Llamada': return 'bg-blue-900/50 text-blue-400 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.3)]';
      case 'Correo': return 'bg-purple-900/50 text-purple-400 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.3)]';
      case 'Visita': return 'bg-emerald-900/50 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]';
      case 'Cotización': return 'bg-amber-900/50 text-amber-400 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]';
      default: return 'bg-slate-800 text-slate-300 border-slate-600 shadow-none';
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-sm mt-8">
      <h3 className="font-tech text-lg font-bold uppercase tracking-widest text-white border-b border-slate-800 pb-4 mb-6">Bitácora de Seguimiento</h3>
      
      {/* Añadir Actividad */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-4 bg-slate-950/40 p-5 rounded-xl border border-slate-800/80 shadow-inner">
        <div className="flex flex-col sm:flex-row gap-4">
          <select 
            value={tipo} 
            onChange={(e) => setTipo(e.target.value)}
            className="h-10 rounded-md border border-slate-700 bg-slate-900 text-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
          >
            <option value="Llamada">Llamada</option>
            <option value="Correo">Correo Electrónico</option>
            <option value="Visita">Visita / Scouting</option>
            <option value="Nota">Nota General</option>
          </select>
          
          <Textarea 
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Resumen de la interacción..."
            className="flex-1 min-h-[40px] resize-none bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-brand-blue"
            required
          />
          
          <Button type="submit" disabled={isSaving} className="sm:w-auto h-10 self-end bg-brand-blue hover:bg-brand-blue/80 text-slate-950 hover:bg-brand-cyan font-tech font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(0,163,255,0.3)] transition-all">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            Agregar
          </Button>
        </div>
      </form>

      {/* Timeline */}
      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
        {activities.length === 0 ? (
          <p className="text-center text-sm font-tech text-slate-500 py-8 relative z-10">No hay actividades registradas aún.</p>
        ) : (
          activities.map((act) => (
            <div key={act.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 bg-slate-900 ${getColor(act.tipo)} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10`}>
                {getIcon(act.tipo)}
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-950/60 p-4 rounded-xl border border-slate-800 shadow-md relative z-10 hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-tech font-bold text-[11px] uppercase tracking-wider text-white bg-slate-800 px-2 py-0.5 rounded">{act.tipo}</span>
                  <span className="text-[10px] font-tech text-slate-400" suppressHydrationWarning>
                    {new Date(act.fecha_actividad).toLocaleDateString()} {new Date(act.fecha_actividad).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{act.descripcion}</p>
                {act.url && (
                  <a href={act.url} className="mt-3 inline-flex items-center text-[10px] font-bold font-tech uppercase tracking-widest text-brand-blue hover:text-brand-cyan hover:underline transition-all">
                    Abrir Enlace →
                  </a>
                )}
                {!act.url && act.quoteId && (
                  <a href={`/admin/cotizador?editId=${act.quoteId}`} className="mt-3 inline-flex items-center text-[10px] font-bold font-tech uppercase tracking-widest text-brand-blue hover:text-brand-cyan hover:underline transition-all">
                    Abrir Cotización →
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

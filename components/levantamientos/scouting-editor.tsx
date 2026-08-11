'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, Loader2, ArrowLeft, Camera } from 'lucide-react';
import Link from 'next/link';
import { createScoutingReport, updateScoutingReport } from '@/app/actions/scouting';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ScoutingEditorProps {
  initialData?: any;
  clients: any[];
}

export function ScoutingEditor({ initialData, clients }: ScoutingEditorProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    clientId: initialData?.clientId?.toString() || '',
    tecnico: initialData?.tecnico || '',
    fecha_visita: initialData?.fecha_visita 
      ? new Date(initialData.fecha_visita).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    distancia_cable: initialData?.distancia_cable || '',
    tipo_conexion: initialData?.tipo_conexion || '',
    notas: initialData?.notas || '',
    status: initialData?.status || 'Programado'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const dataToSubmit = {
        ...formData,
        clientId: parseInt(formData.clientId, 10),
        distancia_cable: formData.distancia_cable ? parseFloat(formData.distancia_cable) : undefined,
        fecha_visita: new Date(formData.fecha_visita + 'T00:00:00')
      };

      if (initialData?.id) {
        await updateScoutingReport(initialData.id, dataToSubmit);
      } else {
        await createScoutingReport(dataToSubmit);
      }
      router.push('/admin/levantamientos');
    } catch (error) {
      console.error('Error saving scouting report:', error);
      alert('Hubo un error al guardar. Revisa la consola.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <Link href="/admin/levantamientos">
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-tech font-bold uppercase tracking-widest text-white">
            {initialData ? 'Editar Levantamiento' : 'Programar Levantamiento'}
          </h1>
          <p className="text-sm font-tech text-slate-400">Registra los detalles técnicos de la visita.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Columna Izquierda - Datos Principales */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-xl backdrop-blur-sm">
              <h3 className="font-tech text-sm font-bold uppercase tracking-widest text-brand-blue border-b border-slate-800 pb-3">Información General</h3>
              
              <div className="space-y-2">
                <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Cliente *</label>
                <Select name="clientId" value={formData.clientId} onValueChange={(v) => setFormData(p => ({ ...p, clientId: v }))} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un cliente..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Selecciona un cliente...</SelectItem>
                    {clients.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.nombre} {c.empresa ? `(${c.empresa})` : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Fecha de Visita *</label>
                  <Input type="date" name="fecha_visita" value={formData.fecha_visita} onChange={handleChange} required className="" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Técnico Asignado</label>
                  <Input name="tecnico" value={formData.tecnico} onChange={handleChange} placeholder="Nombre del técnico" className="" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Estatus</label>
                <Select name="status" value={formData.status} onValueChange={(v) => setFormData(p => ({ ...p, status: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estatus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Programado">Programado</SelectItem>
                    <SelectItem value="En Progreso">En Progreso</SelectItem>
                    <SelectItem value="Completado">Completado</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-xl backdrop-blur-sm">
              <h3 className="font-tech text-sm font-bold uppercase tracking-widest text-brand-blue border-b border-slate-800 pb-3">Detalles Técnicos</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Distancia Cable (m)</label>
                  <Input type="number" step="0.1" name="distancia_cable" value={formData.distancia_cable} onChange={handleChange} placeholder="Ej. 15.5" className="" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Tipo de Conexión</label>
                  <Select name="tipo_conexion" value={formData.tipo_conexion} onValueChange={(v) => setFormData(p => ({ ...p, tipo_conexion: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="No especificado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No especificado</SelectItem>
                      <SelectItem value="Monofásica">Monofásica</SelectItem>
                      <SelectItem value="Bifásica">Bifásica</SelectItem>
                      <SelectItem value="Trifásica">Trifásica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Notas / Observaciones</label>
                <Textarea name="notas" value={formData.notas} onChange={handleChange} placeholder="Detalles sobre la instalación, problemas encontrados, etc." className=" min-h-[100px]" />
              </div>
            </div>
          </div>

          {/* Columna Derecha - Evidencia y Extras */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-xl backdrop-blur-sm">
              <h3 className="font-tech text-sm font-bold uppercase tracking-widest text-brand-blue border-b border-slate-800 pb-3 flex justify-between items-center">
                Evidencia Fotográfica
                <Camera className="h-4 w-4 text-slate-500" />
              </h3>
              
              <div className="py-8 text-center border-2 border-dashed border-slate-700 rounded-xl bg-slate-950/40">
                <p className="text-sm font-tech text-slate-400">Sube fotos del área de instalación o posibles problemas.</p>
                <Button type="button" disabled variant="outline" className="mt-4 border-slate-700 bg-slate-900 text-slate-500 font-tech uppercase tracking-widest">
                  Próximamente
                </Button>
                <p className="text-[10px] text-slate-500 mt-2">La subida de archivos requiere integración con S3 / Supabase Storage</p>
              </div>
            </div>

            <Button type="submit" disabled={isSaving} className="w-full bg-brand-blue hover:bg-brand-blue/80 text-slate-950 hover:bg-brand-cyan h-12 font-tech font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(0,163,255,0.4)] transition-all">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {initialData ? 'Guardar Cambios' : 'Crear Levantamiento'}
            </Button>
          </div>

        </div>
      </form>
    </div>
  );
}

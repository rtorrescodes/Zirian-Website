'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createClient, updateClient } from '@/app/actions/clients';
import { ClientActivities } from './client-activities';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ClientEditorProps {
  initialData?: any;
  partners: any[];
  initialActivities?: any[];
}

export function ClientEditor({ initialData, partners, initialActivities = [] }: ClientEditorProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || '',
    empresa: initialData?.empresa || '',
    telefono: initialData?.telefono || '',
    email: initialData?.email || '',
    marca_ev: initialData?.marca_ev || '',
    tipo_instalacion: initialData?.tipo_instalacion || '',
    distancia_centro_carga: initialData?.distancia_centro_carga || '',
    ubicacion: initialData?.ubicacion || '',
    status: initialData?.status || 'Lead',
    origen: initialData?.origen || 'Directo',
    notas: initialData?.notas || '',
    partnerId: initialData?.partnerId?.toString() || '',
    fecha_creacion: initialData?.fecha_creacion 
      ? new Date(initialData.fecha_creacion).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
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
        partnerId: formData.partnerId ? parseInt(formData.partnerId, 10) : undefined,
        fecha_creacion: new Date(formData.fecha_creacion + 'T00:00:00')
      };

      if (initialData?.id) {
        await updateClient(initialData.id, dataToSubmit);
      } else {
        await createClient(dataToSubmit);
      }
      router.push('/admin/clientes');
    } catch (error) {
      console.error('Error saving client:', error);
      alert('Hubo un error al guardar. Revisa la consola.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <Link href="/admin/clientes">
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-tech font-bold uppercase tracking-widest text-white">
            {initialData ? 'Editar Cliente' : 'Nuevo Cliente / Lead'}
          </h1>
          <p className="text-sm font-tech text-slate-400">Llena los datos del prospecto para poder cotizarle después.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Columna Izquierda - Datos Principales */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-xl backdrop-blur-sm">
              <h3 className="font-tech text-sm font-bold uppercase tracking-widest text-brand-blue border-b border-slate-800 pb-3">Datos de Contacto</h3>
              
              <div className="space-y-2">
                <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Nombre Completo *</label>
                <Input name="nombre" value={formData.nombre} onChange={handleChange} required className="" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Empresa (Opcional)</label>
                <Input name="empresa" value={formData.empresa} onChange={handleChange} className="" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Teléfono *</label>
                  <Input name="telefono" value={formData.telefono} onChange={handleChange} required className="" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Email</label>
                  <Input name="email" type="email" value={formData.email} onChange={handleChange} className="" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Ubicación / Dirección *</label>
                <Input name="ubicacion" value={formData.ubicacion} onChange={handleChange} required className="" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-xl backdrop-blur-sm">
              <h3 className="font-tech text-sm font-bold uppercase tracking-widest text-brand-blue border-b border-slate-800 pb-3">Clasificación</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Estatus</label>
                  <Select name="status" value={formData.status} onValueChange={(v) => setFormData(p => ({ ...p, status: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Estatus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lead">Lead (Nuevo)</SelectItem>
                      <SelectItem value="Prospect">Prospecto (Contactado)</SelectItem>
                      <SelectItem value="Cliente">Cliente (Compró)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Origen</label>
                  <Select name="origen" value={formData.origen} onValueChange={(v) => setFormData(p => ({ ...p, origen: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Origen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Directo">Directo</SelectItem>
                      <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                      <SelectItem value="Web">Web</SelectItem>
                      <SelectItem value="Partner">Referido (Partner)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Partner Referente</label>
                  <Select name="partnerId" value={formData.partnerId} onValueChange={(v) => setFormData(p => ({ ...p, partnerId: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Ninguno" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Ninguno</SelectItem>
                      {partners.map(p => (
                        <SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Fecha de Registro</label>
                  <Input 
                    type="date" 
                    name="fecha_creacion" 
                    value={formData.fecha_creacion} 
                    onChange={handleChange}
                    className=" [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-xl backdrop-blur-sm">
              <h3 className="font-tech text-sm font-bold uppercase tracking-widest text-emerald-400 border-b border-slate-800 pb-3">Detalles Técnicos (Si aplica)</h3>
              
              <div className="space-y-2">
                <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Marca de Vehículo EV</label>
                <Input name="marca_ev" placeholder="Ej. BYD, Tesla, Volvo..." value={formData.marca_ev} onChange={handleChange} className="bg-slate-950/80 border-slate-700 text-white placeholder:text-slate-600 focus-visible:ring-emerald-500" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Tipo de Instalación</label>
                <Input name="tipo_instalacion" placeholder="Ej. Residencial, Comercial..." value={formData.tipo_instalacion} onChange={handleChange} className="bg-slate-950/80 border-slate-700 text-white placeholder:text-slate-600 focus-visible:ring-emerald-500" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Distancia Estimada al Centro de Carga</label>
                <Input name="distancia_centro_carga" placeholder="Ej. 15 metros" value={formData.distancia_centro_carga} onChange={handleChange} className="bg-slate-950/80 border-slate-700 text-white placeholder:text-slate-600 focus-visible:ring-emerald-500" />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Notas Internas</label>
                <Textarea name="notas" value={formData.notas} onChange={handleChange} className="resize-none h-24 bg-slate-950/80 border-slate-700 text-white placeholder:text-slate-600 focus-visible:ring-emerald-500" placeholder="Comentarios sobre el cliente..." />
              </div>
            </div>

            <Button type="submit" disabled={isSaving} className="w-full bg-brand-blue hover:bg-brand-blue/80 text-white font-tech uppercase tracking-widest font-bold h-14 text-lg shadow-[0_0_20px_rgba(0,163,255,0.4)] transition-all">
              {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
              {initialData ? 'Guardar Cambios' : 'Registrar Cliente'}
            </Button>
          </div>
          
        </div>
      </form>

      {initialData?.id && (
        <ClientActivities clientId={initialData.id} initialActivities={initialActivities} />
      )}
    </div>
  );
}

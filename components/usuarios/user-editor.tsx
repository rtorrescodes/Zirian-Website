'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Loader2, ArrowLeft, KeyRound, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { createUser, updateUser } from '@/app/actions/users';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserEditorProps {
  initialData?: any;
}

export function UserEditor({ initialData }: UserEditorProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || '',
    email: initialData?.email || '',
    role: initialData?.role || 'Gerente',
    activo: initialData?.activo ?? true,
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    
    try {
      if (initialData?.id) {
        await updateUser(initialData.id, formData);
      } else {
        if (!formData.password) {
          setError('Debes asignar una contraseña para el usuario nuevo.');
          setIsSaving(false);
          return;
        }
        await createUser(formData);
      }
      router.push('/admin/configuracion/usuarios');
    } catch (err: any) {
      setError(err.message || 'Error al guardar el usuario.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <Link href="/admin/configuracion/usuarios">
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-tech font-bold uppercase tracking-widest text-white">
            {initialData ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h1>
          <p className="text-sm font-tech text-slate-400">Configura los accesos y roles.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/60 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm font-tech font-bold flex items-center gap-2">
          <ShieldAlert className="h-4 w-4" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6 shadow-xl backdrop-blur-sm">
          
          <div className="space-y-4">
            <h3 className="font-tech text-sm font-bold uppercase tracking-widest text-brand-blue border-b border-slate-800 pb-3">Información de la Cuenta</h3>
            
            <div className="space-y-2">
              <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Nombre del Empleado *</label>
              <Input name="nombre" value={formData.nombre} onChange={handleChange} required className="bg-slate-950/80 border-slate-700 text-white focus-visible:ring-brand-blue" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Correo Electrónico (Login) *</label>
              <Input name="email" type="email" value={formData.email} onChange={handleChange} required className="bg-slate-950/80 border-slate-700 text-white focus-visible:ring-brand-blue" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Rol en el Sistema *</label>
                <Select name="role" value={formData.role} onValueChange={(v) => setFormData(p => ({ ...p, role: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gerente">Gerente</SelectItem>
                    <SelectItem value="Instalador">Instalador / Técnico</SelectItem>
                    <SelectItem value="Supervisor">Supervisor</SelectItem>
                    <SelectItem value="SuperAdmin">Super Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 flex flex-col justify-end">
                <label className="flex items-center space-x-3 cursor-pointer bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 h-10 hover:border-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    name="activo"
                    checked={formData.activo}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-brand-blue focus:ring-brand-blue focus:ring-offset-slate-950"
                  />
                  <span className="text-sm font-tech font-bold uppercase tracking-wider text-slate-300">Cuenta Activa</span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-slate-800">
            <h3 className="font-tech text-sm font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
              <KeyRound className="h-4 w-4" /> 
              Seguridad
            </h3>
            
            <div className="space-y-2">
              <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">
                {initialData ? 'Nueva Contraseña (Opcional)' : 'Contraseña de Acceso *'}
              </label>
              <Input 
                name="password" 
                type="password" 
                value={formData.password} 
                onChange={handleChange} 
                placeholder={initialData ? 'Escribe aquí para cambiarla...' : 'Asigna una contraseña segura...'}
                className=""
              />
              {initialData && (
                <p className="text-[10px] font-tech text-slate-500 mt-1 uppercase tracking-wider">
                  Déjalo en blanco si no deseas cambiar la contraseña actual del usuario.
                </p>
              )}
            </div>
          </div>
        </div>

        <Button type="submit" disabled={isSaving} className="w-full bg-brand-blue hover:bg-brand-blue/80 text-slate-950 hover:bg-brand-cyan font-tech uppercase tracking-widest font-bold h-14 text-lg shadow-[0_0_20px_rgba(0,163,255,0.4)] transition-all">
          {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
          {initialData ? 'Guardar Cambios' : 'Registrar Nuevo Usuario'}
        </Button>
      </form>
    </div>
  );
}

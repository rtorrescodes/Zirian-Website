'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Loader2, ArrowLeft, KeyRound } from 'lucide-react';
import Link from 'next/link';

interface ProfileEditorProps {
  initialData: any;
}

export function ProfileEditor({ initialData }: ProfileEditorProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || '',
    currentPassword: '',
    newPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error al actualizar.');
      }
      
      setSuccess(data.message);
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
      router.refresh(); // so layout updates if name changed
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <Link href="/admin/dashboard">
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-tech font-bold uppercase tracking-widest text-white">
            Mi Perfil
          </h1>
          <p className="text-sm font-tech text-slate-400">Actualiza tu información y contraseña.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/60 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm font-tech font-bold">
          ⚠️ {error}
        </div>
      )}
      
      {success && (
        <div className="bg-emerald-950/60 border border-emerald-500/50 text-emerald-400 px-4 py-3 rounded-lg text-sm font-tech font-bold">
          ✅ {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6 shadow-xl backdrop-blur-sm">
          
          <div className="space-y-4">
            <h3 className="font-tech text-sm font-bold uppercase tracking-widest text-brand-blue border-b border-slate-800 pb-3">Datos Personales</h3>
            
            <div className="space-y-2">
              <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Tu Nombre *</label>
              <Input name="nombre" value={formData.nombre} onChange={handleChange} required className="bg-slate-950/80 border-slate-700 text-white focus-visible:ring-brand-blue" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Correo Electrónico (No modificable)</label>
              <Input value={initialData.email} disabled className="bg-slate-950 text-slate-500 border-slate-800 cursor-not-allowed" />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Tu Rol</label>
              <Input value={initialData.role} disabled className="bg-slate-950 text-slate-500 border-slate-800 cursor-not-allowed font-tech font-bold uppercase tracking-wider" />
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-slate-800">
            <h3 className="font-tech text-sm font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
              <KeyRound className="h-4 w-4" /> 
              Cambiar Contraseña (Opcional)
            </h3>
            
            <div className="space-y-2">
              <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Contraseña Actual</label>
              <Input 
                name="currentPassword" 
                type="password" 
                value={formData.currentPassword} 
                onChange={handleChange} 
                placeholder="Requerida solo si cambiarás la contraseña"
                className="bg-slate-950/80 border-slate-700 text-white placeholder:text-slate-600 focus-visible:ring-brand-blue"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Nueva Contraseña</label>
              <Input 
                name="newPassword" 
                type="password" 
                value={formData.newPassword} 
                onChange={handleChange} 
                placeholder="Escribe tu nueva contraseña secreta"
                className="bg-slate-950/80 border-slate-700 text-white placeholder:text-slate-600 focus-visible:ring-brand-blue"
              />
            </div>
          </div>
        </div>

        <Button type="submit" disabled={isSaving} className="w-full bg-brand-blue hover:bg-brand-blue/80 text-white font-tech uppercase tracking-widest font-bold h-14 text-lg shadow-[0_0_20px_rgba(0,163,255,0.4)] transition-all">
          {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
          Guardar Cambios
        </Button>
      </form>
    </div>
  );
}

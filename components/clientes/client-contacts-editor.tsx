'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Loader2, Save } from 'lucide-react';
import { addClientContact, removeClientContact } from '@/app/actions/clients';

interface Contact {
  id: number;
  nombre: string;
  puesto?: string | null;
  telefono?: string | null;
  email?: string | null;
}

interface ClientContactsEditorProps {
  clientId: number;
  initialContacts: Contact[];
}

export function ClientContactsEditor({ clientId, initialContacts }: ClientContactsEditorProps) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newContact, setNewContact] = useState({
    nombre: '',
    puesto: '',
    telefono: '',
    email: ''
  });

  const handleAdd = async () => {
    if (!newContact.nombre) return;
    setIsSaving(true);
    try {
      const added = await addClientContact({
        clientId,
        nombre: newContact.nombre,
        puesto: newContact.puesto,
        telefono: newContact.telefono,
        email: newContact.email
      });
      setContacts([...contacts, added]);
      setNewContact({ nombre: '', puesto: '', telefono: '', email: '' });
      setIsAdding(false);
    } catch (error) {
      console.error('Error adding contact:', error);
      alert('Error al agregar el contacto');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (contactId: number) => {
    if (!confirm('¿Estás seguro de quitar este contacto?')) return;
    try {
      await removeClientContact(contactId, clientId);
      setContacts(contacts.filter(c => c.id !== contactId));
    } catch (error) {
      console.error('Error removing contact:', error);
      alert('Error al quitar el contacto');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-xl backdrop-blur-sm mt-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="font-tech text-sm font-bold uppercase tracking-widest text-brand-blue">Contactos Secundarios</h3>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsAdding(!isAdding)}
          className="text-brand-cyan hover:bg-brand-cyan/10 hover:text-brand-cyan h-8 px-2 font-tech text-xs"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Añadir Contacto
        </Button>
      </div>

      <div className="space-y-3">
        {contacts.map(c => (
          <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-slate-950/80 border border-slate-800 gap-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full text-xs">
              <div>
                <p className="text-slate-500 font-tech uppercase tracking-wider text-[9px]">Nombre</p>
                <p className="text-slate-200 font-medium">{c.nombre}</p>
              </div>
              <div>
                <p className="text-slate-500 font-tech uppercase tracking-wider text-[9px]">Puesto</p>
                <p className="text-slate-400">{c.puesto || '-'}</p>
              </div>
              <div>
                <p className="text-slate-500 font-tech uppercase tracking-wider text-[9px]">Teléfono</p>
                <p className="text-slate-400">{c.telefono || '-'}</p>
              </div>
              <div>
                <p className="text-slate-500 font-tech uppercase tracking-wider text-[9px]">Email</p>
                <p className="text-slate-400">{c.email || '-'}</p>
              </div>
            </div>
            <Button 
              type="button"
              variant="ghost" 
              size="icon" 
              onClick={() => handleRemove(c.id)}
              className="text-slate-500 hover:text-red-400 hover:bg-red-400/10 h-8 w-8 shrink-0 self-end sm:self-center"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {contacts.length === 0 && !isAdding && (
          <p className="text-xs text-slate-500 italic py-2 text-center">No hay contactos secundarios registrados.</p>
        )}

        {isAdding && (
          <div className="p-4 rounded-lg bg-brand-blue/5 border border-brand-blue/20 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-tech font-bold uppercase tracking-wider text-slate-400">Nombre *</label>
                <Input 
                  value={newContact.nombre} 
                  onChange={e => setNewContact({...newContact, nombre: e.target.value})} 
                  placeholder="Ej. Juan Pérez"
                  className="h-8 text-sm bg-slate-950"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-tech font-bold uppercase tracking-wider text-slate-400">Puesto</label>
                <Input 
                  value={newContact.puesto} 
                  onChange={e => setNewContact({...newContact, puesto: e.target.value})} 
                  placeholder="Ej. Gerente de Mantenimiento"
                  className="h-8 text-sm bg-slate-950"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-tech font-bold uppercase tracking-wider text-slate-400">Teléfono</label>
                <Input 
                  value={newContact.telefono} 
                  onChange={e => setNewContact({...newContact, telefono: e.target.value})} 
                  placeholder="Ej. 624 123 4567"
                  className="h-8 text-sm bg-slate-950"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-tech font-bold uppercase tracking-wider text-slate-400">Email</label>
                <Input 
                  value={newContact.email} 
                  onChange={e => setNewContact({...newContact, email: e.target.value})} 
                  placeholder="Ej. juan@empresa.com"
                  className="h-8 text-sm bg-slate-950"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)} className="h-8 text-xs">Cancelar</Button>
              <Button type="button" size="sm" onClick={handleAdd} disabled={!newContact.nombre || isSaving} className="h-8 bg-brand-blue hover:bg-brand-cyan text-slate-950 text-xs font-bold uppercase tracking-wider">
                {isSaving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />}
                Guardar Contacto
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

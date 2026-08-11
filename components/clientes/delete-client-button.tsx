'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { deleteClient } from '@/app/actions/clients';

export function DeleteClientButton({ clientId, clientName }: { clientId: number, clientName: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Evitar que el click navegue a /admin/clientes/editor/...

    if (window.confirm(`¿Estás seguro de que deseas eliminar a ${clientName}? Esta acción no se puede deshacer y borrará todas sus cotizaciones.`)) {
      setIsDeleting(true);
      try {
        await deleteClient(clientId);
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
        alert('Hubo un error al eliminar el cliente.');
        setIsDeleting(false);
      }
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
      onClick={handleDelete}
      disabled={isDeleting}
      title="Eliminar Cliente"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}

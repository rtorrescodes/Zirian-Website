'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteQuote } from '@/app/actions/quotes';

interface QuoteDetailHeaderActionsProps {
  quoteId: number;
}

export function QuoteDetailHeaderActions({ quoteId }: QuoteDetailHeaderActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de que deseas eliminar esta cotización de forma permanente? Se borrarán todas las partidas asociadas.')) {
      setIsDeleting(true);
      try {
        await deleteQuote(quoteId);
        router.push('/admin/cotizaciones');
      } catch (error) {
        console.error('Error deleting quote:', error);
        alert('Hubo un error al eliminar la cotización.');
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <Link href={`/admin/cotizador?editId=${quoteId}`}>
        <Button
          variant="outline"
          size="sm"
          className="border-brand-blue/50 text-brand-blue hover:bg-brand-blue/10 font-tech font-bold uppercase tracking-wider text-xs h-9"
        >
          <Edit className="w-3.5 h-3.5 mr-1.5" />
          Editar en Cotizador
        </Button>
      </Link>

      <a
        href={`/api/quotes/${quoteId}/pdf`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center rounded-md border border-brand-cyan/50 bg-brand-cyan/10 px-3.5 py-1.5 text-xs font-tech font-bold uppercase tracking-wider text-brand-cyan transition-colors hover:bg-brand-cyan/20 h-9"
      >
        <FileText className="w-3.5 h-3.5 mr-1.5" />
        Ver PDF
      </a>

      <Button
        variant="outline"
        size="sm"
        onClick={handleDelete}
        disabled={isDeleting}
        className="border-red-500/40 text-red-400 hover:bg-red-950/40 hover:text-red-300 font-tech font-bold uppercase tracking-wider text-xs h-9 transition-colors"
        title="Eliminar Cotización"
      >
        {isDeleting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
        ) : (
          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
        )}
        Eliminar
      </Button>
    </div>
  );
}

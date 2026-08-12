'use client';

import { useState, useTransition } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { toggleSyscomFeatured } from '@/app/actions/syscom-settings';

export function FeaturedButton({ productId, isFeatured = false }: { productId: string | number, isFeatured?: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [featuredState, setFeaturedState] = useState(isFeatured);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    startTransition(async () => {
      try {
        await toggleSyscomFeatured(String(productId));
        setFeaturedState(!featuredState);
      } catch (error) {
        console.error("Error toggling featured state", error);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={`absolute top-0 right-10 z-20 flex items-center justify-center w-8 h-8 rounded-bl-lg rounded-tr-xl transition-colors shadow-lg backdrop-blur-sm ${
        featuredState 
          ? 'bg-yellow-500/90 text-white hover:bg-yellow-600' 
          : 'bg-slate-900/80 text-slate-400 border-b border-l border-slate-700/50 hover:bg-slate-800 hover:text-yellow-400'
      }`}
      title={featuredState ? 'Quitar de Destacados' : 'Marcar como Destacado'}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Star className={`w-4 h-4 ${featuredState ? 'fill-white' : ''}`} />
      )}
    </button>
  );
}

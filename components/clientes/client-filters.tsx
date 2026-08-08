'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function ClientFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState(searchParams?.get('q') || '');
  const [status, setStatus] = useState(searchParams?.get('status') || 'all');

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams?.toString() || '');
      if (value && value !== 'all') {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    const currentQ = searchParams?.get('q') || '';
    if (query === currentQ) return;

    const timeoutId = setTimeout(() => {
      router.push(pathname + '?' + createQueryString('q', query));
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [query, pathname, router, createQueryString, searchParams]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setStatus(val);
    router.push(pathname + '?' + createQueryString('status', val));
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800 shadow-md mb-6 backdrop-blur-sm">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <Input 
          placeholder="Buscar por nombre, empresa, teléfono o email..." 
          className="pl-9 w-full bg-slate-950/80 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-brand-blue"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Filter className="h-4 w-4 text-slate-500" />
        <select 
          className="h-10 rounded-md border border-slate-700 bg-slate-950/80 px-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
          value={status}
          onChange={handleStatusChange}
        >
          <option value="all">Todos los Estatus</option>
          <option value="Lead">Lead (Nuevo)</option>
          <option value="Prospect">Prospecto (Contactado)</option>
          <option value="Cliente">Cliente (Cerrado)</option>
        </select>
      </div>
    </div>
  );
}

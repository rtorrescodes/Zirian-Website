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
  const [origen, setOrigen] = useState(searchParams?.get('origen') || 'all');
  const [tipo, setTipo] = useState(searchParams?.get('tipo') || 'all');
  const [ciudad, setCiudad] = useState(searchParams?.get('ciudad') || 'all');

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

  const handleFilterChange = (key: string, val: string) => {
    if (key === 'status') setStatus(val);
    if (key === 'origen') setOrigen(val);
    if (key === 'tipo') setTipo(val);
    if (key === 'ciudad') setCiudad(val);
    router.push(pathname + '?' + createQueryString(key, val));
  };

  return (
    <div className="flex flex-col lg:flex-row items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800 shadow-md mb-6 backdrop-blur-sm">
      <div className="relative flex-1 w-full lg:w-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <Input 
          placeholder="Buscar por nombre, empresa, teléfono o email..." 
          className="pl-9 w-full bg-slate-950/80 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-brand-blue"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      
      <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
        <Filter className="h-4 w-4 text-slate-500 hidden sm:block" />
        <select 
          className="h-10 rounded-md border border-slate-700 bg-slate-950/80 px-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue flex-1 sm:flex-none"
          value={status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="all">Estatus: Todos</option>
          <option value="Lead">Lead (Nuevo)</option>
          <option value="Prospect">Prospecto (Contactado)</option>
          <option value="Cliente">Cliente (Cerrado)</option>
        </select>

        <select 
          className="h-10 rounded-md border border-slate-700 bg-slate-950/80 px-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue flex-1 sm:flex-none"
          value={origen}
          onChange={(e) => handleFilterChange('origen', e.target.value)}
        >
          <option value="all">Origen: Todos</option>
          <option value="Directo">Directo</option>
          <option value="WhatsApp">WhatsApp</option>
          <option value="Web">Página Web</option>
          <option value="Recomendacion">Recomendación</option>
          <option value="Facebook">Facebook / Meta</option>
          <option value="Google">Google / Búsqueda</option>
          <option value="Partner">Partner / Aliado</option>
          <option value="BYD">BYD / Concesionaria</option>
          <option value="Otro">Otro</option>
        </select>

        <select 
          className="h-10 rounded-md border border-slate-700 bg-slate-950/80 px-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue flex-1 sm:flex-none"
          value={tipo}
          onChange={(e) => handleFilterChange('tipo', e.target.value)}
        >
          <option value="all">Tipo: Todos</option>
          <option value="Instalación EV">Cargadores EV</option>
          <option value="Paneles Solares">Paneles Solares</option>
          <option value="CCTV">CCTV / Seguridad</option>
          <option value="Smart Home">Smart Home</option>
          <option value="Redes">Redes / WiFi</option>
          <option value="Híbrido">Múltiple / Híbrido</option>
          <option value="Otro">Otro</option>
        </select>
        
        <select 
          className="h-10 rounded-md border border-slate-700 bg-slate-950/80 px-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue flex-1 sm:flex-none"
          value={ciudad}
          onChange={(e) => handleFilterChange('ciudad', e.target.value)}
        >
          <option value="all">Ciudad: Todas</option>
          <option value="Cabo San Lucas">Cabo San Lucas</option>
          <option value="San José del Cabo">San José del Cabo</option>
          <option value="Todos Santos">Todos Santos</option>
          <option value="Cabo del Este">Cabo del Este</option>
          <option value="La Paz">La Paz</option>
        </select>
      </div>
    </div>
  );
}

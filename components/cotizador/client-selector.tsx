'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ChevronsUpDown, Search, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';

const clientTypeColor: Record<string, string> = {
  Lead: 'text-brand-cyan',
  Prospect: 'text-brand-green',
  Cliente: 'text-amber-300',
};

interface ClientSelectorProps {
  clients: any[];
  selectedClient: any;
  setSelectedClient: (client: any) => void;
}

export function ClientSelector({ clients, selectedClient, setSelectedClient }: ClientSelectorProps) {
  const [clientOpen, setClientOpen] = useState(false);
  const [clientQuery, setClientQuery] = useState('');

  const filteredClients = useMemo(() => {
    return clientQuery
      ? clients.filter((c) => c.nombre.toLowerCase().includes(clientQuery.toLowerCase()))
      : clients;
  }, [clients, clientQuery]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setClientOpen(!clientOpen)}
        className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-left transition-colors hover:bg-slate-800"
      >
        {selectedClient ? (
          <>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-cyan/15 text-xs font-semibold text-brand-cyan">
              {selectedClient.nombre.slice(0, 2).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium text-white">
                {selectedClient.nombre}
              </span>
              <span className={cn('block text-xs', clientTypeColor[selectedClient.status] || 'text-slate-400')}>
                {selectedClient.status}
              </span>
            </span>
          </>
        ) : (
          <span className="flex-1 text-slate-400">Selecciona o busca un cliente…</span>
        )}
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-slate-400" />
      </button>

      {clientOpen && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-[0_0_20px_rgba(0,0,0,0.8)]">
          <div className="relative border-b border-slate-800 p-2 bg-slate-950/50">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              autoFocus
              value={clientQuery}
              onChange={(e) => setClientQuery(e.target.value)}
              placeholder="Buscar cliente por nombre..."
              className="h-9 border-0 bg-transparent pl-8 text-white focus-visible:ring-0 placeholder:text-slate-500"
            />
          </div>
          
          <ul className="max-h-60 overflow-y-auto p-1 bg-slate-900">
            {filteredClients.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setSelectedClient(c);
                    setClientOpen(false);
                    setClientQuery('');
                  }}
                  className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-slate-800"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-800 text-xs font-semibold text-white">
                    {c.nombre.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-white">
                      {c.nombre}
                    </span>
                    <span className="block truncate text-[10px] font-tech font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                      {c.status}
                    </span>
                  </span>
                  {selectedClient?.id === c.id && (
                    <Check className="h-4 w-4 text-brand-green" />
                  )}
                </button>
              </li>
            ))}
            {filteredClients.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-slate-400">
                Sin resultados
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

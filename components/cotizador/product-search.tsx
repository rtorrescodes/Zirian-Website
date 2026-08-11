'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Search as SearchIcon, Loader2, Plus, Box, ExternalLink, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Product {
  id: number;
  nombre: string;
  codigo?: string | null;
  marca?: string | null;
  descripcion?: string | null;
  precio_base: any;
  costo_estimado?: any;
  unidad_medida: string;
  categoryId: number;
  recommendations?: { recommended: Product }[];
}

interface ProductSearchProps {
  searchMode: 'local' | 'syscom';
  setSearchMode: (mode: 'local' | 'syscom') => void;
  productQuery: string;
  setProductQuery: (query: string) => void;
  initialProducts: Product[];
  isSearchingSyscom: boolean;
  syscomResults: { items: any[]; filteredOut: number };
  pickedProductId: number | string | null;
  setPickedProductId: (id: number | string | null) => void;
  addItem: () => void;
  addDirectItem: (product: any, quantity?: number) => void;
  itemDetails: string;
  setItemDetails: (details: string) => void;
  finishAddItem: () => void;
}

export function ProductSearch({
  searchMode,
  setSearchMode,
  productQuery,
  setProductQuery,
  initialProducts,
  isSearchingSyscom,
  syscomResults,
  pickedProductId,
  setPickedProductId,
  addItem,
  addDirectItem,
  itemDetails,
  setItemDetails,
  finishAddItem,
}: ProductSearchProps) {
  const filteredProducts = useMemo(() => {
    if (!productQuery) return initialProducts;
    const q = productQuery.toLowerCase();
    return initialProducts.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        (p.codigo && p.codigo.toLowerCase().includes(q)) ||
        (p.marca && p.marca.toLowerCase().includes(q)),
    );
  }, [initialProducts, productQuery]);

  const currencyExact = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value);
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/60 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-md">
      {/* Selector Local vs Syscom */}
      <div className="flex w-full bg-slate-950 p-1">
        <button
          className={cn(
            'flex-1 rounded-md py-2 text-xs font-tech font-bold uppercase tracking-widest transition-all',
            searchMode === 'local'
              ? 'bg-brand-blue text-slate-950 shadow-[0_0_10px_rgba(0,163,255,0.4)]'
              : 'text-slate-400 hover:text-white',
          )}
          onClick={() => setSearchMode('local')}
        >
          Catálogo Interno
        </button>
        <button
          className={cn(
            'flex-1 rounded-md py-2 text-xs font-tech font-bold uppercase tracking-widest transition-all',
            searchMode === 'syscom'
              ? 'bg-brand-cyan text-slate-950 shadow-[0_0_10px_rgba(0,255,255,0.4)]'
              : 'text-slate-400 hover:text-white',
          )}
          onClick={() => setSearchMode('syscom')}
        >
          Syscom (API)
        </button>
      </div>

      <div className="relative border-b border-slate-700 bg-slate-950/80 p-3">
        <SearchIcon className={cn("absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2", searchMode === 'syscom' ? "text-brand-cyan" : "text-brand-blue")} />
        <Input
          value={productQuery}
          onChange={(e) => setProductQuery(e.target.value)}
          placeholder={searchMode === 'local' ? "Buscar productos locales..." : "Buscar en Syscom (mínimo 3 letras)..."}
          className={cn(
            "h-12 border-slate-700 bg-slate-900 pl-11 text-lg text-white placeholder:text-slate-500",
            searchMode === 'syscom' ? "focus-visible:ring-brand-cyan" : "focus-visible:ring-brand-blue"
          )}
        />
        {searchMode === 'syscom' && isSearchingSyscom && (
          <Loader2 className="absolute right-6 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-brand-cyan" />
        )}
      </div>

      {searchMode === 'syscom' && syscomResults.filteredOut > 0 && (
        <div className="px-3 py-2 text-xs font-tech text-slate-400 bg-slate-900/50 border-b border-slate-800 flex justify-between">
          <span>Filtro Syscom Activo</span>
          <span>{syscomResults.filteredOut} productos ocultos</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto max-h-[500px]">
        {searchMode === 'local' ? (
          <ul className="divide-y divide-slate-800/50">
            {filteredProducts.map((p) => (
              <li key={p.id}>
                <div
                  className={cn(
                    "group flex cursor-pointer items-start justify-between gap-4 p-4 transition-colors hover:bg-slate-800/50",
                    pickedProductId === p.id && "bg-slate-800/80"
                  )}
                  onClick={() => setPickedProductId(p.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-950 border border-slate-800">
                      <Box className="h-5 w-5 text-brand-blue" />
                    </div>
                    <div className="flex flex-col">
                      <span className={cn("block line-clamp-3 leading-tight whitespace-normal mb-1 text-sm font-medium", pickedProductId === p.id ? "text-brand-blue" : "text-white")}>
                        {p.nombre}
                      </span>
                      <span className={cn("block line-clamp-2 text-[10px] font-tech font-bold uppercase tracking-wider mt-0.5", pickedProductId === p.id ? "text-brand-blue/70" : "text-slate-400")}>
                        {p.codigo && `SKU: ${p.codigo} | `}{p.marca && `Marca: ${p.marca}`}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="block font-mono text-sm font-bold text-emerald-400">
                      {currencyExact(Number(p.precio_base))}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addDirectItem(p);
                      }}
                      className="mt-2 inline-flex items-center gap-1 text-[10px] font-tech font-bold uppercase tracking-widest text-slate-400 hover:text-brand-blue transition-colors"
                    >
                      <Plus className="h-3 w-3" /> Añadir Rápido
                    </button>
                  </div>
                </div>
              </li>
            ))}
            {filteredProducts.length === 0 && (
              <li className="p-8 text-center text-sm text-slate-500">
                No se encontraron productos locales.
              </li>
            )}
          </ul>
        ) : (
          <ul className="divide-y divide-slate-800/50">
            {syscomResults.items && syscomResults.items.map((p) => (
              <li key={p.id}>
                <div
                  className={cn(
                    "group flex cursor-pointer items-start justify-between gap-4 p-4 transition-colors hover:bg-slate-800/50",
                    pickedProductId === p.id && "bg-slate-800/80"
                  )}
                  onClick={() => setPickedProductId(p.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white overflow-hidden border border-slate-700 p-1">
                      {p.imagen ? (
                        <img src={p.imagen} alt={p.modelo} className="object-contain h-full w-full" loading="lazy" />
                      ) : (
                        <Box className="h-5 w-5 text-slate-300" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className={cn("block line-clamp-3 leading-tight whitespace-normal mb-1 text-sm font-medium", pickedProductId === p.id ? "text-brand-cyan" : "text-white")}>
                        {p.nombre}
                      </span>
                      <span className={cn("block line-clamp-2 text-[10px] font-tech font-bold uppercase tracking-wider mt-0.5", pickedProductId === p.id ? "text-brand-cyan/70" : "text-slate-400")}>
                        Mod: {p.modelo} | {p.marca}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end">
                    <span className="block font-mono text-sm font-bold text-emerald-400">
                      {currencyExact(p.precioListaMXN)}
                    </span>
                    <a
                      href={`https://www.syscom.mx/producto/${p.syscomId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 flex items-center gap-1 text-[10px] text-slate-500 hover:text-brand-cyan transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" /> Ver
                    </a>
                  </div>
                </div>
              </li>
            ))}
            {syscomResults.items && syscomResults.items.length === 0 && productQuery.length >= 3 && !isSearchingSyscom && (
              <li className="p-8 text-center text-sm text-slate-500">
                No se encontraron productos en Syscom.
              </li>
            )}
            {productQuery.length < 3 && (
              <li className="p-8 text-center text-sm text-slate-500">
                Escribe al menos 3 letras para buscar en Syscom...
              </li>
            )}
          </ul>
        )}
      </div>

      {pickedProductId && (
        <div className="border-t border-brand-blue/30 bg-slate-900 p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.3)] relative z-10 animate-in slide-in-from-bottom-2">
          <label className="mb-2 block text-xs font-tech font-bold uppercase tracking-wider text-brand-blue">
            Detalles Adicionales (Opcional)
          </label>
          <Textarea
            value={itemDetails}
            onChange={(e) => setItemDetails(e.target.value)}
            placeholder="Especificaciones o notas extra para el cliente..."
            className="mb-3 h-20 resize-none border-slate-700 bg-slate-950 text-white placeholder:text-slate-600 focus-visible:ring-brand-blue text-sm"
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setPickedProductId(null)
                setItemDetails('')
              }}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                addItem()
                finishAddItem()
              }}
              className="bg-brand-blue hover:bg-brand-blue/80 text-slate-950 hover:bg-brand-cyan font-bold"
            >
              Confirmar y Agregar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

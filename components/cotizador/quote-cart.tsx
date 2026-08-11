'use client';

import { cn } from '@/lib/utils';
import { Package, Trash2, Plus, Minus, Paperclip, X, Check } from 'lucide-react';
import { useRef } from 'react';

interface QuoteCartProps {
  items: any[];
  updateQty: (id: number, delta: number) => void;
  removeItem: (id: number) => void;
  onFiles: (files: FileList | null) => void;
  removeFile: (id: string) => void;
  attachments: any[];
  addDirectItem: (product: any, qty: number) => void;
}

export function QuoteCart({ items, updateQty, removeItem, onFiles, removeFile, attachments, addDirectItem }: QuoteCartProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currencyExact = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value);
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 border border-slate-800 mb-4 shadow-[0_0_30px_rgba(0,163,255,0.1)]">
              <Package className="h-8 w-8 text-brand-blue/50" />
            </div>
            <p className="text-lg font-tech font-bold uppercase tracking-widest text-white">Carrito Vacío</p>
            <p className="mt-2 text-sm text-slate-400 max-w-[250px]">Busca productos en el panel izquierdo para comenzar a armar tu cotización.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <ul className="divide-y divide-slate-800 border-b border-slate-800">
              {items.map((i) => (
                <li key={i.product.id} className="flex items-start gap-3 py-4">
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                    <Package className="h-5 w-5 text-brand-blue" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between h-full">
                    <div>
                      <p className="line-clamp-3 text-sm font-medium text-white leading-tight text-balance">
                        {i.product.nombre}
                      </p>
                      {i.detalles && (
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 italic border-l-2 border-slate-700 pl-2">
                          {i.detalles}
                        </p>
                      )}
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center rounded-md border border-slate-700 bg-slate-900 shadow-inner">
                        <button
                          type="button"
                          onClick={() => updateQty(i.product.id, -1)}
                          className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                          aria-label="Disminuir"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold text-white">
                          {i.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQty(i.product.id, 1)}
                          className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                          aria-label="Aumentar"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      
                      {i.product.recommendations && i.product.recommendations.length > 0 && (
                        <div className="mt-3 bg-slate-900/40 rounded-lg p-2 border border-slate-800/50">
                          <p className="text-[10px] font-tech text-brand-blue uppercase tracking-widest mb-2 font-semibold">Accesorios Sugeridos</p>
                          <div className="space-y-1.5">
                            {i.product.recommendations.map((rec: any) => {
                              const alreadyInQuote = items.some(it => it.product.id === rec.recommended.id);
                              return (
                                <div key={rec.recommended.id} className="flex items-center justify-between gap-2">
                                  <span className="text-[11px] text-slate-300 truncate max-w-[120px] lg:max-w-[140px]" title={rec.recommended.nombre}>
                                    {rec.recommended.nombre}
                                  </span>
                                  {!alreadyInQuote ? (
                                    <button 
                                      type="button" 
                                      onClick={() => addDirectItem(rec.recommended, i.qty)}
                                      className="text-[10px] bg-slate-800 hover:bg-brand-blue hover:text-slate-950 hover:bg-brand-cyan text-slate-300 px-1.5 py-0.5 rounded flex items-center gap-1 transition-colors whitespace-nowrap font-medium"
                                    >
                                      <Plus className="w-2.5 h-2.5" /> Agregar
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-brand-green/80 flex items-center gap-0.5 px-1.5 py-0.5 bg-brand-green/10 rounded">
                                      <Check className="w-2.5 h-2.5" /> Agregado
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-4">
                        <p className="font-mono text-sm font-bold text-brand-cyan">
                          {currencyExact(Number(i.product.precio_base) * i.qty)}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeItem(i.product.id)}
                          className="text-slate-500 hover:text-red-400 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/30 p-4 transition-colors hover:border-slate-500 hover:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-400">
                  <Paperclip className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Adjuntos Técnicos</p>
                  <p className="text-xs text-slate-400">PDFs, Fichas Técnicas, Evidencia...</p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
                >
                  Subir
                </button>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  ref={fileInputRef}
                  onChange={(e) => onFiles(e.target.files)}
                />
              </div>
              {attachments.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {attachments.map((a) => (
                    <li key={a.id} className="flex items-center justify-between rounded-md bg-slate-950 p-2 text-xs">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Paperclip className="h-3 w-3 shrink-0 text-slate-500" />
                        <span className="truncate text-slate-300">{a.name}</span>
                        <span className="shrink-0 text-slate-500">({a.size})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(a.id)}
                        className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

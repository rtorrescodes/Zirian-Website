import React, { useRef } from 'react';
import { Minus, Plus, Trash2, Package, Battery, Cpu, Box, Cloud, Network, Wind, Sun, Video, Check, Upload, FileText, X } from 'lucide-react';

interface QuoteCartProps {
  items: any[];
  updateQty: (id: number, delta: number) => void;
  updatePrice?: (id: number, price: number) => void;
  removeItem: (id: number) => void;
  onFiles: (files: FileList | null) => void;
  removeFile: (id: string) => void;
  attachments: any[];
  addDirectItem: (product: any, qty: number) => void;
  secciones?: string[];
  onAddSeccion?: (nombre: string) => void;
  onRemoveSeccion?: (nombre: string) => void;
  onUpdateItemSeccion?: (itemId: number, seccion?: string) => void;
  onReorderSecciones?: (sourceIdx: number, destIdx: number) => void;
}

const getCategoryIcon = (categoryId: number) => {
  switch (categoryId) {
    case 5: return <Wind className="h-5 w-5 text-brand-blue" />; // Aire Acondicionado
    case 6: return <Sun className="h-5 w-5 text-brand-blue" />; // Panel Solar
    case 7: return <Battery className="h-5 w-5 text-brand-blue" />; // Batería
    case 2: return <Video className="h-5 w-5 text-brand-blue" />; // CCTV
    case 1: return <Network className="h-5 w-5 text-brand-blue" />; // Redes
    case 4: return <Cpu className="h-5 w-5 text-brand-blue" />; // Control Acceso
    default: return <Box className="h-5 w-5 text-brand-blue" />;
  }
};


function PriceEditor({
  product,
  currencyExact,
  onSave,
  onCancel,
}: {
  product: any;
  currencyExact: (v: number) => string;
  onSave: (p: number) => void;
  onCancel: () => void;
}) {
  const [mode, setMode] = React.useState<'manual'|'margin'>('manual');
  const [val, setVal] = React.useState<string>(String(product.precio_base));
  
  const costo = Number(product.costo_estimado || 0);

  return (
    <div className="absolute right-0 top-8 z-50 bg-slate-900 border border-brand-cyan/50 rounded shadow-[0_0_15px_rgba(0,163,255,0.2)] p-3 w-64 text-left">
      <div className="flex justify-between items-center mb-2">
         <span className="text-xs font-bold text-brand-cyan">Editar Precio</span>
         <button type="button" onClick={onCancel} className="text-slate-400 hover:text-white"><X className="w-3 h-3" /></button>
      </div>
      
      {costo > 0 && (
         <div className="mb-2 text-[10px] text-slate-400 bg-slate-950 p-1.5 rounded space-y-1">
            <div className="flex justify-between">
               <span>Costo (Especial):</span>
               <span className="font-mono text-white cursor-pointer hover:text-brand-cyan" onClick={() => {setMode('manual'); setVal(String(costo))}} title="Usar este precio">
                 {currencyExact(costo)}
               </span>
            </div>
            <div className="flex justify-between">
               <span>Último Precio Base:</span>
               <span className="font-mono text-white cursor-pointer hover:text-brand-cyan" onClick={() => {setMode('manual'); setVal(String(product.precio_base))}} title="Usar este precio">
                 {currencyExact(Number(product.precio_base))}
               </span>
            </div>
         </div>
      )}

      <div className="flex gap-2 mb-2">
         <button type="button" onClick={() => setMode('manual')} className={`flex-1 text-[10px] py-1 rounded ${mode === 'manual' ? 'bg-brand-cyan text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'}`}>Manual</button>
         {costo > 0 && <button type="button" onClick={() => setMode('margin')} className={`flex-1 text-[10px] py-1 rounded ${mode === 'margin' ? 'bg-brand-cyan text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'}`}>Ganancia %</button>}
      </div>

      {mode === 'manual' ? (
         <div className="flex items-center gap-1 mb-2">
            <span className="text-brand-cyan">$</span>
            <input autoFocus type="number" value={val} onChange={e => setVal(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-brand-cyan" />
         </div>
      ) : (
         <div className="flex items-center gap-1 mb-2">
            <input autoFocus type="number" placeholder="Ej. 30" value={val} onChange={e => setVal(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-brand-cyan" />
            <span className="text-brand-cyan">%</span>
         </div>
      )}

      {mode === 'margin' && val && !isNaN(Number(val)) && (
         <div className="text-[10px] text-slate-400 mb-2">
            Precio Final: <span className="text-white font-mono">{currencyExact(costo * (1 + Number(val)/100))}</span>
         </div>
      )}

      <button 
         type="button"
         onClick={() => {
            if(mode === 'manual') onSave(Number(val));
            else onSave(costo * (1 + Number(val)/100));
         }}
         className="w-full bg-brand-cyan text-slate-950 text-xs font-bold py-1.5 rounded hover:bg-brand-blue hover:text-white transition-colors"
      >
         Guardar
      </button>
    </div>
  )
}



function PriceEditor({
  product,
  currencyExact,
  onSave,
  onCancel,
}: {
  product: any;
  currencyExact: (v: number) => string;
  onSave: (p: number) => void;
  onCancel: () => void;
}) {
  const [mode, setMode] = React.useState<'manual'|'margin'>('manual');
  const [val, setVal] = React.useState<string>(String(product.precio_base));
  
  const costo = Number(product.costo_estimado || 0);

  return (
    <div className="absolute right-0 top-8 z-50 bg-slate-900 border border-brand-cyan/50 rounded shadow-[0_0_15px_rgba(0,163,255,0.2)] p-3 w-64 text-left">
      <div className="flex justify-between items-center mb-2">
         <span className="text-xs font-bold text-brand-cyan">Editar Precio</span>
         <button type="button" onClick={onCancel} className="text-slate-400 hover:text-white"><X className="w-3 h-3" /></button>
      </div>
      
      {costo > 0 && (
         <div className="mb-2 text-[10px] text-slate-400 bg-slate-950 p-1.5 rounded space-y-1">
            <div className="flex justify-between">
               <span>Costo (Especial):</span>
               <span className="font-mono text-white cursor-pointer hover:text-brand-cyan" onClick={() => {setMode('manual'); setVal(String(costo))}} title="Usar este precio">
                 {currencyExact(costo)}
               </span>
            </div>
            <div className="flex justify-between">
               <span>Último Precio Base:</span>
               <span className="font-mono text-white cursor-pointer hover:text-brand-cyan" onClick={() => {setMode('manual'); setVal(String(product.precio_base))}} title="Usar este precio">
                 {currencyExact(Number(product.precio_base))}
               </span>
            </div>
         </div>
      )}

      <div className="flex gap-2 mb-2">
         <button type="button" onClick={() => setMode('manual')} className={`flex-1 text-[10px] py-1 rounded ${mode === 'manual' ? 'bg-brand-cyan text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'}`}>Manual</button>
         {costo > 0 && <button type="button" onClick={() => setMode('margin')} className={`flex-1 text-[10px] py-1 rounded ${mode === 'margin' ? 'bg-brand-cyan text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'}`}>Ganancia %</button>}
      </div>

      {mode === 'manual' ? (
         <div className="flex items-center gap-1 mb-2">
            <span className="text-brand-cyan">$</span>
            <input autoFocus type="number" value={val} onChange={e => setVal(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-brand-cyan" />
         </div>
      ) : (
         <div className="flex items-center gap-1 mb-2">
            <input autoFocus type="number" placeholder="Ej. 30" value={val} onChange={e => setVal(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-brand-cyan" />
            <span className="text-brand-cyan">%</span>
         </div>
      )}

      {mode === 'margin' && val && !isNaN(Number(val)) && (
         <div className="text-[10px] text-slate-400 mb-2">
            Precio Final: <span className="text-white font-mono">{currencyExact(costo * (1 + Number(val)/100))}</span>
         </div>
      )}

      <button 
         type="button"
         onClick={() => {
            if(mode === 'manual') onSave(Number(val));
            else onSave(costo * (1 + Number(val)/100));
         }}
         className="w-full bg-brand-cyan text-slate-950 text-xs font-bold py-1.5 rounded hover:bg-brand-blue hover:text-white transition-colors"
      >
         Guardar
      </button>
    </div>
  )
}


export function QuoteCart({ 
  items, updateQty, updatePrice, removeItem, onFiles, removeFile, attachments, addDirectItem,
  secciones = [], onAddSeccion, onRemoveSeccion, onUpdateItemSeccion, onReorderSecciones
}: QuoteCartProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [dragType, setDragType] = React.useState<'item' | 'section' | null>(null);
  const [draggedSectionIdx, setDraggedSectionIdx] = React.useState<number | null>(null);
  const [dragOverSectionIdx, setDragOverSectionIdx] = React.useState<number | null>(null);
  const [editingPriceId, setEditingPriceId] = React.useState<number | null>(null);

  const currencyExact = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value);
  };

  const renderSection = (seccionName: string | undefined, list: any[], index: number) => {
    if (list.length === 0 && seccionName === undefined) return null;

    const isSectionDraggable = seccionName !== undefined;
    const isDraggingThis = dragType === 'section' && draggedSectionIdx === index;
    const isDragOver = dragType === 'section' && dragOverSectionIdx === index;
    const dropClasses = isDragOver ? 'border-t-2 border-brand-cyan shadow-[0_-5px_15px_rgba(0,163,255,0.3)]' : '';

    return (
      <div 
        key={seccionName || 'default'} 
        className={`mb-6 transition-all duration-200 ${isDraggingThis ? 'opacity-30' : ''} ${dropClasses}`}
        draggable={isSectionDraggable}
        onDragStart={(e) => {
          if (!isSectionDraggable) {
            e.preventDefault();
            return;
          }
          e.dataTransfer.setData('text/plain', `section-${index}`);
          e.dataTransfer.effectAllowed = 'move';
          setDragType('section');
          setDraggedSectionIdx(index);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          if (dragType === 'section' && draggedSectionIdx !== null && draggedSectionIdx !== index && isSectionDraggable) {
            setDragOverSectionIdx(index);
          }
        }}
        onDragLeave={() => {
          if (dragType === 'section') setDragOverSectionIdx(null);
        }}
        onDrop={(e) => {
          e.preventDefault();
          const data = e.dataTransfer.getData('text/plain');
          
          if (data.startsWith('item-')) {
            const itemId = parseInt(data.replace('item-', ''));
            if (!isNaN(itemId) && onUpdateItemSeccion) {
               onUpdateItemSeccion(itemId, seccionName);
            }
          } else if (data.startsWith('section-')) {
            const sourceIndex = parseInt(data.replace('section-', ''));
            if (!isNaN(sourceIndex) && onReorderSecciones && sourceIndex !== index && isSectionDraggable) {
              onReorderSecciones(sourceIndex, index);
            }
          }
          
          setDragType(null);
          setDraggedSectionIdx(null);
          setDragOverSectionIdx(null);
        }}
        onDragEnd={() => {
          setDragType(null);
          setDraggedSectionIdx(null);
          setDragOverSectionIdx(null);
        }}
      >
        {seccionName && (
          <div className="flex items-center justify-between bg-brand-blue/10 border border-brand-blue/30 p-2 rounded-t text-brand-cyan font-tech text-xs uppercase shadow-sm cursor-grab active:cursor-grabbing">
            <span>{seccionName}</span>
            <button onClick={() => onRemoveSeccion?.(seccionName)} className="text-brand-cyan hover:text-red-400">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <ul className={`divide-y divide-slate-800 border-b border-slate-800 ${dragType === 'item' ? 'min-h-[60px] bg-slate-900/20 rounded-b' : ''}`}>
          {list.map((i) => (
            <li 
              key={i.product.id} 
              className="flex items-start gap-3 py-4 cursor-grab active:cursor-grabbing hover:bg-slate-900/30 px-2 rounded transition-colors"
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                e.dataTransfer.setData('text/plain', `item-${i.product.id}`);
                e.dataTransfer.effectAllowed = 'move';
                setDragType('item');
              }}
              onDragEnd={(e) => {
                e.stopPropagation();
                setDragType(null);
              }}
            >
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                {getCategoryIcon(i.product.categoryId)}
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-between h-full">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-3 text-sm font-medium text-white leading-tight text-balance">
                      {i.product.nombre}
                    </p>
                    {secciones.length > 0 && (
                      <select 
                        value={i.seccion || ''} 
                        onChange={(e) => onUpdateItemSeccion?.(i.product.id, e.target.value || undefined)}
                        className="bg-slate-900 border border-slate-700 text-[10px] text-slate-400 p-1 rounded max-w-[100px] outline-none shrink-0"
                      >
                        <option value="">General</option>
                        {secciones.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    )}
                  </div>
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

                  <div className="flex items-center gap-3">
                    {i.qty > 1 && (
                      <span className="text-[10px] text-slate-500 font-mono hidden sm:inline-block mt-1">
                        {currencyExact(Number(i.product.precio_base))} c/u
                      </span>
                    )}
                    
                    {Number(i.product.precio_base) === 0 ? (
                      <div className="flex items-center group relative">
                        <span className="text-brand-cyan font-bold mr-1">$</span>
                        <input
                          type="number"
                          className="w-20 bg-slate-800 text-brand-cyan font-mono text-sm font-bold rounded px-1 py-0.5 outline-none border border-brand-cyan/50 focus:border-brand-cyan text-right placeholder:text-brand-cyan/50"
                          placeholder="Sin precio"
                          defaultValue=""
                          onBlur={(e) => {
                            if (e.target.value && updatePrice) updatePrice(i.product.id, Number(e.target.value));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              if (e.currentTarget.value && updatePrice) updatePrice(i.product.id, Number(e.currentTarget.value));
                              e.currentTarget.blur();
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="relative">
                        <p 
                          className="font-mono text-sm font-bold text-brand-cyan cursor-pointer hover:bg-slate-800 px-2 py-1 rounded transition-colors"
                          onClick={() => setEditingPriceId(i.product.id)}
                          title="Click para editar precio"
                        >
                          {currencyExact(Number(i.product.precio_base) * i.qty)}
                        </p>
                        {editingPriceId === i.product.id && (
                          <PriceEditor
                            product={i.product}
                            currencyExact={currencyExact}
                            onSave={(newPrice) => {
                              if (updatePrice && !isNaN(newPrice)) {
                                updatePrice(i.product.id, newPrice);
                              }
                              setEditingPriceId(null);
                            }}
                            onCancel={() => setEditingPriceId(null)}
                          />
                        )}
                      </div>
                    )}
                    
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
      </div>
    );
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">
        {items.length === 0 && secciones.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 border border-slate-800 mb-4 shadow-[0_0_30px_rgba(0,163,255,0.1)]">
              <Package className="h-8 w-8 text-brand-blue/50" />
            </div>
            <p className="text-lg font-tech font-bold uppercase tracking-widest text-white">Carrito Vacío</p>
            <p className="mt-2 text-sm text-slate-400 max-w-[250px]">Busca productos en el panel izquierdo para comenzar a armar tu cotización.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Render the default general section if there are unassigned items */}
            {renderSection(undefined, items.filter(i => !i.seccion), -1)}
            
            {/* Render custom sections */}
            {secciones.map((s, idx) => renderSection(s, items.filter(i => i.seccion === s), idx))}
          </div>
        )}
      </div>

      <div className="mt-auto border-t border-brand-cyan/20 bg-slate-950 p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="font-tech text-xs font-bold uppercase tracking-widest text-slate-400">Archivos Adjuntos</p>
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 text-xs font-semibold text-brand-blue hover:text-brand-cyan transition-colors"
          >
            <Upload className="h-4 w-4" />
            Subir Archivo
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => onFiles(e.target.files)}
            className="hidden"
            multiple
          />
        </div>
        
        {attachments.length > 0 && (
          <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
            {attachments.map((file) => (
              <div key={file.id} className="flex items-center justify-between rounded bg-slate-900 p-2 border border-slate-800">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="truncate text-xs text-slate-300">{file.name}</span>
                  <span className="shrink-0 text-[10px] text-slate-500">({file.size})</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="ml-2 p-1 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

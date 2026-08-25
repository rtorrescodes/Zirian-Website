const fs = require('fs');

const priceEditorStr = `
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
         <button type="button" onClick={() => setMode('manual')} className={\`flex-1 text-[10px] py-1 rounded \${mode === 'manual' ? 'bg-brand-cyan text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'}\`}>Manual</button>
         {costo > 0 && <button type="button" onClick={() => setMode('margin')} className={\`flex-1 text-[10px] py-1 rounded \${mode === 'margin' ? 'bg-brand-cyan text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'}\`}>Ganancia %</button>}
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
`;

let content = fs.readFileSync('components/cotizador/quote-cart.tsx', 'utf-8');

// Insert PriceEditor before QuoteCart
const quoteCartIdx = content.indexOf('export function QuoteCart');
content = content.substring(0, quoteCartIdx) + priceEditorStr + '\n\n' + content.substring(quoteCartIdx);

// Add editingPriceId state
content = content.replace(
  "const [dragOverSectionIdx, setDragOverSectionIdx] = React.useState<number | null>(null);",
  "const [dragOverSectionIdx, setDragOverSectionIdx] = React.useState<number | null>(null);\n  const [editingPriceId, setEditingPriceId] = React.useState<number | null>(null);"
);

fs.writeFileSync('components/cotizador/quote-cart.tsx', content, 'utf-8');

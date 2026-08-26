const fs = require('fs');
let c = fs.readFileSync('components/cotizador/quote-cart.tsx', 'utf-8');

c = c.replace(
  /onKeyDown=\{e => \{ if\(e\.key === 'Enter'\) \{ if\(mode === 'manual'\) onSave\(Number\(val\)\); else onSave\(baseForMargin \* \(1 \+ Number\(val\)\/100\)\); \} \}\}/g,
  "onKeyDown={e => { if(e.key === 'Enter') { e.preventDefault(); if(mode === 'manual') { onSave(Number(val)); } else { onSave(baseForMargin * (1 + Number(val)/100)); } } }}"
);
// wait, the above replacement still has if(mode === 'manual') in both.

c = c.replace(
  /\{mode === 'manual' \? \([\s\S]*?\) : \([\s\S]*?\)\}/,
  `{mode === 'manual' ? (
         <div className="flex items-center gap-1 mb-2">
            <span className="text-brand-cyan">$</span>
            <input autoFocus type="number" value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => { if(e.key === 'Enter') { onSave(Number(val)); } }} className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-brand-cyan" />
         </div>
      ) : (
         <div className="flex items-center gap-1 mb-2">
            <input autoFocus type="number" placeholder="Ej. 30" value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => { if(e.key === 'Enter') { onSave(baseForMargin * (1 + Number(val)/100)); } }} className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-brand-cyan" />
            <span className="text-brand-cyan">%</span>
         </div>
      )}`
);

fs.writeFileSync('components/cotizador/quote-cart.tsx', c, 'utf-8');

const fs = require('fs');
let c = fs.readFileSync('components/cotizador/quote-cart.tsx', 'utf-8');

c = c.replace(
  /onKeyDown=\{e => \{ if\(e\.key === 'Enter'\) \{ if\(mode === 'manual'\) onSave\(Number\(val\)\); else onSave\(baseForMargin \* \(1 \+ Number\(val\)\/100\)\); \} \}\}/g,
  "onKeyDown={e => { if(e.key === 'Enter') { if(mode === 'manual') onSave(Number(val)); else onSave(baseForMargin * (1 + Number(val)/100)); } }} onBlur={() => { if(mode === 'manual') onSave(Number(val)); else onSave(baseForMargin * (1 + Number(val)/100)); }}"
);

fs.writeFileSync('components/cotizador/quote-cart.tsx', c, 'utf-8');

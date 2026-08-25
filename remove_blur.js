const fs = require('fs');
let c = fs.readFileSync('components/cotizador/quote-cart.tsx', 'utf-8');

c = c.replace(
  /onBlur=\{\(\) => \{ if\(mode === 'manual'\) onSave\(Number\(val\)\); else onSave\(baseForMargin \* \(1 \+ Number\(val\)\/100\)\); \}\}/g,
  ""
);

fs.writeFileSync('components/cotizador/quote-cart.tsx', c, 'utf-8');

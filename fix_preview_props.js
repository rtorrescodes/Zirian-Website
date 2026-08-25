const fs = require('fs');
let c = fs.readFileSync('components/cotizador/quote-builder.tsx', 'utf-8');

c = c.replace(
  "impuestosIniciales={initialQuote?.impuestos}",
  "impuestosIniciales={initialQuote?.impuestos}\n          attachments={attachments}"
);

fs.writeFileSync('components/cotizador/quote-builder.tsx', c, 'utf-8');

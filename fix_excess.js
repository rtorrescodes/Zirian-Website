const fs = require('fs');
let c = fs.readFileSync('components/cotizador/quote-builder.tsx', 'utf-8');

c = c.replace(
  "finalDetails = excess;",
  "finalDetails = finalDetails ? `${finalDetails}\\n\\n${excess}` : excess;"
);

fs.writeFileSync('components/cotizador/quote-builder.tsx', c, 'utf-8');

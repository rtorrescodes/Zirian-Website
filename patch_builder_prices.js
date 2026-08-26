const fs = require('fs');
let c = fs.readFileSync('components/cotizador/quote-builder.tsx', 'utf-8');

c = c.replace(
  /costo_estimado: sp\.precioEspecialMXN,/g,
  "costo_estimado: sp.precioDescuentoMXN,"
);

fs.writeFileSync('components/cotizador/quote-builder.tsx', c, 'utf-8');
console.log('Success');

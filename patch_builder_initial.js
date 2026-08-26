const fs = require('fs');
let c = fs.readFileSync('components/cotizador/quote-builder.tsx', 'utf-8');

c = c.replace(
  "precio_base: Number(i.precio_unitario || 0),\n        unidad_medida:",
  "precio_base: Number(i.precio_unitario || 0),\n        costo_estimado: Number(i.costo_unitario || 0),\n        unidad_medida:"
);

fs.writeFileSync('components/cotizador/quote-builder.tsx', c, 'utf-8');
console.log('Success');

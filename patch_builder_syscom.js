const fs = require('fs');
let c = fs.readFileSync('components/cotizador/quote-builder.tsx', 'utf-8');

c = c.replace(
  "recommendations?: { recommended: Product }[]\n}",
  "recommendations?: { recommended: Product }[]\n  syscom_precio_lista?: any\n  syscom_precio_especial?: any\n}"
);

c = c.replace(
  "codigo: sp.modelo,\n        precio_base: sp.precioListaMXN,\n        costo_estimado: sp.precioEspecialMXN,",
  "codigo: sp.modelo,\n        precio_base: sp.precioListaMXN,\n        costo_estimado: sp.precioEspecialMXN,\n        syscom_precio_lista: sp.precioListaMXN,\n        syscom_precio_especial: sp.precioEspecialMXN,"
);

fs.writeFileSync('components/cotizador/quote-builder.tsx', c, 'utf-8');
console.log('Success');

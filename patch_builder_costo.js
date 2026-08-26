const fs = require('fs');
let c = fs.readFileSync('components/cotizador/quote-builder.tsx', 'utf-8');

c = c.replace(
  /precio_unitario: Number\(i\.product\.precio_base\),\s*total: Number\(i\.product\.precio_base\)/,
  "precio_unitario: Number(i.product.precio_base),\n            costo_unitario: Number(i.product.costo_estimado || 0),\n            total: Number(i.product.precio_base)"
);

fs.writeFileSync('components/cotizador/quote-builder.tsx', c, 'utf-8');
console.log('Success');

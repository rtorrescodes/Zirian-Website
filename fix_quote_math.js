const fs = require('fs');

// 1. Update quote-summary.tsx button text
let summary = fs.readFileSync('components/cotizador/quote-summary.tsx', 'utf-8');
summary = summary.replace('Generar PDF Comercial', 'Generar PDF');
fs.writeFileSync('components/cotizador/quote-summary.tsx', summary, 'utf-8');

// 2. Update quote-builder.tsx ganancia
let builder = fs.readFileSync('components/cotizador/quote-builder.tsx', 'utf-8');
builder = builder.replace(
  "const ganancia = subtotal - subtotalCost",
  "const ganancia = subtotal - (subtotalCost * 1.16)"
);
fs.writeFileSync('components/cotizador/quote-builder.tsx', builder, 'utf-8');

// 3. Update quote-cart.tsx baseForMargin
let cart = fs.readFileSync('components/cotizador/quote-cart.tsx', 'utf-8');
cart = cart.replace(
  "const baseForMargin = costo > 0 ? costo : (basePrice > 0 ? basePrice : 0);",
  "const baseForMargin = costo > 0 ? (costo * 1.16) : (basePrice > 0 ? basePrice : 0);"
);
fs.writeFileSync('components/cotizador/quote-cart.tsx', cart, 'utf-8');

const fs = require('fs');
let c = fs.readFileSync('components/cotizador/quote-builder.tsx', 'utf-8');

c = c.replace(
  /const addDirectItem = \(product: Product, quantity = 1\) => \{\s*let finalProduct = \{ \.\.\.product \};\s*let finalDetails = '';/,
  "const addDirectItem = (product: Product, quantity = 1) => {\n      let finalProduct = { ...product };\n      let finalDetails = finalProduct.descripcion || '';"
);

fs.writeFileSync('components/cotizador/quote-builder.tsx', c, 'utf-8');

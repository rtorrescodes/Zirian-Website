const fs = require('fs');
let c = fs.readFileSync('components/cotizador/quote-builder.tsx', 'utf-8');

// For addItem
c = c.replace(
  "      let finalDetails = itemDetails;",
  "      let finalDetails = itemDetails;\n      if (finalProduct.descripcion) {\n        finalDetails = finalDetails ? `${finalProduct.descripcion}\\n\\n${finalDetails}` : finalProduct.descripcion;\n      }"
);

// For addDirectItem
c = c.replace(
  "    const addDirectItem = (product: Product, quantity = 1) => {\n      let finalProduct = { ...product };\n      let finalDetails = '';",
  "    const addDirectItem = (product: Product, quantity = 1) => {\n      let finalProduct = { ...product };\n      let finalDetails = finalProduct.descripcion || '';"
);

fs.writeFileSync('components/cotizador/quote-builder.tsx', c, 'utf-8');

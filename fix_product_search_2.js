const fs = require('fs');
let c = fs.readFileSync('components/cotizador/product-search.tsx', 'utf-8');

c = c.replace(/<select[\s\S]*?>/, (match) => {
  return match + '\n              <option value="">Todas las Categorías</option>';
});

fs.writeFileSync('components/cotizador/product-search.tsx', c, 'utf-8');

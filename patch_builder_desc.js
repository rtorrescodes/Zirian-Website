const fs = require('fs');
let c = fs.readFileSync('components/cotizador/quote-builder.tsx', 'utf-8');

c = c.replace(
  /const details = i\.product\s*\?\s*i\.descripcion\.replace\(i\.product\.nombre, ''\)\.trim\(\)\s*:\s*''/g,
  "let vName = i.descripcion || 'Artículo sin nombre';\n        let vDetails = '';\n        if (!i.product && i.descripcion?.includes('\\n')) {\n          const parts = i.descripcion.split('\\n');\n          vName = parts[0];\n          vDetails = parts.slice(1).join('\\n').trim();\n        }\n        const details = i.product ? i.descripcion.replace(i.product.nombre, '').trim() : vDetails;"
);

c = c.replace(
  /nombre: i\.descripcion \|\| 'Art\u00EDculo sin nombre',/g,
  "nombre: vName,"
);
// In case the file has another encoding
c = c.replace(
  /nombre: i\.descripcion \|\| 'Artculo sin nombre',/g,
  "nombre: vName,"
);

c = c.replace(
  /let finalDetails = itemDetails;/g,
  "let finalDetails = itemDetails || finalProduct.descripcion || '';"
);

fs.writeFileSync('components/cotizador/quote-builder.tsx', c, 'utf-8');
console.log('Success');

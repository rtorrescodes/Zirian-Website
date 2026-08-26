const fs = require('fs');
let c = fs.readFileSync('components/cotizador/quote-builder.tsx', 'utf-8');

const target = `const itemProduct = i.product ? { ...i.product, precio_base: Number(i.precio_unitario || 0) } : {
        id: -Math.floor(Math.random() * 1000000), // ID negativo para identificar que es virtual
        nombre: vName,
        codigo: null,
        precio_base: Number(i.precio_unitario || 0),
        unidad_medida: 'Pieza',
        categoryId: 0,
      }
      
      let vName = i.descripcion || 'Artículo sin nombre';
        let vDetails = '';
        if (!i.product && i.descripcion?.includes('\\n')) {
          const parts = i.descripcion.split('\\n');
          vName = parts[0];
          vDetails = parts.slice(1).join('\\n').trim();
        }
        const details = i.product ? i.descripcion.replace(i.product.nombre, '').trim() : vDetails;`;

const targetFallback = target.replace('Artículo', 'Artculo');

const replacement = `let vName = i.descripcion || 'Artículo sin nombre';
        let vDetails = '';
        if (!i.product && i.descripcion?.includes('\\n')) {
          const parts = i.descripcion.split('\\n');
          vName = parts[0];
          vDetails = parts.slice(1).join('\\n').trim();
        }
        const details = i.product ? i.descripcion.replace(i.product.nombre, '').trim() : vDetails;

        const itemProduct = i.product ? { ...i.product, precio_base: Number(i.precio_unitario || 0) } : {
          id: -Math.floor(Math.random() * 1000000), // ID negativo para identificar que es virtual
          nombre: vName,
          codigo: null,
          precio_base: Number(i.precio_unitario || 0),
          costo_estimado: Number(i.costo_unitario || 0),
          unidad_medida: 'Pieza',
          categoryId: 0,
        }`;

let success = false;
if (c.includes(target)) {
  c = c.replace(target, replacement);
  success = true;
} else if (c.includes(targetFallback)) {
  c = c.replace(targetFallback, replacement);
  success = true;
} else {
  // Let's use regex
  c = c.replace(/const itemProduct = [\s\S]*?const details = [\s\S]*?: vDetails;/, replacement);
  success = true;
}

if (success) {
  fs.writeFileSync('components/cotizador/quote-builder.tsx', c, 'utf-8');
  console.log('Success');
} else {
  console.log('Failed');
}

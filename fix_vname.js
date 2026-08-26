const fs = require('fs');
let c = fs.readFileSync('components/cotizador/quote-builder.tsx', 'utf-8');

c = c.replace(
  /const itemProduct = i\.product \? \{ \.\.\.i\.product, precio_base: Number\(i\.precio_unitario \|\| 0\) \} : \{\s*id: -Math\.floor\(Math\.random\(\) \* 1000000\), \/\/ ID negativo para identificar que es virtual\s*nombre: vName,\s*codigo: null,\s*precio_base: Number\(i\.precio_unitario \|\| 0\),\s*costo_estimado: Number\(i\.costo_unitario \|\| 0\),\s*unidad_medida: 'Pieza',\s*categoryId: 0,\s*\}\s*let vName = i\.descripcion \|\| 'Art(?:.+)culo sin nombre';\s*let vDetails = '';\s*if \(!i\.product && i\.descripcion\?\.includes\('\\n'\)\) \{\s*const parts = i\.descripcion\.split\('\\n'\);\s*vName = parts\[0\];\s*vDetails = parts\.slice\(1\)\.join\('\\n'\)\.trim\(\);\s*\}\s*const details = i\.product \? i\.descripcion\.replace\(i\.product\.nombre, ''\)\.trim\(\) : vDetails;/g,
  `let vName = i.descripcion || 'Artículo sin nombre';
        let vDetails = '';
        if (!i.product && i.descripcion?.includes('\\n')) {
          const parts = i.descripcion.split('\\n');
          vName = parts[0];
          vDetails = parts.slice(1).join('\\n').trim();
        }
        const details = i.product ? i.descripcion.replace(i.product.nombre, '').trim() : vDetails;

        const itemProduct = i.product ? { ...i.product, precio_base: Number(i.precio_unitario || 0) } : {
          id: -Math.floor(Math.random() * 1000000),
          nombre: vName,
          codigo: null,
          precio_base: Number(i.precio_unitario || 0),
          costo_estimado: Number(i.costo_unitario || 0),
          unidad_medida: 'Pieza',
          categoryId: 0,
        }`
);

fs.writeFileSync('components/cotizador/quote-builder.tsx', c, 'utf-8');
console.log('Success');

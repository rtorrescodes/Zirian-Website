const fs = require('fs');
let c = fs.readFileSync('components/cotizador/quote-builder.tsx', 'utf-8');
const search = `      const itemProduct = i.product || {
        id: -Math.floor(Math.random() * 1000000), // ID negativo para identificar que es virtual
        nombre: i.descripcion || 'Artículo sin nombre',
        codigo: null,
        precio_base: i.precio_unitario || 0,
        unidad_medida: 'Pieza',
        categoryId: 0,
      }`;
const replace = `      const itemProduct = i.product ? { ...i.product, precio_base: Number(i.precio_unitario || 0) } : {
        id: -Math.floor(Math.random() * 1000000), // ID negativo para identificar que es virtual
        nombre: i.descripcion || 'Artículo sin nombre',
        codigo: null,
        precio_base: Number(i.precio_unitario || 0),
        unidad_medida: 'Pieza',
        categoryId: 0,
      }`;

c = c.replace(search, replace);
c = c.replace(search.replace(/\r\n/g, '\n'), replace);
fs.writeFileSync('components/cotizador/quote-builder.tsx', c, 'utf-8');

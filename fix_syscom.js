const fs = require('fs');
let c = fs.readFileSync('app/actions/syscom.ts', 'utf-8');

const transform = `    const items = products.map(p => {
      let nombre = p.titulo;
      let descripcion = '';
      if (nombre.includes('/')) {
        const parts = nombre.split('/');
        nombre = parts[0].trim();
        descripcion = parts.slice(1).join(' / ').trim();
      }

      return {
        id: \`syscom-\${p.producto_id}\`,
        syscomId: p.producto_id,
        nombre: nombre,
        descripcion: descripcion,
        modelo: p.modelo,
        marca: p.marca,
        imagen: p.img_portada,
        precioListaUSD: p.precios?.precio_lista ? parseFloat(p.precios.precio_lista.toString().replace(/,/g, '')) : 0,
        precioEspecialUSD: p.precios?.precio_1 ? parseFloat(p.precios.precio_1.toString().replace(/,/g, '')) : 0,
        precioListaMXN: p.precios?.precio_lista ? parseFloat(p.precios.precio_lista.toString().replace(/,/g, '')) * tc : 0,
        precioEspecialMXN: p.precios?.precio_1 ? parseFloat(p.precios.precio_1.toString().replace(/,/g, '')) * tc : 0,
        stock: p.existencia?.nuevo || p.total_existencia || 0,
        categorias: p.categorias || []
      };
    });`;

c = c.replace(/const items = products\.map\([\s\S]*?categorias: p\.categorias \|\| \[\]\n  \}\)\);/, transform);

fs.writeFileSync('app/actions/syscom.ts', c, 'utf-8');

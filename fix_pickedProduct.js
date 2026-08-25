const fs = require('fs');
let c = fs.readFileSync('components/cotizador/quote-builder.tsx', 'utf-8');

c = c.replace(
  "descripcion: `Modelo: ${sp.modelo} | Marca: ${sp.marca}`,",
  "descripcion: sp.descripcion ? `${sp.descripcion}\\nModelo: ${sp.modelo} | Marca: ${sp.marca}` : `Modelo: ${sp.modelo} | Marca: ${sp.marca}`,"
);

fs.writeFileSync('components/cotizador/quote-builder.tsx', c, 'utf-8');

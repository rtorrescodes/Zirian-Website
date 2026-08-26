const fs = require('fs');
let c = fs.readFileSync('app/actions/syscom.ts', 'utf-8');

c = c.replace(
  /precioEspecialUSD: p\.precios\?\.precio_1 \? parseFloat\(p\.precios\.precio_1\.toString\(\)\.replace\(\/,\/g, ''\)\) : 0,/,
  `precioEspecialUSD: p.precios?.precio_especial ? parseFloat(p.precios.precio_especial.toString().replace(/,/g, '')) : 0,
          precioDescuentoUSD: p.precios?.precio_descuento ? parseFloat(p.precios.precio_descuento.toString().replace(/,/g, '')) : 0,`
);

c = c.replace(
  /precioEspecialMXN: p\.precios\?\.precio_1 \? parseFloat\(p\.precios\.precio_1\.toString\(\)\.replace\(\/,\/g, ''\)\) \* tc : 0,/,
  `precioEspecialMXN: p.precios?.precio_especial ? parseFloat(p.precios.precio_especial.toString().replace(/,/g, '')) * tc : 0,
          precioDescuentoMXN: p.precios?.precio_descuento ? parseFloat(p.precios.precio_descuento.toString().replace(/,/g, '')) * tc : 0,`
);

fs.writeFileSync('app/actions/syscom.ts', c, 'utf-8');
console.log('Success');

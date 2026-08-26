const fs = require('fs');
let c = fs.readFileSync('components/cotizador/quote-cart.tsx', 'utf-8');

c = c.replace(
  "        <div className=\"mb-2 text-[10px] text-slate-400 bg-slate-950 p-1.5 rounded space-y-1\">\n            {costo > 0 && (",
  "        <div className=\"mb-2 text-[10px] text-slate-400 bg-slate-950 p-1.5 rounded space-y-1\">\n            {product.syscom_precio_lista && (\n              <div className=\"flex justify-between\">\n                  <span>Precio Lista (Syscom):</span>\n                  <span className=\"font-mono text-white cursor-pointer hover:text-brand-cyan\" onClick={() => {setMode('manual'); setVal(String(product.syscom_precio_lista))}} title=\"Usar este precio\">\n                    {currencyExact(product.syscom_precio_lista)}\n                  </span>\n              </div>\n            )}\n            {product.syscom_precio_especial && (\n              <div className=\"flex justify-between\">\n                  <span>Precio Especial (Syscom):</span>\n                  <span className=\"font-mono text-white cursor-pointer hover:text-brand-cyan\" onClick={() => {setMode('manual'); setVal(String(product.syscom_precio_especial))}} title=\"Usar este precio\">\n                    {currencyExact(product.syscom_precio_especial)}\n                  </span>\n              </div>\n            )}\n            {costo > 0 && ("
);

c = c.replace(
  "<span>Costo (Especial):</span>",
  "<span>Costo:</span>"
);

fs.writeFileSync('components/cotizador/quote-cart.tsx', c, 'utf-8');

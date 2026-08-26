const fs = require('fs');
let c = fs.readFileSync('components/cotizador/quote-cart.tsx', 'utf-8');

const oldBlock = `<div className="mb-2 text-[10px] text-slate-400 bg-slate-950 p-1.5 rounded space-y-1">
          {costo > 0 && (
            <div className="flex justify-between">
                <span>Costo:</span>
                <span className="font-mono text-white cursor-pointer hover:text-brand-cyan" onClick={() => {setMode('manual'); setVal(String(costo))}} title="Usar este precio">
                  {currencyExact(costo)}
                </span>
            </div>
          )}
          <div className="flex justify-between">
              <span>Precio Base:</span>
              <span className="font-mono text-white cursor-pointer hover:text-brand-cyan" onClick={() => {setMode('manual'); setVal(String(basePrice))}} title="Usar este precio">
                {currencyExact(basePrice)}
              </span>
          </div>
      </div>`;

const newBlock = `<div className="mb-2 text-[10px] text-slate-400 bg-slate-950 p-1.5 rounded space-y-1">
          {product.syscom_precio_lista && (
            <div className="flex justify-between">
                <span>Precio Lista (Syscom):</span>
                <span className="font-mono text-white cursor-pointer hover:text-brand-cyan" onClick={() => {setMode('manual'); setVal(String(product.syscom_precio_lista))}} title="Usar este precio">
                  {currencyExact(product.syscom_precio_lista)}
                </span>
            </div>
          )}
          {product.syscom_precio_especial && (
            <div className="flex justify-between">
                <span>Precio Especial (Syscom):</span>
                <span className="font-mono text-white cursor-pointer hover:text-brand-cyan" onClick={() => {setMode('manual'); setVal(String(product.syscom_precio_especial))}} title="Usar este precio">
                  {currencyExact(product.syscom_precio_especial)}
                </span>
            </div>
          )}
          {costo > 0 && (
            <div className="flex justify-between">
                <span title="Costo Base + 16% IVA">Costo (con IVA):</span>
                <span className="font-mono text-white cursor-pointer hover:text-brand-cyan" onClick={() => {setMode('manual'); setVal(String(costo * 1.16))}} title="Usar este costo + IVA">
                  {currencyExact(costo * 1.16)}
                </span>
            </div>
          )}
          <div className="flex justify-between">
              <span>Precio Base:</span>
              <span className="font-mono text-white cursor-pointer hover:text-brand-cyan" onClick={() => {setMode('manual'); setVal(String(basePrice))}} title="Usar este precio">
                {currencyExact(basePrice)}
              </span>
          </div>
      </div>`;

// Use regex to replace to avoid whitespace issues
const regex = /<div className="mb-2 text-\[10px\] text-slate-400 bg-slate-950 p-1\.5 rounded space-y-1">[\s\S]*?<\/div>\s*<\/div>/;

if (regex.test(c)) {
  c = c.replace(regex, newBlock);
  fs.writeFileSync('components/cotizador/quote-cart.tsx', c, 'utf-8');
  console.log("Success");
} else {
  console.log("Regex not found");
}


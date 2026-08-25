const fs = require('fs');
let c = fs.readFileSync('components/cotizador/quote-cart.tsx', 'utf-8');

const replaceStr = `          <div className="flex items-center justify-between mb-4">
            <p className="font-tech text-xs font-bold uppercase tracking-widest text-slate-400">Archivos Adjuntos</p>
            <select
              onChange={(e) => {
                if(e.target.value && onAddBrochure) {
                  const b = availableBrochures.find(x => String(x.id) === e.target.value);
                  if (b && !attachments.find(a => String(a.id) === String(b.id))) {
                    onAddBrochure(b);
                  }
                  e.target.value = "";
                }
              }}
              className="bg-slate-900 border border-brand-cyan/30 text-xs text-brand-blue rounded px-2 py-1 outline-none"
            >
              <option value="">+ Seleccionar de Biblioteca</option>
              {availableBrochures.map(b => (
                <option key={b.id} value={b.id}>{b.nombre}</option>
              ))}
            </select>
          </div>`;

c = c.replace(/<div className="flex items-center justify-between mb-4">\s*<p className="font-tech text-xs font-bold uppercase tracking-widest text-slate-400">Archivos Adjuntos<\/p>[\s\S]*?<\/div>/, replaceStr);

fs.writeFileSync('components/cotizador/quote-cart.tsx', c, 'utf-8');

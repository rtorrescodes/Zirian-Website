const fs = require('fs');
let c = fs.readFileSync('components/clientes/client-editor.tsx', 'utf-8');

const regex = /<div className="grid grid-cols-2 gap-4">\s*<div className="space-y-2">\s*<label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Ubicaci.*?n \/ Direcci.*?n \*<\/label>[\s\S]*?<div className="space-y-2">\s*<label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Ciudad \/ Municipio<\/label>\s*<Input name="ciudad" value=\{formData\.ciudad\} onChange=\{handleChange\} placeholder="Ej\. Cabo San Lucas" className="" \/>\s*<\/div>\s*<\/div>/;

const replacement = `<div className="space-y-2">
                <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Ubicación / Dirección *</label>
                {isLoaded ? (
                  <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                    <Input name="ubicacion" value={formData.ubicacion} onChange={handleChange} required className="" placeholder="Buscar dirección..." />
                  </Autocomplete>
                ) : (
                  <Input name="ubicacion" value={formData.ubicacion} onChange={handleChange} required className="" />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Ciudad / Municipio</label>
                  <Input name="ciudad" value={formData.ciudad} onChange={handleChange} placeholder="Ej. Cabo San Lucas" className="" />
                </div>
              </div>`;

if (regex.test(c)) {
  c = c.replace(regex, replacement);
  fs.writeFileSync('components/clientes/client-editor.tsx', c, 'utf-8');
  console.log('Success');
} else {
  console.log('Regex did not match');
}

const fs = require('fs');
let c = fs.readFileSync('components/cotizador/quote-builder.tsx', 'utf-8');

c = c.replace(
  "removeFile={(id) => setAttachments(prev => prev.filter(a => a.id !== id))}",
  "removeFile={(id) => setAttachments(prev => prev.filter(a => a.id !== id))}\n            availableBrochures={initialBrochures}\n            onAddBrochure={(b) => setAttachments(prev => [...prev, { id: String(b.id), name: b.nombre, size: 'PDF' }])}"
);

fs.writeFileSync('components/cotizador/quote-builder.tsx', c, 'utf-8');

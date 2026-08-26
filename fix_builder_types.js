const fs = require('fs');
let c = fs.readFileSync('components/cotizador/quote-builder.tsx', 'utf-8');

c = c.replace(
  "  detalles?: string\n}",
  "  detalles?: string\n  seccion?: string | null\n}"
);

c = c.replace(
  "onGroupPriceChange={(gName, val) => setGroupPrices(p => ({ ...p, [gName]: val }))}\n            onSave={handleSave}",
  "onGroupPriceChange={(gName, val) => setGroupPrices(p => ({ ...p, [gName]: val }))}"
);

fs.writeFileSync('components/cotizador/quote-builder.tsx', c, 'utf-8');

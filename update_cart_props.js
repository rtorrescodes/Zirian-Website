const fs = require('fs');
let c = fs.readFileSync('components/cotizador/quote-cart.tsx', 'utf-8');

c = c.replace(
  "  onReorderSecciones?: (sourceIdx: number, destIdx: number) => void;\n}",
  "  onReorderSecciones?: (sourceIdx: number, destIdx: number) => void;\n  availableBrochures?: any[];\n  onAddBrochure?: (b: any) => void;\n}"
);

c = c.replace(
  "secciones = [], onAddSeccion, onRemoveSeccion, onUpdateItemSeccion, onReorderSecciones\n}: QuoteCartProps) {",
  "secciones = [], onAddSeccion, onRemoveSeccion, onUpdateItemSeccion, onReorderSecciones, availableBrochures = [], onAddBrochure\n}: QuoteCartProps) {"
);

fs.writeFileSync('components/cotizador/quote-cart.tsx', c, 'utf-8');

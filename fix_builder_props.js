const fs = require('fs');
let c = fs.readFileSync('components/cotizador/quote-builder.tsx', 'utf-8');

c = c.replace(
  "initialCategories: any[]",
  "initialCategories: any[]\n  initialBrochures?: any[]"
);

c = c.replace(
  "    initialClientId,\n    initialQuote,\n  }: QuoteBuilderProps) {",
  "    initialClientId,\n    initialQuote,\n    initialBrochures = [],\n  }: QuoteBuilderProps) {"
);

fs.writeFileSync('components/cotizador/quote-builder.tsx', c, 'utf-8');

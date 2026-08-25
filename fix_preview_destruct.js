const fs = require('fs');
let c = fs.readFileSync('components/cotizador/quote-preview.tsx', 'utf-8');

if (!c.includes('attachments = []')) {
  c = c.replace(
    /mostrarDesglose = false,\s*groupPrices = \{\},\s*\}: QuotePreviewProps\)\s*\{/,
    `mostrarDesglose = false,
  groupPrices = {},
  attachments = [],
}: QuotePreviewProps) {`
  );
  fs.writeFileSync('components/cotizador/quote-preview.tsx', c, 'utf-8');
}

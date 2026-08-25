const fs = require('fs');
let c = fs.readFileSync('components/cotizador/quote-cart.tsx', 'utf-8');

// Find the first instance of function PriceEditor
const firstIdx = c.indexOf("function PriceEditor");
const secondIdx = c.indexOf("function PriceEditor", firstIdx + 1);

if (secondIdx !== -1) {
  // We have a duplicate. We need to remove the second block.
  // The block ends right before 'export function QuoteCart'
  const exportIdx = c.indexOf("export function QuoteCart", secondIdx);
  if (exportIdx !== -1) {
    const startStr = c.substring(0, secondIdx);
    const endStr = c.substring(exportIdx);
    fs.writeFileSync('components/cotizador/quote-cart.tsx', startStr + endStr, 'utf-8');
  }
}

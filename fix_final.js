const fs = require('fs');
let c = fs.readFileSync('components/cotizador/quote-builder.tsx', 'utf-8');

c = c.replace(
  /interface QuoteBuilderProps\s*\{[\s\S]*?\}/,
  `interface QuoteBuilderProps {
  initialClients: any[]
  initialProducts: any[]
  initialCategories: any[]
  initialBrochures?: any[]
  initialClientId?: number
  initialQuote?: any
}`
);

c = c.replace(
  /export function QuoteBuilder\(\{\s*initialClients,\s*initialProducts,\s*initialCategories,\s*initialClientId,\s*initialQuote,\s*\}\:\s*QuoteBuilderProps\)\s*\{/,
  `export function QuoteBuilder({
  initialClients,
  initialProducts,
  initialCategories,
  initialClientId,
  initialQuote,
  initialBrochures = [],
}: QuoteBuilderProps) {`
);

fs.writeFileSync('components/cotizador/quote-builder.tsx', c, 'utf-8');

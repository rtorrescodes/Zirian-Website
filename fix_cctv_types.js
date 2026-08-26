const fs = require('fs');
let c = fs.readFileSync('app/actions/cctvToQuote.ts', 'utf-8');

c = c.replace(
  "let foundModelId = null;",
  "let foundModelId: string | null = null;"
);

c = c.replace(
  "const lineTotal = Number(realProduct.precio_base) * count;",
  "const lineTotal = Number(realProduct.precio_base) * count;"
);

fs.writeFileSync('app/actions/cctvToQuote.ts', c, 'utf-8');

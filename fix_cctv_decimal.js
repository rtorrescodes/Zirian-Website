const fs = require('fs');
let c = fs.readFileSync('app/actions/cctvToQuote.ts', 'utf-8');

c = c.replace(
  "quoteCounts[foundModelId] = (quoteCounts[foundModelId] || 0) + item.cantidad;",
  "quoteCounts[foundModelId] = (quoteCounts[foundModelId] || 0) + Number(item.cantidad);"
);

fs.writeFileSync('app/actions/cctvToQuote.ts', c, 'utf-8');

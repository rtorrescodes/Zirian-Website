const fs = require('fs');
let c = fs.readFileSync('app/actions/quotes.ts', 'utf-8');

c = c.replace(
  /precio_unitario: number;\s*total: number;/g,
  "precio_unitario: number;\n    costo_unitario?: number;\n    total: number;"
);

fs.writeFileSync('app/actions/quotes.ts', c, 'utf-8');
console.log('Success');

const fs = require('fs');
let c = fs.readFileSync('app/actions/syscom.ts', 'utf-8');

c = c.replace(
  /let nombre = p\.titulo;\s*let descripcion = '';\s*if \(nombre\.includes\('\/'\)\) \{\s*const parts = nombre\.split\('\/'\);\s*nombre = parts\[0\]\.trim\(\);\s*descripcion = parts\.slice\(1\)\.join\(' \/ '\)\.trim\(\);\s*\}/g,
  "let nombre = p.titulo;\n      let descripcion = '';"
);

fs.writeFileSync('app/actions/syscom.ts', c, 'utf-8');
console.log('Success');

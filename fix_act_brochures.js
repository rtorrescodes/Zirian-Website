const fs = require('fs');
let content = fs.readFileSync('app/actions/brochures.ts', 'utf8');
content = content.replace('orderBy: { fecha_creacion: \\'desc\\' }', 'select: { id: true, nombre: true, file_url: true, activo: true, fecha_creacion: true },\\n    orderBy: { fecha_creacion: \\'desc\\' }');
fs.writeFileSync('app/actions/brochures.ts', content);
console.log('Fixed actions/brochures.ts');


const fs = require('fs');
let content = fs.readFileSync('app/admin/configuracion/documentos/page.tsx', 'utf8');
content = content.replace('await createBrochure({ nombre: name, file_url: data.url });', 'await createBrochure({ nombre: name, file_url: data.url, file_base64: data.base64 });');
fs.writeFileSync('app/admin/configuracion/documentos/page.tsx', content);
console.log('Modified admin docs');


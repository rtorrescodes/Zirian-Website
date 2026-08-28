const fs = require('fs');
let content = fs.readFileSync('components/cotizador/quote-builder.tsx', 'utf8');
content = content.replace('const savedBrochure = await createBrochure({ nombre: f.name.replace(\'.pdf\', \'\'), file_url: data.url });', 'const savedBrochure = await createBrochure({ nombre: f.name.replace(\'.pdf\', \'\'), file_url: data.url, file_base64: data.base64 });');
fs.writeFileSync('components/cotizador/quote-builder.tsx', content);
console.log('Modified quote builder');


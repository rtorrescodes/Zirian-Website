const fs = require('fs');

let c = fs.readFileSync('app/admin/ajustes/page.tsx', 'utf-8');
c = c.replace("<AppShell>", "<AppShell title=\"Ajustes\">");
fs.writeFileSync('app/admin/ajustes/page.tsx', c, 'utf-8');

let c2 = fs.readFileSync('app/admin/configuracion/documentos/page.tsx', 'utf-8');
c2 = c2.replace("<AppShell>", "<AppShell title=\"Biblioteca de Documentos\">");
fs.writeFileSync('app/admin/configuracion/documentos/page.tsx', c2, 'utf-8');

const fs = require('fs');
let c = fs.readFileSync('app/admin/cotizador/page.tsx', 'utf-8');
const fetchBlock = `
  const brochures = await prisma.brochure.findMany({
    orderBy: { fecha_creacion: 'desc' }
  });
  
  return (`;

c = c.replace("return (", fetchBlock);
fs.writeFileSync('app/admin/cotizador/page.tsx', c, 'utf-8');

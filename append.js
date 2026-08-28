const fs = require('fs');
let content = fs.readFileSync('app/actions/quotes.ts', 'utf8');
content += '\n\nexport async function adminCompleteQuote(id: number) {\n  const quote = await prisma.quote.findUnique({ where: { id } });\n  if (!quote) throw new Error(\'Cotización no encontrada\');\n  \n  await prisma.quote.update({\n    where: { id },\n    data: {\n      status: \'Cobrada\',\n      status_pago: \'Pagado\',\n      monto_pagado: quote.total\n    }\n  });\n\n  await prisma.clientActivity.create({\n    data: {\n      clientId: quote.clientId,\n      tipo: \'Cobro de Proyecto\',\n      descripcion: El administrador marcó la cotización # como Terminada y Cobrada.\n    }\n  });\n\n  revalidatePath(\'/admin/cotizaciones\');\n  revalidatePath(\'/admin/dashboard\');\n  revalidatePath(\'/admin\');\n}\n';
fs.writeFileSync('app/actions/quotes.ts', content);
console.log('Done');

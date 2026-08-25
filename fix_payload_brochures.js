const fs = require('fs');
let c = fs.readFileSync('components/cotizador/quote-builder.tsx', 'utf-8');

c = c.replace(
  "motivo_rechazo: (status === 'Rechazada' || status === 'Cancelada') ? motivoRechazo : null,",
  "motivo_rechazo: (status === 'Rechazada' || status === 'Cancelada') ? motivoRechazo : null,\n          brochures: attachments.map((a: any) => Number(a.id)),"
);

fs.writeFileSync('components/cotizador/quote-builder.tsx', c, 'utf-8');

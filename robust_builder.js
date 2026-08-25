const fs = require('fs');
let c = fs.readFileSync('components/cotizador/quote-builder.tsx', 'utf-8');

// 1. Add initialBrochures to interface
c = c.replace(
  "initialCategories: any[]\n  initialClientId?: number",
  "initialCategories: any[]\n  initialBrochures?: any[]\n  initialClientId?: number"
);

// 2. Add initialBrochures to function destructuring
c = c.replace(
  "  initialClientId,\n  initialQuote,\n}: QuoteBuilderProps) {",
  "  initialClientId,\n  initialQuote,\n  initialBrochures = [],\n}: QuoteBuilderProps) {"
);

// 3. Change attachments initialization
c = c.replace(
  /const \[attachments, setAttachments\] = useState<Attachment\[\]>\(\[\s*\{\s*id: 'a1'[\s\S]*?size: '2\.4 MB'\s*\},\s*\]\)/,
  "const [attachments, setAttachments] = useState<Attachment[]>(initialQuote?.brochures?.map((b: any) => ({ id: String(b.brochure.id), name: b.brochure.nombre, size: 'PDF' })) || [])"
);

// 4. Change handleSave payload to include brochures (right after motivo_rechazo)
c = c.replace(
  "motivo_rechazo: (status === 'Rechazada' || status === 'Cancelada') ? motivoRechazo : null,\n          items: [",
  "motivo_rechazo: (status === 'Rechazada' || status === 'Cancelada') ? motivoRechazo : null,\n          brochures: attachments.map(a => Number(a.id)),\n          items: ["
);

// 5. Pass attachments and initialBrochures to QuoteCart
c = c.replace(
  "removeFile={(id) => setAttachments(prev => prev.filter(a => a.id !== id))}",
  "removeFile={(id) => setAttachments(prev => prev.filter(a => a.id !== id))}\n            availableBrochures={initialBrochures}\n            onAddBrochure={(b) => setAttachments(prev => [...prev, { id: String(b.id), name: b.nombre, size: 'PDF' }])}"
);

// 6. Pass attachments to QuotePreview
c = c.replace(
  "impuestosIniciales={initialQuote?.impuestos}",
  "impuestosIniciales={initialQuote?.impuestos}\n          attachments={attachments}"
);

fs.writeFileSync('components/cotizador/quote-builder.tsx', c, 'utf-8');

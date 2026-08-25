const fs = require('fs');
let c = fs.readFileSync('components/cotizador/quote-builder.tsx', 'utf-8');

c = c.replace(
  "  const [attachments, setAttachments] = useState<Attachment[]>([\n    { id: 'a1', name: 'Catálogo_Cargadores_2026.pdf', size: '2.4 MB' },\n  ])",
  "  const [attachments, setAttachments] = useState<Attachment[]>(\n    initialQuote?.brochures?.map((b: any) => ({ id: String(b.brochure.id), name: b.brochure.nombre, size: 'PDF' })) || []\n  )"
);
// wait, the 'Catálogo' has a unicode character. Let me use a looser regex.

c = c.replace(/const \[attachments, setAttachments\] = useState<Attachment\[\]>\(\[\s*\{\s*id: 'a1'[\s\S]*?\},\s*\]\)/, "const [attachments, setAttachments] = useState<Attachment[]>(\n    initialQuote?.brochures?.map((b: any) => ({ id: String(b.brochure.id), name: b.brochure.nombre, size: 'PDF' })) || []\n  )");

// Also change the payload in handleSave
c = c.replace(
  "          items: [",
  "          brochures: attachments.map(a => Number(a.id)),\n          items: ["
);

fs.writeFileSync('components/cotizador/quote-builder.tsx', c, 'utf-8');

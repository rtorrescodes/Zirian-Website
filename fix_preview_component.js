const fs = require('fs');
let c = fs.readFileSync('components/cotizador/quote-preview.tsx', 'utf-8');

c = c.replace(
  "  impuestosIniciales?: number;",
  "  impuestosIniciales?: number;\n  attachments?: any[];"
);

c = c.replace(
  "moneda = 'MXN', impuestosIniciales",
  "moneda = 'MXN', impuestosIniciales, attachments = []"
);

// Add attachments list at the very bottom
const attachBlock = `
        {/* Documentos Anexos */}
        {attachments.length > 0 && (
          <div className="mt-8 border-t border-slate-200 pt-4">
            <h4 className="text-[#1C497B] font-bold text-sm mb-2">Documentos Anexos a la Cotización:</h4>
            <ul className="list-disc list-inside text-xs text-slate-600">
              {attachments.map(a => (
                <li key={a.id}>{a.name} (Se anexará en el PDF final)</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
`;

c = c.replace(/      <\/div>\s*<\/div>\s*\)\s*\}\s*$/, attachBlock + "  )\n}");

fs.writeFileSync('components/cotizador/quote-preview.tsx', c, 'utf-8');

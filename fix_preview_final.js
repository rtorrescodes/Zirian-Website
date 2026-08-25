const fs = require('fs');
let c = fs.readFileSync('components/cotizador/quote-preview.tsx', 'utf-8');

c = c.replace(
  "  impuestosIniciales?: number;",
  "  impuestosIniciales?: number;\n  attachments?: any[];"
);

c = c.replace(
  "  mostrarDesglose = false,\n  groupPrices = {},\n}: QuotePreviewProps) {",
  "  mostrarDesglose = false,\n  groupPrices = {},\n  attachments = [],\n}: QuotePreviewProps) {"
);

const attachBlock = `
            {attachments && attachments.length > 0 && (
              <div className="mt-8 border-t border-slate-200 pt-4 px-12 pb-8">
                <h4 className="text-[#1C497B] font-bold text-sm mb-2">Documentos Anexos a la Cotización:</h4>
                <ul className="list-disc list-inside text-xs text-slate-600">
                  {attachments.map((a: any) => (
                    <li key={a.id}>{a.name} (Se adjuntará en el PDF final)</li>
                  ))}
                </ul>
              </div>
            )}
`;

c = c.replace(/(\s*)<\/Card>\s*<\/div>\s*\);\s*\}/, attachBlock + "$1      </Card>\n    </div>\n  );\n}");

fs.writeFileSync('components/cotizador/quote-preview.tsx', c, 'utf-8');

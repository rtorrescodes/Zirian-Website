const fs = require("fs");
let content = fs.readFileSync("components/cotizador/quote-preview.tsx", "utf8");

const oldEnd = `            {attachments && attachments.length > 0 && (
              <div className="mt-8 border-t border-slate-200 pt-4 px-12 pb-8">
                <h4 className="text-[#1C497B] font-bold text-sm mb-2">Documentos Anexos a la Cotización:</h4>
                <ul className="list-disc list-inside text-xs text-slate-600">
                  {attachments.map((a: any) => (
                    <li key={a.id}>{a.name} (Se adjuntará en el PDF final)</li>
                  ))}
                </ul>
              </div>
            )}

            </Card>
    </div>
  );
}`;
const newEnd = `            </Card>
    </div>
  );
}`;
content = content.replace(oldEnd, newEnd);

const oldFooter = `                {/* Absolute bottom footer */}`;
const newFooter = `                {attachments && attachments.length > 0 && (
                  <div className="px-12 pb-4">
                    <div className="bg-slate-100 p-3 border border-slate-200">
                      <h4 className="text-[#1C497B] font-bold text-xs mb-1 uppercase tracking-wider">Documentos Anexos:</h4>
                      <ul className="list-disc list-inside text-[10px] text-slate-600">
                        {attachments.map((a: any) => (
                          <li key={a.id}>{a.name} <span className="text-slate-400 italic">(Se adjuntará en el PDF final)</span></li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Absolute bottom footer */}`;
content = content.replace(oldFooter, newFooter);

fs.writeFileSync("components/cotizador/quote-preview.tsx", content);
console.log("Done");

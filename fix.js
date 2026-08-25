const fs = require('fs');
let c = fs.readFileSync('components/cotizador/quote-preview.tsx', 'utf-8');
c = c.replace(/\{\/\* Compromiso Zirian Section \*\/\}[\s\S]*?\{\/\* Image Strip Section \*\/\}/m, `                {/* Compromiso Zirian Section */}
                {!isGeneral && (
                  <div className="px-12 pt-3 mb-1">
                    <h3 className="text-[#1C497B] font-bold text-sm uppercase tracking-wider">{isEn ? 'Zirian Commitment' : 'Compromiso Zirian'}</h3>
                  </div>
                )}
                <div className="px-12 mb-1">
                  <div className="w-full border-t border-black pt-1">
                    {!isGeneral && (
                      <>
                        <p className="text-[10px] italic text-slate-600 mb-2">
                          {isEn
                            ? '"We guarantee leading infrastructure compatible with BYD, operating under the strictest safety and regulatory standards in BCS."'
                            : '"Garantizamos infraestructura líder y compatible con BYD, operando bajo los más estrictos estándares normativos de seguridad en BCS."'
                          }
                        </p>
                        <p className="text-xs font-bold text-[#1C497B]">{isEn ? 'Zirian México Team' : 'Equipo Zirian México'}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Image Strip Section */}`);
fs.writeFileSync('components/cotizador/quote-preview.tsx', c, 'utf-8');

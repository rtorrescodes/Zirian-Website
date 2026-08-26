const fs = require('fs');
let c = fs.readFileSync('components/cotizador/product-search.tsx', 'utf-8');

// For Local Products
c = c.replace(
  /<span className=\{cn\("block line-clamp-2 text-\[10px\] font-tech font-bold uppercase tracking-wider mt-0\.5", pickedProductId === p\.id \? "text-brand-blue\/70" : "text-slate-400"\)\}>\s*\{p\.codigo && `SKU: \$\{p\.codigo\} \| `\}\{p\.marca && `Marca: \$\{p\.marca\}`\}\s*<\/span>/g,
  `<span className={cn("block line-clamp-2 text-[10px] font-tech font-bold uppercase tracking-wider mt-0.5", pickedProductId === p.id ? "text-brand-blue/70" : "text-slate-400")}>
                          {p.codigo && \`SKU: \${p.codigo} | \`}{p.marca && \`Marca: \${p.marca}\`}
                        </span>
                        {p.descripcion && (
                          <span className={cn("block line-clamp-2 text-[11px] mt-1 whitespace-pre-wrap leading-tight", pickedProductId === p.id ? "text-brand-blue/80" : "text-slate-400")}>
                            {p.descripcion}
                          </span>
                        )}`
);

// For Syscom Products
c = c.replace(
  /<span className=\{cn\("block line-clamp-2 text-\[10px\] font-tech font-bold uppercase tracking-wider mt-0\.5", pickedProductId === p\.id \? "text-brand-cyan\/70" : "text-slate-400"\)\}>\s*Mod: \{p\.modelo\} \| \{p\.marca\}\s*<\/span>/g,
  `<span className={cn("block line-clamp-2 text-[10px] font-tech font-bold uppercase tracking-wider mt-0.5", pickedProductId === p.id ? "text-brand-cyan/70" : "text-slate-400")}>
                          Mod: {p.modelo} | {p.marca}
                        </span>
                        {p.descripcion && (
                          <span className={cn("block line-clamp-2 text-[11px] mt-1 whitespace-pre-wrap leading-tight", pickedProductId === p.id ? "text-brand-cyan/80" : "text-slate-400")}>
                            {p.descripcion}
                          </span>
                        )}`
);

fs.writeFileSync('components/cotizador/product-search.tsx', c, 'utf-8');
console.log('Success');

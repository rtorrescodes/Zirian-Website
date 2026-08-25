const fs = require('fs');
let c = fs.readFileSync('components/cotizador/product-search.tsx', 'utf-8');

// Change select onchange
c = c.replace(
  "setActiveCategory(Number(e.target.value))",
  "setActiveCategory(e.target.value ? Number(e.target.value) : null)"
);

// Insert "Todas las Categorías" option
c = c.replace(
  "className=\"w-full h-10 rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none\"\n            >\n              {initialCategories.map((c) => (",
  "className=\"w-full h-10 rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none\"\n            >\n              <option value=\"\">Todas las Categorías</option>\n              {initialCategories.map((c) => ("
);

fs.writeFileSync('components/cotizador/product-search.tsx', c, 'utf-8');

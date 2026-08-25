const fs = require('fs');
let c = fs.readFileSync('components/cotizador/quote-builder.tsx', 'utf-8');

c = c.replace(
  "const [activeCategory, setActiveCategory] = useState<number | null>(\n    initialCategories.length > 0 ? initialCategories[0].id : null\n  )",
  "const [activeCategory, setActiveCategory] = useState<number | null>(null)"
);

c = c.replace(
  "p.categoryId === activeCategory &&",
  "(!activeCategory || p.categoryId === activeCategory) &&"
);

fs.writeFileSync('components/cotizador/quote-builder.tsx', c, 'utf-8');

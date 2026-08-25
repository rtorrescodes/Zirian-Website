const fs = require('fs');
let c = fs.readFileSync('components/cotizador/quote-builder.tsx', 'utf-8');

c = c.replace(
  /const \[activeCategory, setActiveCategory\] = useState<number \| null>\([\s\S]*?\)/,
  "const [activeCategory, setActiveCategory] = useState<number | null>(null)"
);

fs.writeFileSync('components/cotizador/quote-builder.tsx', c, 'utf-8');

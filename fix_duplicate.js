const fs = require('fs');
let content = fs.readFileSync('components/cotizador/quote-cart.tsx', 'utf-8');
content = content.replace("  const [editingPriceId, setEditingPriceId] = React.useState<number | null>(null);\n  const [editingPriceId, setEditingPriceId] = React.useState<number | null>(null);", "  const [editingPriceId, setEditingPriceId] = React.useState<number | null>(null);");
fs.writeFileSync('components/cotizador/quote-cart.tsx', content, 'utf-8');

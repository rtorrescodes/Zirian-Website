const fs = require('fs');
let c = fs.readFileSync('components/cotizador/quote-builder.tsx', 'utf-8');

const regex = /\/\/ Use an effect to auto-populate groupPrices[\s\S]*?\}, \[items, mostrarDesglose\]\);/;

const replacement = `const prevCalculatedGroupsRef = useRef<Record<string, number>>({});

  // Use an effect to auto-populate groupPrices with the base calculated values when items change
  // so the user can then override them.
  useEffect(() => {
    if (!mostrarDesglose) {
      const calculatedGroups: Record<string, number> = {};
      
      items.forEach((i: any) => {
        const groupName = i.product?.grupo_impresion || 'Concepto General';
        if (calculatedGroups[groupName] === undefined) {
          calculatedGroups[groupName] = 0;
        }
        calculatedGroups[groupName] += Number(i.product.precio_base) * i.qty;
      });
      
      setGroupPrices((prev) => {
        const next = { ...prev };
        let changed = false;
        
        // Remove keys that no longer exist in the cart
        for (const key of Object.keys(next)) {
          if (calculatedGroups[key] === undefined) {
            delete next[key];
            changed = true;
          }
        }

        // Update if the underlying items cost changed for this group, OR if it's new
        for (const [gName, val] of Object.entries(calculatedGroups)) {
          const prevCalc = prevCalculatedGroupsRef.current[gName];
          if (next[gName] === undefined || prevCalc !== val) {
            next[gName] = val;
            changed = true;
          }
        }
        
        prevCalculatedGroupsRef.current = calculatedGroups;
        return changed ? next : prev;
      });
    }
  }, [items, mostrarDesglose]);`;

if (regex.test(c)) {
  c = c.replace(regex, replacement);
  fs.writeFileSync('components/cotizador/quote-builder.tsx', c, 'utf-8');
  console.log("Success");
} else {
  console.log("Regex not found");
}

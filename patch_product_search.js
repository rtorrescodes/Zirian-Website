const fs = require('fs');
let c = fs.readFileSync('components/cotizador/product-search.tsx', 'utf-8');

c = c.replace(
  /const filteredProducts = useMemo\(\(\) => \{\s*if \(!productQuery\) return initialProducts;\s*const q = productQuery\.toLowerCase\(\);\s*return initialProducts\.filter\(\s*\(p\) =>\s*p\.nombre\.toLowerCase\(\)\.includes\(q\) \|\|\s*\(p\.codigo && p\.codigo\.toLowerCase\(\)\.includes\(q\)\) \|\|\s*\(p\.marca && p\.marca\.toLowerCase\(\)\.includes\(q\)\),\s*\);\s*\}, \[initialProducts, productQuery\]\);/g,
  `const filteredProducts = useMemo(() => {
      let result = initialProducts;
      if (activeCategory) {
        result = result.filter(p => p.categoryId === activeCategory);
      }
      if (!productQuery) return result;
      const q = productQuery.toLowerCase();
      return result.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          (p.codigo && p.codigo.toLowerCase().includes(q)) ||
          (p.marca && p.marca.toLowerCase().includes(q)),
      );
    }, [initialProducts, productQuery, activeCategory]);`
);

fs.writeFileSync('components/cotizador/product-search.tsx', c, 'utf-8');
console.log('Success');

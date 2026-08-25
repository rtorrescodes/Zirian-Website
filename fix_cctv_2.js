const fs = require('fs');
let c = fs.readFileSync('app/actions/cctvToQuote.ts', 'utf-8');

c = c.replace(/descripcion: `\$\{sectionPrefix\}(.*?): \$\{modelNames\[modelId\] \|\| modelId\}`/g, "descripcion: `${sectionPrefix}${modelNames[modelId] || modelId}`");
c = c.replace(/if \(item\.descripcion\.includes\('(.*?)CCTV:'\)\) return true;/g, "if (Object.values(modelNames).some(mName => item.descripcion.includes(mName))) return true;");
c = c.replace(/if \(!foundModelId && item\.descripcion\.includes\('(.*?)CCTV:'\)\) \{/g, "if (!foundModelId) {");

fs.writeFileSync('app/actions/cctvToQuote.ts', c, 'utf-8');

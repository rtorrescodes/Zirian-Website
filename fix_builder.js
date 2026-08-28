const fs = require('fs');
let content = fs.readFileSync('components/cotizador/quote-builder.tsx', 'utf8');

content = content.replace('import { QuotePreview } from \'./quote-preview\';', 'import { QuotePreview } from \'./quote-preview\';\nimport { createBrochure } from \'@/app/actions/brochures\';');

const oldOnFiles = '          onFiles={(files) => {\n            if (files) {\n              const newFiles = Array.from(files).map((f) => ({\n                id: Math.random().toString(36).substring(7),\n                name: f.name,\n                size: (f.size / 1024).toFixed(1) + \' KB\',\n              }));\n              setAttachments((prev) => [...prev, ...newFiles]);\n            }\n          }}';

const newOnFiles = '          onFiles={async (files) => {\n            if (files) {\n              for (const f of Array.from(files)) {\n                const formData = new FormData();\n                formData.append(\'file\', f);\n                formData.append(\'folder\', \'documentos\');\n                try {\n                  const res = await fetch(\'/api/upload\', { method: \'POST\', body: formData });\n                  const data = await res.json();\n                  if (data.url) {\n                    const savedBrochure = await createBrochure({ nombre: f.name.replace(\'.pdf\', \'\'), file_url: data.url });\n                    setAttachments(prev => [...prev, { id: String(savedBrochure.id), name: savedBrochure.nombre, size: \'PDF\' }]);\n                  } else {\n                    alert(\'Error subiendo archivo: \' + data.error);\n                  }\n                } catch (e) {\n                  console.error(\'Upload error\', e);\n                  alert(\'Error de conexión al subir el archivo.\');\n                }\n              }\n            }\n          }}';

content = content.replace(oldOnFiles, newOnFiles);
fs.writeFileSync('components/cotizador/quote-builder.tsx', content);
console.log('Fixed onFiles');


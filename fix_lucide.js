const fs = require('fs');
let c = fs.readFileSync('components/tecnico/checklist-bom.tsx', 'utf-8');

c = c.replace(/ArchiveBox/g, "ArchiveX");

fs.writeFileSync('components/tecnico/checklist-bom.tsx', c, 'utf-8');
